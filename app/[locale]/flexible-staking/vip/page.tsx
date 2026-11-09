import View from '@views/flexible-staking/vip';
import { translatedMetadata } from '@src/lib/page-metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return translatedMetadata((await params).locale, 'flexible', 'vip', '/flexible-staking/vip', {}, true);
}
export default function Page() { return <View />; }
