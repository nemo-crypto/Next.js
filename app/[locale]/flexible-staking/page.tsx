import View from '@views/flexible-staking/list';
import { translatedMetadata } from '@src/lib/page-metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return translatedMetadata((await params).locale, 'flexible', 'list', '/flexible-staking', {}, false);
}
export default function Page() { return <View />; }
