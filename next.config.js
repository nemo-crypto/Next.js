/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const path = require('path');
const nextTranslate = require('next-translate-plugin');

// 获取当前开发环境
const NODE_ENV = process.env.APP_ENV || 'prod';

// 根据环境创建打包目录
const BUILD_FOLDER = (() => {
    if (NODE_ENV !== 'dev') return 'dist';
    return '.next';
})();

// 配置别名
const aliases = {
    '@public': path.resolve('./public'),
    '@src': path.resolve('./src'),
    '@styles': path.resolve('./styles'),
    '@components': path.resolve('./src/components'),
    '@constants': path.resolve('./src/constants'),
    '@service': path.resolve('./src/service'),
    '@static': path.resolve('./src/static'),
    '@store': path.resolve('./src/store'),
    '@utils': path.resolve('./src/utils'),
    '@views': path.resolve('./src/views')
};

module.exports = nextTranslate({
    // reactStrictMode: true,
    swcMinify: true,
    images: {
        unoptimized: true,
    },

    distDir: BUILD_FOLDER,

    // webpack 配置项
    webpack (config) {
        // 配置别名
        config.resolve.alias = Object.assign({}, config.resolve.alias, aliases);

        // 修复对fs包的依赖
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false
        };

        // 配置环境变量
        config.plugins.push(
            new webpack.DefinePlugin({
                __ENV__: JSON.stringify(NODE_ENV),
                __NODE_ENV__: JSON.stringify({
                    apiDomain: process.env.API_URL,
                    apiDomainFuture: process.env.API_FUTURES,
                    websiteDomain: process.env.WEBSITE_URL,
                    WebSocketDomain: process.env.WEBSOCKET_URL,
                    staticDomain: process.env.STATIC_URL,
                    cookieDomain: process.env.COOKIES_DOMIAN,
                    languageParamName: process.env.LANGUAGE_PARAM_NAME || 'language'
                })
            })
        )

        return config;
    }
});
