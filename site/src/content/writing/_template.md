---
# ─────────────────────────────────────────────────────────────
# 文章模板。用法：
#   cp src/content/writing/_template.md src/content/writing/你的文件名.md
# 然后把下面每一项填上。字段说明见 WRITING.md（或本文件底部注释）。
# 文件名用英文短横线连接，会成为网址的一部分。
# ─────────────────────────────────────────────────────────────
title: 这里写标题
description: 一句话说清这篇解决什么问题（会显示在列表页和搜索引擎结果里）
date: 2026-01-01
category: agent          # agent | java | algo 三选一
tags: [标签一, 标签二]
minutes: 10              # 预估阅读分钟数，正整数
status: planned          # published（已发布）| planned（还在写）
sources: []              # 参考来源，可留空数组。格式见下方注释
---

## 第一节标题

正文从这里开始，用标准 Markdown 写就行。

代码块带语言标签会自动高亮：

```python
def hello():
    return "world"
```

三种提示框：

<div class="box box-tip">
💡 这是一条提示
</div>

<div class="box box-warn">
⚠️ 这是一个警告
</div>

<div class="box box-quote">
引述别人的话，配合 sources 使用
</div>

<!--
sources 的写法（每一项三个字段）：
sources:
  - title: Building Effective Agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    kind: official    # official | course | roadmap | article 四选一
-->
