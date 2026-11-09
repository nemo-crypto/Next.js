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
- 静态图片启用优化；远端动态图片暂直接加载，避免任意域名进入图片代理。上线后可按实际 CDN 配置专用白名单优化。
- 公开行情与活动采用 no-store，metadata/page 的重复读取仅在同一 React 请求中合并。不缓存账号数据。
- 部分历史视图仍是较大的 JS 客户端组件，保留已有交互以控制业务回归风险。不是把文件扩展名改为 TSX 就宣称完成类型治理。
- lint 保留旧视图的 hook 依赖及图片等诊断；React Compiler 专项规则暂未作为旧视图门禁，未启用 React Compiler。
- 使用 Next.js 16 默认 Turbopack；旧 DefinePlugin 全局变量已移至显式公开环境变量，alias 由 tsconfig paths 管理。

## 验证记录

完成后在此记录实际执行结果，不以静态阅读代替构建和运行时验证。
