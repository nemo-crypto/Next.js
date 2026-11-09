# Next.js Pages Router 多语言业务前端

基于 Next.js 13.0.4、React 18、MobX、Axios 与 next-translate 的业务前端，采用 `pages/` 路由，包含币种价格、兑换、质押、定投与活动页面。历史Next.js学习笔记已保存在[学习记录](docs/nextjs-notes.md)，工程运行方式以本文和实际配置为准。

<!-- BEGIN project-discovery -->
## 项目定位与实践入口

Next.js + React frontend with Pages Router, SSR, multilingual pages, MobX and cryptocurrency UI. 多语言行情、兑换与质押页面示例，需配套业务 API。

适合从以下入口阅读实现与接入条件：

- [Pages Router 页面](pages/)
- [国际化资源](locales/)
- [Next.js 学习记录](docs/nextjs-notes.md)
<!-- END project-discovery -->

## 业务与目录

| 路径 | 说明 |  
|---|---|
| `pages/price/` | 币种列表与动态币种详情 |
| `pages/converter/` | 兑换入口与币种页 |
| `pages/flexible-staking/`、`pages/btr-lockup-staking/` | 理财、锁仓与相关记录页面 |
| `pages/btc-xrp-eth-trading-bot/`、`pages/land/` | 策略与活动页面 |
| `src/` | 业务组件、HTTP、状态和WebSocket封装 |
| `locales/`、[i18n.js](i18n.js) | 多语言资源与页面命名空间映射 |
| [next.config.js](next.config.js)、[pm2.config.js](pm2.config.js) | 构建环境与进程管理 |

## 安装与本地运行

目录保留yarn.lock，可在兼容该历史工具链的环境中执行：

```bash
yarn install --frozen-lockfile
yarn dev
```

开发地址为 `http://localhost:9000`。工程没有声明Node engines，本次没有进行运行时兼容性验证。

## 环境变量与地址

配置读取 `APP_ENV`，默认 `prod`，并读取 `API_URL`、`API_FUTURES`、`WEBSITE_URL`、`WEBSOCKET_URL`、`STATIC_URL`、`COOKIES_DOMIAN`。最后一个名称按源码保留拼写，不能直接改为COOKIES_DOMAIN。

开发/构建脚本设置的NODE_ENV与APP_ENV职责不同。真实接入需要核对业务接口、Cookie域、WebSocket与多语言资源；本目录不提供对应业务后端。客户端可访问的配置不可承载服务端秘密。

## 构建与启动

```bash
yarn build:prod
yarn start
```

生产启动端口为5000，且必须先生成构建产物。`build:qa` 脚本实际设置 `NODE_ENV=test` 后执行构建；是否满足目标测试环境，需同时检查APP_ENV与实际地址。

```bash
yarn lint
```

没有独立的测试脚本。`export` 是否适用于所有动态和服务端页面需逐页核对，不能保证所有业务都可静态导出。

## 进程管理与验收

`pm2:start` 脚本会安装依赖、删除并重建指定PM2进程，属于部署操作；仅在确认目标进程与配置后使用，日常本地开发不需要执行。

验收覆盖页面路由、语言切换、网络配置、登录态、异常响应和生产构建。本轮仅核对README与源码，未安装依赖、运行PM2或验证后端联调。

## 中性演示配置

多语言展示与示例标识统一使用DemoExchange，样式改用系统字体。币种和法币图标优先使用STATIC_URL对应路径，未配置时回退到本地中性SVG；WebSocket必须通过WEBSOCKET_URL配置，缺省时不主动连接外部服务。

公共请求语言字段默认是language，可通过LANGUAGE_PARAM_NAME适配目标后端；该变量在构建时注入。静态语言资源子目录为languse/demo-content，支持文档链接为example.com示例，均需按实际业务接入替换，不能作为在线服务可用性保证。
