import { ImageResponse } from 'next/og';
import { getMessages, translate } from '@src/lib/i18n/server';

export const alt = 'Digital assets, market information and tools';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
    await params;
    const messages = await getMessages('en', 'common');
    const title = translate(messages, 'seo.title');
    return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#111827', color: '#fff' }}>
        <div style={{ color: '#e6aa1e', fontSize: 30, marginBottom: 36 }}>{process.env.NEXT_PUBLIC_SITE_NAME || 'DemoExchange'}</div>
        <div style={{ fontSize: 58, lineHeight: 1.3 }}>{title}</div>
    </div>, size);
}
