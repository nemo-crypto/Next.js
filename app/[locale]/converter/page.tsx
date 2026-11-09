import View from '@views/converter';
import { translatedMetadata } from '@src/lib/page-metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return translatedMetadata((await params).locale, 'converter', 'seo', '/converter', {}, false);
}
export default function Page() { return <View />; }
