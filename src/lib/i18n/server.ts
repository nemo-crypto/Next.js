import 'server-only';
import { cache } from 'react';
import { isLocale } from '../routing';

const namespaces = ['common', 'price', 'converter', 'flexible', 'btrlockup', 'autoinvest', 'learnstaking'];
export const getMessages = cache(async (locale: string, namespace: string) => {
    if (!isLocale(locale) || !namespaces.includes(namespace)) throw new Error('Unsupported translation resource');
    try {
        return (await import(`../../../locales/${locale}/${namespace}.json`)).default;
    } catch (error) {
        // 旧仓库 converter 只有英文资源；显式回退，避免其他语言构建失败。
        if (locale !== 'en' && namespace === 'converter') return (await import('../../../locales/en/converter.json')).default;
        throw error;
    }
});
export function translate(messages: Record<string, unknown>, key: string, values: Record<string, string | number> = {}) {
    const text = key.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined, messages);
    if (typeof text !== 'string') return '';
    return text.replace(/{{\s*(\w+)\s*}}/g, (_, name) => String(values[name] ?? ''));
}
