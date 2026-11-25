# pi-compaction-i18n — Agent 规范

## 文件职责与阅读顺序

- 本文件只记录本地化扩展长期契约；支持语言、locale 优先级、安装和当前行为以 `README.md`、`README-zh.md`、源码和测试为准。
- `README.md` 是英文入口，`README-zh.md` 是中文入口，两份在顶部互链，内容保持语义同步；语言、检测顺序、提示契约、公开接口或安装方式变化时，在同一次改动中更新两版，保留全部技术细节。
- 修改前读取目标 locale、模板、Pi 集成入口及相应测试，不复制语言矩阵。
- 入口导航见 `doc/README.md`；现行正文在 `README.md`、`extensions/`（`locale.ts`、`templates.ts`、`summarize.ts`）与 `tests/`（`locale.test.ts`、`templates.test.ts`、`extension.test.ts`）；术语口径见 `doc/术语表.md`。
- 本仓库不建 `doc/架构/` 与 `doc/规格/`：机制与规格的唯一正文在根 `README.md` 与源码、测试，不要在 `doc/` 下再写第二份。

## 项目边界

- 只改变 compaction 与 tree summary 的语言选择和提示模板，不改变摘要事实、分支语义或 Pi 核心状态。
- locale 检测使用当前公开环境与 Pi 能力，未知值安全回退；不得读取或上传与本地化无关的用户数据。
- 各语言保持变量、格式和信息覆盖一致；新增语言必须有对应行为测试。
- 不硬编码密钥，不修改 Pi 核心，不保留与 `pi-di18n` 等消费者冲突的重复加载路径。
- 调试先建立 locale 输入到输出的确定性测试，连续两次同类失败且范围未缩小时停止原路径。

## 验证

```bash
npm test
```

Pi API 或实际渲染变化还需临时加载当前仓库，验证 `/compact`、`/tree` 与未知 locale 回退；未做 TUI 实测时明确说明。

## 文档沉淀出口

三个沉淀出口按边界分工，不混用：

- **`doc/决策档案/`** — 回答"为什么这么定"，只收"难逆转 + 无上下文会困惑 + 有真实权衡"的决策（刻碑，记了就不删）。一条一文件，顺序编号 `0001-中文标题.md`（项目术语沿用术语表规范叫法）；维护 `doc/决策档案/README.md` 索引（编号 + 标题 + 一句话主旨），新增 / 更新 ADR 时同步。
- **`doc/经验笔记.md`** — 回答"这事儿怎么做"，收可改的做法与避坑经验（活页）。门槛：解决一个坑时，如果换一个无上下文的 agent 来会重走一遍，就值得记。格式：现象 + 做法 + 证据。重复发生时在原条目追加证据，不新建条目。
- **`doc/references/`** — 回答"这些结论从哪来"，收来源、验证记录与历史阶段材料（上游版本评估、立项与设计提案），不是现行权威。新增前先确认 `doc/README.md` 未把它列为正文。

本机原始现场（截图、日志、抓取输出）放仓库根 `.artifacts/`，已被 Git 忽略。

## 文档与 Git

- 语言、检测顺序、提示契约或安装方式变化时同步 `README.md` 与 `README-zh.md`。公开贡献入口（开发、验证命令、公开接口约束）写在 README 的 Contributing 节，`doc/README.md` 顶部提供英文贡献者导航；内部中文与历史内容保留。
- 两份变更日志都在本 GitHub 仓库维护。`CHANGELOG.md` 是英文发布记录，`CHANGELOG-zh.md` 是中文日常记录。两份只写用户可感知事实，不倒填未发布版本。
- 日常用中文把已完成的用户可感知变化写入 `CHANGELOG-zh.md`；准备发布（release）时按版本把同一版本的用户可感知条目同步进英文 `CHANGELOG.md`，两份都保留该版本记录，并核对版本、日期与 issue 链接。
- `README.md` 是英文默认版（npm 默认展示），`README-zh.md` 是同包附带的中文版；两份 README 与两份 changelog 都随 npm 包发布。发布前用 `npm pack --dry-run --ignore-scripts --json` 核对清单包含 `README.md`、`README-zh.md`、`CHANGELOG.md`、`CHANGELOG-zh.md`。
- 未经用户明确要求，不执行 commit、push、tag 或 npm publish。
