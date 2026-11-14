# SSR、SEO、安全与用户体验优化

日期：2026-11-14。范围：本仓库；保留原业务 URL、接口、登录态和交易/质押协议。未连接真实账号或执行资金操作。

## 框架和版本选择

沿用 Next.js App Router + React Server Components。项目已采用 React，服务端元数据、语言路由和公开数据边界也已落地；更换为另一套框架不能自动解决安全或体验问题，反而会扩大业务回归范围。

以 npm 当天 `latest` 和真实安装结果核验：Next.js / eslint-config-next **16.4.6**、React / React DOM **19.3.1**。其他运行依赖同步到当前稳定版，包括 Axios 1.21.1、Swiper 14.4.0、Pako 3.0.3、BigNumber 11.1.5、ECharts 6.1.0、DayPicker 10.0.2、MobX 7.1.7。锁文件固定实际解析结果，部署使用冻结安装。

工具链采用最新**兼容**版本：TypeScript **6.0.3**、ESLint **9.39.5**、Node.js 24 类型 **24.19.2**。已实际尝试 TS 7.0.2 / ESLint 10.15.0，Next 配套 typescript-eslint 明确拒绝 TS 7，部分插件 peer 也不支持 ESLint 10，因此保留支持范围内版本，不关闭检查绕过问题。移除 TS 已弃用的 baseUrl，paths 使用显式相对路径。

运行 Node.js **24.14.0+**，`.nvmrc` 跟随 24 LTS；本机实测 24.14.1，未升级或替换用户机器的 Node。pnpm 维持可复现的 **10.32.0**：本机旧管理器自动切换 pnpm 12.18.0 时未完成其原生二进制安装、报 ENOEXEC，未以一个无法正常执行的版本作为项目默认。

## 已实施

| 方向 | 处理 | 验证边界 |
| --- | --- | --- |
| SSR | 保留服务端 page、server-only 数据和 React 请求级去重；公开请求 no-store、8秒超时；拒绝带凭据/非 HTTP API 地址及自动重定向 | 不把账号数据加入共享缓存，不新建业务接口或改变请求参数 |
| SEO | 回归 canonical、16语言 hreflang、Open Graph、Twitter、JSON-LD 转义、sitemap/robots、真实404 | 新 Demo 强制 noindex、不进 sitemap；正式域名和收录开关继续显式配置 |
| 内容安全 | 接口、活动、弹窗、规则和翻译插值后的 HTML 共用 sanitize-html 白名单；保留常用标题、表格、图片和有限排版 | 移除 script/iframe/form/事件属性、脚本 URL、协议相对地址及危险 CSS；不同于全面允许后台 HTML |
| 导航安全 | 后台网站链接与活动新窗口校验 HTTP(S)/本地 URL，拒绝嵌入凭据、控制字符和反斜杠；新窗口隔离 opener | 登录、交易等外围系统仍使用原有导航方式，不改变交易流程 |
| 响应安全 | 添加 SAMEORIGIN、CSP base-uri/object-src/frame-ancestors 和权限策略，保留 nosniff/referrer-policy | 这是兼容性安全基线，未宣称有完整 script-src CSP；第三方跨站 iframe 嵌入会被拒绝 |
| 用户体验 | 恢复键盘可见焦点、跳过导航、16语言错误与404提示、重试入口、reduced-motion；无公共 Header 时取消 H5 空白占位 | Demo 检查390px无横向溢出和明暗主题；翻译为本次补充，正式品牌发布仍应做语言审校 |
| 弹窗 | 语义 dialog、可访问名称、真实按钮、Tab循环、Escape关闭、关闭后还原焦点、嵌套滚动锁及卸载清理 | 未修改确认回调和业务提交参数，未让关闭弹窗触发确认操作 |
| 升级兼容 | Swiper CSS新入口；Pako toText解码；BigNumber中间输入兼容、缺失报价显示 --；Sass list.nth | 回归压缩中文行情、重复数组请求编码、日期计算、大额小数精度和ROUND_DOWN，不调整资金公式 |

## Demo 和实测

```bash
pnpm install --frozen-lockfile
pnpm dev:demo
# http://localhost:9000/demos/ssr
```

- 默认：服务端输出可阅读内容；禁用 JavaScript 仍可阅读、切换和从失败页重试。
- `?scenario=slow`：固定1200ms的本地模拟慢源，Suspense仅阻塞文章区；骨架保留相同布局。无JS提供完整内容入口。
- `?scenario=error`：模拟错误与重试，不访问真实支付、账号或行情服务。
- Save sample：当前页内状态；不会暗中保存到服务器或账号。
- Dialog：复用项目弹窗，验证焦点循环、嵌套关闭和滚动锁。

`SSR_DEMOS_ENABLED` 默认关闭，关闭时 HTTP 404；启用展示需在构建和运行时均配置。Demo 以英语独立标记 `lang=en`，不伪装成已完成16语业务文案。

生产模式可重复验收：

```bash
pnpm exec playwright install chromium
pnpm check
pnpm verify:e2e
pnpm audit:prod
```

`verify:e2e` 使用专用测试域名 `https://ssr.example.test` 和本机 mock API 构建，随后启动受控测试进程。它会重建 `dist/`，该产物只用于测试，不能直接部署为正式网站。正式部署重新配置真实站点变量并执行 `pnpm build:prod`。mock 只允许本机测试来源的 CORS，不修改真实 API 的跨域策略。

2026-11-14 本机初次有效样本（无网络/CPU限速，不能代替线上 CWV 或前后优化对照实验）：

| 实测项目 | 结果 |
| --- | --- |
| 框架首个 HTML 与慢源完成 | 12ms / 1212ms；模拟源1200ms，验证先到框架再到数据 |
| 桌面1440×1000 Demo | TTFB约66ms、LCP约96ms、CLS约0.00154 |
| Chromium | 原13项 + 新6项，共19项通过 |
| Axe | Demo桌面日间、H5夜间 WCAG A/AA 自动检查无违规；不等同全站无障碍认证 |
| 单元测试 | 16项通过，含重定向阻断、HTML攻击输入、精度、压缩行情及SEO |
| 生产构建 | Next 16.4.6 / Turbopack，164个预渲染页面；动态详情保持按需SSR |
| 类型 / lint | 类型通过；lint无错误，48条历史视图/新版诊断警告保留，不通过关规则隐藏 |
| 生产依赖审计 | 0个已知漏洞；相比升级前生产依赖50条公告命中（含2 critical、22 high） |

`.temp/ssr-stream-metrics.json`、`.temp/ssr-paint-metrics.json` 保存每次测量，截图见 `.temp/ssr-demo-desktop-light.png` / `ssr-demo-mobile-dark.png`。这些是忽略的本地产物，不作为业务源码提交。

## 仍需关注的边界

1. 完整依赖审计仍有1项中风险：typescript-eslint → minimatch 10.2.6 的 glob 放大公告。位于开发工具链，线上生产依赖不包含它；当前 lint 使用仓库固定模式，不接收用户输入的 glob。未通过强制跨主版本 override 掩盖兼容性，等待上游兼容修复；若用于处理不可信仓库/动态glob，应另外限制资源并重新评估。
2. 完整 script-src CSP 需要确认公共 Header/Footer、GA 和其他外部脚本域名；本次不添加 unsafe-inline/unsafe-eval 来伪装“完整CSP”。TLS/HSTS、WAF、服务端限流和会话/CSRF由实际部署及后端一并验收，前端没有新增认证API。
3. 公开数据 SSR 仅用于原有公开接口。余额、订单、报名、买入/赎回及外部登录仍须真实测试环境回归；mock通过不代表资金业务验收完成。所有依赖的主版本升级应先部署测试环境，不直接发布正式业务。
4. 正式域名、品牌文案、缺失的 converter 非英文内容和实际后端协议，沿用 README 中的上线前确认项。第三方HTML中被白名单移除的交互脚本、嵌入和复杂CSS，需改为受控组件，不能重新放开任意HTML。

## 官方参考

- [Next.js 数据读取与流式渲染](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Next.js CSP及其静态/动态渲染约束](https://nextjs.org/docs/app/guides/content-security-policy)
- [Next.js Metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [sanitize-html 白名单配置](https://github.com/apostrophecms/sanitize-html)
