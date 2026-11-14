import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { localizedPath } from '@src/lib/routing';
import { pageMetadata } from '@src/lib/seo';
import DemoInteractions from './interactions';
import styles from './page.module.css';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ params }: Props) {
    return pageMetadata({ locale: (await params).locale, path: '/demos/ssr', noindex: true,
        title: 'SSR experience lab', description: 'An isolated demo of server rendering, streaming and accessible interactions. Not market data.' });
}
const articles = [
    { title: 'Content before JavaScript', category: 'SSR', text: 'The page shell and these articles are rendered on the server. Turn off JavaScript and they still work.' },
    { title: 'Discoverable by design', category: 'SEO', text: 'A semantic heading, descriptive metadata and canonical URLs. This demo always opts out of indexing.' },
    { title: 'A smaller trust boundary', category: 'Security', text: 'Public content contains no account data. Rich text is sanitized before it reaches the HTML document.' },
];
async function Articles({ scenario, locale }: { scenario: string; locale: string }) {
    // 固定且有上限的本地延迟，仅在显式启用的 Demo 中使用，不调用真实业务接口。
    await new Promise(resolve => setTimeout(resolve, scenario === 'slow' ? 1200 : 60));
    if (scenario === 'error') return <section className={styles.failure} role='alert'>
        <h2>The sample source is unavailable</h2><p>This is a simulated error. Your existing content is safe.</p>
        <Link href={localizedPath('/demos/ssr', locale)} prefetch={false}>Retry sample</Link>
    </section>;
    return <section aria-label='Server-rendered articles' data-testid='server-articles' className={styles.grid}>
        {articles.map(item => <article key={item.category} className={styles.card}>
            <span className={styles.tag}>{item.category}</span><h2>{item.title}</h2><p>{item.text}</p>
        </article>)}
    </section>;
}
export default async function Page({ params, searchParams }: Props) {
    if (process.env.SSR_DEMOS_ENABLED !== 'true') notFound();
    await connection();
    const { locale } = await params;
    const query = await searchParams;
    const scenario = ['slow', 'error'].includes(String(query.scenario)) ? String(query.scenario) : 'normal';
    const path = localizedPath('/demos/ssr', locale);
    const renderedAt = new Date().toISOString();
    // 默认/失败页先生成关键内容，禁用 JS 仍可阅读和重试；慢源单独演示流式区域。
    const content = scenario === 'slow' ? <Articles scenario={scenario} locale={locale} /> : await Articles({ scenario, locale });
    return <main lang='en' className={styles.main}>
        <div className={styles.wrap}>
            <header className={styles.header}><Link href={localizedPath('/', locale)}>← Back home</Link><span>EXPERIENCE LAB / 01</span></header>
            <div className={styles.hero}>
                <p className={styles.eyebrow}>NEXT.JS · APP ROUTER · REACT SERVER COMPONENTS</p>
                <h1>Fast to arrive.<br /><span>Ready to interact.</span></h1>
                <p className={styles.lead}>A small, working lab for server rendering, progressive delivery and thoughtful recovery.</p>
                <p className={styles.notice}>Demo content only · No real prices or accounts · Always noindex</p>
            </div>
            <section aria-labelledby='delivery-heading' className={styles.delivery}>
                <div><h2 id='delivery-heading'>Try a delivery condition</h2><p>The shell arrives first. Only the article region waits.</p></div>
                <nav aria-label='Delivery condition'>
                    {[['normal', 'Normal'], ['slow', 'Slow source'], ['error', 'Failed source']].map(([value, label]) =>
                        <Link key={value} href={`${path}${value === 'normal' ? '' : `?scenario=${value}`}`} prefetch={false}
                            aria-current={scenario === value ? 'page' : undefined}>{label}</Link>)}
                </nav>
            </section>
            <Suspense key={scenario} fallback={<section className={styles.skeleton} role='status' aria-label='Loading sample articles'>
                <p>Loading sample articles…</p><noscript><a href={path}>Load the complete sample without JavaScript</a></noscript><div aria-hidden='true' className={styles.grid}>{articles.map(item => <div className={styles.placeholder} key={item.category} />)}</div>
            </section>}>{content}</Suspense>
            <DemoInteractions />
            <footer className={styles.footer}><span>Rendered on the server</span><time dateTime={renderedAt} data-testid='rendered-at'>{renderedAt}</time></footer>
        </div>
    </main>;
}
