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
