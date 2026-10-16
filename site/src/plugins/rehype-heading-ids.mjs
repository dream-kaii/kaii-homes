/**
 * rehypeHeadingIds —— 显式锚点：在标题末尾写标记，标题 id 就取标记里的值。
 *
 * 标记有两种写法（两种产出的 id 完全一样）：
 *   1) 井号形式：    `## 标题 {` + `#s1}`              —— 普通 Markdown（`.md`）
 *   2) JSX 注释形式：`## 标题 {` + `/* s1 *` + `/}`     —— MDX（`.mdx` 必须用这种）
 *
 * 为什么两种都要支持：MDX 里井号形式会被当成 JS 表达式，构建直接失败
 * （`Could not parse expression with acorn`）。而 `{/* … *\/}` 是合法 MDX，
 * 编译后不出现在 DOM 里，正好当「隐藏的锚点标记」。
 *
 * 为什么需要这个插件：
 *   站点默认用 Astro 自带的 rehypeHeadingIds，id 由标题文本经 github-slugger 生成。
 *   中文标题得到的 slug 不可读（`## 我的标题` → `id="我的标题"`）且会随措辞漂移。
 *   文章详情页与项目详情页的右栏目录都要求锚点稳定，所以必须由作者显式指定。
 *
 * ⚠️ 关键实现约束（本任务实测踩到，改之前务必读完）：
 *   单纯写成一个 rehype 插件是**不够的**。两条渲染路径的插件顺序不同：
 *
 *   - `.md` 路径（@astrojs/markdown-remark）：
 *     用户 `rehypePlugins` 排在 Astro 自带的 rehypeHeadingIds **之前**。
 *     我先设好 `properties.id`，它看到 id 已是字符串就跳过 —— 可行。
 *
 *   - `.mdx` 路径（@astrojs/mdx）：
 *     `getRehypePlugins` 先 push 用户插件、**之后**才 push 自带的 rehypeHeadingIds。
 *     Astro 的插件把残留的 `{/* s1 *\/}` 当标题文字，生成
 *     `一个真实失败案例--s1` 这样的 id 并**覆盖**我设的值 —— 不可行。
 *
 *   所以本模块导出**一对**插件，各管一条路径：
 *     - 默认导出 `rehypeHeadingIds` → 挂 `markdown.rehypePlugins`（管 `.md`）
 *     - 具名导出 `recmaHeadingIds`  → 挂 `mdx.recmaPlugins`（管 `.mdx`）
 *
 *   MDX 这条为什么要绕到 recma：recma 阶段拿到的是**最终 ESTree**
 *   （Astro 的 id 生成早已跑完），可以直接把 JSX 里的 `id` 属性与
 *   `getHeadings()` 的返回值一起改掉。缺点是那时 `vfile.value` 已被清空，
 *   拿不到源码，所以由 rehype 阶段的 `remarkStashSource` 先把源码存进
 *   `vfile.data`，两个插件接力完成。
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

/** 从一串标题文本里解析出显式 id 与剥掉标记后的正文 */
function parseHeading(raw) {
  for (const re of PATTERNS) {
    const m = re.exec(raw);
    if (m) return { id: m[1], text: raw.slice(0, m.index).trimEnd() };
  }
  return null;
}

/** 从整份源码里抽出「标题原文 → {id, text}」映射 */
function collectFromSource(src) {
  const map = new Map();
  for (const line of String(src).split('\n')) {
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (!m) continue;
    const parsed = parseHeading(m[1]);
    if (parsed) map.set(m[1].trim(), parsed);
  }
  return map;
}


/**
 * 归一化标题文本，用于 MDX 路径的模糊匹配。
 *
 * 为什么需要：MDX 编译会把标题里的 ASCII 双引号 `"` 等标点转义/改写，
 * 导致 `text.startsWith(v.text)` 匹配失败 → 插件放弃改写 id →
 * 回落到 Astro 默认 slug（形如 `从一次哈希没生效说起--s1`），锚点静默失效。
 * （实测：用中文引号「」的标题没事，换成 ASCII 双引号就坏 ——
 *   因为 MDX/HTML 会把 ASCII 双引号序列化成 `&quot;`。）
 *
 * 所以比对前先剥掉引号、空白、以及 `&quot;` 这类实体，只留下实义字符。
 */
function normalizeHeading(s) {
  return String(s ?? '')
    .replace(/&quot;|&#34;|&apos;|&#39;|&amp;/g, '') // HTML 实体
    // 各种标点：ASCII 单双引号、反引号、中文直角引号、中文弯引号、全角引号。
    // 用 \u 转义写，避免源文件编码差异导致字符类被破坏（踩过：中文弯引号
    // 被写成 ASCII 直引号，归一化静默失效）。
    //
    // 为什么连反引号也要剥：Markdown 的 `` `code` `` 在源码里带反引号，
    // 渲染成 <code> 后纯文本不含反引号。源侧（stash map 的 text）与
    // 渲染侧（jsxTextOf）如果不统一剥掉，含行内代码的标题就匹配不上。
    .replace(/["'`\u300c\u300d\u300e\u300f\u201c\u201d\u2018\u2019\uff02\uff07]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

export const STASH_KEY = 'explicitHeadingIds';

// ────────────────────────────── .md 路径（rehype） ──────────────────────────────

/** @param {any} node */
function walkRehype(node) {
  if (node && node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
    const parsed = parseHeading(textOf(node));
    if (parsed) {
      node.properties = node.properties ?? {};
      node.properties.id = parsed.id;
      // 用纯文本重建标题内容。Markdown 的 h2/h3 只有文字与行内 code，
      // 展平后视觉差异可忽略，换来的是 `.md` 与 `.mdx` 两条路径行为一致。
      node.children = [{ type: 'text', value: parsed.text }];
    }
  }
  for (const child of node?.children ?? []) walkRehype(child);
}

/**
 * 默认导出：同时服务两条路径。
 * - `.md`（rehype 阶段）：直接改写 id。
 * - `.mdx`（rehype 阶段）：此刻 `vfile.value` 还是源码，先 stash 起来给 recma 用。
 */
export default function rehypeHeadingIds() {
  return (tree, vfile) => {
    walkRehype(tree);
    if (vfile) {
      const src = typeof vfile.value === 'string' ? vfile.value : '';
      const map = collectFromSource(src);
      if (map.size > 0) {
        vfile.data ??= {};
        vfile.data[STASH_KEY] = map;
      }
    }
  };
}

// ───────────────────────────── .mdx 路径（recma） ─────────────────────────────

/** @param {any} node @returns {string} */
function jsxTextOf(node) {
  if (!node || typeof node !== 'object') return '';
  // children 可能是数组（标题里含行内 `code`、链接等时就是多个节点），
  // 逐个取文本再拼起来 —— 漏掉这一支会让含行内代码的标题匹配失败，
  // 锚点静默回落到 Astro 默认 slug（`带-code-的-标题--s3`）。
  if (Array.isArray(node)) return node.map(jsxTextOf).join('');
  switch (node.type) {
    case 'Literal':
      return typeof node.value === 'string' ? node.value : '';
    case 'JSXText':
      return node.value;
    case 'JSXElement':
      return (node.children ?? []).map(jsxTextOf).join('');
    case 'JSXExpressionContainer':
      return node.expression?.type === 'Literal' ? String(node.expression.value) : '';
    // ESTree 节点：多个 children 会被编译成 `[a, b, c]`（ArrayExpression），
    // 例如标题里含行内 `code` 或链接。漏掉这一支时 text 取到空串，
    // 归一化后匹配不到，锚点静默回落成 `带-code-的-标题--s3`。
    case 'ArrayExpression':
      return (node.elements ?? []).map(jsxTextOf).join('');
    case 'CallExpression':
      return (node.arguments ?? []).map(jsxTextOf).join('');
    case 'ObjectExpression': {
      const prop = (node.properties ?? []).find((p) => (p?.key?.name ?? p?.key?.value) === 'children');
      return prop ? jsxTextOf(prop.value) : '';
    }
    default:
      return '';
  }
}

/** 把显式 id 写回 `_jsx(_components.h2, { id, children })` 与 `getHeadings()` */
function fixMdxAst(ast, map) {
  // 用「源标题剥掉标记后的正文」建查询表。MDX 把 `{/* s1 */}` 编译成
  // JSXEmptyExpression，原文丢失，只剩剥掉注释后的标题文字（`标题 `），
  // 而已生成的 slug（`标题--s1`）不可靠，所以按**正文前缀**匹配。
  const byText = [...map.values()].slice(0, 64);
  let patched = 0;

  /** @param {any} node */
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
      return;
    }

    if (node.type === 'CallExpression' && /^_jsxs?$/.test(node.callee?.name ?? '')) {
      const props = node.arguments?.find((a) => a?.type === 'ObjectExpression');
      const byName = {};
      for (const p of props?.properties ?? []) {
        if (p?.type === 'Property' && p.key?.name) byName[p.key.name] = p;
      }
      const idProp = byName.id;
      const childProp = byName.children;
      if (idProp && childProp) {
        const text = jsxTextOf(childProp.value).trim();
        // 归一化后再比：见 normalizeHeading 的注释（ASCII 引号会被 MDX 转义）
        const norm = normalizeHeading(text);
        const hit = norm
          ? byText.find((v) => normalizeHeading(v.text) === norm || norm.startsWith(normalizeHeading(v.text)))
          : null;
        if (hit) {
          idProp.value = { type: 'Literal', value: hit.id };
          // 标题文本统一压成纯文本：与 `.md` 路径 walkRehype 的处理一致，
          // 也保证 `getHeadings()` 与 DOM 两侧的 text 相同。
          // （代价：标题里原有的行内 <code> 会被展平，视觉差异可忽略。）
          childProp.value = { type: 'Literal', value: hit.text };
          patched += 1;
        }
      }
    }

    // 只走白名单键，避开 `parent`/`loc` 造成的环
    for (const key of ['body', 'declarations', 'declaration', 'arguments', 'properties', 'value',
                       'expression', 'children', 'init', 'params', 'consequent', 'alternate',
                       'expression', 'callee', 'object', 'elements', 'left', 'right', 'test',
                       'block', 'argument', 'source', 'specifiers', 'local', 'id']) {
      const v = node[key];
      if (v && typeof v === 'object') visit(v);
    }
  };
  visit(ast);

  // `getHeadings()` 里那份 headings 数组也要同步改 ——
  // 文章详情页右栏目录的 href 来自 `render()` 返回的 `headings`，
  // 它读的就是这个函数（而不是 DOM），漏改会让目录锚点全部落空。
  patchGetHeadings(ast, byText);

  return patched;
}

/**
 * 同步改写 `getHeadings()` 导出的 headings：
 * 把 slug/text 换成显式 id 与剥掉标记后的标题。
 * @param {any} ast
 * @param {{id:string,text:string}[]} byText
 */
function patchGetHeadings(ast, byText) {
  /** @param {any} node */
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const c of node) visit(c);
      return;
    }
    // 定位到 { depth: n, slug: "...", text: "..." } 字面量
    if (node.type === 'FunctionDeclaration' && node.id?.name === 'getHeadings') {
      const elements = node.body?.body?.[0]?.argument?.elements;
      for (const el of elements ?? []) {
        if (el?.type !== 'ObjectExpression') continue;
        const props = {};
        for (const p of el.properties ?? []) {
          // ObjectExpression 的键可能是 Identifier（name）也可能是 Literal（value）
          const k = p?.key?.name ?? p?.key?.value;
          if (p?.type === 'Property' && typeof k === 'string') props[k] = p;
        }
        const textProp = props.text;
        const slugProp = props.slug;
        if (!textProp || !slugProp) continue;
        // Astro 生成的 text 形如 `标题 /* s1 */`（MDX 保留了注释原文），
        // slug 形如 `标题--s1`。用「源正文前缀」匹配。
        const rawText = typeof textProp.value?.value === 'string' ? textProp.value.value : '';
        const cleaned = rawText
          .replace(/\s*\{#[\w-]+\}\s*$/, '')
          .replace(/\s*\{\/\*[\s\S]*?\*\/\}\s*$/, '')
          .trim();
        const normCleaned = normalizeHeading(cleaned);
        const hit = byText.find(
          (v) => normalizeHeading(v.text) === normCleaned || normCleaned.startsWith(normalizeHeading(v.text))
        );
        if (hit) {
          // 就地改 value（不要替换整个 Property 节点，否则破坏 ESTree 形状，
          // 下游 astring 序列化会抛 `this[node.value.type] is not a function`）
          slugProp.value = { type: 'Literal', value: hit.id, raw: JSON.stringify(hit.id) };
          textProp.value = { type: 'Literal', value: hit.text, raw: JSON.stringify(hit.text) };
        }
      }
    }
    for (const key of Object.keys(node)) {
      if (['parent', 'loc', 'range', 'start', 'end'].includes(key)) continue;
      const v = node[key];
      if (v && typeof v === 'object') visit(v);
    }
  };
  visit(ast);
}

/** @param {any} vfile */
export function recmaHeadingIds() {
  return (tree, vfile) => {
    const map = vfile?.data?.[STASH_KEY];
    if (!map || map.size === 0) return;
    fixMdxAst(tree, map);
  };
}
