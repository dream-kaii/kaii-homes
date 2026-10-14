---
title: 滑动窗口题型的统一思路
description: 这类题的模板其实非常固定：右指针扩张、不满足条件时左指针收缩、过程中更新答案。用几道经典题讲透这一个套路。
date: 2026-10-01
category: algo
tags: [Hot 100, 滑动窗口]
minutes: 8
status: planned
sources:
  - title: NeetCode Roadmap
    url: https://neetcode.io/roadmap
    kind: roadmap
---

这篇文章还在写。

内容是收敛的：滑动窗口只有**一个**模板，变化都在「怎么判断窗口合法」上。

- 右指针一直往前走，把元素放进窗口
- 窗口不合法时，左指针往前收，直到重新合法
- 每次收缩完更新一次答案

配的题：无重复字符的最长子串、长度最小的子数组、找到字符串中所有字母异位词。

已经写完的那篇讲的是检索，跟这篇没关系，但还是放一下：
[《从关键词到语义：为什么 RAG 一定要做混合检索》](/writing/rag-hybrid-retrieval/)。
