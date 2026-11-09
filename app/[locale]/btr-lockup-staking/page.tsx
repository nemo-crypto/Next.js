import View from '@views/btr-lockup-staking';
import { translatedMetadata } from '@src/lib/page-metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return translatedMetadata((await params).locale, 'btrlockup', 'list', '/btr-lockup-staking', {}, false);
}
export default function Page() { return <View />; }
