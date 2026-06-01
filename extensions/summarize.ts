import { complete, getModel, getEnvApiKey } from "@earendil-works/pi-ai";
import { convertToLlm, serializeConversation } from "@earendil-works/pi-coding-agent";
import { detectLocale, languageInstructionForLocale } from "./locale.js";
import { buildCompactionPrompt, buildTreeSummaryPrompt } from "./templates.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// ── Config (auto-create if missing) ──────────────────────

interface CompactionConfig {
  locale?: string;  // e.g. "zh-CN", or "auto" for auto-detect
  model?: string;   // e.g. "zai/glm-5v-turbo", empty = use ctx.model
}

const CONFIG_PATH = join(homedir(), ".pi", "agent", "pi-compaction-i18n.json");

const DEFAULT_CONFIG: CompactionConfig = {
  locale: "auto",
  model: "", // empty = use current session model (ctx.model)
};

function loadConfig(): CompactionConfig {
  try {
    if (!existsSync(CONFIG_PATH)) {
      writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf-8");
      return DEFAULT_CONFIG;
    }
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw) as CompactionConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

const compactionConfig = loadConfig();

// ── Core ─────────────────────────────────────────────────

const DEFAULT_SYSTEM_PROMPT = "You are a conversation summarizer for pi. Follow the requested language exactly and output only the requested structured markdown summary.";

export function serializeAgentMessages(messages: any[]): string {
  return serializeConversation(convertToLlm(messages));
}

export function entryToAgentMessage(entry: any): any | undefined {
  if (!entry || typeof entry !== "object") return undefined;
  switch (entry.type) {
    case "message":
      return entry.message;
    case "custom_message":
      return {
        role: "custom",
        customType: entry.customType,
        content: entry.content,
        display: entry.display,
        details: entry.details,
        timestamp: new Date(entry.timestamp).getTime(),
      };
    case "branch_summary":
      return {
        role: "branchSummary",
        summary: entry.summary,
        fromId: entry.fromId,
        timestamp: new Date(entry.timestamp).getTime(),
      };
    case "compaction":
      return {
        role: "compactionSummary",
        summary: entry.summary,
        tokensBefore: entry.tokensBefore,
        timestamp: new Date(entry.timestamp).getTime(),
      };
    default:
      return undefined;
  }
}

export function serializeSessionEntries(entries: any[]): string {
  const messages = entries.map(entryToAgentMessage).filter(Boolean);
  return serializeAgentMessages(messages);
}

/**
 * Resolve API key for a model with multi-strategy fallback.
 *
 * Strategy order:
 *   1. ctx.modelRegistry.getApiKeyAndHeaders() — preferred, session-aware
 *   2. Direct auth.json read — bypasses potential extension-context issues
 *   3. Environment variable — last resort
 */
async function resolveModelAuth(
  ctx: any,
  model: any,
): Promise<{ apiKey: string | undefined; headers: Record<string, string> | undefined }> {
  // Strategy 1: Session's modelRegistry (normal path)
  try {
    const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
    if (auth?.ok && auth?.apiKey) {
      return { apiKey: auth.apiKey, headers: auth.headers };
    }
  } catch {
    // Strategy 1 failed, continue to fallback
  }

  // Strategy 2: Direct auth.json read (bypasses extension-context issues)
  try {
    const authPath = join(homedir(), ".pi", "agent", "auth.json");
    if (existsSync(authPath)) {
      const raw = readFileSync(authPath, "utf-8");
      const authData = JSON.parse(raw);
      const cred = authData[model.provider];
      if (cred?.type === "api_key" && cred?.key) {
        return { apiKey: cred.key, headers: undefined };
      }
    }
  } catch {
    // Strategy 2 failed, continue to fallback
  }

  // Strategy 3: Environment variable
  try {
    const envKey = getEnvApiKey(model.provider);
    if (envKey) {
      return { apiKey: envKey, headers: undefined };
    }
  } catch {
    // Strategy 3 also failed
  }

  return { apiKey: undefined, headers: undefined };
}

async function runSummary(ctx: any, prompt: string, signal?: AbortSignal): Promise<string | undefined> {
  // Use configured model if set, otherwise fall back to session's active model
  let model = ctx.model;
  if (!model) {
    ctx.ui.notify("No active model for compaction summarization; falling back to pi default compaction.", "warning");
    return undefined;
  }

  if (compactionConfig.model) {
    const slashIndex = compactionConfig.model.indexOf("/");
    if (slashIndex !== -1) {
      const provider = compactionConfig.model.slice(0, slashIndex);
      const modelId = compactionConfig.model.slice(slashIndex + 1);
      const resolved = getModel(provider, modelId);
      if (resolved) model = resolved;
    }
  }

  const { apiKey, headers } = await resolveModelAuth(ctx, model);
  if (!apiKey) {
    ctx.ui.notify(`Compaction i18n could not get API key for provider "${model.provider}"; falling back to pi default compaction.`, "warning");
    return undefined;
  }

  const response = await complete(
    model,
    {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
          timestamp: Date.now(),
        },
      ],
    },
    {
      apiKey,
      headers,
      signal,
      maxTokens: Math.min(8192, model.maxTokens > 0 ? model.maxTokens : 8192),
    },
  );

  const text = response.content
    .filter((c: any) => c.type === "text")
    .map((c: any) => c.text)
    .join("\n")
    .trim();

  return text || undefined;
}

export async function summarizeForCompaction(event: any, ctx: any) {
  const locale = compactionConfig.locale && compactionConfig.locale !== "auto"
    ? compactionConfig.locale
    : detectLocale();
  const languageInstruction = languageInstructionForLocale(locale);
  const conversationText = serializeAgentMessages([
    ...event.preparation.messagesToSummarize,
    ...event.preparation.turnPrefixMessages,
  ]);

  const prompt = `${languageInstruction}\n\n${buildCompactionPrompt({
    locale,
    conversationText,
    previousSummary: event.preparation.previousSummary,
    customInstructions: event.customInstructions,
  })}`;

  const summary = await runSummary(ctx, prompt, event.signal);
  if (!summary) return undefined;

  return {
    compaction: {
      summary,
      firstKeptEntryId: event.preparation.firstKeptEntryId,
      tokensBefore: event.preparation.tokensBefore,
      details: {
        locale,
        languageInstruction,
        source: "pi-compaction-i18n",
      },
    },
  };
}

export async function summarizeForTree(event: any, ctx: any) {
  if (!event.preparation.userWantsSummary) return undefined;

  const locale = compactionConfig.locale && compactionConfig.locale !== "auto"
    ? compactionConfig.locale
    : detectLocale();
  const languageInstruction = languageInstructionForLocale(locale);
  const conversationText = serializeSessionEntries(event.preparation.entriesToSummarize ?? []);

  const prompt = `${languageInstruction}\n\n${buildTreeSummaryPrompt({
    locale,
    conversationText,
    customInstructions: event.preparation.customInstructions,
  })}`;

  const summary = await runSummary(ctx, prompt, event.signal);
  if (!summary) return undefined;

  return {
    summary: {
      summary,
      details: {
        locale,
        languageInstruction,
        source: "pi-compaction-i18n",
      },
    },
  };
}
