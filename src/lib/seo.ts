import type { Metadata } from 'next';
import { locales, localizedPath } from './routing';

export function getSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL || process.env.WEBSITE_URL || '') {
    try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return undefined;
        return url.origin;
    } catch { return undefined; }
}
export function isIndexable() {
    return process.env.APP_ENV !== 'qa' && process.env.NEXT_PUBLIC_INDEXABLE === 'true' && Boolean(getSiteUrl());
}
export function pageMetadata({ title, description, locale, path, noindex = false }: {
    title: string; description: string; locale: string; path: string; noindex?: boolean;
}): Metadata {
    const origin = getSiteUrl();
    const url = origin ? `${origin}${localizedPath(path, locale)}` : undefined;
    const index = isIndexable() && !noindex;
    return {
        title, description,
        robots: { index, follow: index },
        alternates: origin ? {
            canonical: url,
            languages: Object.fromEntries([...locales.map(lang => [lang, `${origin}${localizedPath(path, lang)}`]), ['x-default', `${origin}${path}`]]),
        } : undefined,
        openGraph: { type: 'website', title, description, url, locale: locale.replace('-', '_'), siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'DemoExchange' },
        twitter: { card: 'summary', title, description },
    };
}
export function serializeJsonLd(value: unknown) {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}
