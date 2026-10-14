import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 文章正文里会嵌 Astro 组件（`<RetrievalDemo />`），所以 custom `loader` + `.mdx` 扩展。
// 为什么不是 `type: 'content'`（glob 默认只认 `.md`）：
//   默认的 Markdown 处理器没有组件支持，`<RetrievalDemo />` 在产物里会变成一个
//   字面量 `<retrievaldemo>` 标签（不是组件、也不是错误）。见 task-11 报告。
const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
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

// 项目切到组件化渲染的原因与 `writing` 相同（`.md` 里嵌组件会被转义成字面 HTML）。
// 这一段**不是本任务（Task 11）的产出** —— 是并行工作的 Task 10 agent 在同一工作树里
// 改的在途改动；这里原样保留，不做修改。
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
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
