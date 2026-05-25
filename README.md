# pi-compaction-i18n

> **Make pi's compaction and branch summaries speak your language.**

`pi-compaction-i18n` is a pi extension that overrides the default English-only `/compact` and `/tree` branch summaries with **fully localized output** in 11 languages — auto-detected from your system locale.

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

Or install from a local path:

```bash
pi install /absolute/path/to/pi-compaction-i18n
```

## ⚙️ Configuration

Create `~/.pi/agent/pi-compaction-i18n.json`:

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

> **Note**: Compaction summaries benefit from strong models (they need deep context understanding). Only override `model` if you have a specific reason.

## 🚀 Usage

### Check status

After installing, open any pi session and run:

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

1. **Locale detection**: Reads `PI_LOCALE` → `LC_ALL` → `LANG` environment variables (e.g., `zh_CN.UTF-8` → `zh-CN`)
2. **Language mapping**: Maps locale code to one of 11 supported languages
3. **Template generation**: Builds a compaction/branch-summary prompt with **localized section headings** and a **language instruction** prepended
4. **Event interception**: Registers handlers for `session_before_compact` and `session_before_tree` events via pi's extension API
5. **LLM call**: Uses `complete()` from `@earendil-works/pi-ai` to generate the summary with the localized prompt

### Event precedence

For `session_before_compact` and `session_before_tree` events, **the last handler that returns a non-null result wins**. If you have multiple extensions that override compaction, ensure only one is active at a time.

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

## 📄 License

MIT © [ssdiwu](https://github.com/ssdiwu)
