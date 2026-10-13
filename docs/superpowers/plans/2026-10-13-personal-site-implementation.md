# kaii 个人站 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把已定稿的六页设计稿实现成一个可部署的 Astro 静态站点。

**Architecture:** Astro 5 + Tailwind CSS 4。三栏骨架抽成共享 Layout，页面通过 slot 注入左栏/右栏内容。文章与项目走 Content Collections（Markdown + Zod 校验）。三个交互组件（对比演示、时间轴、召回对比器）做成 Astro Islands，只在需要处加载 JS。

**Tech Stack:** Astro 5 · Tailwind CSS 4 · TypeScript（strict）· Pagefind（搜索）· pnpm

**Spec:** `docs/superpowers/specs/2026-10-13-personal-site-design.md`

**设计稿参考**（实现时的视觉基准）：`design-mockup/*.html`

---

## Global Constraints

- **Node.js** ≥ 20；包管理器 **pnpm**
- **Astro** 5.x，**Tailwind CSS** 4.x
- **TypeScript strict 模式**，`astro check` 零错误
- **零运行时框架依赖**：不引入 React/Vue；交互用原生 `<script>`（Astro Islands 原生模式）
- **配色令牌**（取自 `design-mockup/*.html` 的 `:root`）：

```
--paper:#FAF9F2  --paper2:#F2F1E4  --card:#FFFFFF
--gh:#B5CA4D     --gm:#5E8A4E     --gd:#3E6B3F   --gk:#2A4D2E
--ink:#1F2919    --ink2:#48543E   --ink3:#7A8570 --ink4:#A6AE9C
--line:#E2E1D2   --line2:#EDECDF
--rose:#C4685C   --amber:#D99A3C  --violet:#8B6FB8
```

- **字体**：正文系统无衬线栈；等宽仅用于数字、日期、技术标签、代码
- **间距刻度**：`4 / 8 / 16 / 24 / 32 / 48 / 64 / 96`（Tailwind 默认间距即覆盖，不额外定义）
- **圆角**：`8px` 小元素 · `14px` 卡片 · `22px` 大容器（对应 Tailwind `rounded-lg` / `rounded-[14px]` / `rounded-[22px]`）
- **无障碍**：所有动效必须包在 `@media (prefers-reduced-motion: reduce)` 内
- **响应式断点**：`1320px`（收右栏）/ `1080px`（收左栏）/ `700px`（收边距）
- **不得编造**：文章中的版本号、API 签名、性能数字必须来自 `sources-verified.md` 中已核实的来源
- **内部链接不得 404**：所有 `href` 指向真实存在的路由
- **导航 `active` 取值必须与 `Nav.astro` 的 `key` 严格一致**：`'home' | 'projects' | 'writing' | 'learning' | 'about'`
  首页 → `home`；项目列表页与项目详情页 → `projects`；文章列表页与文章详情页 → `writing`；
  学习路线页 → `learning`；关于页 → `about`

---

## Review Focus

1. **未写完的文章链接**：文章列表 8 篇中只有 1 篇有真实内容，其余是占位。**期望行为**：占位文章应显示"即将发布"状态或指向 `/writing/` 列表页，不能产生 404。
2. **空内容集合**：`projects` 或 `writing` 目录为空时构建应当**失败并给出明确提示**，而不是产出空白页面。
3. **超长标题/标签**：中文长标题或用户填入的超长 tag 可能撑破卡片。**期望行为**：`overflow-wrap: anywhere` + 卡片高度自适应，不产生横向滚动。
4. **`prefers-reduced-motion` 下的时序依赖**：三个动效组件在动画被禁用时必须**立即呈现终态**（而非停在初始态导致内容不可见）。
5. **外链与来源**：`sources-verified.md` 标注为 ⚠️ 的来源不得作为唯一依据；外链应带 `rel="noopener"`。

---

## 文件结构

```
/
├── astro.config.mjs              Astro 配置（Tailwind 集成、站点 URL、sitemap）
├── tsconfig.json                 strict 模式
├── package.json
├── pnpm-workspace.yaml           含 allowBuilds
├── public/
│   ├── avatar.jpg                从 design-mockup/assets 复制
│   ├── hero-bg.jpg
│   ├── favicon.svg
│   └── CNAME                     新域名（待用户提供，先留占位）
├── src/
│   ├── styles/
│   │   └── global.css            设计令牌 + 基础样式 + 组件类
│   ├── layouts/
│   │   ├── BaseLayout.astro       <html> 骨架、导航、页脚、进度条
│   │   └── ContentLayout.astro    三栏骨架（左栏/中栏/右栏 slot）
│   ├── components/
│   │   ├── Nav.astro              顶部导航（高亮当前页）
│   │   ├── Footer.astro
│   │   ├── RailLeft.astro         左栏容器（进度环 + slot）
│   │   ├── RailRight.astro        右栏容器（目录 + slot）
│   │   ├── ProgressRing.astro     阅读进度环（含内联脚本）
│   │   ├── TocList.astro          右栏目录（含滚动高亮脚本）
│   │   ├── TagList.astro          标签组
│   │   ├── ProjectCard.astro      首页项目卡
│   │   ├── PostRow.astro          文章行
│   │   ├── StepCard.astro         学习路线的单个步骤卡
│   │   ├── AgentCompare.astro     ★ 首页对比演示（Island）
│   │   ├── EvolutionTimeline.astro ★ 十步演进时间轴（Island）
│   │   ├── RetrievalDemo.astro    ★ 文章页召回对比器（Island）
│   │   ├── Glossary.astro         名词速查折叠面板
│   │   └── ProjectStages.astro    项目十章演进卡
│   ├── content/
│   │   ├── config.ts              Content Collections + Zod schema
│   │   ├── writing/               技术文章（Markdown）
│   │   ├── projects/              项目详情（Markdown）
│   │   └── learning/              学习路线（YAML 数据）
│   ├── data/
│   │   ├── site.ts                站点元信息（名字、邮箱、链接）
│   │   ├── evolution.ts           十步演进数据
│   │   └── glossary.ts            名词速查数据
│   └── pages/
│       ├── index.astro            首页
│       ├── about.astro            关于
│       ├── learning-path.astro    学习路线
│       ├── writing/
│       │   ├── index.astro        文章列表
│       │   └── [...slug].astro    文章详情
│       ├── projects/
│       │   ├── index.astro        项目列表
│       │   └── [...slug].astro    项目详情
│       └── 404.astro
```

---

### Task 1: 项目脚手架与设计令牌

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `pnpm-workspace.yaml`
- Create: `src/styles/global.css`
- Create: `src/pages/index.astro`（临时占位）
- Test: 构建成功 + `astro check` 通过

**Interfaces:**
- Consumes: 无
- Produces: 可运行的 Astro 项目；`global.css` 中的 CSS 变量与工具类

- [ ] **Step 1: 初始化项目**

```bash
cd /Users/kaii/MyProjects/blog-review
pnpm create astro@latest site --template minimal --typescript strict --no-install --no-git
```

若交互式提示无法跳过，则手动创建 `site/package.json`：

```json
{
  "name": "kaii-site",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "check": "astro check"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
cd /Users/kaii/MyProjects/blog-review/site
pnpm add astro@^5
pnpm add -D @astrojs/check typescript @tailwindcss/vite tailwindcss@^4
pnpm add -D @astrojs/sitemap
```

- [ ] **Step 3: 写 `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',   // 待用户提供新域名后替换
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
});
```

- [ ] **Step 4: 写 `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

- [ ] **Step 5: 写 `src/styles/global.css`**

```css
@import "tailwindcss";

@theme {
  --color-paper: #FAF9F2;
  --color-paper2: #F2F1E4;
  --color-card: #FFFFFF;
  --color-gh: #B5CA4D;
  --color-gm: #5E8A4E;
  --color-gd: #3E6B3F;
  --color-gk: #2A4D2E;
  --color-ink: #1F2919;
  --color-ink2: #48543E;
  --color-ink3: #7A8570;
  --color-ink4: #A6AE9C;
  --color-line: #E2E1D2;
  --color-line2: #EDECDF;
  --color-rose: #C4685C;
  --color-amber: #D99A3C;
  --color-violet: #8B6FB8;

  --font-mono: "SF Mono", "JetBrains Mono", "Fira Code", ui-monospace, Menlo, monospace;

  --radius-sm: 8px;
  --radius-card: 14px;
  --radius-lg: 22px;
}

html { scroll-behavior: smooth; }

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
               "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* 纸张纹理 */
body::before {
  content: "";
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: repeating-linear-gradient(
    45deg, rgba(62,107,63,.017) 0 1px, transparent 1px 15px);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}

/* 滚动入场 */
.rv {
  opacity: 0; transform: translateY(28px);
  transition: opacity .75s cubic-bezier(.22,1,.36,1),
              transform .75s cubic-bezier(.22,1,.36,1);
}
.rv.in { opacity: 1; transform: none; }
.rv[data-d="1"] { transition-delay: .08s; }
.rv[data-d="2"] { transition-delay: .16s; }
.rv[data-d="3"] { transition-delay: .24s; }
@media (prefers-reduced-motion: reduce) {
  .rv { opacity: 1 !important; transform: none !important; }
}
```

- [ ] **Step 6: 写占位首页并验证构建**

`src/pages/index.astro`:

```astro
---
import '../styles/global.css';
---
<html lang="zh-CN">
  <head><meta charset="utf-8"><title>kaii</title></head>
  <body><h1>kaii</h1></body>
</html>
```

Run: `pnpm build`
Expected: 构建成功，`dist/index.html` 生成，`astro check` 无错误

- [ ] **Step 7: 复制静态资源**

```bash
mkdir -p public
cp ../design-mockup/assets/avatar.jpg public/
cp ../design-mockup/assets/hero-bg.jpg public/
```

**同时创建 `public/favicon.svg`**（本任务负责，`<link rel="icon" href="/favicon.svg">` 引用的就是这个文件）：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#3E6B3F"/>
  <path d="M16 6.5l8 4.5v9L16 24.5 8 20v-9l8-4.5z" fill="none" stroke="#B5CA4D"
        stroke-width="2" stroke-linejoin="round"/>
  <circle cx="16" cy="15.5" r="2.6" fill="#B5CA4D"/>
</svg>
```

图形是首页技术名片里的 Agent 六边形图标，配色取自设计令牌（`--color-gd` 底 + `--color-gh` 描边）。
用 SVG 而非 ICO：单文件适配所有尺寸，体积仅 307 字节。

- [ ] **Step 8: Commit**

```bash
git init -b main
git add -A
git commit -m "chore: 初始化 Astro 项目与设计令牌"
```

---

### Task 2: 内容集合与数据文件

**Files:**
- Create: `src/content/config.ts`
- Create: `src/data/site.ts`, `src/data/evolution.ts`, `src/data/glossary.ts`
- Create: `src/content/writing/.gitkeep`, `src/content/projects/.gitkeep`, `src/content/learning/.gitkeep`
- Test: `astro check` 通过；故意写错一条 frontmatter 应当报错

**Interfaces:**
- Consumes: Task 1 的项目
- Produces:
  - `site` 对象：`{ name, fullName, email, github, role, cohort }`
  - `evolution` 数组：`{ n: string, title: string, en: string, desc: string, items: string[], pitfalls: string[] }[]`
  - `glossary` 数组：`{ term: string, def: string }[]`
  - Content Collections：`writing`、`projects`、`learning`

- [ ] **Step 1: 写 `src/data/site.ts`**

```ts
export const site = {
  name: 'kaii',
  fullName: 'kaii',
  email: '2157497451@qq.com',
  github: 'https://github.com/dream-kaii',
  role: 'Agent 应用开发 · Java 后端',
  cohort: '软件工程 · 2028 届',
  available: true,
} as const;
```

- [ ] **Step 2: 写 `src/data/glossary.ts`**

从 `design-mockup/index-v9.html` 的 `GLOSSARY` 区块逐条搬运 12 个名词。格式：

```ts
export interface GlossaryItem { term: string; def: string; }

export const glossary: GlossaryItem[] = [
  { term: 'LLM', def: '大语言模型。就是 GPT、DeepSeek 这类「会说话」的模型本体，只负责理解和生成文字，本身够不到你的数据库。' },
  { term: 'Agent', def: '在模型外面套一层「能动手」的框架：它自己判断该做什么、去调工具拿数据、再根据结果决定下一步，直到把事办完。' },
  { term: 'Function Calling', def: '让模型能「点菜」。你把可用的功能描述给它，它自己决定什么时候调用哪一个、传什么参数。' },
  // …其余 9 条从设计稿搬运，文案一字不改
];
```

- [ ] **Step 3: 写 `src/data/evolution.ts`**

从 `design-mockup/index-v9.html` 的 `ST` 数组逐条搬运 10 步。格式：

```ts
export interface EvolutionStep {
  n: string; title: string; en: string;
  desc: string; items: string[]; pitfalls: string[];
}

export const evolution: EvolutionStep[] = [
  {
    n: '01', title: '对话能跑通', en: 'Pure Chat',
    desc: '任何 Agent 应用的起点都是把一次对话做稳：流式输出让用户不用干等，多轮上下文让对话能接住，历史按 token 预算裁剪避免越聊越贵。',
    items: ['SSE 流式输出，逐 token 渲染', '多轮会话续接与会话标识', '历史裁剪按 token 预算兜底', '结构化抽取：把自然语言变成可入库的字段'],
    pitfalls: ['裁剪要按「对话对」整组删，否则会把工具调用链拆散', '上游协议统一后，换模型只改配置'],
  },
  // …其余 9 步从设计稿搬运
];
```

- [ ] **Step 4: 写 `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['agent', 'java', 'algo']),
    tags: z.array(z.string()).default([]),
    minutes: z.number().int().positive(),
    status: z.enum(['published', 'planned']).default('published'),
    sources: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
      kind: z.enum(['official', 'course', 'roadmap', 'article']),
    })).default([]),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    role: z.string(),
    nature: z.string(),
    stack: z.array(z.string()),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })),
    status: z.enum(['completed', 'in-progress']).default('completed'),
    year: z.string(),
    order: z.number(),
    repo: z.string().url().optional(),
  }),
});

const learning = defineCollection({
  type: 'data',
  schema: z.object({
    track: z.enum(['agent', 'algo', 'backend']),
    label: z.string(),
    subtitle: z.string(),
    intro: z.string(),
    stages: z.array(z.object({ n: z.string(), title: z.string(), desc: z.string() })),
    steps: z.array(z.object({
      id: z.string(),
      title: z.string(),
      duration: z.string(),
      body: z.string(),
      tips: z.array(z.string()).default([]),
      warn: z.string().optional(),
      article: z.object({
        status: z.enum(['published', 'planned']),
        title: z.string(),
        href: z.string().optional(),
      }).optional(),
      docs: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    })),
  }),
});

export const collections = { writing, projects, learning };
```

- [ ] **Step 5: 验证 schema 生效**

Run: `pnpm check`
Expected: 通过（此时集合为空，不报错）

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 内容集合 schema 与站点数据"
```

---

### Task 3: BaseLayout 与导航页脚

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Nav.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro`
- Test: 首页渲染出导航四项 + 页脚

**Interfaces:**
- Consumes: `site` from `src/data/site.ts`
- Produces: `<BaseLayout title active>`，`active` 取值 `'home' | 'projects' | 'writing' | 'learning' | 'about'`

- [ ] **Step 1: 写 `src/components/Nav.astro`**

```astro
---
import { site } from '../data/site';
interface Props { active?: string }
const { active } = Astro.props;
const items = [
  { key: 'home',     href: '/',              label: '首页' },
  { key: 'projects', href: '/projects/',     label: '项目' },
  { key: 'writing',  href: '/writing/',      label: '文章' },
  { key: 'learning', href: '/learning-path/',label: '学习路线' },
  { key: 'about',    href: '/about/',        label: '关于' },
];
---
<nav class="sticky top-0 z-60 border-b border-line2"
     style="background:rgba(250,249,242,.87);backdrop-filter:blur(16px)">
  <div class="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-10">
    <a href="/" class="flex items-center gap-2.5 text-ink no-underline">
      <img src="/avatar.jpg" alt="" width="31" height="31"
           class="rounded-full border-2 border-white object-cover"
           style="box-shadow:0 0 0 1.5px var(--color-gh)" />
      <span class="font-mono text-[15px] font-semibold">{site.name}</span>
    </a>
    <div class="flex gap-0.5">
      {items.map(i => (
        <a href={i.href}
           class:list={['rounded-lg px-3.5 py-2 text-[13.5px] no-underline transition',
                        active === i.key
                          ? 'font-semibold text-gd'
                          : 'text-ink2 hover:bg-paper2 hover:text-gd']}>
          {i.label}
        </a>
      ))}
    </div>
  </div>
</nav>
```

- [ ] **Step 2: 写 `src/components/Footer.astro`**

```astro
---
import { site } from '../data/site';
---
<footer class="mt-14 border-t border-line2 pb-12 pt-8">
  <div class="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-6 px-10">
    <span class="flex items-center gap-2.5 font-mono text-[12.5px] text-ink3">
      <img src="/avatar.jpg" alt="" width="21" height="21"
           class="rounded-full border-[1.5px] border-white object-cover"
           style="box-shadow:0 0 0 1px var(--color-gh)" />
      © 2026 {site.name}
    </span>
    <div class="flex gap-6">
      <a href={site.github} rel="noopener" target="_blank"
         class="text-[13px] text-ink2 no-underline transition hover:text-gd">GitHub</a>
      <a href={`mailto:${site.email}`}
         class="text-[13px] text-ink2 no-underline transition hover:text-gd">邮箱</a>
      <a href="/rss.xml"
         class="text-[13px] text-ink2 no-underline transition hover:text-gd">RSS</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: 写 `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import { site } from '../data/site';

interface Props {
  title: string;
  description?: string;
  active?: string;
}
const { title, description = site.role, active } = Astro.props;
---
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
  </head>
  <body>
    <div id="progress-bar"
         class="fixed left-0 top-0 z-[100] h-[3px] w-0"
         style="background:linear-gradient(90deg,var(--color-gd),var(--color-gh))"></div>
    <Nav active={active} />
    <slot />
    <Footer />
    <script>
      // 滚动入场 + 顶部进度条（全站共用）
      const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!rm) {
        const io = new IntersectionObserver((es) => {
          es.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
          });
        }, { threshold: .06, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.rv').forEach((el) => io.observe(el));
      } else {
        document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'));
      }

      const bar = document.getElementById('progress-bar');
      const upd = () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        if (bar) bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
      };
      addEventListener('scroll', upd, { passive: true });
      upd();
    </script>
  </body>
</html>
```

- [ ] **Step 4: 改写 `src/pages/index.astro` 验证骨架**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="kaii — Agent 应用开发" active="home">
  <main class="mx-auto max-w-[1440px] px-10 py-20">
    <h1 class="text-4xl font-extrabold">首页</h1>
  </main>
</BaseLayout>
```

- [ ] **Step 5: 验证**

Run: `pnpm build && pnpm preview`
Expected: 页面出现导航五项 + 页脚；点击导航跳转（其他页 404 属正常，后续任务补）

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: BaseLayout 与导航页脚"
```

---

### Task 4: 三栏布局骨架（ContentLayout + RailLeft + RailRight）

**Files:**
- Create: `src/layouts/ContentLayout.astro`
- Create: `src/components/ProgressRing.astro`, `src/components/RailRight.astro`, `src/components/TocList.astro`
- Test: 用临时页面验证三栏在 1440/1000/700px 三个断点表现

**Interfaces:**
- Consumes: `BaseLayout`
- Produces:
  - `<ContentLayout title active left={...} right={...}>` — 左栏/右栏通过具名 slot 注入
  - `<TocList items={[{href,label}]}>` — 右栏目录，含滚动高亮脚本
  - `<ProgressRing />` — 左栏进度环，含脚本

- [ ] **Step 1: 写 `src/components/ProgressRing.astro`**

```astro
---
---
<div class="mb-7 flex flex-col items-end gap-2.5">
  <svg id="ring" width="60" height="60" viewBox="0 0 60 60"
       class="block max-h-[60px] max-w-[60px] flex-none" style="transform:rotate(-90deg)">
    <circle cx="30" cy="30" r="26" fill="none" stroke="var(--color-line)" stroke-width="4" />
    <circle id="ring-fg" cx="30" cy="30" r="26" fill="none" stroke="var(--color-gd)"
            stroke-width="4" stroke-linecap="round"
            stroke-dasharray="163.4" stroke-dashoffset="163.4" />
  </svg>
  <span id="ring-label" class="font-mono text-[10.5px] tracking-wide text-ink4">0% 已读</span>
</div>
<script>
  const CIRC = 163.4;
  const fg = document.getElementById('ring-fg');
  const lb = document.getElementById('ring-label');
  const upd = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    const p = h > 0 ? Math.min(scrollY / h, 1) : 0;
    if (fg) fg.style.strokeDashoffset = String(CIRC * (1 - p));
    if (lb) lb.textContent = Math.round(p * 100) + '% 已读';
  };
  addEventListener('scroll', upd, { passive: true });
  upd();
</script>
```

- [ ] **Step 2: 写 `src/components/TocList.astro`**

```astro
---
interface Props {
  items: { href: string; label: string }[];
  heading?: string;
}
const { items, heading = '本文目录' } = Astro.props;
---
<div>
  <h5 class="mb-3 font-mono text-[9.5px] font-bold tracking-[.11em] text-ink4">{heading}</h5>
  <ol class="list-none counter-reset">
    {items.map((it, i) => (
      <li class="py-[3px]">
        <a href={it.href}
           data-toc
           class:list={['flex gap-2.5 border-l-2 border-line2 py-1 pl-3 text-[12.3px] leading-relaxed text-ink3 no-underline transition',
                        i === 0 && 'is-active font-semibold text-gd']}>
          <span class="flex-none pt-0.5 font-mono text-[10px] font-bold text-gh">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span>{it.label}</span>
        </a>
      </li>
    ))}
  </ol>
</div>
<style>
  [data-toc].is-active { border-left-color: var(--color-gd); }
  [data-toc]:hover { color: var(--color-gd); border-left-color: var(--color-gh); padding-left: .875rem; }
</style>
<script>
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc]')];
  const targets = links
    .map((a) => {
      const id = a.getAttribute('href')?.slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter((el): el is HTMLElement => !!el);

  const hl = () => {
    let cur = targets[0]?.id;
    targets.forEach((t) => { if (t.getBoundingClientRect().top <= 140) cur = t.id; });
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', hl, { passive: true });
  hl();
</script>
```

- [ ] **Step 3: 写 `src/components/RailRight.astro`**

```astro
---
interface Props { sticky?: boolean }
const { sticky = true } = Astro.props;
---
<aside class:list={['toc2', sticky && 'sticky top-24 self-start pt-14']}>
  <slot />
</aside>
<style>
  @media (max-width: 1320px) { .toc2 { display: none; } }
</style>
```

- [ ] **Step 4: 写 `src/layouts/ContentLayout.astro`**

三栏骨架。左右栏用具名 slot，中栏用默认 slot。

```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  description?: string;
  active?: string;
  hasLeft?: boolean;
  hasRight?: boolean;
}
const { title, description, active, hasLeft = true, hasRight = true } = Astro.props;
---
<BaseLayout title={title} description={description} active={active}>
  <div class="shell" data-left={hasLeft} data-right={hasRight}>
    {hasLeft && (
      <aside class="rail-l self-start pt-14">
        <slot name="left" />
      </aside>
    )}
    <div class="mid">
      <slot />
    </div>
    {hasRight && (
      <aside class="rail-r self-start pt-14">
        <slot name="right" />
      </aside>
    )}
  </div>
</BaseLayout>

<style>
  .shell {
    margin: 0 auto; max-width: 1440px; padding: 0 2.5rem;
    display: grid; gap: 3.5rem; align-items: start;
    grid-template-columns: 212px minmax(0, 740px) 236px;
    justify-content: center;
  }
  .shell[data-right="false"] { grid-template-columns: 212px minmax(0, 740px); }
  .shell[data-left="false"]  { grid-template-columns: minmax(0, 740px) 236px; }
  .shell[data-left="false"][data-right="false"] { grid-template-columns: minmax(0, 740px); }
  .mid { min-width: 0; }
  .rail-l, .rail-r { position: sticky; top: 96px; }

  @media (max-width: 1320px) {
    .shell { grid-template-columns: 212px minmax(0, 740px); gap: 3.25rem; }
    .rail-r { display: none; }
  }
  @media (max-width: 1080px) {
    .shell { grid-template-columns: minmax(0, 1fr); gap: 0; padding: 0 1.5rem; max-width: 820px; }
    .rail-l, .rail-r { display: none; }
  }
  @media (max-width: 700px) {
    .shell { padding: 0 1rem; }
  }
</style>
```

- [ ] **Step 5: 用临时页面验证三栏**

临时改写 `src/pages/about.astro`：

```astro
---
import ContentLayout from '../layouts/ContentLayout.astro';
const toc = [{ href: '#a', label: '测试章节一' }, { href: '#b', label: '测试章节二' }];
---
<ContentLayout title="关于 — 测试" active="about">
  <div slot="left" class="text-right">
    <p class="font-mono text-xs text-ink3">左栏占位</p>
  </div>
  <h2 id="a" class="text-2xl font-bold">测试章节一</h2>
  <p class="mt-4 text-ink2">正文内容测试。</p>
  <div class="h-[800px]"></div>
  <h2 id="b" class="text-2xl font-bold">测试章节二</h2>
  <div slot="right">
    <TocList items={toc} />
  </div>
</ContentLayout>
```

注意：`TocList` 需在 frontmatter import。

Run: `pnpm dev`，在浏览器把窗口宽度依次拖到 1440 / 1200 / 1000 / 700px
Expected:
- 1440px：三栏并排
- 1200px：右栏消失，左栏 + 正文
- 1000px：左右栏都消失，正文居中最大 740px
- 700px：边距收窄
- 滚动时进度环数字变化、目录高亮跟随

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 三栏内容布局与右栏目录"
```

---

### Task 5: 首页 Hero（自我介绍 + 技术名片）

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/components/Hero.astro`
- Test: 1440px 下左右分屏正确；700px 下堆叠；荧光笔高亮生效

**Interfaces:**
- Consumes: `site`
- Produces: `<Hero />`

- [ ] **Step 1: 写 `src/components/Hero.astro`**

从 `design-mockup/index-v9.html` 的 `<div class="hero">` 区块搬运。要点：

- 背景：`hero-bg.jpg` + 线性渐变遮罩
- 左：`开放实习机会` 徽章 → `你好，我是 kaii`（`kaii` 带荧光笔高亮）→ 定位行 → 欢迎语 → 两个按钮 → 三个社交图标
- 右：技术名片（头像 / kaii / github 地址 / 学习中 徽章 / 方向 / 正在学 / 正在用 / 底部两格 `Agent 当前主攻方向` + `Java 工程底子`）
- 视差：mousemove 时背景 `translate3d`，鼠标离开归位
- 荧光笔：`::before` 伪元素 `scaleX(0)` → `scaleX(1)`，加载后触发

关键 CSS（自设计稿迁移）：

```css
.hero { position: relative; overflow: hidden;
  background: linear-gradient(165deg,#D2E284 0%,#B5CA4D 34%,#8FA84E 68%,#6B9149 100%); }
.hero-art { position:absolute; inset:-6% -4%; z-index:0;
  background:url('/hero-bg.jpg') center 38%/cover no-repeat; opacity:.85; will-change:transform; }
.hero-art::after { content:""; position:absolute; inset:0;
  background:linear-gradient(180deg,rgba(250,249,242,.62) 0%,rgba(250,249,242,.1) 24%,
    transparent 50%,rgba(250,249,242,.93) 100%); }
```

**`prefers-reduced-motion` 处理**：视差脚本在 rm 为 true 时不注册 mousemove；荧光笔在 rm 下直接置为终态。

- [ ] **Step 2: 接入首页**

`src/pages/index.astro`：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
---
<BaseLayout title="kaii — Agent 应用开发" active="home">
  <Hero />
</BaseLayout>
```

- [ ] **Step 3: 验证**

Run: `pnpm dev`
Expected:
- 首屏左右分屏；左侧文案、右侧名片
- 鼠标在 Hero 区移动时背景轻微位移，离开归位
- 「kaii」下方荧光笔从左往右刷出
- 窗口拖到 700px：堆叠为单列
- 系统开启「减少动态效果」后：无位移动画，荧光笔直接显示

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 首页 Hero 与视差"
```

---

### Task 6: 首页对比演示（AgentCompare Island）

**Files:**
- Create: `src/components/AgentCompare.astro`
- Modify: `src/pages/index.astro`
- Test: 进入视口自动播放；重播按钮可用；`prefers-reduced-motion` 下直接显示终态

**Interfaces:**
- Consumes: 无
- Produces: `<AgentCompare />`（自包含，无 props）

- [ ] **Step 1: 写 `src/components/AgentCompare.astro`**

从 `design-mockup/index-v9.html` 的 `<!-- ================= Agent 和普通 AI 问答 ================= -->` 区块搬运结构与样式。

核心动画逻辑（自设计稿搬运，时序参数不变）：

```js
const pfs      = [...document.querySelectorAll('.pf')];
const plainAns = document.getElementById('plainAns');
const tks      = [...document.querySelectorAll('.think-col .tk')];
const syss     = [...document.querySelectorAll('.sys')];
const agentAns = document.getElementById('agentAns');
const qState   = document.getElementById('qState');
let timers = [], played = false;

const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

function clearAll() {
  timers.forEach(clearTimeout); timers = [];
  pfs.forEach(e => e.classList.remove('on'));
  tks.forEach(e => e.classList.remove('show', 'ready'));
  syss.forEach(e => e.classList.remove('show'));
  plainAns?.classList.remove('show');
  agentAns?.classList.remove('show');
}
const at = (ms, fn) => timers.push(setTimeout(fn, ms));

function play() {
  clearAll();
  if (qState) { qState.classList.remove('done'); qState.lastChild.textContent = '播放中'; }

  // 左：普通 AI —— 2 步走完
  at(420,  () => pfs[0]?.classList.add('on'));
  at(1050, () => pfs[1]?.classList.add('on'));
  at(1700, () => plainAns?.classList.add('show'));

  // 右：Agent —— 5 步思考，每步转圈 620ms 后打勾，系统环节同步亮起
  for (let i = 0; i < 5; i++) {
    const T = 2300 + i * 1050;
    at(T,       () => tks[i]?.classList.add('show'));
    at(T + 620, () => { tks[i]?.classList.add('ready'); syss[i]?.classList.add('show'); });
  }
  at(2300 + 5 * 1050 + 300, () => {
    agentAns?.classList.add('show');
    if (qState) { qState.classList.add('done'); qState.lastChild.textContent = '完成'; }
  });
}

let played2 = false;
const ioS = new IntersectionObserver((es) => {
  es.forEach(e => {
    if (e.isIntersecting && !played2 && !rm) { played2 = true; setTimeout(play, 340); ioS.disconnect(); }
  });
}, { threshold: .22 });
const box = document.querySelector('.sync');
if (box) ioS.observe(box);
document.getElementById('replay')?.addEventListener('click', () => { played2 = true; play(); });

if (rm) {
  pfs.forEach(e => e.classList.add('on'));
  tks.forEach(e => e.classList.add('show', 'ready'));
  syss.forEach(e => e.classList.add('show'));
  plainAns?.classList.add('show');
  agentAns?.classList.add('show');
  if (qState) { qState.classList.add('done'); qState.lastChild.textContent = '完成'; }
}
```

**移动端**：`< 760px` 时取消左右分栏，思考链与系统环节改为上下单列（中间虚线分隔）。**同步感通过动画时序保留，不依赖空间并排**。

- [ ] **Step 2: 接入首页并验证**

Run: `pnpm dev`
Expected:
- 滚动到该区块，动画自动开始
- 左栏在 1.7s 结束，右栏从 2.3s 起逐步推进
- 每个思考步骤先转圈（约 780ms/圈），620ms 后变打勾
- 点「重播」可重放
- 700px 下为单列，动画仍同步
- 系统开启减少动态效果：直接显示完整终态

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 首页 Agent 对比演示动画"
```

---

### Task 7: 首页能力全景与名词速查

**Files:**
- Create: `src/components/CapabilityGrid.astro`, `src/components/Glossary.astro`
- Modify: `src/pages/index.astro`
- Test: 折叠面板可展开/收起；键盘可达

**Interfaces:**
- Consumes: `glossary` from `src/data/glossary.ts`
- Produces: `<CapabilityGrid />`、`<Glossary />`

- [ ] **Step 1: 写 `src/components/CapabilityGrid.astro`**

三栏内容自 `design-mockup/index-v9.html` 的 `<!-- LANDSCAPE -->` 区块搬运：

- 左栏「输入侧 · 怎么听懂」：多轮上下文 / 指代消解 / 意图分流 / Query 扩写
- 中间「请求在系统里走一遍」：8 个编号步骤（sticky）
- 右栏「输出侧 · 怎么答对」：混合检索 / 重排精筛 / 拒答与引用 / 数据飞轮

- [ ] **Step 2: 写 `src/components/Glossary.astro`**

```astro
---
import { glossary } from '../data/glossary';
---
<section class="mx-auto max-w-[1440px] px-10 pb-5">
  <div id="glossary" class="rv overflow-hidden rounded-[22px] border border-line bg-card"
       style="box-shadow:0 1px 3px rgba(42,77,46,.05)">
    <button id="gl-head" type="button" aria-expanded="false" aria-controls="gl-body"
            class="flex w-full cursor-pointer items-center gap-3 border-b border-line2 px-[26px] py-[17px] text-left">
      <svg class="gl-arrow h-4 w-4 flex-none" viewBox="0 0 24 24" fill="none"
           stroke="var(--color-gm)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
      <h3 class="flex-1 text-[14.5px] font-bold">名词速查</h3>
      <span class="font-mono text-[11px] text-ink4">看不明白的词，这里有一句话解释</span>
    </button>
    <div id="gl-body" class="gl-body">
      <dl class="grid md:grid-cols-2">
        {glossary.map((g) => (
          <div class="border-b border-line2 px-[26px] py-3.5 last:border-b-0">
            <dt class="mb-1.5 font-mono text-[11.5px] font-bold text-gd">{g.term}</dt>
            <dd class="text-[12.8px] leading-relaxed text-ink2">{g.def}</dd>
          </div>
        ))}
      </dl>
    </div>
  </div>
</section>
<style>
  .gl-body { max-height: 0; overflow: hidden; transition: max-height .5s cubic-bezier(.22,1,.36,1); }
  #glossary.open .gl-body { max-height: 1200px; }
  .gl-arrow { transition: transform .3s; }
  #glossary.open .gl-arrow { transform: rotate(180deg); }
</style>
<script>
  const gl = document.getElementById('glossary');
  const head = document.getElementById('gl-head');
  const body = document.getElementById('gl-body');
  head?.addEventListener('click', () => {
    const open = gl!.classList.toggle('open');
    head.setAttribute('aria-expanded', String(open));
    if (body) body.setAttribute('aria-hidden', String(!open));
  });
</script>
```

- [ ] **Step 3: 接入并验证**

Run: `pnpm dev`
Expected: 折叠面板默认收起，点击展开 12 条名词；`Tab` 能聚焦到标题栏并用 `Enter` 展开

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 首页能力全景与名词速查"
```

---

### Task 8: 首页项目卡、文章列表与联系区

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/components/PostRow.astro`, `src/components/ContactBand.astro`
- Modify: `src/pages/index.astro`
- Test: 数字滚动在进入视口时触发；文章标题与列表页一致

**Interfaces:**
- Consumes: `writing` collection（取前 8 条）
- Produces: 三个组件

- [ ] **Step 1: 写 `src/components/ProjectCard.astro`**

```astro
---
interface Props {
  index: string;
  title: string;
  role: string;
  desc: string;
  badge: string;
  badgePrimary?: boolean;
  metrics: { value: number; label: string; suffix?: string }[];
  tags: string[];
  href: string;
}
const { index, title, role, desc, badge, badgePrimary, metrics, tags, href } = Astro.props;
---
<a href={href} class="pc-rv group relative block overflow-hidden rounded-[22px] border border-line bg-card p-8 no-underline transition hover:-translate-y-1 hover:border-[#D5D8C4]"
   style="box-shadow:0 1px 3px rgba(42,77,46,.05)">
  <div class="mb-3.5 flex items-start justify-between gap-6">
    <div>
      <span class="mb-2 block font-mono text-[11px] font-bold tracking-[.13em] text-ink4">{index}</span>
      <h3 class="mb-1.5 text-[21px] font-bold leading-snug tracking-[-.022em] text-ink">{title}</h3>
      <div class="font-mono text-[12.5px] font-semibold text-gm">{role}</div>
    </div>
    <span class:list={['whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-bold',
                       badgePrimary ? 'bg-gd text-white' : 'border border-line bg-paper2 text-ink2']}>
      {badge}
    </span>
  </div>
  <p class="mb-4 max-w-[700px] text-[14px] leading-relaxed text-ink2">{desc}</p>
  <div class="mb-4 flex flex-wrap gap-8 border-y border-dashed border-line py-3.5">
    {metrics.map((m) => (
      <div>
        <span class="block font-mono text-[23px] font-bold leading-tight tracking-[-.035em] text-gd"
              data-count={m.value} data-suffix={m.suffix ?? ''}>0</span>
        <span class="text-[11px] font-medium text-ink3">{m.label}</span>
      </div>
    ))}
  </div>
  <div class="flex flex-wrap gap-1.5">
    {tags.map((t) => (
      <span class="rounded-full border border-line bg-paper2 px-2.5 py-1 font-mono text-[10.5px] text-gd">{t}</span>
    ))}
  </div>
</a>
```

数字滚动脚本（放在首页统一处理）：

```js
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const dur = 1300, t0 = performance.now();
  (function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    el.textContent = Math.round(target * e).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString() + suffix;
  })(t0);
}
const ioN = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { countUp(e.target); ioN.unobserve(e.target); } });
}, { threshold: .4 });
document.querySelectorAll('[data-count]').forEach(el => ioN.observe(el));
```

- [ ] **Step 2: 写 `src/components/PostRow.astro`**

```astro
---
interface Props { category: string; title: string; href: string; tags: string[] }
const { category, title, href, tags } = Astro.props;
---
<a href={href} class="post-row group grid grid-cols-[104px_1fr_auto] items-center gap-6 border-b border-line2 px-[30px] py-4.5 no-underline transition last:border-b-0 hover:bg-[#FCFCF6] hover:pl-9">
  <span class="font-mono text-[12px] text-ink4">{category}</span>
  <span class="text-[15px] font-medium text-ink transition group-hover:text-gd">{title}</span>
  <span class="flex gap-1.5">
    {tags.map((t) => <span class="rounded-full border border-line bg-paper2 px-2.5 py-1 font-mono text-[10.5px] text-gd">{t}</span>)}
  </span>
</a>
<style>
  @media (max-width: 700px) {
    .post-row { grid-template-columns: 1fr; gap: .5rem; }
    .post-row > span:last-child { display: none; }
  }
</style>
```

- [ ] **Step 3: 写 `src/components/ContactBand.astro`**

深绿渐变横条 + 邮件/GitHub 按钮，自设计稿搬运。

- [ ] **Step 4: 组装首页并验证**

`src/pages/index.astro` 最终结构：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import AgentCompare from '../components/AgentCompare.astro';
import CapabilityGrid from '../components/CapabilityGrid.astro';
import EvolutionTimeline from '../components/EvolutionTimeline.astro';
import ProjectCard from '../components/ProjectCard.astro';
import PostRow from '../components/PostRow.astro';
import ContactBand from '../components/ContactBand.astro';
import Glossary from '../components/Glossary.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('writing'))
  .filter((p) => p.data.status === 'published')
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

const projects = [
  { index: '01', title: 'MewHelp · 电商智能客服 Agent', /* … */ },
  // …
];
---
<BaseLayout title="kaii — Agent 应用开发" active="home">
  <Hero />
  <AgentCompare />
  <CapabilityGrid />
  <EvolutionTimeline />
  <!-- PROJECTS -->
  <!-- WRITING：posts.slice(0, 8) -->
  <Glossary />
  <ContactBand />
</BaseLayout>
```

Run: `pnpm dev`
Expected: 首页八段齐全；项目卡数字滚动；文章标题与后续列表页一致

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 首页项目卡、文章列表与联系区"
```

---

### Task 9: 十步演进时间轴（EvolutionTimeline Island）

**Files:**
- Create: `src/components/EvolutionTimeline.astro`
- Test: 悬停/点击切换节点；进度线填充；键盘可达

**Interfaces:**
- Consumes: `evolution` from `src/data/evolution.ts`
- Produces: `<EvolutionTimeline />`

- [ ] **Step 1: 写组件**

结构：横向可滚动轨道 + 10 个节点按钮 + 下方详情面板（两栏：`要做成什么样` / `容易踩在哪儿`）。

数据从 `evolution` 数组渲染。点击/悬停节点切换面板内容，并填充进度线。

**键盘可达**：节点用 `<button>`，支持 `Tab` 聚焦 + `Enter` 切换。

- [ ] **Step 2: 验证**

Run: `pnpm dev`
Expected:
- 10 个节点横向排列，可左右滚动
- 悬停或点击切换下方详情
- 进度线随选中位置填充
- 700px 下缩略标签换行不溢出

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 十步演进时间轴"
```

---

### Task 10: 项目详情页

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[...slug].astro`
- Create: `src/content/projects/mewhelp.md`, `chengmi.md`, `zhixue.md`
- Create: `src/components/ProjectStages.astro`, `src/components/CaseCard.astro`
- Test: 章节锚点跳转正确；右栏目录高亮跟随

**Interfaces:**
- Consumes: `projects` collection、`ContentLayout`、`TocList`
- Produces: 项目详情路由 `/projects/<slug>/`

- [ ] **Step 1: 写 MewHelp 内容文件**

`src/content/projects/mewhelp.md` frontmatter：

```yaml
---
title: MewHelp · 电商智能客服 Agent
subtitle: 从一条纯对话接口起步，逐章长成一个能用的客服系统
role: 独立完成
nature: 课程项目 · 按章节复现并二次开发
status: completed
year: '2026'
order: 1
stack: [FastAPI, LangGraph, LangChain, Milvus, BGE-M3, Reranker, MCP, Langfuse, RoBERTa]
metrics:
  - { value: '10', label: '递进章节' }
  - { value: '6727', label: '应用代码行' }
  - { value: '48', label: '测试文件' }
  - { value: '46', label: 'Make 任务' }
repo: https://github.com/dream-kaii/MewHelp
---
```

正文从 `design-mockup/project-detail-v2.html` 搬运五个章节。四个案例用 `<CaseCard>` 组件包裹：

```astro
<CaseCard severity="critical" title="上下文裁剪把工具调用链拆散，导致之后每一轮请求都失败">
  <Fragment slot="problem">多轮对话要按 token 预算裁剪历史，原实现按「一问一答」成对删除。</Fragment>
  <Fragment slot="impact">一旦对话里有工具调用，这个假设就不成立……</Fragment>
  <Fragment slot="fix">升级为分组感知裁剪……</Fragment>
  <Fragment slot="verify">补 8 个边界用例……</Fragment>
</CaseCard>
```

- [ ] **Step 2: 写 `[...slug].astro`**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import ContentLayout from '../../layouts/ContentLayout.astro';
import TocList from '../../components/TocList.astro';
import ProgressRing from '../../components/ProgressRing.astro';
import SourceList from '../../components/SourceList.astro';

export async function getStaticPaths() {
  const items = await getCollection('projects');
  if (items.length === 0) throw new Error('projects 内容集合为空，至少需要 1 个项目');
  return items.map((p) => ({ params: { slug: p.slug }, props: { project: p } }));
}

const { project } = Astro.props;
const { Content } = await project.render();
const toc = [
  { href: '#sec1', label: '这个项目做了什么' },
  { href: '#sec2', label: '架构怎么长出来的' },
  { href: '#sec3', label: '解决过的工程问题' },
  { href: '#sec4', label: '一段关键实现' },
  { href: '#sec5', label: '已知限制' },
];
---
<ContentLayout title={`${project.data.title} — kaii`} active="projects">
  <!-- 左栏：进度环 + 项目信息 + 技术栈 + 其他项目 -->
  <div slot="left" class="text-right">
    <ProgressRing />

    <div class="mb-5 border-b border-line2 pb-5">
      <h5 class="mb-3 font-mono text-[9.5px] font-bold tracking-[.11em] text-ink4">项目信息</h5>
      <dl class="grid grid-cols-[auto_1fr] justify-end gap-x-3 gap-y-[7px]">
        <dt class="text-right font-mono text-[10.5px] text-ink4">角色</dt>
        <dd class="text-left text-[12.5px] font-medium text-ink2">{project.data.role}</dd>
        <dt class="text-right font-mono text-[10.5px] text-ink4">性质</dt>
        <dd class="text-left text-[12.5px] font-medium text-ink2">{project.data.nature}</dd>
        <dt class="text-right font-mono text-[10.5px] text-ink4">年份</dt>
        <dd class="text-left text-[12.5px] font-medium text-ink2">{project.data.year}</dd>
      </dl>
    </div>

    <div class="mb-5 border-b border-line2 pb-5">
      <h5 class="mb-3 font-mono text-[9.5px] font-bold tracking-[.11em] text-ink4">技术栈</h5>
      <div class="flex flex-wrap justify-end gap-1.5">
        {project.data.stack.map((s) => (
          <span class="rounded-full border border-line bg-paper2 px-2.5 py-1 font-mono text-[10.5px] text-gm">{s}</span>
        ))}
      </div>
    </div>
  </div>
  <article class="prose-k">
    <Content />
  </article>
  <div slot="right">
    <TocList items={toc} heading="本页目录" />
    <div class="mt-8 border-t border-line2 pt-5"><!-- 关键数据 KPI --></div>
  </div>
</ContentLayout>
```

**列表页 `projects/index.astro` 的 `active`**：必须是 `active="projects"`（不是 `home`）。

**空集合守卫**：`items.length === 0` 时抛错（对应 Review Focus 第 2 条）。

**frontmatter 类型注意**（来自 Task 2 审查的 deferred minor）：`order` 必须是**裸数字**（`order: 1`），
写成 `order: '1'` 会因 `z.number()` 校验失败；`year` 必须是**字符串**（`year: '2026'`），
写成 `year: 2026` 会因 `z.string()` 失败。两者同族不同型，容易写错。

- [ ] **Step 3: 验证**

Run: `pnpm dev`
Expected:
- `/projects/mewhelp/` 渲染完整
- 右栏目录点击锚点滚动到对应章节（注意 `scroll-margin-top` 需留出导航高度）
- 滚动时目录高亮跟随
- 700px 下三栏收为单栏

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 项目详情页与内容"
```

---

### Task 11: 文章列表与详情页

**Files:**
- Create: `src/pages/writing/index.astro`, `src/pages/writing/[...slug].astro`
- Create: `src/components/RetrievalDemo.astro`, `src/components/SourceList.astro`
- Create: `src/content/writing/*.md`（8 篇；1 篇完整，7 篇 `status: planned`）
- Test: 占位文章不产生 404；筛选器可用

**Interfaces:**
- Consumes: `writing` collection、`ContentLayout`
- Produces: `/writing/` 与 `/writing/<slug>/`

- [ ] **Step 1: 写完整文章 `src/content/writing/rag-hybrid-retrieval.md`**

frontmatter：

```yaml
---
title: 从关键词到语义：为什么 RAG 一定要做混合检索
description: 问「邮费是多少」，知识库里明明有「运费怎么算」，系统却答「未找到」。这不是模型笨，是检索方式选错了。
date: 2026-10-13
category: agent
tags: [RAG, 检索]
minutes: 12
status: published
sources:
  - title: Building Effective Agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    kind: official
  - title: LangChain Docs · Retrieval
    url: https://docs.langchain.com/oss/python/deepagents/retrieval
    kind: official
---
```

正文七节，从 `design-mockup/article-mockup.html` 搬运。**§4 召回结果对比**处嵌入 `<RetrievalDemo />`。

- [ ] **Step 2: 写其余 7 篇占位**

每篇：frontmatter 完整（与列表页标题一字不差），`status: planned`，正文一句说明：

```markdown
---
title: 工具调用的三个工程问题：超时、幂等与重试边界
description: 给模型挂上工具只是开始。真正麻烦的是：工具跑超时了怎么办、写操作被重试两次会怎样、什么时候该放弃重试。
date: 2026-10-11
category: agent
tags: [Function Calling, 可靠性]
minutes: 10
status: planned
---

这篇文章还在写。可以先看看已经完成的<a href="/writing/rag-hybrid-retrieval/">《为什么 RAG 一定要做混合检索》</a>。
```

- [ ] **Step 3: 写 `src/components/RetrievalDemo.astro` 与文章页辅助样式**

**3a. 召回对比器 Island**：三种模式（`kw` / `vec` / `hyb`）切换，分数条动画展开。数据内联在组件里：

```js
const DATA = {
  kw: {
    hits: [
      { t: '退货政策 · 七天无理由', s: 'doc:退货政策.md', v: 0 },
      { t: '售后手册 · 联系方式',   s: 'doc:售后手册.md', v: 0 },
    ],
    hint: 'BM25 拿「邮费」去比对，但文档里写的是「运费」。两个字对不上 —— 正确答案「运费说明」压根没有被召回。注意系统不会报错，只会说「没找到」。',
  },
  vec: {
    hits: [
      { t: '运费怎么算？',     s: 'doc:运费说明.md', v: 0.72 },
      { t: '配送范围与时效',   s: 'doc:运费说明.md', v: 0.61 },
      { t: '会员包邮权益',     s: 'doc:会员权益.md', v: 0.58 },
    ],
    hint: '向量检索认得「邮费 ≈ 运费」，正确条目被召回了。但也把两条不太相关的一起拉进来 —— 因为它只看语义接近，不区分是不是真在问你这个问题。',
  },
  hyb: {
    hits: [
      { t: '运费怎么算？',     s: 'doc:运费说明.md', v: 0.94 },
      { t: '会员包邮权益',     s: 'doc:会员权益.md', v: 0.71 },
      { t: '配送范围与时效',   s: 'doc:运费说明.md', v: 0.66 },
    ],
    hint: 'BM25 和向量各召回一批，用 RRF 融合后再让重排模型精排。正确答案稳稳排在第一位，且分数和其他拉开了明显差距 —— 这个差距就是「可以放心作答」的信号。',
  },
};
```

**3b. 占位文章提示条**：不单独建组件，直接在 `[...slug].astro` 中内联：

```astro
{isPlanned && (
  <div class="my-6 flex items-start gap-3 rounded-[13px] border border-[#F0E0BC] bg-[#FDF6E8] px-5 py-4 text-[13.5px] leading-relaxed text-ink2">
    <svg class="mt-0.5 h-4 w-4 flex-none" viewBox="0 0 24 24" fill="none"
         stroke="var(--color-amber)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 9v4M12 17h.01" />
    </svg>
    <span>这篇文章还在写。可以先看看已经完成的<a href="/writing/rag-hybrid-retrieval/" class="text-gd underline">《为什么 RAG 一定要做混合检索》</a>。</span>
  </div>
)}
```

**3c. `SourceList.astro`**：参考来源区块（编号 + 标题 + 链接 + 类型标签）。

**3d. 正文排版样式**：在 `global.css` 增加 `.prose-k` 规则（h2/h3/p/ul/ol/code/a/strong 的样式），从 `design-mockup/article-mockup.html` 的 `.prose` 规则迁移，并加上 `scroll-margin-top: 84px` 保证锚点跳转不被导航遮挡。

- [ ] **Step 4: 写列表页 `src/pages/writing/index.astro`**

**`active` 必须是 `active="writing"`**（不是 `home`）。

- 左栏：分类筛选器（全部/Agent/Java/算法，带计数）+ 文章统计 + 热门标签
- 中栏：文章卡片列表
- 右栏：推荐阅读 + 写作计划 + 按主题浏览

**筛选器行为**：点击按钮切换 `data-cat` 过滤。**占位文章（`status: planned`）**：卡片加「即将发布」徽标，`href` 指向自身详情页（详情页会渲染"还在写"的正文），**不产生 404**。

- [ ] **Step 5: 写详情页 `src/pages/writing/[...slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import ContentLayout from '../../layouts/ContentLayout.astro';
import TocList from '../../components/TocList.astro';
import ProgressRing from '../../components/ProgressRing.astro';
import SourceList from '../../components/SourceList.astro';

export async function getStaticPaths() {
  const items = await getCollection('writing');
  if (items.length === 0) throw new Error('writing 内容集合为空');
  return items.map((p) => ({ params: { slug: p.slug }, props: { post: p } }));
}
const { post } = Astro.props;
const { Content, headings } = await post.render();
const toc = headings.filter(h => h.depth === 2)
  .map(h => ({ href: '#' + h.slug, label: h.text }));
const isPlanned = post.data.status === 'planned';
---
<ContentLayout title={`${post.data.title} — kaii`} active="writing">

  <!-- 左栏：进度环 + 本文信息 + 标签 + 系列文章。必须 import ProgressRing（Task 4 产出） -->
  <div slot="left" class="text-right">
    <ProgressRing />

    <div class="mb-5 border-b border-line2 pb-5">
      <h5 class="mb-3 font-mono text-[9.5px] font-bold tracking-[.11em] text-ink4">本文信息</h5>
      <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-[7px] justify-end">
        <dt class="text-right font-mono text-[10.5px] text-ink4">发布</dt>
        <dd class="text-left text-[12.5px] font-medium text-ink2">
          {post.data.date.toISOString().slice(0, 10)}
        </dd>
        <dt class="text-right font-mono text-[10.5px] text-ink4">阅读</dt>
        <dd class="text-left text-[12.5px] font-medium text-ink2">约 {post.data.minutes} 分钟</dd>
        <dt class="text-right font-mono text-[10.5px] text-ink4">分类</dt>
        <dd class="text-left text-[12.5px] font-medium text-ink2">{post.data.category}</dd>
      </dl>
    </div>

    <div class="rtags mb-5 border-b border-line2 pb-5">
      <h5 class="mb-3 font-mono text-[9.5px] font-bold tracking-[.11em] text-ink4">标签</h5>
      <div class="flex flex-wrap justify-end gap-1.5">
        {post.data.tags.map((tg) => (
          <a href="/writing/" class="rounded-full border border-line bg-paper2 px-2.5 py-1 font-mono text-[10.5px] text-gm no-underline transition hover:border-gh hover:bg-[#EAF2CE] hover:text-gd">{tg}</a>
        ))}
      </div>
    </div>
  </div>

  <article class="prose-k" data-planned={isPlanned}>
    <header><!-- 面包屑 / h1 / 摘要 / 元信息 --></header>
    {isPlanned && /* 见 Step 3b 的内联提示条 */ null}
    <Content />
    {post.data.sources.length > 0 && <SourceList sources={post.data.sources} />}
  </article>
  <div slot="right">
    {toc.length > 0 && <TocList items={toc} />}
    <div class="mt-8"><!-- 相关文章 --></div>
  </div>
</ContentLayout>
```

- [ ] **Step 6: 验证**

Run: `pnpm dev`
Expected:
- `/writing/` 列出 8 篇，筛选器可用
- 点任意一篇进入详情页，**无 404**
- 完整文章显示目录、召回对比器可切换、参考来源列出
- 占位文章显示提示条 + 正文说明
- 700px 下单栏

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 文章列表与详情页"
```

---

### Task 12: 学习路线页

**Files:**
- Create: `src/pages/learning-path.astro`
- Create: `src/content/learning/agent.yml`, `algo.yml`, `backend.yml`
- Create: `src/components/StepCard.astro`, `src/components/TrackTabs.astro`
- Test: 三条线切换；每步的文章链接有效

**Interfaces:**
- Consumes: `learning` collection、`ContentLayout`
- Produces: `/learning-path/`

- [ ] **Step 1: 写三个 YAML 数据文件**

`src/content/learning/agent.yml`（7 步）：

```yaml
track: agent
label: Agent 应用开发
subtitle: 主线 · 正在走
intro: 很多人一上来就问「用哪个框架」，这是错的问题。建议先花十分钟把概念理清。
stages:
  - { n: STEP 01, title: 能对话, desc: 模型调用、流式输出、多轮上下文 }
  # …5 个阶段
steps:
  - id: a1
    title: 先读概念，别急着写代码
    duration: 半天
    body: 动手前先把「Workflow 和 Agent 到底差在哪」搞清楚。这不是学术问题 —— 它直接决定你的架构选型。
    tips:
      - 重点看这两句：「Workflows 是预定义代码路径编排 LLM 和工具」「Agents 是 LLM 动态决定自己的流程」。
    article:
      status: planned
      title: 我用一个客服场景讲清 Workflow 和 Agent 的分界
    docs:
      - { label: Building Effective Agents ↗, url: https://www.anthropic.com/engineering/building-effective-agents }
  # …其余 6 步
```

`algo.yml`（6 步）与 `backend.yml`（6 步，顺序：语言基础 → MySQL → 框架 → Redis → 分布式与中间件 → JVM 与深度）的**头部字段与 `agent.yml` 同构，只有 `track` 取值不同**：

```yaml
# algo.yml
track: algo               # ← 必须是小写 algo，不是 algorithm
label: 算法 / 面试
subtitle: LeetCode 路线
intro: 刷题不是刷数量，是按题型建立反射。建议按分类集中攻克，而不是从第 1 题顺着做。
stages:
  - { n: 第 1 轮, title: 数组 · 字符串 · 哈希, desc: 建立基本手感，别贪难 }
  # …共 5 个阶段
steps:
  - id: b1
    title: 先建地图，再开始走
    duration: 1 天
    body: 开始刷之前先看一眼按题型组织的路线图，知道整个版图有多大、哪些是主干。
    # …共 6 步（对应设计稿 data-p="algo" 面板）
```

```yaml
# backend.yml
track: backend            # ← 必须是小写 backend
label: Java 后端
subtitle: 工程基础
intro: 先把会用变成懂原理，再谈分布式。顺序建议：语言基础 → MySQL → 框架 → Redis → 分布式与中间件 → JVM 底层。
stages:
  - { n: STEP 01, title: 语言基础, desc: Java 语法、集合、面向对象 }
  # …共 6 个阶段
steps:
  - id: c1
    title: 语言基础：从「会用」到「知道它怎么实现」
    duration: 1-2 周
    body: 先打牢 Java 语法、面向对象、异常处理这些基本功，然后重点啃集合框架。
    # …共 6 步（对应设计稿 data-p="backend" 面板）
```

**`track` 三个合法值（与 `src/content/config.ts:40` 的 `z.enum(['agent','algo','backend'])` 严格对应）**：
`agent` / `algo` / `backend`。拼错任何一个（如 `algorithm`）会导致 `pnpm build` 直接失败。

**文章链接**：`article.status` 为 `published` 时必须有 `href` 字段指向真实路由。

- [ ] **Step 2: 写 `TrackTabs.astro` 与 `StepCard.astro`**

Tab 切换三块面板；`StepCard` 渲染单步（标题 + 时长 + 正文 + 提示 + 文章链接 + 文档链接）。

**`article.href` 的组件层兜底**（来自 Task 2 审查的 deferred minor）：schema 里 `article.href` 是
`.optional()`，无法强制「`status: published` 时必填」。因此 `StepCard` **必须**判断：

```astro
{step.article && (
  step.article.status === 'published' && step.article.href ? (
    <a href={step.article.href} class="step-link">
      <span class="st">已有</span>{step.article.title}
    </a>
  ) : (
    <span class="step-link step-link--todo">
      <span class="st todo">待写</span>{step.article.title}
    </span>
  )
)}
```

**关键**：status 是 `published` 但 `href` 缺失时，**降级为「待写」样式而不用 `<a>`**，
避免渲染出 `href="undefined"` 导致 404（对应 Review Focus 第 1 条）。

- [ ] **Step 3: 写 `src/pages/learning-path.astro`**

- 左栏：`<ProgressRing />`（import from `../components/ProgressRing.astro`）+ 路线概览 + 文章状态 + 路线切换器
- 中栏：三个 Tab 面板
- 右栏：当前路线目录（随 Tab 切换）+ 文章进度 + 相关文章

- [ ] **Step 4: 验证**

Run: `pnpm dev`
Expected:
- 三条线可切换，Tab 与左栏切换器联动
- 每步显示 `[已有]` 或 `[待写]` 状态
- 标 `[已有]` 的链接指向真实文章，点击可达
- 右栏目录随 Tab 更换

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 学习路线页与三条线数据"
```

---

### Task 13: 关于页与 404 页

**Files:**
- Create: `src/pages/about.astro`, `src/pages/404.astro`
- Test: 两页渲染正确；404 页在错误路径下显示

**Interfaces:**
- Consumes: `site`、`ContentLayout`
- Produces: `/about/`、`404`

- [ ] **Step 1: 写 `src/pages/about.astro`**

- 左栏：`<ProgressRing />`（import from `../components/ProgressRing.astro`）+ 基本情况（专业/届别/方向/状态）+ 关键词 + 操作 + 快速跳转
- 中栏：头像 → kaii → 定位 → 介绍 → 四格事实表 → §01 我的路径（三段时间线）→ §02 技术栈（四组）→ §03 联系方式
- 右栏：本页目录 + 现在在做什么 + 看看我的作品

- [ ] **Step 2: 写 `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="页面未找到 — kaii">
  <main class="mx-auto flex max-w-[600px] flex-col items-center px-6 py-32 text-center">
    <p class="font-mono text-[64px] font-bold text-gh">404</p>
    <h1 class="mt-4 text-2xl font-bold text-ink">这个页面不存在</h1>
    <p class="mt-3 text-[14.5px] leading-relaxed text-ink2">
      可能是链接过期了，或者地址输错了。
    </p>
    <div class="mt-8 flex gap-3">
      <a href="/" class="rounded-full bg-gk px-6 py-3 text-[14px] font-semibold text-white no-underline">回首页</a>
      <a href="/writing/" class="rounded-full border border-line bg-card px-6 py-3 text-[14px] font-semibold text-gd no-underline">看文章</a>
    </div>
  </main>
</BaseLayout>
```

- [ ] **Step 3: 验证**

Run: `pnpm build && pnpm preview`
Expected: `/about/` 正常；访问 `/nonexistent/` 显示 404 页

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 关于页与 404 页"
```

---

### Task 14: SEO、RSS、站点地图与部署配置

**Files:**
- Create: `src/pages/rss.xml.ts`
- Create: `public/robots.txt`, `public/CNAME`
- Modify: `astro.config.mjs`
- Create: `.github/workflows/deploy.yml`
- Test: `pnpm build` 产出 sitemap、rss、robots

**Interfaces:**
- Consumes: `writing` collection、`site`
- Produces: `/rss.xml`、`/sitemap-index.xml`、`/robots.txt`

- [ ] **Step 1: 写 `src/pages/rss.xml.ts`**

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../data/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('writing'))
    .filter((p) => p.data.status === 'published')
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: `${site.name} · 技术文章`,
    description: site.role,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/writing/${p.slug}/`,
    })),
  });
}
```

安装：`pnpm add @astrojs/rss`

- [ ] **Step 2: 写 `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

（域名待用户提供后替换）

- [ ] **Step 3: 写 `public/CNAME`**

```
example.com
```

（占位，待用户提供真实域名）

- [ ] **Step 4: 写 `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 5: 验证**

Run: `pnpm build`
Expected:
- `dist/sitemap-index.xml` 存在
- `dist/rss.xml` 存在且含 1 条已发布文章
- `dist/robots.txt` 存在

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: SEO、RSS 与部署工作流"
```

---

### Task 15: 端到端验收

**Files:**
- Create: `tests/acceptance.spec.json`（供 dsh-verify 使用）
- Test: 真浏览器验收

- [ ] **Step 1: 启动预览服务**

```bash
pnpm build && pnpm preview --port 4321
```

- [ ] **Step 2: 写验收 spec `tests/acceptance.spec.json`**

```json
{
  "base": "http://localhost:4321",
  "steps": [
    { "name": "首页加载", "path": "/", "expect": { "text": ["你好，我是", "kaii"] } },
    { "name": "对比演示存在", "path": "/", "expect": { "selector": ".sync" } },
    { "name": "名词速查可展开", "path": "/", "expect": { "selector": "#glossary" } },
    { "name": "项目详情", "path": "/projects/mewhelp/", "expect": { "text": "MewHelp" } },
    { "name": "文章列表", "path": "/writing/", "expect": { "text": "技术文章" } },
    { "name": "文章详情（无 404）", "path": "/writing/rag-hybrid-retrieval/", "expect": { "text": "混合检索" } },
    { "name": "占位文章可达", "path": "/writing/tool-calling-pitfalls/", "expect": { "text": "还在写" } },
    { "name": "学习路线", "path": "/learning-path/", "expect": { "text": "学习路线" } },
    { "name": "关于", "path": "/about/", "expect": { "text": "kaii" } },
    { "name": "404", "path": "/nonexistent-xyz/", "expect": { "text": "404" } }
  ]
}
```

- [ ] **Step 3: 运行验收**

调用 `dsh_verify`（spec 路径 `tests/acceptance.spec.json`，url `http://localhost:4321`，browser `chromium`）

Run: `dsh_verify({ spec: 'tests/acceptance.spec.json', url: 'http://localhost:4321', out: './dsh-verify-out' })`
Expected: 全部步骤 PASS，报告生成在 `./dsh-verify-out/report.html`

- [ ] **Step 4: 移动端与减少动效人工检查**

在真浏览器中：
1. 打开 DevTools 设备模拟，切到 iPhone SE（375×667），逐页检查**无横向滚动条**（`document.documentElement.scrollWidth <= clientWidth`）
2. 在系统设置里开启「减少动态效果」，刷新首页：**对比演示应直接显示完整终态**，不能停在初始态导致内容不可见（对应 Review Focus 第 4 条）
3. 逐页 `Tab` 键遍历，所有可点元素有可见焦点

- [ ] **Step 5: Lighthouse 检查**

Run: `npx lighthouse http://localhost:4321 --only-categories=performance,accessibility,best-practices,seo --view`
Expected: 四项均 ≥ 95

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: 端到端验收 spec 与报告"
```

---

## 交付清单

完成后应产出：

| 项 | 位置 |
|---|---|
| 可构建的 Astro 站点 | `site/` |
| 6 个页面 | `/`、`/projects/*`、`/writing/*`、`/learning-path/`、`/about/`、404 |
| 4 篇内容骨架 | 1 篇完整文章 + 3 个项目详情 |
| 三条学习路线 | `src/content/learning/*.yml` |
| 部署工作流 | `.github/workflows/deploy.yml` |
| 验收报告 | `dsh-verify-out/report.html` |

**待用户提供**：新域名（替换 `astro.config.mjs` 的 `site`、`public/CNAME`、`robots.txt`）
