---
title: 链表题的指针套路整理
description: 哑结点简化边界、快慢指针找中点判环、三指针反转——链表题的变化不多，把这几招练熟就够了。
date: 2026-09-29
category: algo
tags: [Hot 100, 链表]
minutes: 7
status: planned
sources:
  - title: NeetCode Roadmap
    url: https://neetcode.io/roadmap
    kind: roadmap
---

这篇文章还在写。

想整理的是四招，而不是按题号堆题解：

- **哑结点**：删除 / 插入头部时，把「头节点特判」这一整类分支干掉
- **快慢指针**：找中点、判环、找环入口（三个问题同一套指针）
- **三指针反转**：`prev / cur / next` 的推进顺序，画一遍图就不会写错
- **多指针合并**：合并两个有序链表、两两交换、k 个一组

已经写完的那篇跟这篇没关系，但还是放一下：
[《从关键词到语义：为什么 RAG 一定要做混合检索》](/writing/rag-hybrid-retrieval/)。
