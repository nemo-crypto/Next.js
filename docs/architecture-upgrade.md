# Next.js 16 架构升级审计

## 目标与迁移边界

从 Next.js 13.0.4 Pages Router 迁移到 Next.js 16.4.5 App Router，React 从 18 升级到 19.3.1。保留行情、兑换、质押、定投、活动页面的 URL 与后端契约；不重写金额计算和下单业务。

采用服务端路由 + 客户端交互边界：页面模块负责参数校验、Metadata API 和公开数据；已有业务视图仍可 SSR，并在客户端水合后执行交互。客户端组件不是关闭 SSR。只有依赖 DOM 的 ECharts 通过 dynamic 按需加载，且改为按图表类型注册模块。

## 审计结果与处理

| 原问题 | 本次处理 |
| --- | --- |
| Next 13、Pages Router、过时构建脚本 | Next 16、React 19、App Router、async params、Proxy、独立 ESLint |
| `/` 永久跳转到不存在的 `/home` | 实际首页与服务端导航链接 |
| render 中跳转语言、写 Cookie、重建 bridge | URL 决定语言，effect 写 Cookie、初始化并清理 bridge |
| 多语言 canonical 直接拼接可空域名 | 校验域名、统一 URL、hreflang、x-default、Metadata API |
| 活动 SEO 仅在客户端请求后可见 | 服务端读取公开活动信息，用于首屏及 metadata；用户状态仍由客户端刷新 |
| 价格页描述缺少服务端数据 | 单次渲染复用公开数据请求，元数据与页面保持一致 |
| 无限动态 URL、缺少 sitemap/robots | 白名单 sitemap 路径，账号页 noindex，环境级收录开关 |
| 请求错误被吞掉、Promise 永不完成 | 明确 reject、独立 Axios、最新 token/语言、按请求身份清理 |
| SSR 全局 store 与翻译状态风险 | 每个 React 树独立 provider；server-only 数据层 |
| Toast 重复 createRoot 且 DOM 未移除 | 复用 root、完整计时器卸载和 DOM 清理 |
| 日期控件旧 React 兼容范围 | DayPicker 9 与对应样式 |
| 缺少 API 时仍加载无效公共脚本 | STATIC_URL 和 GA ID 显式配置后才加载 |
| 全量 ECharts | 按需模块 + 客户端动态 chunk |

## 仍需业务输入的边界

- 正式域名、品牌文案、动态收录路径清单须由产品/运营确认，默认关闭收录。
- converter 的非英文翻译原本缺失，本次回退英文；未伪造 15 份翻译。
- 外围登录、买币与公共 Header/Footer 依赖目标服务；本仓库不虚构外部页面。
- 静态图片与 STATIC_URL 对应白名单 CDN 启用 Next 优化；其他远端业务图片直接加载，避免任意域名进入图片代理。
- 公开行情与活动采用 no-store，metadata/page 的重复读取仅在同一 React 请求中合并。不缓存账号数据。
- 部分历史视图仍是较大的 JS 客户端组件，保留已有交互以控制业务回归风险。不是把文件扩展名改为 TSX 就宣称完成类型治理。
- lint 保留旧视图的 hook 依赖及图片等诊断；React Compiler 专项规则暂未作为旧视图门禁，未启用 React Compiler。
- 使用 Next.js 16 默认 Turbopack；旧 DefinePlugin 全局变量已移至显式公开环境变量，alias 由 tsconfig paths 管理。

## 验证记录

验证日期：2026-11-09。Node.js 24.14.1、pnpm 10.32.0。

| 检查 | 实际结果 |
| --- | --- |
| `pnpm install --frozen-lockfile` | 通过，锁文件可复现安装；Swiper 的非必需安装脚本未执行 |
| `pnpm build:prod` | 通过，Next.js 16.4.5 默认 Turbopack，148 个预渲染页面 |
| `pnpm type-check` | 通过 |
| `pnpm lint` | 0 errors、48 warnings，保留历史诊断 |
| `pnpm test` | 9 项通过，覆盖路由、SEO、服务端请求隔离、WebSocket 生命周期 |
| `pnpm test:e2e` | 13 项 Chromium 检查通过 |
| `git diff --check` | 通过 |

浏览器覆盖英文/韩文/阿拉伯文的水合与客户端导航、390px 首页无横向溢出、价格 SSR、公开页面元数据、404、英文前缀跳转保留 query、robots/sitemap 与 OG 图片 PNG 响应。人工检查了移动端首页及桌面价格页截图。

验收发现并修复两类问题：本机 AirPlay 占用 5000 端口，测试改为独立 3100 端口并禁止隐式复用服务；默认英文 rewrite 的本地 origin 规范化引发重定向循环，Proxy 使用原始 URL 并开启 `skipProxyUrlNormalize`。另移除根级 loading 边界，防止无效兑换参数在响应开始后才触发 notFound，造成 soft 404。

本次未配置正式域名，因此默认 noindex，构建时 Next 会提示分享图 metadataBase 使用 localhost；上线前配置真实 `NEXT_PUBLIC_SITE_URL` 后重新构建。分享图默认使用英文标题。真实后端、账号、资金操作、原生 App 桥和完整多语言内容仍需在目标环境回归；此处不将 mock 通过视为真实业务验收通过。
