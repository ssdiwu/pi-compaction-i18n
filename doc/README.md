# doc/

本文件只做入口导航，不承载规格正文。

## 现行正文

当前行为的唯一权威来源在仓库根，不在本目录：

| 位置 | 内容 |
|------|------|
| [`../README.md`](../README.md) | 功能对比、支持语言表、locale 检测优先级、配置字段、事件 precedence、安装与开发方式 |
| [`../extensions/`](../extensions/) | 实现：`locale.ts`（检测与语言映射）、`templates.ts`（模板与语言矩阵）、`summarize.ts`（Pi 事件与 LLM 调用） |
| [`../tests/`](../tests/) | 行为验证（`npm test`） |
| [`../AGENTS.md`](../AGENTS.md) | 长期契约、边界与验证纪律 |

`README.md` 与源码、测试构成一条链，不要在 `doc/` 下再写第二份机制正文。

## 决策与经验

| 位置 | 说明 |
|------|------|
| [`决策档案/README.md`](./决策档案/README.md) | 难逆转决定的档案，一条一文件，`0001-中文标题.md` 命名；索引在该 README，新增条目时同步 |
| [`经验笔记.md`](./经验笔记.md) | 可改做法与避坑经验（活页）；目前暂无条目 |

决策档案目前尚无条目文件（索引保留占位）。相关决策素材见 `references/ISSUE-1.md` 中的 Option A / Option B 对比与非目标清单。

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
