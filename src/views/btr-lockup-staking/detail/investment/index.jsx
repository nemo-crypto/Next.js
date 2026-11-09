'use client';
import ExternalLink from '@components/external-link';

import { useState, useRef } from 'react';
import Link from '@src/components/localized-link';

import Style from './index.module.scss';
import Modal from '@components/modal';

import { formatNumSplit } from '@utils/common';
import useTranslation from '@src/lib/i18n/client';

import { getCalcLockUpAmount, postExtraQuotaOrder } from '@service/btr-lockup';

const Investment = ({ coinName, tokenStr, coinDetail })  => {
    const [lockBtrAmt, setLockBtrAmt] = useState(0);
    const [investErrorMsg, setInvestErrorMsg] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [modalType, setModalType] = useState('');
    const [modalOkText, setModalOkText] = useState('');
    const [modalCancelText, setModalCancelText] = useState('');
    const [modalCancelBtn, setModalCancelBtn] = useState(false);
    const lockCoinName = 'BTR';

    const refInvestAmount = useRef(null);
    const { t, lang } = useTranslation('btrlockup');

    // 监测锁仓币种数量变化
    function handleInvestAmountChange (event) {
        const scale = coinDetail?.inputScale;
        const inputValue = event.target.value;

        // 检查是否包含特殊字符
        if (scale > 0) {
            if (/[^\d.]/.test(event.target.value)) {
                setInvestErrorMsg(t('detail.plsValidNum'));
                return;
            };
        } else {
            if (!/^\+?[1-9][0-9]*$/.test(event.target.value)) {
                setInvestErrorMsg(t('detail.plsIntegerNum'));
                return;
            };
        };

        // 如果有小数位，限制小数位数
        if (scale > 0 && inputValue.includes('.')) {
            const [integerPart, decimalPart] = inputValue.split('.');
            const truncatedDecimalPart = decimalPart.slice(0, scale);
            event.target.value = `${integerPart}.${truncatedDecimalPart}`;
        };

        setInvestErrorMsg('');
        debouncedGetLockUpBtr(event.target.value);
    };

    // 使用防抖函数包装搜索函数，延迟 500 毫秒
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };
    function getLockUpBtrAmount (amount) {
        if (!amount) {
            setLockBtrAmt(0);
            return;
        };

        const params = {
            coin: coinName,
            progressId: coinDetail?.progressId,
            investAmount: amount
        };
        getCalcLockUpAmount(params).then(res => {
            const {code, data} = res;
            if (code === '200') {
                setLockBtrAmt(data?.lockBtrAmount);
            };
        });
    };
    const debouncedGetLockUpBtr = debounce(getLockUpBtrAmount, 1000);

    // 锁仓全部币种数量
    function handleInvestAllClick () {
        const scale = coinDetail?.inputScale;
        const maxAmount = coinDetail?.maxExtraQuotaAvaliableAmt;

        if (maxAmount !== undefined && scale !== undefined) {
            let _investAmount = parseFloat(maxAmount.toFixed(scale));
            refInvestAmount.current.value = _investAmount;

            setInvestErrorMsg('');
            getLockUpBtrAmount(_investAmount);
        };
    };

    // 锁仓按钮
    function handleInvestClick () {
        const _amountVal = refInvestAmount.current.value;

        if (!_amountVal) {
            setInvestErrorMsg(t('detail.investInputPla', {coinName}));
            return;
        };

        if (_amountVal > 0 && investErrorMsg === '') {
            const vParams = {
                progressId: coinDetail?.progressId,
                amount: _amountVal,
                coin: coinName?.toLowerCase()
            };
            postExtraQuotaOrder(vParams).then(res => {
                const { code, data } = res;
                switch (code) {
                    case '200': // 参与成功
                        const tipMsg = t('detail.lockUpSuccess', {
                                vol: `${formatNumSplit(data?.amount)} ${coinName}`,
                                day: coinDetail?.period
                            });
                        setModalType('success');
                        setModalContent(tipMsg);
                        setModalCancelBtn(false);
                        setModalOkText(t('detail.investmentKnowBtn'));
                        setModalVisible(true);
                        break;
                    case '4032': // 账户余额不足
                        setInvestErrorMsg(t('detail.investmentErrorBalance'));
                        break;
                    case '4033': // 购买金额小于最小金额
                        setInvestErrorMsg(t('detail.investmentErrorMin', {vol: `${coinDetail?.minAmount} ${coinName}`}));
                        break;
                    case '4039': // 额度已售完
                        setInvestErrorMsg(t('detail.activityAmountOver'));
                        break;
                    case '4042': // 额度不足
                        setInvestErrorMsg(t('detail.amountNotEnough', {coinName}));
                        break;
                    case '4043': // 所持btr不足
                        setInvestErrorMsg(
                            t('detail.btrNotEnough', {
                                amount: data?.remainBtrAmount,
                                coinAmount: data?.expectBuyAmount,
                                coin: coinName
                            })
                        );
                        break;
                    case '100001': // 去KYC
                        setModalType('tokyc');
                        setModalContent(t('detail.investmentNoKYC'));
                        setModalCancelBtn(true);
                        setModalOkText(t('detail.completeNow'));
                        setModalCancelText(t('detail.investmentKnowBtn'));
                        setModalVisible(true);
                        break;
                    case '100002': // 不支持美国用户购买
                        setModalType('close');
                        setModalContent(t('detail.notAvailableUs'));
                        setModalCancelBtn(false);
                        setModalOkText(t('detail.investmentKnowBtn'));
                        setModalVisible(true);
                        break;
                    default:
                        setModalType('close');
                        setModalContent(t('detail.actValid'));
                        setModalCancelBtn(false);
                        setModalOkText(t('detail.investmentKnowBtn'));
                        setModalVisible(true);
                };
            });
        };
    };

    // 模态框确认按钮 - 方法集合
    function handleModalOkClick () {
        // 增值成功 || 刷新页面
        if (modalType == 'success') {
            window.location.reload()
        };

        // 关闭
        if (modalType == 'close') {
            handleModalCancleClick();
        };

        // 去KYC
        if (modalType == 'tokyc') {
            location.href = '/account/information';
        };
    };

    // 模态框取消按钮
    function handleModalCancleClick () {
        setModalType('');
        setModalContent(null);
        setModalVisible(false);
    };

    // 去登录
    function jumpToLogin () {
        const langUrlFix = lang === 'en' ? '' : `/${lang}`;
        location.href = `/user/login?callBackPath=${langUrlFix}/btr-lockup-staking/${coinName}`;
    };

    return (
        <>
            <div className={Style.increase}>
                <div className={Style.increase_notice}>
                    <p>{t('detail.lockUpCaps')}</p>
                </div>
                <div className={Style.increase_invest}>
                    <div className={Style.increase_invest_top}>
                        <div className={Style.increase_invest_input}>
                            <input
                                type="text"
                                ref={refInvestAmount}
                                placeholder={t('detail.investInputPla', { coinName })}
                                onChange={handleInvestAmountChange}
                            />
                            {
                                tokenStr
                                &&
                                <span>
                                    {coinName}
                                    <i onClick={handleInvestAllClick}>{t('detail.investInputAll')}</i>
                                </span>
                            }
                            <div className={Style.increase_invest_error}>{investErrorMsg}</div>
                            <div className={Style.increase_invest_calc}>
                                <em>{t('detail.investInputLockUp')} {formatNumSplit(lockBtrAmt || 0)} {lockCoinName}</em>
                                {tokenStr && <i>{t('detail.investInputMax')}: {formatNumSplit(coinDetail?.maxExtraQuotaAvaliableAmt || 0)} {coinName}</i>}
                            </div>
                        </div>
                        <div className={Style.increase_invest_btn} onClick={tokenStr ? handleInvestClick : jumpToLogin}>{t('detail.investInputBtn')}</div>
                    </div>
                    <div className={Style.increase_invest_bottom}>
                        <ol>
                            <li>{t('detail.investRules1', { lockUpBtrRate: 0.4 })}</li>
                            <li>{t('detail.investRules2', { coins: 'BTC / ETH / XRP / USDT / ADA', lockUpBtrRate: 0.4, lockUpCount: 0.4 * 1000 })}</li>
                            <li>{t('detail.investRules3')}</li>
                            <li>{t('detail.investRules4')}</li>
                        </ol>
                        <ExternalLink href="/trade/btr_usdt">{t('detail.investBuyBtn')} {lockCoinName} <i className="iconfont icon-arrows"></i></ExternalLink>
                    </div>
                </div>
            </div>
            <Modal
                visible={modalVisible}
                content={modalContent}
                onCancel={modalCancelBtn ? handleModalCancleClick : null}
                onOk={handleModalOkClick}
                cancelText={modalCancelText}
                okText={modalOkText}
            />
        </>
    )
};

export default Investment;