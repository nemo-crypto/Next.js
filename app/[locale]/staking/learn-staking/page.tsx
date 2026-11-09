import View from '@views/staking/learn-staking';
import { translatedMetadata } from '@src/lib/page-metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return translatedMetadata((await params).locale, 'learnstaking', 'seo', '/staking/learn-staking', {}, false);
}
export default function Page() { return <View />; }
