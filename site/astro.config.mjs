import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import rehypeHeadingIds, { recmaHeadingIds } from './src/plugins/rehype-heading-ids.mjs';

export default defineConfig({
  // 生产域名。此值决定 sitemap / RSS / canonical 链接里的绝对地址（SEO 用），
  // 改完需重新部署才生效。
  site: 'https://kaii.homes',

  // MDX 集成：文章正文要能嵌 Astro 组件（`<RetrievalDemo />`）。
  // 默认的 Markdown 处理器没有组件支持 —— `<RetrievalDemo />` 会被当成一段字面 HTML
  // 转义输出，产物里出现一个 `<retrievaldemo>` 标签，组件既不渲染、构建也不报错
  // （静默失败，本任务实测到）。加了 MDX 之后 `.mdx` 走组件化渲染路径，
  // `writing` 集合里那一篇带组件的文章改用 `.mdx`（其余 7 篇仍是 `.md`）。
  //
  // ⚠️ MDX 的插件配置**必须写在 `mdx({...})` 的参数里**，不能写顶层的 `mdx: {...}` ——
  // Astro 5.18.2 的 config schema（core/config/schemas/base.js）根本没有 `mdx` 这个键，
  // 顶层的 `mdx` 块会被**静默丢弃**（不报错、也不生效）。
  // `extendMarkdownConfig` 默认 true，所以 `markdown.rehypePlugins` 里的锚点插件
  // 其实已经顺手带进 MDX 了；这里额外显式声明一次，是为了让两条路径的来源一眼可见。
  integrations: [
    sitemap(),
    mdx({
      rehypePlugins: [rehypeHeadingIds],
      // recmaPlugins 跑在**最后**（拿到最终 ESTree），是 `.mdx` 路径唯一能可靠
      // 改写 heading id 的位置 —— 原因见 src/plugins/rehype-heading-ids.mjs 顶部注释。
      recmaPlugins: [recmaHeadingIds],
    }),
  ],

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
    // `.md` 路径：用户 rehypePlugins 排在 Astro 自带 rehypeHeadingIds **之前**，
    // 先设好 `properties.id`，自带的插件看到 id 已是字符串就会跳过 —— 这条可行。
    rehypePlugins: [rehypeHeadingIds],
  },
});
