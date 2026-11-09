import View from '@views/flexible-staking/record';
import { translatedMetadata } from '@src/lib/page-metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return translatedMetadata((await params).locale, 'flexible', 'list', '/flexible-staking/record', {}, true);
}
export default function Page() { return <View />; }
