# Next.js App Router 多语言业务前端

基于 **Next.js 16.4.5、React 19.3.1、TypeScript 5、App Router** 的多语言行情、兑换、质押、定投和活动前端。保留现有业务接口和页面 URL，服务端负责路由、语言资源、SEO 元数据及公开详情数据，客户端负责交互和登录后的业务操作。

版本依据：2026-11-09 核对 npm stable；实际安装版本以 `package.json`、`pnpm-lock.yaml` 为准。历史 Next.js 13 学习材料保存在 [docs/nextjs-notes.md](docs/nextjs-notes.md)，不再作为当前工程运行指南。

## 环境与运行

要求 Node.js **22 或更新的 LTS**、pnpm **10.32.0**。

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
# 按后端和站点环境填写 .env.local
pnpm dev
```

开发地址：`http://localhost:9000`。

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build:prod
pnpm start
```

生产启动端口为 `5000`（macOS AirPlay 可能占用此端口，本地可用 `pnpm exec next start -p 3100`）。CI 使用 Node.js 24 与冻结 pnpm 锁文件执行检查、构建和 Chromium 回归。`pnpm build:qa` 使用 `APP_ENV=qa`，不会错误地将 `NODE_ENV` 设置为 `test`。生产构建输出为 `dist/`，开发输出为 `.next/`。开发和构建使用 Next.js 16 默认 Turbopack；已移除旧 Webpack DefinePlugin 和手工 alias，改用公开环境变量白名单与 tsconfig paths。

本项目需要 Next.js 服务端，不支持 `next export`。`pm2:start` 会重新安装依赖、删除并重建指定 PM2 进程，仅用于明确的部署操作，不用于本地验收。

## 架构

| 路径 | 职责 |
| --- | --- |
| `app/[locale]/layout.tsx` | Server Component 根布局、HTML 语言/方向、公共语言包、结构化数据 |
| `app/[locale]/**/page.tsx` | 路由入参、服务端数据、`generateMetadata`、视图边界 |
| `app/[locale]/**/layout.tsx` | 按业务模块加载语言 namespace |
| `app/[locale]/providers.jsx` | 客户端语言 Cookie、原生桥、请求树独立 store、可选分析脚本 |
| `app/robots.ts`、`app/sitemap.ts` | Next Metadata Route，控制收录与可发现 URL |
| `proxy.ts` | Next.js 16 Proxy，多语言重写与英文前缀规范化 |
| `src/lib/i18n/` | 服务端语言资源加载与元数据翻译 |
| `src/lib/seo.ts` | canonical、hreflang、Open Graph、Twitter、robots、JSON-LD 序列化 |
| `src/lib/public-data.ts` | `server-only` 公开数据请求，不携带用户凭证 |
| `src/lib/navigation.ts`、`src/components/localized-link.tsx` | 保留当前语言的客户端导航 |
| `src/views/` | 现有业务视图，客户端组件仍进行服务端首屏渲染 |
| `src/utils/http.js` | 浏览器业务请求、最新登录态、取消请求和错误传递 |
| `locales/` | 16 种语言资源 |

原来的 `pages/_app`、`pages/_document`、`getServerSideProps` 与 `next/head` 已迁移到 App Router 对应机制。路由 `params` 按新版本约定异步读取。Server Component 不读取浏览器 Cookie、DOM 或客户端 store。

首页现在有真实的可抓取内容和业务导航，不再跳转到本仓库不存在的 `/home`。账户记录、VIP 页面默认 `noindex`。错误与不存在的页面由路由级 `error.tsx`、`not-found.tsx` 处理。根布局不设置全局 `loading.tsx`，避免参数校验前开始流式响应、将无效详情页返回为 HTTP 200；业务视图保留各自的数据加载状态。

## 多语言与 URL

- 英文：`/price/BTC`；韩文：`/ko/price/BTC`；繁体中文：`/zh-hant/price/BTC`。
- 英文无前缀 URL 在内部重写到 `/en/...`；显式 `/en/...` 永久跳转回无前缀地址，保留查询参数。
- 不再根据浏览器语言自动重定向已访问的 URL，避免水合副作用、爬虫结果不稳定及覆盖用户明确选择。
- `html[lang]` 根据路由设置，阿拉伯语使用 `dir=rtl`。内部 Link 和编程式导航保持语言。
- 原仓库 converter 只有英文翻译，目前其他语言明确回退英文。上线完整多语言 SEO 前应补齐这些资源。
- 不使用全局 `globalThis` 共享翻译状态；语言包由当前 React 树的 context 持有。

## SEO 上线配置

必须先配置真实域名，再开启收录：

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-real-domain.com
NEXT_PUBLIC_SITE_NAME=YourBrand
NEXT_PUBLIC_INDEXABLE=true
# 只填写已经验证可访问的动态详情路径
SITEMAP_PATHS=/price/BTC,/price/ETH,/converter/BTC-to-USD
```

这些公开配置参与构建，修改后需重新构建。未配置站点域名、未显式允许收录或 `APP_ENV=qa` 时，robots/页面元数据关闭索引。默认示例名称并不代表已完成品牌文案替换；`locales/**` 中现有 DemoExchange 文案也需要按正式品牌审校。

实现包含：

- 各路由服务端生成 title/description；价格、币种详情采用具体入参及公开接口数据。
- 绝对 canonical、不带跟踪查询参数的稳定 URL、16 种语言的 hreflang 和 `x-default`。
- Open Graph、Twitter 摘要、服务端生成的品牌分享图（默认英文标题），以及经过安全转义的 WebSite/BreadcrumbList JSON-LD；不虚构评级、评论或金融收益。
- `/robots.txt`、`/sitemap.xml`；sitemap 包含公开静态页和运营确认的动态路径，不枚举无限换算金额、不包含账号页或 `/price` 跳转页。
- 保留浏览器缩放，使用语义标题；本地图片与 STATIC_URL 白名单 CDN 使用 Next 图片优化，未知远端图片不通过任意域名代理。

SEO 技术配置不保证排名。正式上线仍需要核验内容质量、动态路径清单、真实后端返回、Search Console 收录和 Core Web Vitals。

## 数据、缓存与安全边界

- 公共数据仅通过 `server-only` 模块在服务端读取；用 React `cache` 合并同一次渲染中 metadata 与页面的重复请求。
- 行情、活动详情当前明确使用 `cache: 'no-store'`，超时 8 秒；不把实时数据或活动参与状态放入跨用户公共缓存。
- 静态文案页面可预渲染；修改缓存策略前先区分公开内容与账号状态。
- SSR 不转发浏览器 token；登录后的明细、余额、报名和交易继续通过浏览器业务接口读取。
- 浏览器请求使用独立 Axios 实例，每次读取最新 token/语言，失败正常 reject，不再吞错导致调用方永远等待。
- 日志不输出带 token 的完整请求对象。客户端配置只能存放公开地址，不能放服务端密钥。

## 业务接入变量

参见 [.env.example](.env.example)。`API_URL`、`API_FUTURES`、`WEBSOCKET_URL`、`STATIC_URL`、`WEBSITE_URL` 和 `COOKIES_DOMIAN` 需与目标后端匹配。`COOKIES_DOMIAN` 保留历史拼写，避免破坏现有部署变量；语言参数名默认为 `language`，可用 `LANGUAGE_PARAM_NAME` 配置。

`NEXT_PUBLIC_GA_ID` 为可选 GA4 标识，未配置时不加载分析脚本。公共 Header/Footer 仅在配置 `STATIC_URL` 后加载；不存在配套服务时不要把空壳演示视为完整线上业务。

`/creditcard`、`/how-to-buy/**`、登录注册等链接属于现有外围系统，本仓库没有这些页面；上线时需在网关配置对应入口，或在产品范围内补齐。不能通过泛化重写把未知路径伪装成有效页面。

## 验证与迁移记录

```bash
pnpm check
# 全量生产编译与服务端预渲染
pnpm build:prod
```

自动测试覆盖 URL/语言规范化、canonical/hreflang、预览环境和私有页禁止索引、sitemap 过滤以及 JSON-LD 转义。发布前还应验证：16 种语言入口、动态路由参数、明暗主题、移动端日期选择、登录/退出、原生 App 桥、后端错误恢复，以及真实 API 下的价格和订单交互。

2026-11-09 本地验证：生产构建成功（148 个预渲染页面），类型检查通过，9 项单元测试和 13 项 Chromium 检查通过；ESLint 为 0 errors、48 warnings，历史 hook 依赖与图片诊断仍待逐模块治理。浏览器验收使用 mock 公开数据，不代表真实交易及登录流程已完成联调。

本次架构审计、已验证内容与已知边界见 [docs/architecture-upgrade.md](docs/architecture-upgrade.md)。

浏览器验收（先完成构建）：

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

默认自动启动本地只读 mock 后端（9099）及 Next 生产服务（127.0.0.1:3100），不复用占用端口的未知服务，覆盖多语言水合、导航、移动端首页、价格 SSR、SEO HTML 与 404；`E2E_BASE_URL` 可改为已经启动的受控验证环境。真实账号和资金操作不在 mock 验收范围内。
