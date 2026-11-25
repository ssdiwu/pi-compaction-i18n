# pi-compaction-i18n

[English](./README.md) | 简体中文

> **让 pi 的压缩摘要与分支摘要说你的语言。**

`pi-compaction-i18n` 是一个 Pi 扩展，把默认只有英文的 `/compact` 摘要与 `/tree` 分支摘要替换为 **11 种语言的完整本地化输出**，语言从系统 locale 自动检测。

## ✨ 它做什么

| 功能 | 默认 pi | 装了本扩展 |
|---|---|---|
| `/compact` 摘要标题 | `## Goal`、`## Progress`…（英文） | `## 目标`、`## 进展`…（你的语言） |
| `/tree` 分支摘要 | 仅英文 | 本地化 |
| 语言检测 | 无 | 按 `PI_LOCALE` > `LC_ALL` > `LANG` 自动检测 |
| 支持语言 | 仅英文 | **11 种语言** |

## 🌍 支持的语言

| Locale | 语言 | 标题示例 |
|---|---|---|
| `zh-CN`、`zh_*` | 简体中文 (Simplified Chinese) | `## 目标 / ## 进展 / ## 下一步` |
| `zh-TW`、`zh-HK`、`zh-MO` | 繁體中文 (Traditional Chinese) | `## 目標 / ## 進展 / ## 下一步` |
| `ja-*` | 日本語 (Japanese) | `## 目標 / ## 進捗 / ## 次のステップ` |
| `ko-*` | 한국어 (Korean) | `## 목표 / ## 진행 상황 / ## 다음 단계` |
| `de-*` | Deutsch (German) | `## Ziel / ## Fortschritt / ## Nächste Schritte` |
| `fr-*` | Français (French) | `## Objectif / ## Progression / ## Étapes suivantes` |
| `es-*` | Español (Spanish) | `## Objetivo / ## Progreso / ## Próximos pasos` |
| `pt-*` | Português (Portuguese) | `## Objetivo / ## Progresso / ## Próximos passos` |
| `ru-*` | Русский (Russian) | `## Цель / ## Прогресс / ## Следующие шаги` |
| `ar-*` | العربية (Arabic) | `## الهدف / ## التقدم / ## الخطوات التالية` |
| 其他 | English | `## Goal / ## Progress / ## Next Steps` |

## 📦 安装

```bash
pi install npm:pi-compaction-i18n
```

**开箱即用。** 无需配置——默认使用当前会话的模型。

## ⚙️ 配置

配置文件在**首次使用**时自动生成于 `~/.pi/agent/pi-compaction-i18n.json`：

```json
{
  "locale": "auto",
  "model": ""
}
```

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `locale` | string | `"auto"` | 强制指定 locale（如 `"zh-CN"`）。设为 `"auto"` 时从环境变量自动检测 |
| `model` | string | _（会话模型）_ | 覆盖摘要用的 LLM 模型（`provider/modelId`）。留空 = 使用当前会话的活动模型 |

> **注意**：压缩摘要受益于能力更强的模型（需要深入理解上下文）。多数情况下推荐保留「使用会话模型」的默认行为，除非有明确理由才覆盖。

## 🚀 使用

### 查看状态

安装后打开任意 Pi 会话，运行：

```
/compaction-i18n-status
```

中文系统上的输出示例：

```
pi-compaction-i18n: enabled
Detected locale: zh-CN
Summary language: zh-Hans
Instruction: Write the entire summary in Simplified Chinese (简体中文). All headings and body content must be in Simplified Chinese.
```

### 触发本地化摘要

- **压缩**：输入 `/compact`，或让自动压缩自然触发
- **分支摘要**：在开启摘要的情况下用 `/tree` 在分支间导航

两者现在都会产出完整本地化的 Markdown 摘要。

## 🔧 工作方式

1. **locale 检测**：读取 `PI_LOCALE` → `LC_ALL` → `LANG` 环境变量（如 `zh_CN.UTF-8` → `zh-CN`），可通过配置覆盖。
2. **语言映射**：把 locale 代码映射到 11 种支持语言之一。
3. **模板生成**：构造带**本地化章节标题**和前置**语言指令**的压缩／分支摘要提示词。
4. **事件拦截**：通过 Pi 扩展 API 注册 `session_before_compact` 与 `session_before_tree` 事件处理器。
5. **LLM 调用**：用 `@earendil-works/pi-ai` 的 `complete()` 生成本地化摘要。默认使用会话活动模型，也可配置为覆盖。

### 事件优先级

对 `session_before_compact` 与 `session_before_tree` 事件，**最后一个返回非空结果的 handler 生效**。如果装了多个会覆盖压缩行为的扩展，请确保同一时间只启用一个。

## 公开契约

- **扩展入口**：`index.ts` 导出默认扩展入口；`package.json` 通过 `pi.extensions` 注册它。
- **使用的事件**：`session_before_compact`、`session_before_tree`；状态命令为 `/compaction-i18n-status`。
- **配置契约**：`~/.pi/agent/pi-compaction-i18n.json` 的 `locale` 与 `model` 字段见上文配置表；locale 检测优先级固定为 `PI_LOCALE` > `LC_ALL` > `LANG`，未知值安全回退到英文。
- **输出边界**：只改变摘要的语言选择与提示模板，不改变摘要事实、分支语义或 Pi 核心状态。各语言的变量、格式与信息覆盖保持一致。
- **模型调用**：摘要通过 `@earendil-works/pi-ai` 的 `complete()` 生成，默认使用会话活动模型；不硬编码密钥，不修改 Pi 核心。
- **多扩展约定**：同一事件的最后一个非空 handler 生效；不要与 `pi-di18n` 等消费者形成冲突的重复加载路径。
- **实现位置**：`extensions/locale.ts`（检测与映射）、`extensions/templates.ts`（模板与语言矩阵）、`extensions/summarize.ts`（事件与 LLM 调用）；术语口径见 [doc/术语表.md](doc/术语表.md)。

## 🧪 开发

```bash
# 克隆与测试
git clone https://github.com/ssdiwu/pi-compaction-i18n.git
cd pi-compaction-i18n
npm install
npm test

# 本地安装到 pi 试用
pi install .
```

变更语言、检测顺序、提示契约或安装方式时，同步更新 `README.md` 与 `README-zh.md`；新增语言必须有对应行为测试。

## 贡献

- **入口**：`index.ts` 与 `extensions/`（实现）、`tests/`（`locale.test.ts`、`templates.test.ts`、`extension.test.ts`）、`README.md` 与 `README-zh.md`（用户文档）、`AGENTS.md`（长期契约与边界）、`doc/README.md`（文档导航）、`doc/术语表.md`（概念名称与边界）。
- **本地验证**：`npm test`（Vitest）。涉及 locale 输入到输出的行为时先建立确定性测试；Pi API 或实际渲染变化还需临时加载当前仓库，验证 `/compact`、`/tree` 与未知 locale 回退，未做 TUI 实测时明确说明。
- **文档同步**：同一次改动里更新 `README.md`（英文）与 `README-zh.md`（中文），两版保留全部技术细节，并保持页面顶部互链。
- **变更记录**　日常把用户可感知的变化写入本仓 `CHANGELOG-zh.md`，准备发布时按版本同步到英文 `CHANGELOG.md`。两份日志都随 npm 包发布。贡献者可在 PR 描述里写明用户影响。
- **打包核对**：发布前用 `npm pack --dry-run --ignore-scripts --json` 查看包清单，确认包含 `README.md`、`README-zh.md`、`CHANGELOG.md` 与 `CHANGELOG-zh.md`。
- **边界**：只改变摘要语言与提示模板，不改摘要事实／分支语义；各语言变量、格式和信息覆盖一致；不读取或上传与本地化无关的用户数据，不硬编码密钥。

## 🔗 相关

- [pi-autoname](https://github.com/ssdiwu/pi-autoname) —— AI 驱动的会话命名（姊妹项目）

## 📄 许可证

MIT © [ssdiwu](https://github.com/ssdiwu)
