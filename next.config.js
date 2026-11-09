/** @type {import('next').NextConfig} */
const appEnv = process.env.APP_ENV || (process.env.NODE_ENV === 'development' ? 'dev' : 'prod');
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.WEBSITE_URL || '';
let validSiteUrl = false;
try {
    const url = new URL(siteUrl);
    validSiteUrl = ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
} catch {}
const indexable = appEnv !== 'qa' && process.env.NEXT_PUBLIC_INDEXABLE === 'true' && validSiteUrl;
module.exports = {
    reactStrictMode: true,
    poweredByHeader: false,
    distDir: appEnv === 'dev' ? '.next' : 'dist',
    images: { formats: ['image/avif', 'image/webp'] },
    // 仅公开地址与站点配置；服务端密钥不能放进这个白名单。
    env: {
        NEXT_PUBLIC_APP_ENV: appEnv,
        NEXT_PUBLIC_SITE_URL: siteUrl,
        NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'DemoExchange',
        NEXT_PUBLIC_INDEXABLE: String(indexable),
        NEXT_PUBLIC_API_URL: process.env.API_URL || '',
        NEXT_PUBLIC_API_FUTURES: process.env.API_FUTURES || '',
        NEXT_PUBLIC_WEBSITE_URL: process.env.WEBSITE_URL || siteUrl,
        NEXT_PUBLIC_WEBSOCKET_URL: process.env.WEBSOCKET_URL || '',
        NEXT_PUBLIC_STATIC_URL: process.env.STATIC_URL || '',
        NEXT_PUBLIC_COOKIE_DOMAIN: process.env.COOKIES_DOMIAN || '',
        NEXT_PUBLIC_LANGUAGE_PARAM_NAME: process.env.LANGUAGE_PARAM_NAME || 'language',
    },
    async headers() {
        return [{ source: '/:path*', headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            ...(indexable ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
        ] }];
    },
};
