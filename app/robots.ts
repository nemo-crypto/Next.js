import type { MetadataRoute } from 'next';
import { getSiteUrl, isIndexable } from '../src/lib/seo';
export default function robots(): MetadataRoute.Robots {
    const origin = getSiteUrl();
    return { rules: { userAgent: '*', ...(isIndexable() ? { allow: '/', disallow: ['/api/'] } : { disallow: '/' }) }, sitemap: isIndexable() && origin ? `${origin}/sitemap.xml` : undefined };
}
