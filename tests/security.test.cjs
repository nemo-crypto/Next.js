const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const { sanitizeRichHtml } = load('src/lib/safe-content.ts');
const { safeNavigationUrl } = load('src/lib/safe-url.ts');

test('rich content removes executable HTML, attributes, embeds and unsafe styles', () => {
    const html = sanitizeRichHtml(`<script>globalThis.pwned=true</script><img src=x onerror="alert(1)">
        <svg onload="alert(1)"><a href="javascript:alert(1)">svg</a></svg>
        <iframe src="https://evil.test"></iframe><form action="https://evil.test"><input name="cookie"></form>
        <a href="jav&#x61;script:alert(1)" onclick="alert(1)">Unsafe</a>
        <a href="//evil.test" target="_blank">Relative host</a>
        <span style="position:fixed;inset:0;background-image:url(javascript:alert(1));color:#123">Text</span>`);
    assert.doesNotMatch(html, /<script|<svg|<iframe|<form|<input|onerror|onload|onclick|javascript:|href="\/\/|position:|background-image:/i);
    assert.match(html, /color:#123/);
});
test('rich content preserves supported presentation and hardens external tabs', () => {
    const html = sanitizeRichHtml('<h2>Title</h2><p><strong>Bold</strong><br><a href="/trade/btc_usdt?lang=ko" target="_bank">Trade</a></p><table><tr><td colspan="2">Cell</td></tr></table><img src="https://cdn.example.test/a.png" alt="Coin" width="24">');
    assert.match(html, /<h2>Title<\/h2>/);
    assert.match(html, /<strong>Bold<\/strong>/);
    assert.match(html, /href="\/trade\/btc_usdt\?lang=ko"/);
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /colspan="2"/);
    assert.match(html, /loading="lazy"/);
    assert.equal(sanitizeRichHtml(undefined), '');
});
test('navigation accepts website and local destinations without executable URLs or credentials', () => {
    for (const unsafe of ['javascript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,x', '//evil.test', '/\\evil.test', 'https://user:secret@example.test', 'https://exa mple.test', undefined]) {
        assert.equal(safeNavigationUrl(unsafe), undefined, String(unsafe));
    }
    for (const safe of ['https://example.test/path?q=1', 'http://localhost:9000', '/user/login?return=%2Fprice%2FBTC', '#details', '?page=2']) {
        assert.ok(safeNavigationUrl(safe), safe);
    }
});
test('response headers enforce a compatible baseline without disabling SSR scripts', async () => {
    const headers = (await require('../next.config.js').headers())[0].headers;
    const value = name => headers.find(header => header.key === name)?.value;
    assert.equal(value('X-Content-Type-Options'), 'nosniff');
    assert.equal(value('X-Frame-Options'), 'SAMEORIGIN');
    assert.match(value('Content-Security-Policy'), /object-src 'none'/);
    assert.match(value('Content-Security-Policy'), /frame-ancestors 'self'/);
    assert.doesNotMatch(value('Content-Security-Policy'), /unsafe-inline|unsafe-eval/);
});
