---
title: 多轮对话的上下文管理：滑窗、摘要与 token 预算
description: 全量历史递给模型，聊到第十轮就爆了。最近几轮保真、更早的压成摘要、再按预算兜底——三层怎么配合、各自在哪一层失效。
date: 2026-10-09
category: agent
tags: [上下文, Token]
minutes: 11
status: planned
sources:
  - title: LangChain overview
    url: https://docs.langchain.com/oss/python/langchain/overview
    kind: official
---

这篇文章还在写。

想讲清楚的是「上下文不是把历史全塞进去」这件事：

- **滑窗**：最近几轮保留原文，窗口开多大是算出来的而不是拍出来的
- **摘要**：更早的历史压成一段摘要，什么该留、什么可以丢
- **预算**：工具返回的大段 JSON、检索到的长文档，谁先被裁

还有一个我已经踩过的坑：按「一问一答」成对裁剪，会把工具调用链从中间剪断。

已经写完的那篇讲的是「资料怎么找得准」：
[《从关键词到语义：为什么 RAG 一定要做混合检索》](/writing/rag-hybrid-retrieval/)。
