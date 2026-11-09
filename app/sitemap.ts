import type { MetadataRoute } from 'next';
import { getSiteUrl, isIndexable } from '../src/lib/seo';
import { locales, localizedPath } from '../src/lib/routing';
export default function sitemap(): MetadataRoute.Sitemap {
    const origin = getSiteUrl();
    if (!origin || !isIndexable()) return [];
    const paths = ['/', '/converter', '/flexible-staking', '/btr-lockup-staking', '/btc-xrp-eth-trading-bot', '/staking/learn-staking'];
    // 只发布运营确认可用的动态页，不猜测币种、活动或生成无限数量换算 URL。
    for (const path of (process.env.SITEMAP_PATHS || '').split(',')) {
        if (/^\/(price|converter|flexible-staking|btr-lockup-staking|btc-xrp-eth-trading-bot|land)\/[a-zA-Z0-9-]+$/.test(path) && !path.endsWith('/record') && !path.endsWith('/vip')) paths.push(path);
    }
    return [...new Set(paths)].flatMap(path => locales.map(locale => ({
        url: `${origin}${localizedPath(path, locale)}`,
        alternates: { languages: Object.fromEntries([...locales.map(lang => [lang, `${origin}${localizedPath(path, lang)}`]), ['x-default', `${origin}${path}`]]) },
    })));
}
