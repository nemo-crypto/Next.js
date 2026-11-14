import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

test('demo has complete semantic HTML without JavaScript, real SEO metadata and noindex', async ({ browser, request }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
        const page = await context.newPage();
        await page.goto('/demos/ssr');
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Fast to arrive.');
        await expect(page.getByRole('article')).toHaveCount(3);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ssr.example.test/demos/ssr');
        await page.getByRole('link', { name: 'Failed source' }).click();
        await expect(page.getByRole('alert')).toContainText('simulated error');
        await page.getByRole('link', { name: 'Retry sample' }).click();
        await expect(page.getByRole('article')).toHaveCount(3);
    } finally { await context.close(); }
    const sitemap = await request.get('/sitemap.xml');
    expect(await sitemap.text()).not.toContain('/demos/');
});

test('slow data streams after the shell rather than blocking the whole response', async ({ baseURL }) => {
    const started = performance.now();
    const response = await fetch(`${baseURL}/demos/ssr?scenario=slow`);
    expect(response.status).toBe(200);
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let html = '';
    let shellAt = 0;
    let dataAt = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
        if (!shellAt && html.includes('Fast to arrive.')) shellAt = performance.now() - started;
        if (!dataAt && html.includes('data-testid="server-articles"')) dataAt = performance.now() - started;
    }
    expect(shellAt).toBeGreaterThan(0);
    expect(dataAt - shellAt).toBeGreaterThan(500);
    expect(html).toContain('Loading sample articles');
    await mkdir('.temp', { recursive: true });
    await writeFile('.temp/ssr-stream-metrics.json', JSON.stringify({ shellMs: Math.round(shellAt), articlesMs: Math.round(dataAt), bytes: Buffer.byteLength(html), sourceDelayMs: 1200 }, null, 2));
});

test('hydration and dialog keyboard lifecycle retain focus and nested scroll locks', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/demos/ssr');
    const save = page.getByRole('button', { name: 'Save sample' });
    await save.click();
    await expect(page.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const trigger = page.getByRole('button', { name: 'Open dialog', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Accessible dialog', exact: true });
    await expect(dialog).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/no-scroll/);
    await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Open nested dialog' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
    await dialog.getByRole('button', { name: 'Open nested dialog' }).click();
    await expect(page.getByRole('dialog', { name: 'Nested dialog', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Nested dialog', exact: true })).toHaveCount(0);
    await expect(page.locator('body')).toHaveClass(/no-scroll/);
    await expect(dialog.getByRole('button', { name: 'Open nested dialog' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveClass(/no-scroll/);
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
});

test('mobile and dark experience has no overflow, visible keyboard navigation and accessible content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.context().addCookies([{ name: 'theme', value: 'dark', domain: '127.0.0.1', path: '/' }]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/demos/ssr');
    await expect(page.locator('html')).toHaveAttribute('theme', 'dark');
    await expect(page.getByRole('article')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#page-content')).toBeFocused();
    const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations;
    expect(violations).toEqual([]);
    await page.screenshot({ path: '.temp/ssr-demo-mobile-dark.png', fullPage: true });
});

test('public responses enforce security headers and sanitize upstream HTML on SSR and hydration', async ({ page, request }) => {
    const response = await request.get('/');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers()['content-security-policy']).toContain("object-src 'none'");
    expect(response.headers()['x-powered-by']).toBeUndefined();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/price/BTC');
    await expect(page.getByText('Public market information for testing.')).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__xssExecuted)).toBeUndefined();
    expect(await page.locator('#page-content').evaluate(element => [...element.querySelectorAll('*')].some(node =>
        [...node.attributes].some(attribute => /^on/i.test(attribute.name)) ||
        /^javascript:/i.test(node.getAttribute('href') || '')))).toBe(false);
    expect(errors).toEqual([]);
});

test('desktop demo remains readable in light mode with stable layout and measured paint timing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.addInitScript(() => {
        const metrics = { lcpMs: 0, cls: 0 };
        (window as unknown as { __labMetrics: typeof metrics }).__labMetrics = metrics;
        new PerformanceObserver(list => {
            for (const entry of list.getEntries()) metrics.lcpMs = entry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
                const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
                if (!shift.hadRecentInput) metrics.cls += shift.value;
            }
        }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/demos/ssr');
    await expect(page.getByRole('article')).toHaveCount(3);
    await page.screenshot({ path: '.temp/ssr-demo-desktop-light.png', fullPage: true });
    const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return { ...(window as unknown as { __labMetrics: { lcpMs: number; cls: number } }).__labMetrics,
            ttfbMs: navigation.responseStart - navigation.startTime, domContentLoadedMs: navigation.domContentLoadedEventEnd,
            viewport: `${innerWidth}x${innerHeight}`, note: 'Single local Chromium sample, no network or CPU throttling; not field CWV.' };
    });
    expect(metrics.lcpMs).toBeGreaterThan(0);
    expect(metrics.cls).toBeLessThan(0.1);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    await writeFile('.temp/ssr-paint-metrics.json', JSON.stringify(metrics, null, 2));
});
