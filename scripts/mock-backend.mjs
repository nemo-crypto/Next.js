// 仅用于本地验收；不包含真实账号、凭证或订单操作。
import http from 'node:http';
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let data = {};
    if (url.pathname.endsWith('/getCoinIntroduction')) {
        const coinName = url.searchParams.get('coinName') || 'BTC';
        data = { etf: false, commonCoinInfo: { coinName, coinFullName: coinName === 'BTC' ? 'Bitcoin' : coinName, description: 'Public market information for testing.<img src="/invalid-test-image" onerror="window.__xssExecuted=true"><a href="javascript:window.__xssExecuted=true">Unsafe link</a><script>window.__xssExecuted=true</script>', website: 'https://example.com', tokensIssued: '100' }, marketInfo: { currentPrice: '82000', increase: '0.01' } };
    } else if (url.pathname.endsWith('/coin/list')) data = { baseCoins: [] };
    else if (url.pathname.endsWith('/converter/mainInfo')) data = { baseCoin: { name: 'BTC', fullName: 'Bitcoin', amount: 1 }, quoteCoin: { name: 'USD', fullName: 'US Dollar', sign: '$' }, baseToQuoteRate: 82000, moreCryptocurrency: [], moreCryptocurrencyExchangeRate: [], moreFiat: [], moreAmount: [] };
    else if (url.pathname.includes('/activity_land/detail/')) data = { title: 'Test campaign', depict: 'Public campaign information', seoContent: { seoTitle: 'Test campaign', seoDes: 'Public campaign information' }, content: [], backPic: {} };
    // 仅允许受控的本地浏览器验收来源，不影响真实 API 的 CORS 策略。
    if (req.headers.origin === 'http://127.0.0.1:3100') res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ code: 0, data }));
});
server.listen(Number(process.env.MOCK_PORT || 9099), '127.0.0.1', () => console.log('Mock backend ready'));
