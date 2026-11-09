import { notFound } from 'next/navigation';
import View from '@views/price';
import { getPrice } from '@src/lib/public-data';
import { getMessages, translate } from '@src/lib/i18n/server';
import { pageMetadata } from '@src/lib/seo';
type Props = { params: Promise<{ locale: string; coin: string }> };
async function resolve(params: Props['params']) {
    const { locale, coin } = await params;
    if (!/^[a-zA-Z0-9-]{1,60}$/.test(coin)) notFound();
    const upper = coin.toUpperCase();
    const parts = upper.split('-');
    const coinName = upper.includes('ETF') && parts.length === 3 ? `${parts[0]}${parts[2]}` : upper;
    return { locale, coin, coinName, detail: await getPrice(coinName, locale) };
}
export async function generateMetadata({ params }: Props) {
    const { locale, coin, coinName, detail } = await resolve(params);
    const messages = await getMessages(locale, 'price');
    const values = { coinName, coinFullName: detail?.info?.coinFullName || coinName };
    return pageMetadata({ locale, path: `/price/${coin}`, noindex: !detail,
        title: translate(messages, detail?.isEtf ? 'seo.etfTitle' : 'seo.title', values),
        description: translate(messages, detail?.isEtf ? 'seo.etfDescription' : 'seo.description', values),
    });
}
export default async function Page({ params }: Props) {
    const { coinName, detail } = await resolve(params);
    return <View coinName={coinName} coinDetail={detail || {}} />;
}
