export const locales = ['en', 'zh-hant', 'es', 'id', 'ar', 'pl', 'tr', 'fr', 'de', 'th', 'nl', 'pt', 'ru', 'vi', 'sv', 'ko'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';
export function isLocale(value: string): value is Locale {
    return locales.some(locale => locale === value);
}
export function localizedPath(path: string, locale: string) {
    if (!path.startsWith('/') || path.startsWith('//')) return path;
    const first = path.split('/')[1]?.split(/[?#]/)[0];
    if (isLocale(first)) return path;
    return locale === defaultLocale ? path : `/${locale}${path === '/' ? '' : path}`;
}
