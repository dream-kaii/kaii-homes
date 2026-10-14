# 部署说明（Cloudflare Pages）

本站在 **Cloudflare Pages** 上部署。

> **为什么不用 GitHub Pages**：访客主要在中国大陆，`*.github.io` 域名在大陆访问不稳定
> （经常被墙或限速）。Cloudflare Pages 有免费额度、全球 CDN，且在国内的可达性明显更好。

---

## 域名

本站域名：**https://kaii.homes**（已配置）

域名写在两处，改域名时**两处都要改**：

| # | 文件 | 位置 |
|---|---|---|
| 1 | `site/astro.config.mjs` | `site: 'https://kaii.homes'`（决定 sitemap / RSS / canonical 的绝对地址）|
| 2 | `site/public/robots.txt` | 末行 `Sitemap: https://kaii.homes/sitemap-index.xml` |

改完后跑一次构建，检查 `dist/sitemap-0.xml` 里的 `<loc>` 是否已是新域名。

## 一、首次部署（Cloudflare Pages 控制台）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权并选择本仓库（`dream-kaii/<你的仓库名>`）
3. 在「Set up builds and deployments」里填：

   | 配置项 | 值 |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `Astro`（选它会自动填好下面两项；也可选 `None` 手动填）|
   | **Build command** | `pnpm build` |
   | **Build output directory** | `dist` |
   | **Root directory（根目录）** | `site` |

   > **根目录必须是 `site`** —— 仓库根是工作区，Astro 项目在 `site/` 子目录里。
   > 不填 `site` 会构建失败（找不到 `package.json`）。

4. **Environment variables（环境变量）** 加上这两个：

   | 名称 | 值 |
   |---|---|
   | `NODE_VERSION` | `22` |
   | `PNPM_VERSION` | `10` |

   > `PNPM_VERSION` 是必须的：Cloudflare 默认用较老的 pnpm，而本站的 lockfile 是 pnpm 10 生成的，
   > 版本不匹配会导致 `--frozen-lockfile` 安装失败。

5. 点 **Save and Deploy**。首次构建约 1–2 分钟，成功后会给一个 `*.pages.dev` 临时域名。

---

## 二、绑定自定义域名

1. Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 输入你的域名（如 `kaii.dev`），按提示操作：
   - **域名已托管在 Cloudflare**：自动加好 CNAME，等几十秒生效
   - **域名在别处**：按提示去 DNS 服务商加一条 `CNAME` 指向 `<项目名>.pages.dev`
3. 等证书签发（通常几分钟）。之后 `https://你的域名` 即可访问。

4. **改完域名后**，回到上面「必须替换的 2 处占位」改配置文件并重新部署。

---

## 三、日常更新

```bash
git add <改动的文件>
git commit -m "docs: 新增一篇文章"
git push
```

推到 `main` 后 Cloudflare Pages 会**自动重新构建并发布**，无需手动操作。

### 质量门禁

仓库根的 `.github/workflows/ci.yml` 会在 push / PR 时跑 `pnpm check` + `pnpm build`。
它**只做检查、不做部署** —— 部署完全交给 Cloudflare Pages 的 Git 集成。

---

## 四、本地预览构建产物

```bash
cd site
rm -rf dist node_modules/.astro && pnpm build   # 构建
pnpm preview                                     # 本地起服务看 dist/
```

> **为什么要连 `node_modules/.astro` 一起删**：Astro 会把内容集合缓存到那里，
> 删掉内容文件后只删 `dist` 会「假绿」—— 旧文章页面仍然出现在构建产物里。
> 干净构建一律用 `rm -rf dist node_modules/.astro && pnpm build`。

---

## 五、构建产物清单（部署成功应包含）

```
dist/
├── index.html              首页
├── 404.html                404 页
├── projects/               项目列表 + 3 个详情页
├── writing/                文章列表 + 8 篇文章
├── learning-path/          学习路线
├── about/                  关于
├── rss.xml                 RSS 订阅源
├── robots.txt              爬虫规则
├── sitemap-index.xml       sitemap 索引
└── sitemap-0.xml           sitemap 明细
```
