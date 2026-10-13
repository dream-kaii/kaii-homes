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
