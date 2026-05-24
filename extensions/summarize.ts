import { complete } from "@earendil-works/pi-ai";
import { convertToLlm, serializeConversation } from "@earendil-works/pi-coding-agent";
import { detectLocale, languageInstructionForLocale } from "./locale.js";
import { buildCompactionPrompt, buildTreeSummaryPrompt } from "./templates.js";

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

async function runSummary(ctx: any, prompt: string, signal?: AbortSignal): Promise<string | undefined> {
  const model = ctx.model;
  if (!model) {
    ctx.ui.notify("No active model for compaction summarization; falling back to pi default compaction.", "warning");
    return undefined;
  }

  const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
  if (!auth.ok || !auth.apiKey) {
    ctx.ui.notify(`Compaction i18n could not get model auth; falling back to pi default compaction.`, "warning");
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
      apiKey: auth.apiKey,
      headers: auth.headers,
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
  const locale = detectLocale();
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

  const locale = detectLocale();
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
