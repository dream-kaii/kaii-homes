# 怎么写文章

这份文档写给站点的作者（也就是你自己）。**加一篇文章不需要懂框架**，照下面的步骤做就行。

---

## 最快路径：加一篇文章

### 1. 复制模板

```bash
cp src/content/writing/_template.md src/content/writing/你的文件名.md
```

文件名用英文短横线连接，会成为网址的一部分。比如：
- `tool-calling-pitfalls.md` → `/writing/tool-calling-pitfalls/`
- `context-management.md` → `/writing/context-management/`

### 2. 填开头的元信息

```markdown
---
title: 工具调用的三个工程问题：超时、幂等与重试边界
description: 给模型挂上工具只是开始。真正麻烦的是工具跑超时了怎么办。
date: 2026-10-11
category: agent
tags: [Function Calling, 可靠性]
minutes: 10
status: published
---

## 第一节标题

正文从这里开始，用普通 Markdown 写就行。
```

### 3. 写正文

用标准 Markdown。站点会自动套用样式。

### 4. 本地预览（可选）

```bash
pnpm dev
```

浏览器打开 `http://localhost:4321`，改文件会自动刷新。

### 5. 发布

```bash
git add .
git commit -m "post: 工具调用的三个工程问题"
git push
```

**GitHub Actions 会自动构建并部署。** 几分钟后线上就更新了。

---

## frontmatter 字段说明

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✅ | 文章标题，会显示在列表页和详情页 |
| `description` | ✅ | 一句话摘要，显示在列表卡片和搜索结果里。**写得具体一点**，别写"本文介绍了……" |
| `date` | ✅ | 格式 `YYYY-MM-DD`，用于排序 |
| `category` | ✅ | 只能填 `agent` / `java` / `algo` 三选一 |
| `tags` | ✅ | 标签数组，2-3 个即可，别堆 |
| `minutes` | ✅ | 预计阅读时长（整数） |
| `status` | ✅ | `published`（已发布）或 `planned`（占位，还没写完） |
| `sources` | 可选 | 参考来源，见下方 |

### 关于 `status`

- `published` —— 正常显示，会进 RSS
- `planned` —— 占位文章。列表页会显示「即将发布」徽标，点进去能看到你写的说明

**用途**：你可以先把打算写的文章都建成 `planned`，列表页就有了完整脉络，之后再一篇篇填内容。

### 关于 `sources`（参考来源）

**凡是引用了别人的观点、数据、原文，都要在这里列出来。**

```yaml
sources:
  - title: Building Effective Agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    kind: official
  - title: NeetCode Roadmap
    url: https://neetcode.io/roadmap
    kind: roadmap
```

`kind` 可选：`official`（官方文档）/ `course`（课程）/ `roadmap`（路线图）/ `article`（文章）

**为什么重要**：技术文章的可信度来自可核查的来源。写「Anthropic 说……」必须附上链接。

---

## frontmatter 写错了会怎样？

**构建会直接失败，并告诉你哪一行错了。** 不会静默上线一个坏页面。

常见错误：

| 错误 | 报错信息 | 修法 |
|---|---|---|
| `category: Agent` | Invalid enum value | 必须小写，只能是 `agent`/`java`/`algo` |
| `date: 2026/10/11` | Invalid date | 用 `2026-10-11` |
| 漏了 `title` | Required | 补上 |
| `minutes: "10"` | Expected number | 去掉引号 |

本地跑一次 `pnpm build` 就能提前发现。

---

## Markdown 语法支持

### 标准语法

```markdown
## 二级标题      ← 会自动进右侧目录
### 三级标题

**加粗**、*斜体*、`行内代码`

- 无序列表
- 第二项

1. 有序列表

> 引用块，用于引述原文

[链接文字](https://example.com)

![图片说明](/images/foo.png)
```

### 代码块

带语言标签的代码块会自动高亮，并带复制按钮：

````markdown
```python
def hello():
    return "world"
```
````

### 表格

```markdown
| 方案 | 优点 | 缺点 |
|---|---|---|
| 纯向量 | 认得同义说法 | 分不清近似型号 |
```

### 提示框

站点提供了三种提示框：

```markdown
<div class="box box-tip">
💡 这是一条提示
</div>

<div class="box box-warn">
⚠️ 这是一个警告
</div>

<div class="box box-quote">
引述别人的话，配合 sources 使用
</div>
```

---

## 加图片

### 1. 把图片放进 `public/images/`

```bash
cp ~/Downloads/diagram.png public/images/
```

### 2. 正文里引用

```markdown
![架构图](/images/diagram.png)
```

**注意**：路径以 `/images/` 开头（对应 `public/images/`），不要写相对路径。

**建议**：图片压缩后再传。截图用 `png`，照片用 `jpg`，动图用 `webp`。单张控制在 500KB 以内。

---

## 在文章里嵌入交互组件

有些文章适合放可交互的东西（比如对比演示、可切换的图表）。这些组件需要写一小段 Astro 语法：

```astro
---
import RetrievalDemo from '../../components/RetrievalDemo.astro';
---

正文……

<RetrievalDemo />

继续正文……
```

**现有可用的组件**：

| 组件 | 用途 |
|---|---|
| `RetrievalDemo` | 检索结果对比（可切换关键词/向量/混合三种模式） |

**不确定怎么用就先跳过** —— 纯 Markdown 的文章完全够用，等真有需要再加。

---

## 加一个项目

和写文章类似，但目录是 `src/content/projects/`，字段不同：

```markdown
---
title: MewHelp · 电商智能客服 Agent
subtitle: 从一条纯对话接口起步，逐章长成一个能用的客服系统
role: 独立完成
nature: 课程项目 · 按章节复现并二次开发
stack: [FastAPI, LangGraph, Milvus]
metrics:
  - { value: '10', label: '递进章节' }
  - { value: '6727', label: '应用代码行' }
status: completed
year: '2026'
order: 1
repo: https://github.com/dream-kaii/MewHelp
---

## 这个项目做了什么

正文……
```

| 字段 | 说明 |
|---|---|
| `role` | 你的角色，如「独立完成」「负责后端」 |
| `nature` | 项目性质。**如果是课程项目或复现，如实写** —— 诚实比夸大可信 |
| `metrics` | 首页卡片上显示的数字，2-4 个即可 |
| `order` | 显示顺序，数字小的排前面 |
| `repo` | 仓库地址，可选 |
| `status` | `completed` 或 `in-progress` |

---

## 改学习路线

数据在 `src/content/learning/` 下的三个 YAML 文件：`agent.yml`、`algo.yml`、`backend.yml`。

每一步的结构：

```yaml
- id: a3
  title: 让模型会调工具
  duration: 3-5 天
  body: Function Calling 是 Agent 的分水岭。核心只有一件事……
  tips:
    - 工具的命名、参数、描述，就是模型的世界观。
  article:
    status: published          # published 或 planned
    title: 工具调用的三个工程问题
    href: /writing/tool-calling-pitfalls/    # published 时必填
  docs:
    - { label: LangChain · Tools ↗, url: https://docs.langchain.com/oss/python/langchain/tools }
```

**关键**：`article.status` 为 `published` 时必须给 `href`，且指向真实存在的文章路径；否则页面上的链接会 404。

---

## 常见问题

**Q：我想调整首页的自我介绍文案，改哪里？**
A：`src/data/site.ts`（姓名、邮箱、方向等）+ `src/components/Hero.astro`（介绍段落）。

**Q：能不能用中文文件名？**
A：技术上可以，但网址会出现百分比编码（`%E4%B8%AD%E6%96%87`），不好看也不好分享。建议用英文。

**Q：文章写多长合适？**
A：技术文章 2000-4000 字比较舒服。重点是**讲清一件事**，不是堆字数。

**Q：想把旧博客的文章搬过来？**
A：旧站的 HTML 需要转成 Markdown。可以用 `pandoc` 或手动整理 —— 手动整理虽然慢，但能顺便把过时的内容删掉。

**Q：构建失败了怎么办？**
A：先看报错信息，通常会明确指出是哪个文件哪一行。最常见的三种：frontmatter 字段写错、`category` 不在枚举里、日期格式不对。

---

## 记住这三条

1. **加文章 = 建 Markdown 文件 + 填元信息 + 推送**
2. **引用别人的东西就加 `sources`**
3. **`pnpm build` 会在本地提前帮你抓出格式错误**
