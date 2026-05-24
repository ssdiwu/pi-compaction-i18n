import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { detectLocale, languageForLocale, languageInstructionForLocale } from "./locale.js";
import { summarizeForCompaction, summarizeForTree } from "./summarize.js";

export default function extension(pi: ExtensionAPI) {
  pi.on("session_before_compact", async (event, ctx) => {
    try {
      return await summarizeForCompaction(event, ctx);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      ctx.ui.notify(`pi-compaction-i18n failed during compaction: ${message}`, "warning");
      return undefined;
    }
  });

  pi.on("session_before_tree", async (event, ctx) => {
    try {
      return await summarizeForTree(event, ctx);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      ctx.ui.notify(`pi-compaction-i18n failed during branch summary: ${message}`, "warning");
      return undefined;
    }
  });

  pi.registerCommand("compaction-i18n-status", {
    description: "Show locale detection status for pi-compaction-i18n",
    async handler(_args, ctx) {
      const locale = detectLocale();
      const language = languageForLocale(locale);
      const instruction = languageInstructionForLocale(locale);
      ctx.ui.notify(
        [
          `pi-compaction-i18n: enabled`,
          `Detected locale: ${locale ?? "(none)"}`,
          `Summary language: ${language}`,
          `Instruction: ${instruction}`,
        ].join("\n"),
        "info",
      );
    },
  });
}
