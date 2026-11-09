import Link from 'next/link';
import { getSiteUrl, serializeJsonLd } from '@src/lib/seo';
import { localizedPath } from '@src/lib/routing';

export default function Breadcrumbs({ locale, items }: { locale: string; items: { name: string; path: string }[] }) {
    const origin = getSiteUrl();
    const schema = {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem', position: index + 1, name: item.name,
            item: `${origin}${localizedPath(item.path, locale)}`,
        })),
    };
    return <>
        <nav aria-label='Breadcrumb' style={{ maxWidth: 1200, margin: 'auto', padding: '16px 24px', lineHeight: 1.5 }}>
            <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none' }}>
                {items.map((item, index) => <li key={item.path}>
                    {index > 0 && <span aria-hidden='true'> / </span>}
                    {index === items.length - 1 ? <span aria-current='page'>{item.name}</span> : <Link href={localizedPath(item.path, locale)}>{item.name}</Link>}
                </li>)}
            </ol>
        </nav>
        {origin && <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />}
    </>;
}
