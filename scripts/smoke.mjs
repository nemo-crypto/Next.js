import assert from 'node:assert/strict';
const origin = process.env.SMOKE_URL || 'http://localhost:5000';
for (const path of ['/', '/ko', '/ar', '/staking/learn-staking', '/ko/staking/learn-staking', '/converter', '/flexible-staking', '/btr-lockup-staking', '/btc-xrp-eth-trading-bot']) {
    const response = await fetch(`${origin}${path}`, { headers: { 'user-agent': 'Googlebot' } });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<title>[^<]+<\/title>/, `${path} title`);
    assert.match(html, /name="description"/, `${path} description`);
    assert.ok(!html.includes('undefined/'), `${path} invalid URL`);
    assert.ok(!html.includes('NextRouter was not mounted'), `${path} Pages Router dependency`);
    console.log(`OK ${path}`);
}
const redirect = await fetch(`${origin}/en/converter?from=home`, { redirect: 'manual' });
assert.equal(redirect.status, 308);
assert.equal(new URL(redirect.headers.get('location'), origin).pathname, '/converter');
assert.equal(new URL(redirect.headers.get('location'), origin).search, '?from=home');
for (const path of ['/robots.txt', '/sitemap.xml']) assert.equal((await fetch(`${origin}${path}`)).status, 200, path);
assert.equal((await fetch(`${origin}/converter/invalid`)).status, 404);
assert.equal((await fetch(`${origin}/not-a-real-page`)).status, 404);
console.log('SEO and routing smoke passed');
