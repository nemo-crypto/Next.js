'use client';
import ExternalLink from '@components/external-link';

import { useState, useEffect, useCallback } from 'react';
import Link from '@src/components/localized-link';

import Style from './index.module.scss';
import Loading from '@components/loading';

import { formatNumSplit } from '@utils/common';
import Cookies from 'js-cookie';
import { token } from '@constants/cookies';
import useTranslation from '@src/lib/i18n/client';

import { getFlexibleVipInvest, getFlexibleVipCoinList } from '@service/flexible-staking';

const FlexibleVipView = ()  => {
    const [loading, setLoading] = useState(true);
    const [tokenStr, setTokenStr] = useState('');
    const [investInfo, setInvestInfo] = useState({});
    const [investCoinList, setInvestCoinList] = useState([]);
    const [seeRecordMore, setSeeRecordMore] = useState(false);
    const quoteBy = 'USDT'; // 结算币种

    const { t, lang } = useTranslation('flexible');

    useEffect(() => {
        const _tokenStr = Cookies.get(token) || '';
        setTokenStr(_tokenStr);
        setLoading(false);
    }, []);

    // 获取VIP投资详情
    const fetchVipInvest = useCallback(async () => {
        const fetchData = await getFlexibleVipInvest();
        const _vipInvest = fetchData?.code == 0 ? fetchData?.data : [];

        setInvestInfo(_vipInvest);
    }, []);

    useEffect(() => {
        tokenStr && fetchVipInvest();
    }, [fetchVipInvest, tokenStr]);

    // 获取VIP 投资币种列表
    const fetchVipCoinList = useCallback(async () => {
        const params = { pageNo: 1, pageSize: 1000 };
        const fetchData = await getFlexibleVipCoinList(params);
        const _investCoinList = fetchData?.code == 0 ? fetchData?.data?.data : [];

        setInvestCoinList(_investCoinList);
    }, []);

    useEffect(() => {
        tokenStr && fetchVipCoinList();
    }, [fetchVipCoinList, tokenStr]);

    return (
        <>

            {
                loading
                ?
                <Loading />
                :
                <div className={Style.component}>
                    <div className={Style.banner}>
                        <div className={Style.banner_box}>
                            <div className={Style.banner_box_slogan}>
                                <h1>{t('vip.sloganTitle')}</h1>
                                <h2>{t('vip.sloganTitleSub')}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="basic">
                        <div className={Style.account}>
                            <div className={Style.account_box}>
                                <h2>{t('vip.accountBtr')}</h2>
                                <div className={Style.account_balance}>
                                    <span>{tokenStr ? formatNumSplit(investInfo?.btrBalance || 0) : '--'}</span>
                                    {
                                        tokenStr
                                        ?
                                        <ExternalLink href="/trade/btr_usdt">{t('vip.accountBtrBuy')} <i className="iconfont icon-arrows"></i></ExternalLink>
                                        :
                                        <a href={`/user/login?callBackPath=${lang === 'en' ? '' : `/${lang}`}/powerpiggy/vipcap`}>{t('common.loginNow')}</a>
                                    }
                                </div>
                            </div>
                            <div className={Style.account_box}>
                                <h2>{t('vip.accountCap')}</h2>
                                <div className={Style.account_amount}>
                                    <ul>
                                        <li>
                                            <em>{tokenStr ? formatNumSplit(investInfo?.remainingVipCap || 0) : '--'}</em>
                                            <span>{t('vip.accountCapVip')} ({quoteBy})</span>
                                        </li>
                                        <li>
                                            <em>{tokenStr ? formatNumSplit(investInfo?.currentVipInvestmentTotal || 0) : '--'}</em>
                                            <span>{t('vip.accountCapToatal')} ({quoteBy})</span>
                                        </li>
                                        <li>
                                            <em>{tokenStr ? formatNumSplit(investInfo?.totalVipEarnings || 0) : '--'}</em>
                                            <span>{t('vip.accountCapEarn')} ({quoteBy})</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={Style.notice}>{t('vip.vipCapTips')}</div>
                        <div className={Style.invest}>
                            <div className={Style.invest_title}>
                                <h2>{t('vip.inviestTitle')}</h2>
                                {
                                    tokenStr
                                    &&
                                    <Link href="/flexible-staking/record">
                                        <i className="iconfont icon-record"></i>
                                        {t('common.records')}
                                    </Link>
                                }
                            </div>
                            <div className={Style.invest_list}>
                                <ul>
                                    <li>
                                        <span>{t('vip.inviestListCoin')}</span>
                                        <span>{t('vip.inviestListAmount')}</span>
                                        <span>{t('vip.inviestListInterest')}</span>
                                    </li>
                                </ul>
                                <ul className={`${Style.invest_list_hidden} ${seeRecordMore ? Style.invest_list_auto : '' }`}>

                                    {
                                        investCoinList.length > 0
                                        ?
                                        investCoinList.map((item, index) => {
                                            return (
                                                <li key={index}>
                                                    <span>{item?.coin?.toUpperCase() || ''}</span>
                                                    <span>{item.investmentAmount || 0}</span>
                                                    <span>{item.interest || 0}</span>
                                                </li>
                                            )
                                        })
                                        :
                                        <li className={Style.invest_list_empty}>
                                            <p>
                                                <i className="iconfont icon-empty"></i>
                                                <em>{t('common.noRecords')}</em>
                                            </p>
                                        </li>
                                    }
                                </ul>
                                {
                                    investCoinList.length > 5
                                    &&
                                    <div className={Style.invest_list_more} onClick={() => setSeeRecordMore(!seeRecordMore)}>
                                        {t('common.details')} <i className={seeRecordMore ? "iconfont icon-arrow-up" : "iconfont icon-arrow-down"}></i>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className={Style.rules}>
                            <h2>{t('vip.rulesTitle')}</h2>
                            <ol>
                                <li>{t('vip.rules_1')}</li>
                                <li>{t('vip.rules_2')}</li>
                                <li>{t('vip.rules_3')}</li>
                                <li>{t('vip.rules_4')}</li>
                                <li>{t('vip.rules_5')}</li>
                                <li>{t('vip.rules_6')}</li>
                                <li>{t('vip.rules_7')}</li>
                            </ol>
                        </div>
                    </div>
                </div>
            }
        </>
    )
};

export default FlexibleVipView;