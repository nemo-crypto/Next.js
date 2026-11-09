import axios from 'axios';
import querystring from 'query-string';
import Cookies from 'js-cookie';
import { Config } from '@constants/config';
import { token, languages } from '@constants/cookies';
import { toast } from '@components/toast';

// 独立实例不修改第三方 axios 的默认配置。公开 SSR 使用 server-only 请求层。
const request = axios.create({
    timeout: 8000,
    headers: { post: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' } },
});
const pending = new Map();
function clearRequest(config) {
    if (config?.pendingKey && pending.get(config.pendingKey)?.token === config.cancelToken) {
        pending.delete(config.pendingKey);
    }
}
export function clearPending() {
    for (const source of pending.values()) source.cancel('Route changed');
    pending.clear();
}
request.interceptors.request.use(config => {
    if (typeof window === 'undefined') return config;
    const params = {
        appName: navigator.appName, appCodeName: navigator.appCodeName,
        appVersion: navigator.appVersion, userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled, platform: navigator.platform,
        userLanguage: navigator.language, vendor: navigator.vendor,
        onLine: navigator.onLine, product: navigator.product, productSub: navigator.productSub,
        mimeTypesLen: navigator.mimeTypes.length, pluginsLen: navigator.plugins.length,
        javaEnbled: navigator.javaEnabled(), windowScreenWidth: window.screen.width,
        windowScreenHeight: window.screen.height, windowColorDepth: window.screen.colorDepth,
        [Config.languageParamName || 'language']: Cookies.get(languages),
        ...(!window.currencyexchange ? { token: Cookies.get(token) || '' } : {}),
    };
    config.params = { ...params, ...config.params };
    const key = [config.method, config.url, querystring.stringify(config.params), typeof config.data === 'string' ? config.data : JSON.stringify(config.data)].join('&');
    if (!config.cancelToken) {
        pending.get(key)?.cancel('Duplicate request');
        const source = axios.CancelToken.source();
        config.cancelToken = source.token;
        config.pendingKey = key;
        pending.set(key, source);
    }
    return config;
});
request.interceptors.response.use(response => {
    clearRequest(response.config);
    return response;
}, error => {
    clearRequest(error.config);
    if (typeof window !== 'undefined' && error.code === 'ECONNABORTED') {
        toast({ type: 'error', msg: 'Network timeout please refresh and try again!' });
    }
    // 不吞错，不让调用方 Promise 永远处于 pending；由业务决定重试或提示。
    return Promise.reject(error);
});
export async function get(url, params = {}, headers = {}) {
    return (await request.get(url, { params, headers })).data;
}
export async function post(url, params = {}, headers = {}) {
    return (await request.post(url, querystring.stringify(params, { indices: false }), { headers })).data;
}
export async function postArr(url, data, headers = {}) {
    return (await request.post(url, data, { headers })).data;
}
