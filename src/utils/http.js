import { Config } from '@constants/config';
import axios from 'axios';
import querystring from 'query-string';
import Cookies from 'js-cookie';


import { token,languages } from '@constants/cookies';
import { toast } from '@components/toast';

// 声明一个 Map 用于存储每个请求的标识 和 取消函数
const pending = new Map();

/**
 * 添加请求
 * @param {Object} config
 */
const addPending = (config) => {
    const url = [
        config.method,
        config.url,
        querystring.stringify(config.params),
        querystring.stringify(config.data)
    ].join('&');

    config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
        // 如果 pending 中不存在当前请求，则添加进去
        if (!pending.has(url)) {
            pending.set(url, cancel);
        };
    });
};

/**
 * 移除请求
 * @param {Object} config
 */
const removePending = (config) => {
    const url = [
        config.method,
        config.url,
        querystring.stringify(config.params),
        querystring.stringify(config.data)
    ].join('&');

    // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
    if (pending.has(url)) {
        const cancel = pending.get(url);
        cancel(url);
        pending.delete(url);
    };
};

/**
 * 清空 pending 中的请求（在路由跳转时调用）
 */
export const clearPending = () => {
    for (const [url, cancel] of pending) {
        cancel(url);
    };
    pending.clear();
};

// 配置超时时间
axios.defaults.timeout = typeof window === 'undefined' ? 1000 : 5000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

/**
 * 公共参数
 **/
let publicParams = {};
if (typeof window !== 'undefined') {
    publicParams = {
        appName: navigator.appName, // 浏览器名称
        appCodeName: navigator.appCodeName, // 浏览器代码名称
        appVersion: navigator.appVersion, // 浏览器版本号
        userAgent: navigator.userAgent, // 浏览器版本信息
        cookieEnabled: navigator.cookieEnabled, // 浏览器是否启用cookie
        platform: navigator.platform, // 客户端操作系统
        userLanguage: navigator.language, // 浏览器语言
        vendor: navigator.vendor, // 浏览器厂商
        onLine: navigator.onLine, // 浏览器是否需要连接网络
        product: navigator.product, // 浏览器产品名称
        productSub: navigator.productSub, // 浏览器产品其他信息
        mimeTypesLen: navigator.mimeTypes.length, // 浏览器的MIME类型数量
        pluginsLen: navigator.plugins.length, // 浏览器的插件数量
        javaEnbled: navigator.javaEnabled(), // 浏览器是否启用JAVA
        windowScreenWidth: window.screen.width, // 屏幕分辨率 - 宽
        windowScreenHeight: window.screen.height, // 屏幕分辨率 - 高
        windowColorDepth: window.screen.colorDepth, // 屏幕色彩位数
        [Config.languageParamName || 'language']: Cookies.get(languages)
    };

    // 用户登录校验
    if (!window.currencyexchange) {
        publicParams.token = Cookies.get(token) || '';
    };
};

axios.interceptors.request.use(
    config => {
        removePending(config); // 在请求开始前，对之前的请求做检查取消操作
        addPending(config); // 将当前请求添加到 pending 中

        publicParams = Object.assign({},publicParams,{[Config.languageParamName || 'language']: Cookies.get(languages)});

        // 发送公共参数
        config.params = config.params ? Object.assign({}, config.params, publicParams) : publicParams;

        // config.headers['Exchange-Language'] = Cookies.get(languages);
        // config.headers['Exchange-Token'] = Cookies.get(token) || '';
        // config.headers['Exchange-Client'] = 'pc';

        return config;
    },
    error => {
        // 错误上报 测试环境 控制台打印
        __ENV__ === 'qa' && console.log(error);
    }
);

/**
 * 配置响应拦截器
 **/
axios.interceptors.response.use(
    res => {
        if (!res) return false;

        removePending(res) // 在请求结束后，移除本次请求

        // 请求失败
        if (res.status !== 200) {
            return Promise.reject(res);
        };

        // 请求成功
        if (res.status === 200) {
            const { code, data } = res.data;

            if (__ENV__ === 'qa' && (!code || !data)) {
                console.error(`The interface data format is not standard, Missing data. API URL: ${res?.config?.url}`);
            };

            // if (code === '3') {

            //     Cookies.remove(token, { path: '/' });
            //     // 未登录
            //     debugger
            //     window.location.href = '/en/login?callback=' + encodeURIComponent(window.location.pathname);
            // }

            // switch (code) {
            //     case '304': // 请求重复

            //         break
            //     case '400': // 请求参数校验错误

            //         break
            //     case '403': // token失效

            //         break
            //     case '500': // 程序内部错误

            //         break
            //     case '1709999': // 系统维护中
            //         break
            // };
        };

        return Promise.resolve(res)
    },
    error => {
        // 错误提示 测试环境 控制台打印
        __ENV__ === 'qa' && console.error(error)

        // 判断请求异常信息中是否含有超时timeout字符串
        if (error?.message?.includes('timeout')) {
            toast({ type: 'error', msg: 'Network timeout please refresh and try again!' });
        };
    }
);

/**
 * @method GET 请求方式
 * @param url 接口地址
 * @param params 参数
 * @return Promise
 **/
export const get = function (url, params = {}, headers = {}) {
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                params,
                headers
            })
            .then(res => {
                res && resolve(res.data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/**
 * @method POST 请求方式
 * @param url 接口地址
 * @param params 参数
 * @return Promise
 **/
export const post = function (url, params = {}, headers = {}) {
    return new Promise((resolve, reject) => {
        axios
            .post(url, querystring.stringify(params, { indices: false }), { headers })
            .then(res => {
                res && resolve(res.data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/**
 * @method POST 请求方式
 * @param url 接口地址
 * @param params 参数
 * @return Promise
 **/
export const postArr = function (url, data, headers) {
    return new Promise((resolve, reject) => {
        axios({
            url: url,
            method: 'post',
            headers: headers,
            data: data
        }).then(res => {
            res && resolve(res.data)
        }).catch(err => {
            reject(err)
        });
    });
};

