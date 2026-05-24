# pi-compaction-i18n

Locale-aware compaction and branch summarization for pi.

This package overrides pi's default:

- `session_before_compact`
- `session_before_tree`

and generates summaries in the user's language based on:

- `PI_LOCALE`
- `LC_ALL`
- `LANG`

## Current status

MVP implemented.

### Supported language mapping

- `zh-CN` -> Simplified Chinese
- `zh-TW` / `zh-HK` / `zh-MO` -> Traditional Chinese
- `ja-*` -> Japanese
- `ko-*` -> Korean
- `de-*` -> German
- `fr-*` -> French
- `es-*` -> Spanish
- `pt-*` -> Portuguese
- `ru-*` -> Russian
- `ar-*` -> Arabic
- fallback -> English

## Install

```bash
pi install /absolute/path/to/pi-compaction-i18n
# or after publishing
pi install npm:pi-compaction-i18n
```

## Verify locale detection

```bash
/compaction-i18n-status
```

## Notes

- This package is designed to replace pi's default compaction / branch summary output language.
- If multiple compaction override extensions are installed, the last loaded handler that returns a result wins.
