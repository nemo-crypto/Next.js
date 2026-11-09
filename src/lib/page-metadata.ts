import 'server-only';
import { getMessages, translate } from './i18n/server';
import { pageMetadata } from './seo';
export async function translatedMetadata(locale: string, namespace: string, prefix: string, path: string, values: Record<string, string | number> = {}, noindex = false) {
    const [messages, common] = await Promise.all([getMessages(locale, namespace), getMessages(locale, 'common')]);
    return pageMetadata({ locale, path, noindex,
        title: translate(messages, `${prefix}.title`, values) || translate(common, 'seo.title'),
        description: translate(messages, `${prefix}.description`, values) || translate(common, 'seo.description'),
    });
}
