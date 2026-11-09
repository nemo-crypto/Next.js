import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, locales } from '../../src/lib/routing';
import { getMessages, translate } from '../../src/lib/i18n/server';
import { getSiteUrl, serializeJsonLd } from '../../src/lib/seo';
import Providers from './providers';
import '../../styles/globals.css';

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
const siteUrl = getSiteUrl();
export const metadata: Metadata = { metadataBase: siteUrl ? new URL(siteUrl) : undefined, formatDetection: { telephone: false, email: false, address: false } };
export function generateStaticParams() { return locales.map(locale => ({ locale })); }
export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();
    const messages = await getMessages(locale, 'common');
    const origin = getSiteUrl();
    const schema = { '@context': 'https://schema.org', '@type': 'WebSite', name: process.env.NEXT_PUBLIC_SITE_NAME || 'DemoExchange', url: origin, inLanguage: locale, description: translate(messages, 'seo.description') };
    return <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
        <head><script dangerouslySetInnerHTML={{ __html: `(function(){var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);document.documentElement.setAttribute('theme',m&&m[1]==='dark'?'dark':'light')})()` }} /></head>
        <body>
            {origin && <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />}
            <Providers locale={locale} messages={messages}>{children}</Providers>
        </body>
    </html>;
}
