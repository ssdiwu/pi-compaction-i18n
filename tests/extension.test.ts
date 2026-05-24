import { describe, expect, it } from "vitest";
import extension from "../extensions/index.ts";

describe("extension", () => {
  it("registers compact/tree hooks and status command", () => {
    const events: string[] = [];
    const commands: string[] = [];

    extension({
      on(event: string) {
        events.push(event);
      },
      registerCommand(name: string) {
        commands.push(name);
      },
    } as any);

    expect(events).toContain("session_before_compact");
    expect(events).toContain("session_before_tree");
    expect(commands).toContain("compaction-i18n-status");
  });
});
