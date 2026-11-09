import View from '@views/btc-xrp-eth-trading-bot';
import { notFound } from 'next/navigation';
import { translatedMetadata } from '@src/lib/page-metadata';
type Props = { params: Promise<{ locale: string; coin: string }> };
async function resolve(params: Props['params']) {
    const value = await params;
    if (!/^[a-zA-Z0-9-]{1,60}$/.test(value.coin)) notFound();
    return { ...value, coinName: value.coin.toUpperCase() };
}
export async function generateMetadata({ params }: Props) {
    const { locale, coin, coinName } = await resolve(params);
    return translatedMetadata(locale, 'autoinvest', 'tdk', `/btc-xrp-eth-trading-bot/${coin}`, { coin: coinName });
}
export default async function Page({ params }: Props) {
    await resolve(params);
    return <View />;
}
