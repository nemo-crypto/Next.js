import 'server-only';
import { cache } from 'react';

// 仅限公开接口；不转发用户 Cookie/token，不缓存账号或参与状态。
async function publicGet(base: string | undefined, path: string, query: Record<string, string>, headers: Record<string, string> = {}) {
    if (!base) return null;
    const url = new URL(path, base.endsWith('/') ? base : `${base}/`);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
    const response = await fetch(url, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Public data request failed (${response.status})`);
    const result = await response.json();
    if (![0, 200, '0', '200'].includes(result.code)) throw new Error('Public data response was unsuccessful');
    return result.data ?? null;
}
export const getPrice = cache(async (coinName: string, locale: string) => {
    const data = await publicGet(process.env.API_URL, 'exchange-web-gateway/tokenInfo/getCoinIntroduction', { coinName, language: locale });
    if (!data) return null;
    return { isEtf: Boolean(data.etf), info: (data.etf ? data.etfCoinInfo : data.commonCoinInfo) || {}, market: data.marketInfo || {}, certikInfoVo: data.certikInfoVo || null };
});
export const getConverter = cache((key: string, locale: string) => publicGet(process.env.API_URL, 'exchange-web-gateway/converter/mainInfo', { key, language: locale }));
export const getLanding = cache((activityId: string, language: string) => publicGet(process.env.API_FUTURES, `fe-co-api/general/activity_land/detail/${encodeURIComponent(activityId)}`, {}, { 'exchange-client': 'pc', 'exchange-language': language, 'exchange-token': '' }));
