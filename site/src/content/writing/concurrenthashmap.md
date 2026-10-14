---
title: ConcurrentHashMap 详解：从分段锁到 CAS + synchronized
description: 它为什么放弃分段锁？扩容为什么可以多线程并发做？把每个设计决策背后的权衡讲清楚，而不是背结论。
date: 2026-10-05
category: java
tags: [并发, 集合]
minutes: 14
status: planned
sources:
  - title: Java SE 21 API · ConcurrentHashMap
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html
    kind: official
---

这篇文章还在写。

主线是「为什么这么设计」，而不是「结论是什么」：

- **为什么放弃分段锁**：JDK 7 的 Segment 锁粒度粗、内存开销大，8 之后改成「CAS + synchronized 锁单个桶头」
- **get 为什么可以不加锁**：volatile 读 + 节点结构不变式
- **扩容为什么能并发**：`transfer` 的 `sizeCtl` 协商、`ForwardingNode` 标记
- **size 为什么不精确**：`baseCount` + `CounterCell` 的分摊思想

已经写完的那篇讲的是检索，跟这篇没关系，但还是放一下：
[《从关键词到语义：为什么 RAG 一定要做混合检索》](/writing/rag-hybrid-retrieval/)。
