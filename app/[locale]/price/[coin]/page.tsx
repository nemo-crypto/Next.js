import { notFound } from 'next/navigation';
import View from '@views/price';
import Breadcrumbs from '@components/seo/breadcrumbs';
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
    return pageMetadata({ locale, path: `/price/${coin.toUpperCase()}`, noindex: !detail,
        title: translate(messages, detail?.isEtf ? 'seo.etfTitle' : 'seo.title', values),
        description: translate(messages, detail?.isEtf ? 'seo.etfDescription' : 'seo.description', values),
    });
}
export default async function Page({ params }: Props) {
    const { locale, coinName, detail, coin } = await resolve(params);
    return <>
        <Breadcrumbs locale={locale} items={[
            { name: process.env.NEXT_PUBLIC_SITE_NAME || 'DemoExchange', path: '/' },
            { name: detail?.info?.coinFullName || coinName, path: `/price/${coin.toUpperCase()}` },
        ]} />
        {detail ? <View coinName={coinName} coinDetail={detail} /> : <main style={{ padding: 24 }}>
            <h1>{translate(await getMessages(locale, 'price'), 'coinPrice', { coinFullName: coinName })}</h1>
            <p>{translate(await getMessages(locale, 'common'), 'other.noData')}</p>
        </main>}
    </>;
}
