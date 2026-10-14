---
title: 工具调用的三个工程问题：超时、幂等与重试边界
description: 给模型挂上工具只是开始。真正麻烦的是：工具跑超时了怎么办、写操作被重试两次会怎样、什么时候该放弃重试。
date: 2026-10-11
category: agent
tags: [Function Calling, 可靠性]
minutes: 10
status: planned
sources:
  - title: LangChain Docs · Tools
    url: https://docs.langchain.com/oss/python/langchain/tools
    kind: official
  - title: Building Effective Agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    kind: official
---

这篇文章还在写。

打算写的是「给模型挂上工具」之后才开始的那些问题：

- **超时**：工具卡住 30 秒，是继续等还是判失败？判失败之后模型会怎么走下一步？
- **幂等**：一个「创建退款单」的工具被重试两次，用户会不会被退两笔钱？
- **重试边界**：哪些错误值得重试、重试几次、退避怎么算、什么时候必须停下来交给人。

在那之前，可以先看看已经完成的那篇：
[《从关键词到语义：为什么 RAG 一定要做混合检索》](/writing/rag-hybrid-retrieval/) ——
它讲的是「模型该看到什么资料」，这一篇要讲的是「模型动手之后会出什么事」。
