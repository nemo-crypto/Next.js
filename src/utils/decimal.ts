import BigNumber from 'bignumber.js';

// BigNumber 11 对空值/非数字字符串抛错；保持原输入过程中返回 NaN 的语义。
export function decimalValue(value: unknown): BigNumber {
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'bigint' && !BigNumber.isBigNumber(value)) {
        return new BigNumber(NaN);
    }
    try { return new BigNumber(value); }
    catch { return new BigNumber(NaN); }
}

/** 法币：>=1 保留2位，否则5位；数字货币8位。只用于展示，不作为下单金额。 */
export function handelDecimal(type: number, num: unknown) {
    const value = decimalValue(num);
    if (!value.isFinite()) return '--';
    const decimals = type === 1 ? (value.gte(1) ? 2 : 5) : 8;
    return value.toFormat(decimals, BigNumber.ROUND_DOWN);
}
