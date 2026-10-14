---
title: 线程池详解：七个参数、拒绝策略与状态流转
description: 线程池的参数不是背下来的。从「任务提交之后发生了什么」这条线索串起七个参数的作用顺序，以及为什么不该用快捷工厂方法。
date: 2026-10-03
category: java
tags: [并发, 线程池]
minutes: 13
status: planned
sources:
  - title: Java SE 21 API · ThreadPoolExecutor
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html
    kind: official
---

这篇文章还在写。

打算按「一个任务提交进来之后依次经过什么」来讲，而不是列参数表：

- 核心线程没满 → 建核心线程；满了 → 进队列；队列满了 → 建非核心线程；再满 → 走拒绝策略
- **为什么不该用 `Executors.newFixedThreadPool`**：无界队列把 OOM 藏起来了
- `allowCoreThreadTimeOut`、`prestartAllCoreThreads` 各自的适用场合
- 四种拒绝策略在什么业务语义下才是对的
- 状态流转：RUNNING → SHUTDOWN → STOP → TIDYING → TERMINATED

已经写完的那篇跟这篇没关系，但还是放一下：
[《从关键词到语义：为什么 RAG 一定要做混合检索》](/writing/rag-hybrid-retrieval/)。
