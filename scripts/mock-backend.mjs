// 仅用于本地验收；不包含真实账号、凭证或订单操作。
import http from 'node:http';
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let data = {};
    if (url.pathname.endsWith('/getCoinIntroduction')) {
        const coinName = url.searchParams.get('coinName') || 'BTC';
        data = { etf: false, commonCoinInfo: { coinName, coinFullName: coinName === 'BTC' ? 'Bitcoin' : coinName, description: 'Public market information for testing.', website: 'https://example.com', tokensIssued: '100' }, marketInfo: { currentPrice: '82000', increase: '0.01' } };
    } else if (url.pathname.endsWith('/coin/list')) data = { baseCoins: [] };
    else if (url.pathname.endsWith('/converter/mainInfo')) data = { baseCoin: { name: 'BTC', fullName: 'Bitcoin', amount: 1 }, quoteCoin: { name: 'USD', fullName: 'US Dollar', sign: '$' }, baseToQuoteRate: 82000, moreCryptocurrency: [], moreCryptocurrencyExchangeRate: [], moreFiat: [], moreAmount: [] };
    else if (url.pathname.includes('/activity_land/detail/')) data = { title: 'Test campaign', depict: 'Public campaign information', seoContent: { seoTitle: 'Test campaign', seoDes: 'Public campaign information' }, content: [], backPic: {} };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ code: 0, data }));
});
server.listen(Number(process.env.MOCK_PORT || 9099), '127.0.0.1', () => console.log('Mock backend ready'));
