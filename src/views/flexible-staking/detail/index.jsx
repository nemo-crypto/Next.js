'use client';
import ExternalLink from '@components/external-link';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from '@src/components/localized-link';
import Image from '@components/image';

import Style from './index.module.scss';
import classNames from 'classnames';
import Loading from '@components/loading';
import Modal from '@components/modal';

import { formatNumSplit, coinIconPath } from '@utils/common';
import Cookies from 'js-cookie';
import { token } from '@constants/cookies';
import useTranslation from '@src/lib/i18n/client';
import { getFlexibleDetail, postFlexibleJoin, postFlexibleUnfreeze } from '@service/flexible-staking';

const FlexibleVipView = ({ coinName })  => {
    const [loading, setLoading] = useState(true);
    const [tokenStr, setTokenStr] = useState('');
    const [coinDetail, setCoinDetail] = useState({});
    const [investErrorMsg, setInvestErrorMsg] = useState('');
    const [tabsId, setTabsId] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [modalType, setModalType] = useState('');
    const [modalOkText, setModalOkText] = useState('');
    const [modalCancelText, setModalCancelText] = useState('');
    const [modalCancelBtn, setModalCancelBtn] = useState(false);
    const [unfreezeErrorMsg, setUnfreezeErrorMsg] = useState('');

    const quoteBy = 'USDT'; // 结算币种
    const refInvestAmount = useRef(null);
    const refUnfreezeAmount = useRef(null);
    const { t, lang } = useTranslation('flexible');

    const baseCoin = useMemo(() => {
        return coinName.split('-')[0]?.toUpperCase();
    }, []);

    useEffect(() => {
        const _tokenStr = Cookies.get(token) || '';
        setTokenStr(_tokenStr);
        setLoading(false);
    }, []);

    // 获取币种详情
    const fetchCoinDetail = useCallback(async () => {
        const params = {
            name: coinName
        };
        const fetchData = await getFlexibleDetail(params);
        const _coinDetail = fetchData?.code == 0 ? fetchData?.data : [];

        setCoinDetail(_coinDetail);
    }, []);

    useEffect(() => {
        fetchCoinDetail();
    }, [fetchCoinDetail]);

    // 获取最大利率
    const maximumInterestRates = useMemo(() => {
        const incrRateConfigs = coinDetail?.incr?.incrRateConfigs || [];
        const _max = incrRateConfigs[incrRateConfigs.length -1]?.rate || 0;

        return _max;
    }, [coinDetail]);

    // 获取最大利率等级
    const maximumInterestRatesLevel = useMemo(() => {
        const incrRateConfigs = coinDetail?.incr?.incrRateConfigs || [];
        const _max = incrRateConfigs[incrRateConfigs.length -1]?.level || 0;

        return _max;
    }, [coinDetail]);

    // 可投状态
    const isInvestmentFlag = useMemo(() => {
        const _raf = coinDetail?.campaign?.remainingAmount > 0;
        const _vaf = coinDetail?.vipCap > 0;

        return tokenStr && (_raf || _vaf);
    }, [token, coinDetail]);

    // 投资全部额度
    function handleAmountAllClick () {
        const scale = coinDetail?.campaign?.inputScale;
        const maxAmount = coinDetail?.maxInvestmentAmount;

        if (maxAmount !== undefined && scale !== undefined) {
            let _investAmount = parseFloat(maxAmount.toFixed(scale));
            refInvestAmount.current.value = _investAmount;
        };
    };

    // 验证投资金额
    function handleInvestAmountChange (event) {
        const scale = coinDetail?.campaign?.inputScale;
        const maxAmount = coinDetail?.maxInvestmentAmount;
        const inputValue = event.target.value;

        // 检查是否包含特殊字符
        if (scale > 0) {
            if (/[^\0-9\.]/g.test(event.target.value)) {
                setInvestErrorMsg(t('common.plsValidNum'));
                return;
            };
        } else {
            if (!/^\+?[1-9][0-9]*$/.test(event.target.value)) {
                setInvestErrorMsg(t('common.plsIntegerNum'));
                return;
            };
        };

        // 检查是否超过最大额度
        if (maxAmount !== undefined && parseFloat(inputValue) > maxAmount) {
            setInvestErrorMsg(`${t('detail.maxJoinAmout')} ${formatNumSplit(maxAmount)} ${baseCoin}`);
            return;
        }

        // 如果有小数位，限制小数位数
        if (scale > 0 && inputValue.includes('.')) {
            const [integerPart, decimalPart] = inputValue.split('.');
            const truncatedDecimalPart = decimalPart.slice(0, scale);
            event.target.value = `${integerPart}.${truncatedDecimalPart}`;
        };

        setInvestErrorMsg('');
    };

    // 投资
    function handleJoinBtnClick () {
        const _amountVal = refInvestAmount.current.value;

        if (!_amountVal) {
            setInvestErrorMsg(t('detail.investInputPla'));
            return;
        };

        if (_amountVal > 0 && investErrorMsg === '') {
            const vParams = {
                campaignId: coinDetail?.campaign?.id,
                amount: _amountVal,
                coinName: baseCoin
            };

            postFlexibleJoin(vParams).then(res => {
                const { code, data } = res;
                let tipMsg;
                let okText = t('common.investKnowBtn');
                let cancelText = t('common.investKnowBtn');

                switch (code) {
                    case 0: // 参与成功
                        tipMsg = t('detail.investmentSuccess', { vol: `${formatNumSplit(data.buyedAmount)} ${baseCoin}`});
                        setModalCancelBtn(false);
                        setModalType('success');
                        break;
                    case 302002: // 账户余额不足
                        tipMsg = t('detail.investmentErrorBalance', { coin: baseCoin});
                        okText = t('common.investGoPay');
                        setModalCancelBtn(true);
                        setModalType('pay');
                        break;
                    case 302003: // 投资额度已被抢空
                        tipMsg = t('detail.activityAmountOver');
                        setModalCancelBtn(false);
                        setModalType('refresh');
                        break;
                    case 302005: // 不能低于最小投资额
                        tipMsg = t('detail.investmentErrorMin', { vol: `${formatNumSplit(coinDetail?.campaign?.minAmountPeerOrder)} ${baseCoin}`});
                        setModalCancelBtn(false);
                        setModalType('close');
                        break;
                    case 302008: // 活动已下线
                        tipMsg = t('common.actValid');
                        setModalCancelBtn(false);
                        setModalType('close');
                        break;
                    case 302009: // 不是新用户
                        tipMsg = t('common.notNewUser');
                        setModalCancelBtn(false);
                        setModalType('close');
                        break;
                    case '100001': // 去KYC
                        tipMsg = t('detail.investmentNoKYC');
                        okText = t('common.completeNow');
                        setModalCancelBtn(true);
                        setModalType('tokyc');
                        break;
                    case '100002': // 不支持美国用户购买
                        tipMsg = t('detail.notAvailableUs');
                        setModalCancelBtn(false);
                        setModalType('close');
                        break;
                    default:
                        tipMsg = t('common.actValid');
                        setModalCancelBtn(false);
                        setModalType('close');
                };

                setModalOkText(okText);
                setModalCancelText(cancelText);
                setModalContent(tipMsg);
                setModalVisible(true);
            });
        };
    };

    // 模态框确认按钮 - 方法集合
    function handleModalOkClick () {
        // 增值成功 || 刷新页面
        if (modalType == 'success' || modalType == 'refresh') {
            window.location.reload()
        };

        // 去充值
        if (modalType == 'pay') {
            location.href = '/trade/btr_usdt'
        };

        // 关闭
        if (modalType == 'close') {
            handleModalCancleClick();
        };

        // 去KYC
        if (modalType == 'tokyc') {
            location.href = '/account/information';
        };

        // 解锁质押数量
        if (modalType == 'unfreeze') {
            const _amountVal = refUnfreezeAmount.current.value;

            if (!_amountVal) {
                setUnfreezeErrorMsg(t('detail.investInputPla'));
                return;
            };

            if (_amountVal > 0 && unfreezeErrorMsg === '') {
                const vParams = {
                    campaignId: coinDetail?.campaign?.id,
                    amount: _amountVal,
                    coinName: baseCoin
                };
                postFlexibleUnfreeze(vParams).then(res => {
                    let tipMsg = '';
                    let okText = t('common.investKnowBtn');

                    if(res.code == 0){
                        tipMsg = t('detail.unfreezeSuccess', { vol: `${formatNumSplit(_amountVal)} ${baseCoin}`});
                        setModalCancelBtn(false);
                        setModalType('success');
                    } else {
                        tipMsg = t('common.programError');
                        setModalCancelBtn(false);
                        setModalType('refresh');
                    };

                    setModalOkText(okText);
                    setModalContent(tipMsg);
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

    // 显示解锁模块
    function handleVisibleUnfreezeClick () {
        setModalType('unfreeze');
        setModalCancelText(t('common.unfreezeCancelText'));
        setModalOkText(t('common.unfreezeOkText'))
        setModalCancelBtn(true);
        setModalVisible(true);
    };

    // 验证赎回数量
    function handleUnfreezeAmountChange (event) {
        const scale = coinDetail?.campaign?.inputScale;
        const maxAmount = coinDetail?.myInvestment;
        const inputValue = event.target.value;

        // 检查是否包含特殊字符
        if (scale > 0) {
            if (/[^\0-9\.]/g.test(event.target.value)) {
                setUnfreezeErrorMsg(t('common.plsValidNum'));
                return;
            };
        } else {
            if (!/^\+?[1-9][0-9]*$/.test(event.target.value)) {
                setUnfreezeErrorMsg(t('common.plsIntegerNum'));
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
    };

    // 赎回全部参与额
    function handleUnfreezeAllClick () {
        refUnfreezeAmount.current.value = coinDetail?.myInvestment;
        setUnfreezeErrorMsg('');
    };

    return (
        <>

            <div className={Style.component}>
            {
                loading
                ?
                <Loading />
                :
                <>
                    <div className={Style.banner}>
                        <h1>{baseCoin} {t('detail.staking')}</h1>
                        <h3>{formatNumSplit(coinDetail?.campaign?.remainingAmount || 0)} {baseCoin}</h3>
                        <h2>{t('detail.remainingAmount')}</h2>
                        <div className={Style.banner_vip}>
                            <span>{t('detail.remainingVIPCap')}</span>
                            <em>{tokenStr ? formatNumSplit(coinDetail?.vipCap || 0) : '--'} {baseCoin}</em>
                            <i>({tokenStr ? formatNumSplit(coinDetail?.vipCapUsdt || 0) : '--'} {quoteBy})</i>
                            <Link href="/flexible-staking/vip">{t('detail.increaseVIPCap')}</Link>
                        </div>
                    </div>
                    <div className='basic'>
                        <div className={Style.investment}>
                            <div className={Style.investment_earn}>
                                <div className={Style.investment_earn_coin}>
                                    <Image width={26} height={26} src={coinIconPath(baseCoin)} alt={baseCoin} />
                                    {baseCoin}
                                </div>
                                {
                                    tokenStr
                                    ?
                                    <>
                                        <ul className={Style.investment_earn_rate}>
                                            <li>
                                                <p className="rose">{formatNumSplit(coinDetail?.yesterdayRewards || 0)}</p>
                                                <em>{t('detail.yesterdayRewards')}</em>
                                            </li>
                                            <li>
                                                <p>{formatNumSplit(coinDetail?.totalRewards || 0)}</p>
                                                <em>{t('detail.totalRewards')}</em>
                                            </li>
                                            <li>
                                                <p>{formatNumSplit(coinDetail?.myInvestment || 0)}</p>
                                                <em>{t('detail.totalAmount')}</em>
                                            </li>
                                            <li>
                                                <span
                                                    className={classNames({
                                                        [Style.unlock]: true,
                                                        [Style.disabled]: coinDetail?.myInvestment <= 0
                                                    })}
                                                    onClick={coinDetail?.myInvestment > 0 ? handleVisibleUnfreezeClick : null}
                                                >
                                                    {t('detail.unfreeze')}
                                                    <i className="iconfont icon-arrows"></i>
                                                </span>
                                            </li>
                                        </ul>
                                        <ul className={Style.investment_earn_info}>
                                            <li>
                                                <i className="iconfont icon-calculator"></i>
                                                <em>{t('detail.interestRate')}</em>
                                                {
                                                    coinDetail?.campaign?.rate < coinDetail?.effectRate
                                                    ?
                                                    <span className='rose'><s>{coinDetail?.campaign?.rate}%</s> {coinDetail?.effectRate}%</span>
                                                    :
                                                    <span className='rose'>{coinDetail?.campaign?.rate}%</span>
                                                }
                                            </li>
                                            <li>
                                                <i className="iconfont icon-lock"></i>
                                                <em>{t('detail.noLockUp')}</em>
                                            </li>
                                            <li>
                                                <i className="iconfont icon-coin"></i>
                                                <em>{t('detail.minJoinToAmount')}</em>
                                                <span className='rose'>{formatNumSplit(coinDetail?.campaign?.minAmountPeerOrder || 0)} {baseCoin}</span>
                                            </li>
                                        </ul>
                                    </>
                                    :
                                    <>
                                    <ul className={Style.investment_earn_rate}>
                                        <li>
                                            <p className="rose">{coinDetail?.campaign?.rate || 0}%</p>
                                            <em>{t('detail.expectedRate')}</em>
                                        </li>
                                        <li>
                                            <p>{t('detail.noLockUp')}</p>
                                            <em>{t('detail.timeHorizon')}</em>
                                        </li>
                                        <li>
                                            <p>{formatNumSplit(coinDetail?.campaign?.minAmountPeerOrder || 0)} {baseCoin}</p>
                                            <em>{t('detail.minJoinToAmount')}</em>
                                        </li>
                                    </ul>
                                </>
                                }
                            </div>
                            <div className={Style.investment_add}>
                                <div className={Style.investment_add_input}>
                                    <input
                                        type="text"
                                        placeholder={t('detail.investInputPla')}
                                        disabled={!isInvestmentFlag}
                                        onChange={handleInvestAmountChange}
                                        ref={refInvestAmount}
                                    />
                                    {
                                        isInvestmentFlag
                                        &&
                                        <>
                                            <span>
                                                {baseCoin}
                                                <i onClick={handleAmountAllClick}>{t('common.all')}</i>
                                            </span>
                                            <p>{t('detail.maxJoinAmout')} {formatNumSplit(coinDetail?.maxInvestmentAmount || 0)} {baseCoin}</p>
                                        </>
                                    }
                                    {investErrorMsg && <em>{investErrorMsg}</em>}
                                </div>
                                <div className={Style.investment_add_rate}>
                                    <em>{t('detail.expectedRate')}: </em>
                                    <i>{coinDetail?.campaign?.rate > coinDetail?.effectRate ? coinDetail?.campaign?.rate : coinDetail?.effectRate}%</i>
                                </div>
                                {
                                    tokenStr
                                        ?
                                        <div
                                            className={classNames({
                                                [Style.investment_add_btn]: true,
                                                [Style.disabled]: !isInvestmentFlag
                                            })}
                                            onClick={handleJoinBtnClick}
                                        >
                                            {t('common.join')}
                                        </div>
                                        :
                                        <a className={Style.investment_add_btn} href={`/user/login?callBackPath=${lang === 'en' ? '' : `/${lang}`}/flexible-staking/${coinName}`}>
                                            {t('common.loginNow')}
                                        </a>
                                }
                            </div>
                        </div>
                        {
                            coinDetail?.incr?.incrRateConfigs?.length > 0
                            &&
                            <div className={Style.raise}>
                                <h2>{t('detail.raiseTitle')}</h2>
                                <div className={Style.raise_box}>
                                    <div className={Style.raise_notice}>
                                        <p>
                                            {t('detail.raiseNotice1')}<br />
                                            {t('detail.raiseNotice2', {rate: maximumInterestRates })}
                                        </p>
                                    </div>
                                    <div className={Style.raise_interest}>
                                        <div className={Style.raise_interest_step}>
                                            <ul>
                                                {
                                                    coinDetail?.incr?.incrRateConfigs?.map((item, index) => {
                                                        return (
                                                            <li
                                                                key={index}
                                                                className={classNames({
                                                                    [Style.exceed]: tokenStr && coinDetail?.incr?.currentLevel == item.level
                                                                })}
                                                            >
                                                                <span></span>
                                                                <em>{item.rate}%</em>
                                                                {
                                                                    tokenStr && coinDetail?.incr?.currentLevel == item.level
                                                                    &&
                                                                    <i>{t('detail.raiseCurrent')}</i>
                                                                }
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                            <p>
                                            {
                                                tokenStr
                                                ?
                                                (
                                                    coinDetail?.incr?.currentLevel == maximumInterestRatesLevel
                                                    ?
                                                    <span>{t('detail.raiseTopRate', {rate: maximumInterestRates})}</span>
                                                    :
                                                    <>
                                                        <span>{t('detail.raiseNextRate', {amount: formatNumSplit(coinDetail?.incr?.nextStillNeedBtr || 0), rate: coinDetail?.incr?.nextRate || 0})}</span>
                                                        <ExternalLink href="/trade/btr_usdt">{t('detail.raiseBuyBtr')}</ExternalLink>
                                                    </>
                                                )
                                                :
                                                <>
                                                    <span>{t('detail.raisePlsLogin')}</span>
                                                    <a href={`/user/login?callBackPath=${lang === 'en' ? '' : `/${lang}`}/flexible-staking/${coinName}`}>{t('common.loginNow')}</a>
                                                </>
                                            }
                                            </p>
                                        </div>
                                        <ol>
                                            <li>{t('detail.raiseStep1')}</li>
                                            <li>
                                                {t('detail.raiseStep2')}<br />
                                                {t('detail.raiseStep2_1')}<br />
                                                {t('detail.raiseStep2_2')}<br />
                                                {t('detail.raiseStep2_3')}<br />
                                            </li>
                                            <li>{t('detail.raiseStep3')}</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        }
                        <div className={Style.matter}>
                            <div className={Style.matter_tabs}>
                                <ul>
                                    <li onClick={() => setTabsId(1)} className={tabsId == 1 ? Style.current : ''}>{t('detail.rules')}</li>
                                    <li onClick={() => setTabsId(2)} className={tabsId == 2 ? Style.current : ''}>{t('detail.faq')}</li>
                                </ul>
                                {tokenStr && <Link href="/flexible-staking/record">{t('common.records')} &gt;</Link>}
                            </div>
                            <div className={Style.matter_box}>
                            {
                                tabsId == 1
                                &&
                                <ol>
                                    <li>{t('detail.rules1')} {baseCoin}</li>
                                    <li>{t('detail.rules2')}</li>
                                    <li>{t('detail.rules3')}</li>
                                    <li>{t('detail.rules4')}</li>
                                    <li>{t('detail.rules5')}</li>
                                    <li>{t('detail.rules6')} {coinDetail?.campaign?.minAmountPeerOrder} {baseCoin}</li>
                                    <li>{t('detail.rules7')}</li>
                                    <li>{t('detail.rules8')}</li>
                                </ol>
                            }
                            {
                                tabsId == 2
                                &&
                                <ul>
                                    <li>
                                        <span>{t('detail.faqAsk1')}</span>
                                        <p>{t('detail.faqAnswer1')}</p>
                                    </li>
                                    <li>
                                        <span>{t('detail.faqAsk2', {coin: baseCoin})}</span>
                                        <p>{t('detail.faqAnswer2')}</p>
                                    </li>
                                    <li>
                                        <span>{t('detail.faqAsk3')}</span>
                                        <p>{t('detail.faqAnswer3', {coin: baseCoin})}</p>
                                    </li>
                                    <li>
                                        <span>{t('detail.faqAsk4', {coin: baseCoin})}</span>
                                        <p>{t('detail.faqAnswer4', {coin: baseCoin})}</p>
                                    </li>
                                    <li>
                                        <span>{t('detail.faqAsk5', {coin: baseCoin})}</span>
                                        <p>{t('detail.faqAnswer5')}</p>
                                    </li>
                                </ul>
                            }
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
                    >
                    {
                        modalType === 'unfreeze'
                        &&
                        <div className={Style.unfreeze}>
                            <h3>{t('detail.totalAmount')}</h3>
                            <h4>{formatNumSplit(coinDetail?.myInvestment || 0)} <i>{baseCoin}</i></h4>
                            <div className={Style.unfreeze_input}>
                                <input
                                    type="text"
                                    onChange={handleUnfreezeAmountChange}
                                    ref={refUnfreezeAmount}
                                />
                                <span>
                                    {baseCoin}
                                    <i onClick={handleUnfreezeAllClick}>{t('common.all')}</i>
                                </span>
                            </div>
                            <div className={Style.unfreeze_error}>{unfreezeErrorMsg}</div>
                        </div>
                    }
                    </Modal>
                </>
            }
            </div>
        </>
    )
};

export default FlexibleVipView;