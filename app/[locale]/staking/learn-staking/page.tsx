import { getMessages } from '@src/lib/i18n/server';
import View from '@views/staking/learn-staking';
import { translatedMetadata } from '@src/lib/page-metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return translatedMetadata((await params).locale, 'learnstaking', 'seo', '/staking/learn-staking', {}, false);
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return <View locale={locale} messages={await getMessages(locale, 'learnstaking')} />;
}
