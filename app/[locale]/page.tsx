import Link from 'next/link';
import { getMessages, translate } from '../../src/lib/i18n/server';
import { localizedPath } from '../../src/lib/routing';
import { translatedMetadata } from '../../src/lib/page-metadata';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return translatedMetadata((await params).locale, 'common', 'seo', '/');
}
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const common = await getMessages(locale, 'common');
    const entries = [
        ['/price', 'price', 'title'], ['/converter', 'converter', 'seo.title'],
        ['/flexible-staking', 'flexible', 'list.sloganTitle'], ['/btr-lockup-staking', 'btrlockup', 'list.sloganTitle'],
        ['/btc-xrp-eth-trading-bot', 'autoinvest', 'tdk.title'], ['/staking/learn-staking', 'learnstaking', 'main.title'],
    ];
    const links = await Promise.all(entries.map(async ([path, namespace, key]) => ({ path, title: translate(await getMessages(locale, namespace), key) })));
    return <main style={{ maxWidth: 1120, margin: 'auto', padding: '64px 24px', minHeight: '70vh' }}>
        <h1>{translate(common, 'seo.title')}</h1><p>{translate(common, 'seo.description')}</p>
        <nav aria-label='Explore'><ul>{links.map(link => <li key={link.path}><Link href={localizedPath(link.path, locale)}>{link.title}</Link></li>)}</ul></nav>
    </main>;
}
