import { test, expect } from '@playwright/test';

for (const [path, language] of [['/', 'en'], ['/ko', 'ko'], ['/ar', 'ar']] as const) {
    test(`SSR metadata, navigation and hydration ${language}`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('lang', language);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/);
        const target = language === 'en' ? '/staking/learn-staking' : `/${language}/staking/learn-staking`;
        await page.locator(`a[href="${target}"]`).click();
        await expect(page).toHaveURL(new RegExp(`${target}$`));
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', language);
        expect(errors).toEqual([]);
    });
}
test('nonexistent routes return actual 404', async ({ request }) => {
    expect((await request.get('/not-a-real-route')).status()).toBe(404);
    expect((await request.get('/converter/invalid')).status()).toBe(404);
});
test('mobile homepage supports layout and navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    await page.screenshot({ path: '.temp/home-mobile.png', fullPage: true });
});

test('server-rendered price detail has semantic title and no hydration errors', async ({ page }) => {
    // SSR 由 scripts/mock-backend.mjs 提供公开数据，浏览器列表请求也使用受控数据。
    await page.route('**/coin/list**', route => route.fulfill({ json: { code: 0, data: { baseCoins: [] } } }));
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/price/BTC');
    await expect(page.locator('h1')).toContainText('Bitcoin');
    await expect(page).toHaveTitle(/Bitcoin/);
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Bitcoin');
    await page.screenshot({ path: '.temp/price-desktop.png', fullPage: true });
    expect(errors).toEqual([]);
});

for (const path of ['/converter', '/flexible-staking', '/btr-lockup-staking', '/btc-xrp-eth-trading-bot', '/ko/converter']) {
    test(`public HTML exposes metadata ${path}`, async ({ request }) => {
        const response = await request.get(path, { headers: { 'user-agent': 'Googlebot' } });
        expect(response.status()).toBe(200);
        const html = await response.text();
        expect(html).toMatch(/<title>[^<]+<\/title>/);
        expect(html).toContain('name="description"');
        expect(html).not.toContain('undefined/');
    });
}

test('English redirects preserve queries and crawler routes are available', async ({ request }) => {
    const redirect = await request.get('/en/converter?from=home', { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    const location = new URL(redirect.headers().location, 'http://localhost');
    expect(location.pathname).toBe('/converter');
    expect(location.search).toBe('?from=home');
    expect((await request.get('/robots.txt')).status()).toBe(200);
    expect((await request.get('/sitemap.xml')).status()).toBe(200);
});

test('social image metadata points to a generated PNG', async ({ request }) => {
    const response = await request.get('/');
    const html = await response.text();
    const image = html.match(/<meta property="og:image" content="([^"]+)"/);
    expect(image).not.toBeNull();
    const url = new URL(image![1].replaceAll('&amp;', '&'));
    const picture = await request.get(`${url.pathname}${url.search}`);
    expect(picture.status()).toBe(200);
    expect(picture.headers()['content-type']).toContain('image/png');
    expect((await picture.body()).subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
});
