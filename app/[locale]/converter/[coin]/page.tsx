import { notFound } from 'next/navigation';
import View from '@views/converter/detail';
import Breadcrumbs from '@components/seo/breadcrumbs';
import { getConverter } from '@src/lib/public-data';
import { translatedMetadata } from '@src/lib/page-metadata';
type Props = { params: Promise<{ locale: string; coin: string }> };
async function resolve(params: Props['params']) {
    const { locale, coin } = await params;
    const match = /^(?:(\d+(?:\.\d+)?)-)?([a-zA-Z0-9]+)-to-([a-zA-Z0-9]+)$/.exec(coin);
    if (!match || !Number.isFinite(Number(match[1] || 1))) notFound();
    return { locale, coin, fromCount: Number(match[1] || 1), fromName: match[2].toUpperCase(), toName: match[3].toUpperCase() };
}
export async function generateMetadata({ params }: Props) {
    const { locale, coin, fromCount, fromName, toName } = await resolve(params);
    const initialData = await getConverter(`${fromCount}-${fromName}-to-${toName}`, locale);
    const result = await translatedMetadata(locale, 'converter', 'seo', `/converter/${coin}`, {}, !initialData);
    const title = `${fromName} / ${toName} — ${result.title}`;
    return { ...result, title, openGraph: { ...result.openGraph, title }, twitter: { ...result.twitter, title } };
}
export default async function Page({ params }: Props) {
    const data = await resolve(params);
    const initialData = await getConverter(`${data.fromCount}-${data.fromName}-to-${data.toName}`, data.locale);
    return <>
        <Breadcrumbs locale={data.locale} items={[
            { name: process.env.NEXT_PUBLIC_SITE_NAME || 'DemoExchange', path: '/' },
            { name: `${data.fromName} / ${data.toName}`, path: `/converter/${data.coin}` },
        ]} />
        <View {...data} initialData={initialData} />
    </>;
}
