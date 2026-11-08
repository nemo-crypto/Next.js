// @ts-nocheck
import { Config } from '@constants/config';
// 币种图标
export function coinIconPath(coinName: string): string {
    if (!coinName) return '';
    const domain = Config.staticDomain?.replace(/\/$/, '');
    return domain ? `${domain}/icon/icon_${coinName.toUpperCase()}.png` : '/images/demo-coin.svg';
};

// 法币图标
export function legalIconPath(coinName: string): string {
    if (!coinName) return '';
    const domain = Config.staticDomain?.replace(/\/$/, '');
    return domain ? `${domain}/m-static/${coinName.toUpperCase()}.png` : '/images/demo-coin.svg';
};

// 描点到指定位置
export function scrollToAnchor(anchorName: string) {
    if (anchorName) {
        let anchorElement = document.getElementById(anchorName);
        if (anchorElement) {
            anchorElement.scrollIntoView({ behavior: 'smooth' });
        };
    };
};

// 千位分隔符
export function formatNumSplit(num: any): string {
    if (!parseFloat(num)) return num;

    return num.toString().replace(/\d+/, function (n: string) {
        return n.replace(/(\d)(?=(\d{3})+$)/g, ($1: string) => $1 + ',');
    });
};

// 获取URL中指定参数的值
export function getParameterByName(name: string, url: string) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');

    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(url || window.location.href);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

// 将原始数组按特定个数，拆分为二维数组
export function splitArrayIntoPages(array: any, pageSize: number) {
    const pages = [];

    for (let i = 0; i < array.length; i += pageSize) {
        const page = array.slice(i, i + pageSize);
        pages.push(page);
    };

    return pages;
};

/**
 * 模板字符串替换
 * @param {String} template 模板字符串
 * @param {Object} context 变量对象
 */
export function parseString(template: string, context: any) {
    return template.toString().replace(/\{\{(.*?)\}\}/g, (match, key) => context[key.trim()]);
}

/**
 * 将时间戳转换为正常日期
 * @param {Date} time 时间戳
 * @param {String} fmt 转换格式
 */
export function formatDate(time: Date, fmt: string): string {
    if (time == null) return '';

    fmt = fmt ? fmt : 'yyyy-MM-dd';
    time = new Date(time);
    const z = {
        M: time.getMonth() + 1,
        d: time.getDate(),
        h: time.getHours(),
        m: time.getMinutes(),
        s: time.getSeconds()
    };

    fmt = fmt.replace(/(M+|d+|h+|m+|s+)/g, (v) => ((v.length > 1 ? '0' : '') + eval('z.' + v.slice(-1))).slice(-2));

    return fmt.replace(/(y+)/g, (v) => time.getFullYear().toString().slice(-v.length));
};

/**
 * 数组按某个属性值排序 - 数字
 * arr 数组
 * property 属性值
 * mode asc：升序  desc：降序  def：默认
 *
*/
export function arrCompareSort(arr: any, property: string, mode: string): any {
    if (!(arr instanceof Array) || arr.length === 0 || !property) return arr;
    if (typeof arr[0][property] === 'number' || !isNaN(parseFloat(arr[0][property]))) {
        // 按数字排序
        arr.sort(function (a: any, b: any): any {
            const v1 = parseFloat(a[property]);
            const v2 = parseFloat(b[property]);
            if (mode === 'asc') {
                return v1 - v2;
            } else if (mode === 'desc') {
                return v2 - v1;
            }
        })
    } else if (typeof arr[0][property] === 'string') {
        // 按字符串排序
        arr.sort(function (a, b) {
            const v1 = a[property];
            const v2 = b[property];
            if (mode === 'asc') {
                return v1.localeCompare(v2);
            } else if (mode === 'desc') {
                return v2.localeCompare(v1);
            }
        })
    }
    // 返回默认排序
    return arr;
};

export function parseAcceptLanguage(acceptLanguageHeader: string): string {
    let matchLanguage = 'en';

    // 拆分 Accept-Language 头部，得到语言标识符列表
    const languages = acceptLanguageHeader
        ?.split(',')
        ?.map((language) => {
            const [languageCode] = language.trim().split(';');
            return languageCode.trim();
        });

    // 提取第一位语言标识符
    if (languages?.length > 0) {
        matchLanguage = languages[0];
    };

    return matchLanguage; // 如果无法解析出语言标识符，返回默认语言
};

export function mapLocalesIdToKoot(lang: string): string {
    const langLists = {
        'en': 'en_US',
        'zh-hant': 'tw_TW',
        'es': 'es_ES',
        'id': 'id_ID',
        'ar': 'ar_AR',
        'pl': 'pl_PL',
        'tr': 'tr_TR',
        'fr': 'fr_FR',
        'de': 'de_DE',
        'th': 'th_TH',
        'nl': 'nl_NL',
        'pt': 'pt_PT',
        'ru': 'ru_RU',
        'vi': 'vi_VN',
        'sv': 'sv_SE',
        'ko': 'ko_KR'
    };

    return langLists[lang] || 'en_US';
};

/**
 * 活动详情接口返回code
 */

export enum ACTIVITY_CODE {
    EVENT_NULL = '12110',  // 活动不存在
    EVENT_OVER = '12111', //活动已结束
    EVENT_UNSTART = '12115', //活动未开始
    EVENT_UNONLINE = '12118', //活动未上线 
    EVENT_SIGN = '12112',  //您已成功报名 只用于报名接口 重复报名
}

/**
 * 响应式临界值
 */
export enum RESPONSIVE {
    MD = 750,
}