'use client';
import { useRouter as useNextRouter, useParams } from 'next/navigation';
import { localizedPath } from './routing';
export function useRouter() {
    const router = useNextRouter();
    const { locale = 'en' } = useParams<{ locale: string }>();
    return {
        ...router,
        push: (href: string) => router.push(localizedPath(href, locale)),
        replace: (href: string) => router.replace(localizedPath(href, locale)),
    };
}
