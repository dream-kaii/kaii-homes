# 学习路线 —— 信息源核实记录

> 生成日期：2026-10-13
> 用途：本站「学习路线」页面与文章引用的**真实来源清单**
> 原则：**只收录实际访问过并确认存在的地址**。未验证的一律不写进站点。

---

## 一、Agent / LLM 应用开发

### 官方一手文档（已访问确认）

| 名称 | 地址 | 说明 | 核实状态 |
|---|---|---|---|
| LangChain 官方文档 | https://docs.langchain.com/oss/python/langchain/overview | 核心概念：`create_agent`、Tools、短时记忆、事件流、结构化输出 | ✅ 已访问，HTTP 200 |
| LangGraph 官方文档 | https://docs.langchain.com/oss/python/langgraph/overview | 图编排：确定性步骤 + Agent 步骤混编、持久化、Checkpointer、Human-in-the-loop、Interrupts | ✅ 已访问，HTTP 200 |
| MCP 官方文档 | https://modelcontextprotocol.io/ | Model Context Protocol 规范、架构、Server/Client 概念、示例 | ✅ 已访问，HTTP 200 |
| Anthropic 工程博客 | https://www.anthropic.com/engineering/building-effective-agents | 《Building Effective Agents》：Workflow vs Agent 的架构区分，五类 workflow 模式 | ✅ 已访问，HTTP 200 |

### Anthropic《Building Effective Agents》关键结论（原文摘录，可引用）

该文把 **agentic systems** 分为两类，这是**权威定义**：

> - **Workflows** are systems where LLMs and tools are orchestrated through predefined code paths.
> - **Agents** are systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks.
>
> —— Anthropic Engineering, 2024-12-19

归纳的五种 workflow 模式（原文均有配图）：

1. **Prompt chaining** —— 任务拆成固定顺序子步骤，中间可加程序化校验闸
2. **Routing** —— 先分类输入，再路由到专门的处理分支
3. **Parallelization** —— 分两种：Sectioning（拆独立子任务）、Voting（同一任务多次跑取多数）
4. **Orchestrator-workers** —— 中心 LLM 动态拆解任务并派给 worker
5. **Evaluator-optimizer** —— 一个 LLM 生成、另一个给批评，循环改进

三条核心原则（原文 Summary 节）：

> 1. Maintain **simplicity** in your agent's design.
> 2. Prioritize **transparency** by explicitly showing the agent's planning steps.
> 3. Carefully craft your agent-computer interface (ACI) through thorough tool **documentation and testing**.

**该文关于工具的洞见（值得单独成文）**：

> While building our agent for SWE-bench, we actually spent **more time optimizing our tools than the overall prompt**. ... we found that the model would make mistakes with tools using relative filepaths ... To fix this, we changed the tool to always require absolute filepaths — and we found that the model used this method flawlessly.

**该文关于何时**不要**用 Agent 的判断**：

> we recommend finding the simplest solution possible, and only increasing complexity when needed. This might mean not building agentic systems at all. ... For many applications, however, optimizing single LLM calls with retrieval and in-context examples is usually enough.

### 课程

| 名称 | 地址 | 说明 | 核实状态 |
|---|---|---|---|
| DeepLearning.AI · LangChain for LLM Application Development | https://www.deeplearning.ai/courses/langchain | 讲师 Harrison Chase（LangChain 作者）+ Andrew Ng，入门级，8 课 / 1h48m | ✅ 已访问，HTTP 200 |

---

## 二、算法 / LeetCode

| 名称 | 地址 | 说明 | 核实状态 |
|---|---|---|---|
| NeetCode Roadmap | https://neetcode.io/roadmap | 按题型分类的刷题路线图 | ⚠️ 页面可访问但正文为 JS 渲染，未取到完整内容 —— **引用时只写站点名，不写具体章节** |

**待补**：LeetCode 官方与代码随想录等来源需要单独核实后再录入。

---

## 三、尚未核实（不得写入站点）

以下方向**目前没有已验证的一手来源**，写作前必须补齐：

- Java 后端（JVM / 并发 / 微服务）的权威路线来源
- 数据库、Redis、消息队列的官方文档地址
- 具体的 GitHub 仓库（本次 GitHub 搜索与抓取均失败）

---

## 四、写作纪律

1. **凡引用必附来源**，且在文章中给出可点击链接
2. **不编造**版本号、API 签名、性能数字；引用数据必须来自可查证的原始出处
3. 涉及版本敏感的 API（如 LangChain 1.x 与 0.3 差异），**先查官方文档再落笔**，不凭记忆
4. 本站项目实践的描述可引用自己的 `dev-notes`（有 commit 可查）
5. 转载或大幅引用他人内容时**标注出处与许可**
