import { describe, expect, it } from "vitest";
import { detectLocale, languageForLocale, languageInstructionForLocale } from "../extensions/locale.ts";

describe("locale", () => {
  it("detects PI_LOCALE first", () => {
    expect(detectLocale({ PI_LOCALE: "zh-CN", LC_ALL: "ja_JP.UTF-8", LANG: "en_US.UTF-8" })).toBe("zh-CN");
  });

  it("falls back to LC_ALL then LANG", () => {
    expect(detectLocale({ LC_ALL: "ja_JP.UTF-8" })).toBe("ja-JP");
    expect(detectLocale({ LANG: "fr_FR.UTF-8" })).toBe("fr-FR");
  });

  it("normalizes underscore and strips encoding suffix", () => {
    expect(detectLocale({ LANG: "zh_CN.UTF-8" })).toBe("zh-CN");
  });

  it("maps supported locales to summary languages", () => {
    expect(languageForLocale("zh-CN")).toBe("zh-Hans");
    expect(languageForLocale("zh-TW")).toBe("zh-Hant");
    expect(languageForLocale("ja-JP")).toBe("ja");
    expect(languageForLocale("en-US")).toBe("en");
  });

  it("creates explicit language instructions", () => {
    expect(languageInstructionForLocale("zh-CN")).toContain("简体中文");
    expect(languageInstructionForLocale("zh-TW")).toContain("繁體中文");
    expect(languageInstructionForLocale("ja-JP")).toContain("日本語");
  });
});
