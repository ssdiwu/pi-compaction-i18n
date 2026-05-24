# Issue #1 — Design `pi-compaction-i18n`

## Summary

Build a standalone pi package that overrides pi's default compaction and branch summarization prompts so summaries are generated in the user's language instead of always defaulting to English-oriented output.

This package should be independent from `pi-tinyfish-tools` and focused only on session summarization behavior.

## Motivation

Pi's built-in compaction and branch summarization use English prompt templates and section headings by default. Even when the user has `pi-i18n` installed and the UI is localized, the generated compaction summary content can still be English.

For users working primarily in Chinese, Japanese, Korean, or other non-English languages, this creates friction:

- summaries are harder to scan quickly
- branch handoff context feels inconsistent with the rest of the session
- locale-aware UX is incomplete even when UI translation is enabled

## Goals

- Create a **standalone pi package** dedicated to locale-aware compaction
- Override both:
  - `session_before_compact`
  - `session_before_tree`
- Detect locale from environment using the same pattern as `pi-tldr`:
  - `PI_LOCALE`
  - `LC_ALL`
  - `LANG`
- Generate summaries in the detected language
- Keep the package composable and easy to uninstall
- Publish as a normal pi package on npm and make it eligible for pi package discovery

## Non-Goals

- Do not modify pi core
- Do not fork pi's compaction implementation wholesale unless necessary
- Do not handle tool execution, API integrations, or unrelated i18n UI translations
- Do not depend on `pi-tinyfish-tools`

## Proposed Package Name

`pi-compaction-i18n`

Alternative names if needed:
- `pi-compact-i18n`
- `pi-compact-locale`
- `pi-summary-i18n`

## Proposed Behavior

### 1. Locale detection

Implement:

```ts
function detectLocale(): string | undefined
```

Priority:

1. `PI_LOCALE`
2. `LC_ALL`
3. `LANG`

Normalization:

- `zh_CN.UTF-8` -> `zh-CN`
- `ja_JP.UTF-8` -> `ja-JP`
- `fr_FR` -> `fr-FR`

### 2. Locale -> summary language instruction

Implement:

```ts
function languageInstructionForLocale(locale?: string): string
```

Examples:

- `zh-CN` -> `Write the summary in Simplified Chinese (简体中文).`
- `zh-TW` / `zh-HK` -> `Write the summary in Traditional Chinese (繁體中文).`
- `ja-JP` -> `Write the summary in Japanese (日本語).`
- `ko-KR` -> `Write the summary in Korean (한국어).`
- `de-DE` -> `Write the summary in German (Deutsch).`
- `fr-FR` -> `Write the summary in French (Français).`
- `es-ES` -> `Write the summary in Spanish (Español).`
- unknown / English -> empty instruction or English fallback

### 3. Compaction override

Register a `session_before_compact` handler.

Behavior:

- receive `preparation`
- serialize conversation with pi helpers
- call the selected model (or configurable compaction model)
- produce a structured summary in the detected language
- return:

```ts
{
  compaction: {
    summary,
    firstKeptEntryId: preparation.firstKeptEntryId,
    tokensBefore: preparation.tokensBefore,
    details: {
      locale,
      languageInstruction,
      source: "pi-compaction-i18n"
    }
  }
}
```

### 4. Branch summary override

Register a `session_before_tree` handler.

Behavior:

- if `preparation.userWantsSummary` is false, do nothing
- if true, generate a locale-aware branch summary
- return:

```ts
{
  summary: {
    summary,
    details: {
      locale,
      languageInstruction,
      source: "pi-compaction-i18n"
    }
  }
}
```

## Prompt Strategy

There are two implementation options.

### Option A — Append locale instruction to pi's default structure

Use pi-like section structure, but prepend a locale instruction such as:

- `Write the entire summary in Simplified Chinese (简体中文).`
- `All section headings and content must be in the target language.`

Pros:
- close to pi default behavior
- lower risk
- easier migration

Cons:
- headings may still drift toward English if prompt is weak

### Option B — Fully custom localized summary template

Use our own localized markdown template, e.g. for Simplified Chinese:

```md
## 目标
## 约束与偏好
## 进展
### 已完成
### 进行中
### 阻塞项
## 关键决策
## 下一步
## 关键上下文
```

Pros:
- strongest language control
- best UX for non-English users

Cons:
- diverges from pi built-in summary format
- may require more maintenance

## Recommendation

Start with **Option B**.

Reason:
- user goal is not just “content in Chinese” but “thinking chain / summary itself should stop looking English-oriented”
- localized headings are part of the UX problem
- package exists specifically to override this layer

## Extension Precedence / Conflict Notes

Pi runs `session_before_compact` handlers in extension load order. The **last handler returning a result wins** unless a handler returns `{ cancel: true }`.

Implications:

- this package can override pi default compaction
- another installed compaction override package can override this package
- users should avoid installing multiple compaction override packages simultaneously

We should document this clearly in README.

## Config Strategy

Prefer lightweight config under:

`~/.pi/agent/pi-compaction-i18n.json`

Potential fields:

```json
{
  "enabled": true,
  "overrideBranchSummary": true,
  "overrideCompaction": true,
  "forceLocale": "zh-CN",
  "fallbackLocale": "en",
  "templateStyle": "localized",
  "model": null
}
```

Notes:
- `forceLocale` is useful when shell locale is not trustworthy
- `model` may optionally allow dedicated summarization model later
- MVP can omit config commands if we want to keep v0.1 small

## Slash Commands (optional)

Possible commands for v0.2:

- `/compaction-i18n-status`
- `/compaction-i18n-locale`
- `/compaction-i18n-on`
- `/compaction-i18n-off`

Recommendation: **defer commands to v0.2** unless needed immediately.

## Implementation Plan

### Phase 1 — MVP

- scaffold package
- add locale detection helpers
- implement localized summary template(s)
- hook `session_before_compact`
- hook `session_before_tree`
- support Simplified Chinese + English fallback at minimum
- add tests
- publish npm package

### Phase 2 — Better language coverage

- Japanese, Korean, Traditional Chinese, German, French, Spanish, Portuguese, Russian, Arabic
- optional config file
- optional dedicated summarization model

### Phase 3 — UX polish

- slash commands
- status view
- README examples
- conflict detection / warning if another compaction override is present

## Testing Plan

- unit tests for `detectLocale()`
- unit tests for `languageInstructionForLocale()`
- snapshot tests for localized templates
- extension-level tests verifying returned `compaction` shape
- extension-level tests verifying returned `summary` shape
- manual test:
  - set `LANG=zh_CN.UTF-8`
  - trigger `/compact`
  - verify summary headings and content are Chinese

## Open Questions

1. Should MVP support only Chinese first, or all major locales immediately?
2. Should we reuse the current conversation model or optionally choose a cheaper summarization model?
3. Should branch summaries use the exact same template as compaction summaries?
4. Should we expose config/commands in v0.1 or keep the first release minimal?

## Decision Proposal

For v0.1:

- standalone package: **yes**
- package name: **`pi-compaction-i18n`**
- locale detection: **env-based**
- template style: **localized headings**
- config file: **lightweight, optional**
- slash commands: **defer**
- language coverage: **zh-CN first, English fallback, extensible mapper**

## Acceptance Criteria

- package can be installed with `pi install npm:pi-compaction-i18n`
- on Chinese locale, `/compact` produces Chinese summary headings and content
- on Chinese locale, `/tree` branch summary is also Chinese
- on English locale, behavior remains sensible
- package is independent from `pi-tinyfish-tools`
- repository is public and issue tracker contains this design as Issue #1
