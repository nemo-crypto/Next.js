import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, isLocale } from './src/lib/routing';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const first = pathname.split('/')[1];
    if (first === defaultLocale) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.slice(defaultLocale.length + 1) || '/';
        return NextResponse.redirect(url, 308);
    }
    if (isLocale(first)) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
}
export const config = {
    matcher: ['/((?!api(?:/|$)|_next(?:/|$)|robots\\.txt$|sitemap\\.xml$|.*\\.[^/]+$).*)'],
};
