import View from '@views/btc-xrp-eth-trading-bot';
import { translatedMetadata } from '@src/lib/page-metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return translatedMetadata((await params).locale, 'autoinvest', 'tdk', '/btc-xrp-eth-trading-bot', {}, false);
}
export default function Page() { return <View />; }
