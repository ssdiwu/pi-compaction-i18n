# pi-compaction-i18n

English | [简体中文](./README-zh.md)

> **Make pi's compaction and branch summaries speak your language.**

`pi-compaction-i18n` is a Pi extension that overrides the default English-only `/compact` and `/tree` branch summaries with **fully localized output** in 11 languages — auto-detected from your system locale.

## ✨ What it does

| Feature | Default pi | With this extension |
|---|---|---|
| `/compact` summary headings | `## Goal`, `## Progress`… (English) | `## 目标`, `## 进展`… (your language) |
| `/tree` branch summary | English only | Localized |
| Language detection | N/A | Auto from `PI_LOCALE` > `LC_ALL` > `LANG` |
| Supported languages | English only | **11 languages** |

## 🌍 Supported languages

| Locale | Language | Headings example |
|---|---|---|
| `zh-CN`, `zh_*` | 简体中文 (Simplified Chinese) | `## 目标 / ## 进展 / ## 下一步` |
| `zh-TW`, `zh-HK`, `zh-MO` | 繁體中文 (Traditional Chinese) | `## 目標 / ## 進展 / ## 下一步` |
| `ja-*` | 日本語 (Japanese) | `## 目標 / ## 進捗 / ## 次のステップ` |
| `ko-*` | 한국어 (Korean) | `## 목표 / ## 진행 상황 / ## 다음 단계` |
| `de-*` | Deutsch (German) | `## Ziel / ## Fortschritt / ## Nächste Schritte` |
| `fr-*` | Français (French) | `## Objectif / ## Progression / ## Étapes suivantes` |
| `es-*` | Español (Spanish) | `## Objetivo / ## Progreso / ## Próximos pasos` |
| `pt-*` | Português (Portuguese) | `## Objetivo / ## Progresso / ## Próximos passos` |
| `ru-*` | Русский (Russian) | `## Цель / ## Прогресс / ## Следующие шаги` |
| `ar-*` | العربية (Arabic) | `## الهدف / ## التقدم / ## الخطوات التالية` |
| other | English | `## Goal / ## Progress / ## Next Steps` |

## 📦 Install

```bash
pi install npm:pi-compaction-i18n
```

**Works out of the box.** No configuration needed — uses your current session's model by default.

## ⚙️ Configuration

Config file is **auto-generated** on first use at `~/.pi/agent/pi-compaction-i18n.json`:

```json
{
  "locale": "auto",
  "model": ""
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `locale` | string | `"auto"` | Force a locale (e.g. `"zh-CN"`). Set to `"auto"` for auto-detection from environment |
| `model` | string | _(session model)_ | Override the LLM model for summaries (`provider/modelId`). Empty = use current session's active model |

> **Note**: Compaction summaries benefit from strong models (they need deep context understanding). The default behavior of using your session model is recommended in most cases. Only override if you have a specific reason.

## 🚀 Usage

### Check status

After installing, open any Pi session and run:

```
/compaction-i18n-status
```

Example output on a Chinese system:

```
pi-compaction-i18n: enabled
Detected locale: zh-CN
Summary language: zh-Hans
Instruction: Write the entire summary in Simplified Chinese (简体中文). All headings and body content must be in Simplified Chinese.
```

### Trigger localized summaries

- **Compaction**: Type `/compact` or let auto-compaction trigger naturally
- **Branch summary**: Use `/tree` to navigate between branches with summarization enabled

Both will now produce fully localized markdown summaries.

## 🔧 How it works

1. **Locale detection**: Reads `PI_LOCALE` → `LC_ALL` → `LANG` environment variables (e.g., `zh_CN.UTF-8` → `zh-CN`). Can be overridden via config.
2. **Language mapping**: Maps locale code to one of 11 supported languages
3. **Template generation**: Builds a compaction/branch-summary prompt with **localized section headings** and a **language instruction** prepended
4. **Event interception**: Registers handlers for `session_before_compact` and `session_before_tree` events via Pi's extension API
5. **LLM call**: Uses `complete()` from `@earendil-works/pi-ai` to generate the summary with the localized prompt. Uses session's active model by default, or a configured override.

### Event precedence

For `session_before_compact` and `session_before_tree` events, **the last handler that returns a non-null result wins**. If you have multiple extensions that override compaction, ensure only one is active at a time.

## Public contract

- **Extension entry** — `index.ts` exports the default extension entry; `package.json` registers it through `pi.extensions`.
- **Events used** — `session_before_compact` and `session_before_tree`; the status command is `/compaction-i18n-status`.
- **Configuration contract** — the `locale` and `model` fields of `~/.pi/agent/pi-compaction-i18n.json` are listed in the configuration table above; locale detection order is fixed at `PI_LOCALE` > `LC_ALL` > `LANG`, with a safe fallback to English.
- **Output boundary** — only summary language selection and prompt templates change; summary facts, branch semantics, and Pi core state do not. Variables, formatting, and information coverage stay consistent across languages.
- **Model calls** — summaries are generated with `complete()` from `@earendil-works/pi-ai`, using the session's active model by default; no keys are hardcoded and Pi core is not modified.
- **Multi-extension rule** — the last handler returning a non-null result wins for the same event; do not create a conflicting duplicate load path with consumers such as `pi-di18n`.
- **Implementation map** — `extensions/locale.ts` (detection and mapping), `extensions/templates.ts` (templates and language matrix), `extensions/summarize.ts` (events and LLM calls); concept names follow [doc/术语表.md](doc/术语表.md).

## 🧪 Development

```bash
# Clone & test
git clone https://github.com/ssdiwu/pi-compaction-i18n.git
cd pi-compaction-i18n
npm install
npm test

# Install locally into pi for testing
pi install .
```

## Contributing

- **Entry points** — `index.ts` and `extensions/` (implementation), `tests/` (`locale.test.ts`, `templates.test.ts`, `extension.test.ts`), `README.md` and `README-zh.md` (user documentation), `AGENTS.md` (long-term contract and boundaries), `doc/README.md` (documentation navigation), `doc/术语表.md` (concept names and boundaries).
- **Local verification** — `npm test` (Vitest). Build a deterministic test from locale input to output first. When the Pi API or actual rendering changes, also load the checkout temporarily and verify `/compact`, `/tree`, and unknown-locale fallback; state explicitly when no TUI test was run.
- **Documentation sync** — update `README.md` (English) and `README-zh.md` (Chinese) in the same change, keep every technical detail in both, and keep the two pages linked at the top.
- **Change log** — maintainers record user-visible changes in `CHANGELOG-zh.md` and translate them into `CHANGELOG.md` when preparing each release. Both changelogs ship in the npm package. Contributors may describe user impact in the pull request.
- **Packaging check** — before publishing, run `npm pack --dry-run --ignore-scripts --json` and confirm the tarball contains `README.md`, `README-zh.md`, `CHANGELOG.md`, and `CHANGELOG-zh.md`.
- **Boundaries** — only change summary language and prompt templates, never summary facts or branch semantics; keep variables, formatting, and information coverage consistent across languages; do not read or upload user data unrelated to localization and do not hardcode keys.

## 🔗 Related

- [pi-autoname](https://github.com/ssdiwu/pi-autoname) — AI-powered session naming (sibling project)

## 📄 License

MIT © [ssdiwu](https://github.com/ssdiwu)
