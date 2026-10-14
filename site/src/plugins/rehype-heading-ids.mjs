/**
 * rehypeHeadingIds —— 显式锚点：在标题末尾写标记，标题 id 就取标记里的值。
 *
 * 标记有两种写法：
 *   1) 井号形式：   `## 标题 {` + `#s1}`          —— 普通 Markdown（`.md`）友好
 *   2) JSX 注释形式：`## 标题 {` + `/* s1 *` + `/}` —— MDX 友好
 * 两种写法产生的 `id` 都是 `s1`，详见下方「两种写法都要支持」。
 *
 * 为什么需要这个插件：
 *   站点默认用 Astro 自带的 rehypeHeadingIds，id 由标题文本经 github-slugger 生成。
 *   中文标题得到的 slug 不可读（`## 我的标题` → `id="我的标题"`），
 *   而且**会随标题措辞漂移**。文章详情页右栏目录、项目详情页右栏目录都要求锚点稳定，
 *   所以锚点必须由作者显式指定，而不是从标题文本推导。
 *
 * 为什么是 rehype 插件而不是 remark 插件：
 *   Astro 5.18.2 的 `markdown.remarkPlugins` 全部跑在 `remarkRehype` **之前**，
 *   那时标题 id 还没生成（Astro 自带的 rehypeHeadingIds 排在 remarkRehype 之后）。
 *   放在 `rehypePlugins` 里的插件排在自带插件**之后**，可以就地覆盖已生成的 id。
 *
 * 两种写法都要支持（这是踩过的坑）：
 *   为什么需要第 2 种：MDX 里井号形式会被当成 JS 表达式，构建直接失败
 *   （`Could not parse expression with acorn`）。而 JSX 注释是合法 MDX，
 *   解析成一个注释节点，编译后**不出现在 DOM 里** —— 正好当「隐藏的锚点标记」用。
 *
 *   为什么不能只认 text 节点：`.md` 走 `createMarkdownProcessor`，标题文本是 mdast
 *   `text` 节点；MDX 路径下标题文本是 `mdxTextExpression` / raw 子节点。
 *   只认 text 节点时，标记会被原样渲染进页面
 *   （实测过：`<h2 id="…">一个真实失败案例 {#s1}</h2>`）。所以这里遍历标题的**全部**子节点。
 *
 * 没有标记的标题不做任何干预，保持 Astro 默认行为。
 */

const PATTERNS = [
  /\s*\{#([A-Za-z][\w-]*)\}\s*$/, //  井号形式
  /\s*\{\/\*\s*([A-Za-z][\w-]*)\s*\*\/\}\s*$/, //  JSX 注释形式
];

/** 递归收集节点里的纯文本（涵盖 mdast text、mdxTextExpression、raw JSX 子节点） */
function textOf(node) {
  if (!node) return '';
  if (typeof node.value === 'string') return node.value;
  if (Array.isArray(node.children)) return node.children.map(textOf).join('');
  return '';
}

/** @param {any} node @param {string} id */
function setHeadingId(node, id) {
  node.properties = node.properties ?? {};
  node.properties.id = id;
}

/** @param {any} node */
function apply(node) {
  if (node && node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
    const full = textOf(node);
    for (const re of PATTERNS) {
      const m = re.exec(full);
      if (!m) continue;
      setHeadingId(node, m[1]);
      // 用「剥掉标记后的纯文本」重建标题内容。
      // 标题里的行内标记（`code`、**粗体**）会在这一步被展平成纯文本 ——
      // 本站正文的 h2/h3 本来就只用文字 + 行内 code，视觉差异可忽略，
      // 换来的是「.md 与 .mdx 两条渲染路径行为完全一致」。
      node.children = [{ type: 'text', value: full.slice(0, m.index).trimEnd() }];
      break;
    }
  }
  for (const child of node?.children ?? []) apply(child);
}

export default function rehypeHeadingIds() {
  return (tree) => {
    apply(tree);
  };
}
