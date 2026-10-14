import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../data/site';
import type { APIContext } from 'astro';

/**
 * RSS 订阅源 `/rss.xml`
 *
 * 只收录 `status: published` 的文章 —— 7 篇 `planned` 是占位（页面上标「即将发布」），
 * 放进订阅源会让读者点进来看到半成品。
 *
 * 注意：`writing` 集合用的是 glob loader，条目标识是 `p.id`（不是旧 API 的 `p.slug`），
 * 与 `src/pages/writing/[...slug].astro` 的 `params: { slug: p.id }` 保持一致。
 */
export async function GET(context: APIContext) {
  const posts = (await getCollection('writing'))
    .filter((p) => p.data.status === 'published')
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: `${site.name} · 技术文章`,
    description: `${site.role}。记录 Agent 应用开发与后端工程里的真实问题。`,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/writing/${p.id}/`,
    })),
    customData: '<language>zh-cn</language>',
  });
}
