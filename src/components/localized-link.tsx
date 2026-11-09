'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import { localizedPath } from '../lib/routing';
export default function LocalizedLink({ href, ...props }: ComponentProps<typeof Link>) {
    const { locale = 'en' } = useParams<{ locale: string }>();
    return <Link {...props} href={typeof href === 'string' ? localizedPath(href, locale) : href} />;
}
