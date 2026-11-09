const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const production = { NEXT_PUBLIC_SITE_URL: 'https://demo.test/', NEXT_PUBLIC_INDEXABLE: 'true', APP_ENV: 'prod' };
test('locale paths retain default URLs, prefix other languages and preserve external links', () => {
    const { localizedPath } = load('src/lib/routing.ts');
    assert.equal(localizedPath('/price/BTC', 'en'), '/price/BTC');
    assert.equal(localizedPath('/price/BTC?from=home', 'ko'), '/ko/price/BTC?from=home');
    assert.equal(localizedPath('/ko/price/BTC', 'ko'), '/ko/price/BTC');
    assert.equal(localizedPath('https://external.test/a', 'ko'), 'https://external.test/a');
    assert.equal(localizedPath('/', 'ar'), '/ar');
});
test('canonical, hreflang and social URLs use the verified origin and locale', () => {
    const { pageMetadata } = load('src/lib/seo.ts', production);
    const metadata = pageMetadata({ title: 'BTC', description: 'Price', locale: 'ko', path: '/price/BTC' });
    assert.equal(metadata.alternates.canonical, 'https://demo.test/ko/price/BTC');
    assert.equal(metadata.alternates.languages['x-default'], 'https://demo.test/price/BTC');
    assert.equal(Object.keys(metadata.alternates.languages).length, 17);
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(metadata.robots.index, true);
});
test('preview, unconfigured and private pages cannot be indexed', () => {
    for (const env of [{}, { ...production, APP_ENV: 'qa' }, { ...production, NEXT_PUBLIC_INDEXABLE: 'false' }]) {
        const seo = load('src/lib/seo.ts', env);
        assert.equal(seo.isIndexable(), false);
    }
    const seo = load('src/lib/seo.ts', production);
    assert.equal(seo.pageMetadata({ title: 'Private', description: '', locale: 'en', path: '/flexible-staking/record', noindex: true }).robots.index, false);
    for (const url of ['javascript:alert(1)', 'https://user:secret@example.com', 'not a URL']) assert.equal(seo.getSiteUrl(url), undefined);
    assert.ok(!seo.serializeJsonLd({ name: '</script><script>alert(1)</script>' }).includes('<'));
});
test('sitemap excludes redirects, account pages and unverified dynamic URLs', () => {
    const sitemap = load('app/sitemap.ts', { ...production, SITEMAP_PATHS: '/price/BTC,/flexible-staking/record,https://evil.test,/converter' }).default();
    assert.equal(sitemap.length, 7 * 16);
    assert.ok(sitemap.every(entry => !entry.url.endsWith('/record')));
    assert.ok(sitemap.some(entry => entry.url === 'https://demo.test/ko/price/BTC'));
    assert.equal(load('app/sitemap.ts', {}).default().length, 0);
});
