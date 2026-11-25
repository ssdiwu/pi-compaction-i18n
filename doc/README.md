# pi-compaction-i18n 文档入口

## English navigation for contributors

| I want to… | Go to |
|---|---|
| Install and use the extension | [../README.md](../README.md) (English) · [../README-zh.md](../README-zh.md) (Chinese) |
| Understand the public contract (events, config, output boundary, multi-extension rule) | [README.md → Public contract](../README.md#public-contract) · [README-zh.md → 公开契约](../README-zh.md#公开契约) |
| Develop and verify locally | [README.md → Development](../README.md#-development) (`npm install && npm test`) |
| Contribute a change | [README.md → Contributing](../README.md#contributing) · [README-zh.md → 贡献](../README-zh.md#贡献) |
| Know the long-term contract and boundaries | [../AGENTS.md](../AGENTS.md) (Chinese, internal) |
| Browse the docs | [doc/README.md](./README.md) |

Documentation navigation only — this file carries no specification. The current behavior is defined by the implementation and the tests.

1. [术语表](./术语表.md)
2. [现行正文](#现行正文)（在仓库根，不在 `doc/` 下）
3. [决策档案](./决策档案/)
4. [经验笔记](./经验笔记.md)
5. [证据与历史](./references/)
6. [代理协作规则](../AGENTS.md)
7. [工程入口](../README.md)

本文件只做入口导航，不承载规格正文。本仓库没有 `doc/架构/` 与 `doc/规格/`：机制与规格的唯一正文在仓库根的 `README.md`、`extensions/` 与 `tests/`，按「没有对应内容就不要建空目录」不预建空目录。

## 现行正文

当前行为的唯一权威来源在仓库根：

| 位置 | 内容 |
|------|------|
| [`../README.md`](../README.md)、[`../README-zh.md`](../README-zh.md) | 功能对比、支持语言表、locale 检测优先级、配置字段、事件 precedence、安装与开发方式（英文／中文两版） |
| [`../extensions/`](../extensions/) | 实现：`locale.ts`（检测与语言映射）、`templates.ts`（模板与语言矩阵）、`summarize.ts`（Pi 事件与 LLM 调用） |
| [`../tests/`](../tests/) | 行为验证（`npm test`） |
| [`../AGENTS.md`](../AGENTS.md) | 长期契约、边界与验证纪律 |

`README.md` 与源码、测试构成一条链，不要在 `doc/` 下再写第二份机制正文。

## 决策与经验

| 位置 | 说明 |
|------|------|
| [`决策档案/README.md`](./决策档案/README.md) | 难逆转决定的档案，一条一文件，`0001-中文标题.md` 命名；索引在该 README，新增条目时同步 |
| [`经验笔记.md`](./经验笔记.md) | 可改做法与避坑经验（活页）；目前暂无条目 |

决策档案目前尚无条目文件（索引保留占位）。相关决策素材见 [`references/ISSUE-1.md`](./references/ISSUE-1.md) 中的 Option A / Option B 对比与非目标清单。

## 证据与历史

来源、验证与历史阶段材料，不是现行权威：

| 文件 | 说明 |
|------|------|
| [`references/ISSUE-1.md`](./references/ISSUE-1.md) | 立项动机、目标与非目标、接口级设计提案（`detectLocale()` / `languageInstructionForLocale()`、handler 返回结构、Prompt Strategy 取舍）；与现行实现逐条对应，但仍是历史提案 |
| [`references/Pi版本兼容性与影响分析.md`](./references/Pi版本兼容性与影响分析.md) | 上游 Pi 版本基线（2026-06-09 发布版）与影响评估，含未勾选的待办建议动作（🔴 标记为下一个 patch 版本处理），属待办而非已定行为 |

本机原始现场（截图、日志、抓取输出）放仓库根 `.artifacts/`，已被 Git 忽略。

## 当前状态

根目录无 `PLAN.md`，当前执行状态：**无**。

本机现场目录 `.artifacts/` 已建立但为空，忽略规则在 `.gitignore` 中。

## 维护规则

- 语言、检测顺序、提示契约或安装方式变化时同步 `../README.md` 与 `../README-zh.md`。日常把用户可感知变化写入本仓 `../CHANGELOG-zh.md`，准备发布时按版本同步到英文 `../CHANGELOG.md`。两份日志都随 npm 包发布。记录流程见 `../AGENTS.md`。
- 难逆转决定 → 新增 `doc/决策档案/000N-中文标题.md` 并同步该目录索引。
- 可复用做法 → 追加 `doc/经验笔记.md`。
- 来源、验证与历史材料 → `doc/references/`，不作为现行权威。
