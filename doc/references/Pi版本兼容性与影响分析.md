# Pi 版本兼容性与影响分析

> 记录上游 Pi 更新对本项目的直接影响和可改进点，供维护决策参考。

---

## 适用范围

本文档跟踪的 Pi 更新基线：**2026-06-09 发布版**

核心变更：
- Project trust（项目信任门控）
- Extension-controlled trust decisions（扩展接管信任决策）
- Cache-hit visibility（缓存命中率展示）
- Richer SDK / RPC extension surfaces（SDK 和 RPC 扩展面增强）
- Compaction summarization prompt 措辞修复（#5401）
- Skill-wrapped prompts 间距修复（#5371）
- 包导出清理（./hooks 移除）

---

## 影响评估：⚠️ 中高 — compaction prompt 措辞对齐

### 变更详情

Pi 官方修复了 compaction summarization system prompt：

> Fixed the compaction summarization system prompt to use neutral AI assistant wording for non-coding agents (#5401)

### 当前代码状态

本项目 `extensions/summarize.ts` **完全接管**了 compaction / tree summary 的 LLM 调用，使用自有的 `DEFAULT_SYSTEM_PROMPT`：

```ts
const DEFAULT_SYSTEM_PROMPT = "You are a conversation summarizer for pi. Follow the requested language exactly and output only the requested structured markdown summary.";
```

### 影响

| 维度 | 说明 |
|------|------|
| 是否被覆盖 | ❌ 不会被 Pi 内部修复覆盖——我们走独立 LLM 调用路径 |
| 风险 | 当 dteam / dflow 等 **non-coding agent** 触发 compaction 时，prompt 措辞偏 coding 场景 |
| 机会 | 可以参考 Pi 官方修复后的措辞，优化 `DEFAULT_SYSTEM_PROMPT` 的中性化表达 |

### 建议动作

1. **[ ] 检查** Pi 新版原生 compaction prompt 的中性措辞具体内容
2. **[ ] 评估** 是否需要根据调用方类型（coding vs non-coding）动态调整 system prompt
3. **[ ] 可选** 在 `DEFAULT_SYSTEM_PROMPT` 中增加"非编码场景也适用"的中性约束

### 优先级

🔴 **建议在下一个 patch 版本中处理** — 影响多代理场景下的摘要质量。

---

## 次要关联：Skill 包装 Prompt 间距（#5371）

> Fixed skill-wrapped prompts to insert spacing between skill instructions and the user message.

- 本项目是 **extension**（不是 skill），不直接受此修复影响。
- 但如果未来有用户通过 skill wrapper 调用 compaction-i18n 的能力，间距问题已在上游解决。

---

## 无直接影响的项目信任机制（Project Trust）

- 本项目作为 **全局/用户级 extension** 安装，不在项目 `.pi/` 目录下运行。
- Project trust 门控的是**项目本地资源**（`.pi/`、`AGENTS.md`、本地包），不影响全局扩展加载。
- **无需改动**。

---

## 版本记录

| 日期 | Pi 基线 | 变更 |
|------|---------|------|
| 2026-06-09 | 2026-06-09 发布版 | 初版创建；标记 compaction prompt 措辞为关注点 |
