import { notFound } from 'next/navigation';
import View from '@views/converter/detail';
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
    const { locale, coin, fromName, toName } = await resolve(params);
    const result = await translatedMetadata(locale, 'converter', 'seo', `/converter/${coin}`);
    const title = `${fromName} / ${toName} — ${result.title}`;
    return { ...result, title, openGraph: { ...result.openGraph, title }, twitter: { ...result.twitter, title } };
}
export default async function Page({ params }: Props) {
    const data = await resolve(params);
    const initialData = await getConverter(`${data.fromCount}-${data.fromName}-to-${data.toName}`, data.locale);
    return <View {...data} initialData={initialData} />;
}
