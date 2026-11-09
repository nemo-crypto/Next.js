import { notFound } from 'next/navigation';
import View from '@views/landing-page';
import { getLanding } from '@src/lib/public-data';
import { pageMetadata } from '@src/lib/seo';
import { getMessages, translate } from '@src/lib/i18n/server';
import { mapLocalesIdToKoot } from '@utils/common';
type Props = { params: Promise<{ locale: string; activityId: string }> };
async function resolve(params: Props['params']) {
    const value = await params;
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(value.activityId)) notFound();
    return { ...value, data: await getLanding(value.activityId, mapLocalesIdToKoot(value.locale)) };
}
export async function generateMetadata({ params }: Props) {
    const { locale, activityId, data } = await resolve(params);
    const common = await getMessages(locale, 'common');
    return pageMetadata({ locale, path: `/land/${activityId}`, noindex: !data,
        title: data?.seoContent?.seoTitle || translate(common, 'seo.title'),
        description: data?.seoContent?.seoDes || translate(common, 'seo.description'),
    });
}
export default async function Page({ params }: Props) {
    const { locale, activityId, data } = await resolve(params);
    if (!data) {
        const common = await getMessages(locale, 'common');
        return <main style={{ padding: 24 }}><h1>{translate(common, 'seo.title')}</h1><p>{translate(common, 'other.noData')}</p></main>;
    }
    return <View activityId={activityId} initialData={data} />;
}
