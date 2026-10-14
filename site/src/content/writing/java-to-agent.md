---
title: Java 开发者如何转型 Agent 开发
description: 后端那套工程思维在 Agent 领域恰好稀缺。从已有的技术栈出发，缺哪几块、按什么顺序补、哪些经验可以平移。
date: 2026-10-07
category: agent
tags: [路线, 转型]
minutes: 9
status: planned
sources:
  - title: Building Effective Agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    kind: official
  - title: DeepLearning.AI · LangChain for LLM Application Development
    url: https://www.deeplearning.ai/courses/langchain
    kind: course
---

这篇文章还在写。

想讲的是「不用从零开始」这件事：写惯了 Spring 和 MyBatis 的人，搬到 Agent 领域时

- **可以直接平移**：异常处理、幂等设计、可观测性、分层边界
- **需要重学的**：从「确定性流程」切换到「模型每一步都可能跑偏」的心智模型
- **缺口最大的**：评估（怎么知道改了 prompt 之后变好了还是变坏了）

顺序上我倾向于先不碰框架，把一次原始的工具调用手动跑通，再上编排。

已经写完的那篇可以先当背景读：
[《从关键词到语义：为什么 RAG 一定要做混合检索》](/writing/rag-hybrid-retrieval/)。
