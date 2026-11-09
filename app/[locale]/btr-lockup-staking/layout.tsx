import TranslationProvider from '@components/translation-provider';
import { getMessages } from '@src/lib/i18n/server';
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const [common, messages] = await Promise.all([getMessages(locale, 'common'), getMessages(locale, 'btrlockup')]);
    return <TranslationProvider locale={locale} namespaces={{ common, btrlockup: messages }}>{children}</TranslationProvider>;
}
