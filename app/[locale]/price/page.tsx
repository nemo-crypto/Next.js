import { permanentRedirect } from 'next/navigation';
import { localizedPath } from '@src/lib/routing';
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    permanentRedirect(localizedPath('/price/XRP', (await params).locale));
}
