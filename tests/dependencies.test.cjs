const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');

test('updated decimal library preserves amount precision and rounding down', () => {
    const { handelDecimal, decimalValue } = load('src/utils/decimal.ts');
    for (const missing of [undefined, null, '', 'invalid', Infinity]) {
        assert.equal(handelDecimal(1, missing), '--');
    }
    for (const intermediate of ['', '.', 'invalid', undefined]) {
        assert.equal(decimalValue(intermediate).isNaN(), true);
    }
    for (const [type, input, expected] of [
        [1, '1234.567', '1,234.56'], [1, '0.123456', '0.12345'],
        [2, '0.000000019', '0.00000001'], [2, '9007199254740993.123456789', '9,007,199,254,740,993.12345678'],
    ]) assert.equal(handelDecimal(type, input), expected);
});
test('updated request encoder preserves existing form and repeated-array format', async () => {
    const { default: querystring } = await import('query-string');
    assert.equal(querystring.stringify({ amount: '0.00000001', coins: ['BTC', 'ETH'] }, { indices: false }), 'amount=0.00000001&coins=BTC&coins=ETH');
    const { format, addDays } = await import('date-fns');
    assert.equal(format(addDays(new Date(2026, 10, 14, 12), -6), 'y-MM-dd'), '2026-11-08');
});
