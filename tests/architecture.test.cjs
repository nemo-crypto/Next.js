const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('./helpers.cjs');
function files(root) {
    return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(root, entry.name)) : [path.join(root, entry.name)]);
}
test('all original route entries are migrated to App Router', () => {
    for (const route of ['', 'price', 'price/[coin]', 'converter', 'converter/[coin]', 'flexible-staking', 'flexible-staking/[coin]', 'flexible-staking/vip', 'flexible-staking/record', 'btr-lockup-staking', 'btr-lockup-staking/[coin]', 'btc-xrp-eth-trading-bot', 'btc-xrp-eth-trading-bot/[coin]', 'land/[activityId]', 'staking/learn-staking']) {
        assert.ok(fs.existsSync(path.join('app/[locale]', route, 'page.tsx')), route);
    }
    for (const file of [...files('app'), ...files('src')].filter(file => /\.(jsx?|tsx?)$/.test(file))) {
        assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /from ['"]next\/(router|head)['"]|getServerSideProps|__NODE_ENV__/, file);
    }
});
test('supported language resource contract is explicit', () => {
    const { locales } = load('src/lib/routing.ts');
    for (const locale of locales) for (const ns of ['common', 'price', 'flexible', 'btrlockup', 'autoinvest', 'learnstaking']) {
        const messages = JSON.parse(fs.readFileSync(`locales/${locale}/${ns}.json`, 'utf8'));
        assert.ok(Object.keys(messages).length, `${locale}/${ns}`);
    }
    assert.ok(fs.existsSync('locales/en/converter.json'));
});
