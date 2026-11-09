'use client';

import { useState, useRef } from 'react';
import Image from '@components/image';

import Style from './index.module.scss';
import Slider from '@components/slider';
import Modal from '@components/modal';

import BigNumber from 'bignumber.js';
import { formatNumSplit, coinIconPath } from '@utils/common';
import useTranslation from '@src/lib/i18n/client';

import { getCalcInvestAmount, getCalcLockUpBtrAmount, postUnfrozenAmount } from '@service/btr-lockup';

const ProInfo = ({ coinName, tokenStr, coinDetail, lockCoinName })  => {
    const [lockUpAmount, setLockUpAmount] = useState(0);
    const [position, setPosition] = useState(0);
    const [unlockBtrAmount, setUnlockBtrAmount] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const [modalOkText, setModalOkText] = useState('');
    const [modalContent, setModalContent] = useState(null);
    const [modalCancelBtn, setModalCancelBtn] = useState(false);
    const [unfreezeErrorMsg, setUnfreezeErrorMsg] = useState('');

    const refClacInvestAmount = useRef(null);
    const refUnfreezeAmount = useRef(null);
    const calcLockUpTotal = 1000000; // 计算锁仓币种总量
    const { t } = useTranslation('btrlockup');

    // 父组件接收到新的位置值
    function handleSliderChange(newPosition) {
        const singleAmount = new BigNumber(calcLockUpTotal).div(100).toNumber();
        const calcAmount = new BigNumber(newPosition).times(singleAmount).toNumber();

        refClacInvestAmount.current.value = calcAmount;
        debouncedGetLockUpBtr(calcAmount);
    };

    // 监测锁仓币种数量变化
    function handleCalcInvestAmountChange (event) {
        const scale = coinDetail?.inputScale;
        const inputValue = event.target.value;

        // 如果有小数位，限制小数位数
        if (scale > 0 && inputValue.includes('.')) {
            const [integerPart, decimalPart] = inputValue.split('.');
            const truncatedDecimalPart = decimalPart.slice(0, scale);
            event.target.value = `${integerPart}.${truncatedDecimalPart}`;
        };

        const lockUpProgress = new BigNumber(event.target.value).div(calcLockUpTotal).times(100).toNumber();
        setPosition(lockUpProgress);

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
        if (!amount || parseFloat(amount) <= 0) {
            setLockUpAmount(0);
            return;
        };

        const params = {
            coin: coinName,
            progressId: coinDetail?.progressId,
            lockAmount: amount
        };
        getCalcInvestAmount(params).then(res => {
            if (res.code === '200' && JSON.stringify(res.data) !== '{}') {
                setLockUpAmount(res.data.investAmount);
            };
        });
    };
    const debouncedGetLockUpBtr = debounce(getLockUpBtrAmount, 500);

    // 验证赎回数量
    function handleUnfreezeAmountChange (event) {
        const scale = coinDetail?.inputScale;
        const maxAmount = coinDetail?.totalInvestment;
        const inputValue = event.target.value;

        // 检查是否包含特殊字符
        if (scale > 0) {
            if (/[^\d.]/.test(event.target.value)) {
                setUnfreezeErrorMsg(t('detail.plsValidNum'));
                return;
            };
        } else {
            if (!/^\+?[1-9][0-9]*$/.test(event.target.value)) {
                setUnfreezeErrorMsg(t('detail.plsIntegerNum'));
                return;
            };
        };

        // 检查是否超过最大额度
        if (maxAmount !== undefined && parseFloat(inputValue) > maxAmount) {
            refUnfreezeAmount.current.value = maxAmount;
            return;
        };

        // 如果有小数位，限制小数位数
        if (scale > 0 && inputValue.includes('.')) {
            const [integerPart, decimalPart] = inputValue.split('.');
            const truncatedDecimalPart = decimalPart.slice(0, scale);
            event.target.value = `${integerPart}.${truncatedDecimalPart}`;
        };

        setUnfreezeErrorMsg('');
        debouncedGetUnLockUpBtr(event.target.value);
    };

    // 赎回全部参与额
    function handleUnfreezeAllClick () {
        setUnfreezeErrorMsg('');
        refUnfreezeAmount.current.value = coinDetail?.totalInvestment;
        debouncedGetUnLockUpBtr(coinDetail?.totalInvestment);
    };

    // 计算解锁BTR数量
    function getUnLockUpBtrAmount (amount) {
        if (!amount) {
            setUnlockBtrAmount(0);
            return;
        };

        const params = {
            progressId: coinDetail?.progressId,
            redeemAmount: amount || 0
        };
        getCalcLockUpBtrAmount(params).then(res => {
            if (res.code === '200') {
                setUnlockBtrAmount(res.data);
            };
        });
    };
    const debouncedGetUnLockUpBtr = debounce(getUnLockUpBtrAmount, 500);

    // 解锁按钮
    function handleVisibleModalClick () {
        setModalType('unfreeze')
        setModalOkText(t('detail.unfreezeNow'));
        setModalCancelBtn(true);
        setModalVisible(true);
    };

    // 解锁当前质押
    function handleModalOkClick () {
        // 增值成功 || 刷新页面
        if (modalType == 'success' || modalType == 'refresh') {
            window.location.reload()
        };

        // 解锁质押数量
        if (modalType == 'unfreeze') {
            const _amountVal = refUnfreezeAmount.current.value;

            if (!_amountVal) {
                setUnfreezeErrorMsg(t('detail.investInputPla', { coinName }));
                return;
            };

            if (_amountVal > 0 && unfreezeErrorMsg === '') {
                const vParams = {
                    progressId: coinDetail?.progressId,
                    amount: _amountVal,
                    coin: coinName.toLowerCase()
                };
                postUnfrozenAmount(vParams).then(res => {
                    let tipMsg, okText;

                    if(res.code == 200){
                        tipMsg = t('detail.unfreezeSuccess', { vol: `${formatNumSplit(_amountVal)} ${coinName}`});
                        setModalType('success');
                    } else {
                        tipMsg = t('detail.programError');
                        setModalType('refresh');
                    };
                    setModalCancelBtn(false);
                    setModalContent(tipMsg);
                    setModalOkText(okText);
                    setModalVisible(true);
                });
            };
        };
    };

    // 模态框取消按钮
    function handleModalCancleClick () {
        setModalType('');
        setModalContent(null);
        setModalVisible(false);
    };

    return ( 
        <>
            <div className={Style.pro}>
                <div className={Style.pro_info}>
                    <div className={Style.pro_info_top}>
                        <h4>
                            <Image width={26} height={26} src={coinIconPath(coinName)} alt={coinName} /> {coinName}
                        </h4>
                        {
                            (tokenStr && parseFloat(coinDetail?.totalInvestment) > 0)
                            &&
                            <span onClick={handleVisibleModalClick}>
                                {t('detail.unlockBtn')}
                                <i className="iconfont icon-arrows"></i>
                            </span>
                        }
                    </div>
                    <ul>
                        <li>
                            <p className="rose">{coinDetail?.expectRate}%</p>
                            <span>{coinName} {t('detail.interestRate')}</span>
                        </li>
                        <li>
                            <p className="rose">{coinDetail?.lockCoinRate}%</p>
                            <span>{lockCoinName} {t('detail.interestRate')}</span>
                        </li>
                        <li>
                            <p>{coinDetail?.period} {t('detail.days')}</p>
                            <span>{t('list.listPeriod')}</span>
                        </li>
                        <li>
                            <p>{formatNumSplit(coinDetail?.minAmount || 0)} {coinName}</p>
                            <span>{t('detail.minInvestAmount')}</span>
                        </li>
                    </ul>
                </div>
                <div className={Style.pro_clac}>
                    <h4>{t('detail.calculator')}</h4>
                    <div className={Style.pro_clac_input}>
                        <input
                            type="number"
                            min="0"
                            max={calcLockUpTotal}
                            step="1"
                            ref={refClacInvestAmount}
                            placeholder={t('detail.calcInpTips', { lockCoinName })}
                            onChange={handleCalcInvestAmountChange}
                        />
                        <span>{lockCoinName}</span>
                    </div>
                    <div className={Style.pro_clac_invest}>{t('detail.calcInvestAmount', { coinName })} {formatNumSplit(lockUpAmount || 0)} {coinName}</div>
                    <Slider initialPosition={position} onChangePosition={handleSliderChange} />
                    <div className={Style.pro_clac_progress}>
                        <em>0 {lockCoinName}</em>
                        <i>{formatNumSplit(calcLockUpTotal || 0)} {lockCoinName}</i>
                    </div>
                </div>
            </div>
            <Modal
                visible={modalVisible}
                content={modalContent}
                onOk={handleModalOkClick}
                onCancel={modalCancelBtn ? handleModalCancleClick : null}
                okText={modalOkText}
            >
            {
                modalType === 'unfreeze'
                &&
                <div className={Style.unfreeze}>
                    <h3>{t('list.totalAmount')}</h3>
                    <h4>{formatNumSplit(coinDetail?.totalInvestment || 0)} <i>{coinName}</i></h4>
                    <div className={Style.unfreeze_input}>
                        <input
                            type="text"
                            onChange={handleUnfreezeAmountChange}
                            ref={refUnfreezeAmount}
                        />
                        <span>
                            {coinName}
                            <i onClick={handleUnfreezeAllClick}>{t('detail.investInputAll')}</i>
                        </span>
                    </div>
                    <div className={Style.unfreeze_error}>{unfreezeErrorMsg}</div>
                    <div className={Style.unfreeze_unlock}>
                        <i>{t('detail.alsoUnlock')}:</i>
                        <em>{formatNumSplit(unlockBtrAmount)} {lockCoinName}</em>
                    </div>
                </div>
            }
            </Modal>
        </>
    )
};

export default ProInfo;