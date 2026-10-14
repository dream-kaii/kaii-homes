import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import rehypeHeadingIds from './src/plugins/rehype-heading-ids.mjs';

export default defineConfig({
  site: 'https://example.com',   // 待用户提供新域名后替换
  // MDX 集成：文章正文要能嵌 Astro 组件（`<RetrievalDemo />`）。
  // 默认的 Markdown 处理器没有组件支持 —— `<RetrievalDemo />` 会被当成一段字面 HTML
  // 转义输出，产物里出现一个 `<retrievaldemo>` 标签，组件既不渲染、构建也不报错
  // （静默失败，本任务实测到）。加了 MDX 之后 `.mdx` 走组件化渲染路径，
  // `writing` 集合里那一篇带组件的文章改用 `.mdx`（其余 7 篇仍是 `.md`）。
  integrations: [sitemap(), mdx()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
  markdown: {
    // 代码块主题对齐设计稿的深绿（`design-mockup/article-mockup.html:132`：
    // `.codewrap{background:#1B241A;border:1px solid #2C3A29}`）。
    //
    // 关键点：Shiki 会把主题背景写进 `<pre>` 的**内联 style**，
    // 内联样式优先级高于 `.prose-k pre`，所以只改 CSS 是压不住的
    // （实测 computed backgroundColor 仍是 github-dark 的 `rgb(36,41,46)`）。
    // 用 `css-variables` 主题 + `defaultColor: false`：
    // 不写内联背景/前景色，颜色全部交给 CSS 变量，背景改由 `.prose-k pre` 决定。
    shikiConfig: { theme: 'css-variables', defaultColor: false },
    // 让 `## 标题 {/* s1 */}` / `{#s1}` 生成稳定锚点
    // （文章详情页与项目详情页的目录都依赖稳定 id）。
    // 该插件排在 Astro 自带的 rehypeHeadingIds **之后**运行，就地覆盖它生成的 slug：
    // 中文标题自动生成的 slug 不可读，且会随标题措辞漂移，不能作为目录锚点。
    rehypePlugins: [rehypeHeadingIds],
  },
  mdx: {
    // MDX 走独立配置，锚点插件要在这里再挂一次，否则 `.mdx` 里的标记不会被处理。
    rehypePlugins: [rehypeHeadingIds],
  },
});
