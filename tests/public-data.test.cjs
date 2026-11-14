const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function createClient(fetch, env = {}) {
    const sandboxModule = { exports: {} };
    vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/public-data.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
        module: sandboxModule, exports: sandboxModule.exports, URL, AbortSignal, fetch, process: { env },
        require: name => name === 'react' ? { cache: fn => fn } : {},
    });
    return sandboxModule.exports;
}
test('public server requests contain locale but never browser credentials or shared cache', async () => {
    const calls = [];
    const client = createClient(async (url, options) => {
        calls.push({ url, options });
        return { ok: true, json: async () => ({ code: 0, data: { commonCoinInfo: { coinFullName: 'Bitcoin' }, marketInfo: { currentPrice: '100' } } }) };
    }, { API_URL: 'https://api.test/', API_FUTURES: 'https://futures.test/' });
    const result = await client.getPrice('BTC', 'ko');
    assert.equal(result.info.coinFullName, 'Bitcoin');
    assert.equal(calls[0].url.searchParams.get('language'), 'ko');
    assert.equal(calls[0].options.cache, 'no-store');
    assert.equal(calls[0].options.redirect, 'error');
    assert.equal(calls[0].options.headers.cookie, undefined);
    await client.getLanding('abc', 'ko_KR');
    assert.equal(calls[1].options.headers['exchange-token'], '');
    assert.equal(calls[1].options.headers['exchange-language'], 'ko_KR');
});
test('missing backend avoids fabricated requests and unsuccessful responses reject', async () => {
    const offline = createClient(() => { throw new Error('must not fetch'); });
    assert.equal(await offline.getPrice('BTC', 'en'), null);
    const failure = createClient(async () => ({ ok: false, status: 503 }), { API_URL: 'https://api.test' });
    await assert.rejects(failure.getPrice('BTC', 'en'), /503/);
    const badData = createClient(async () => ({ ok: true, json: async () => ({ code: 500 }) }), { API_URL: 'https://api.test' });
    await assert.rejects(badData.getPrice('BTC', 'en'), /unsuccessful/);
});

test('public SSR refuses redirects and credential-bearing or non-HTTP origins', async () => {
    const http = require('node:http');
    let redirectedRequests = 0;
    const server = http.createServer((req, res) => {
        if (req.url === '/target') { redirectedRequests++; res.end('{}'); }
        else { res.writeHead(302, { Location: '/target' }); res.end(); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        const client = createClient(fetch, { API_URL: `http://127.0.0.1:${server.address().port}/` });
        await assert.rejects(client.getPrice('BTC', 'en'));
        assert.equal(redirectedRequests, 0);
    } finally { await new Promise(resolve => server.close(resolve)); }
    for (const base of ['file:///private/', 'https://user:secret@api.test/']) {
        const client = createClient(() => { throw new Error('fetch must not run'); }, { API_URL: base });
        await assert.rejects(client.getPrice('BTC', 'en'), /Invalid public API origin/);
    }
});
