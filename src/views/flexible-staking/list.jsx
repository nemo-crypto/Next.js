'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from '@src/components/localized-link';
import Image from '@components/image';

import Style from './list.module.scss';
import classNames from 'classnames';
import Loading from '@components/loading';
import { toast } from '@components/toast';

import { formatNumSplit, coinIconPath } from '@utils/common';
import Cookies from 'js-cookie';
import { token } from '@constants/cookies';
import useTranslation from 'next-translate/useTranslation';

import { getInvestOverview, getFlexibleCoinList, getFlexibleList } from '@service/flexible-staking';

const FlexibleStaking = ()  => {
    const [loading, setLoading] = useState(true);
    const [tokenStr, setTokenStr] = useState('');
    const [investInfo, setInvestInfo] = useState({});
    const [investVisible, setInvestVisible] = useState(false);
    const [coin, setCoin] = useState('');
    const [coinVal, setCoinVal] = useState('');
    const [coinList, setCoinList] = useState([]);
    const [coinListVisible, setCoinListVisible] = useState(false);
    const [matchMyAssets, setMmatchMyAssets] = useState(false);
    const [pageSize, setPageSize] = useState(50);
    const [totalPage, setTotalPage] = useState(50);
    const [flexibleData, setFlexibleData] = useState([]);
    const quoteBy = 'USDT'; // 结算币种
    const pageNo = 1; // 当前页面

    const { t, lang } = useTranslation('flexible');

    useEffect(() => {
        const _tokenStr = Cookies.get(token) || '';
        setTokenStr(_tokenStr);
    }, []);

    // 获取用户收益
    const fetchInvestInfo = useCallback(async () => {
        const fetchData = await getInvestOverview();
        const _investInfo = fetchData?.code == 0 ? fetchData?.data : [];

        setInvestInfo({..._investInfo});
    }, []);

    useEffect(() => {
        token && fetchInvestInfo();
    }, [fetchInvestInfo, token]);

    // 获取币种列表
    const fetchCoinList = useCallback(async () => {
        const fetchData = await getFlexibleCoinList();
        const _coinList = fetchData?.code == 0 ? fetchData?.data : [];

        setCoinList(_coinList);
    }, []);

    useEffect(() => {
        fetchCoinList();
    }, [fetchCoinList]);

    // 获取币对列表
    function fetchFlexibleList () {
        const params = { pageNo, pageSize, coin, matchMyAssets };

        getFlexibleList(params).then(res => {
            if (res.code == 0) {
                setFlexibleData(res?.data?.data || []);
                setTotalPage(res?.data?.totalCount);
                setLoading(false);
            };
        });
    };

    useEffect(() => {
        fetchFlexibleList();
    }, [pageSize, coin, matchMyAssets]);

    useEffect(() => {
        function handleCoinListVisible () {
            setCoinListVisible(false);
        };

        window.addEventListener('click', handleCoinListVisible);

        return () => {
            window.removeEventListener('click', handleCoinListVisible);
        };
    }, []);

    return (
        <>

            <div className={Style.component}>
                <div className={Style.banner}>
                    <div className={classNames(['basic', Style.banner_box])}>
                        <div className={Style.banner_slogan}>
                            <h1>{t('list.sloganTitle')}</h1>
                            <h2>{t('list.sloganTitleSub')}</h2>
                        </div>
                        <div className={Style.banner_balance}>
                            <ul>
                                <li>
                                    <p>{t('list.btrBalance')}</p>
                                    <span>{tokenStr ? formatNumSplit(investInfo?.btrBalance || 0) : '--'}</span>
                                </li>
                                <li>
                                    <p>{t('list.remainingVIPCap')} ({quoteBy})</p>
                                    <span>{tokenStr ? formatNumSplit(investInfo?.remainingVipCap || 0) : '--'}</span>
                                </li>
                            </ul>
                            <Link href="/flexible-staking/vip">{t('common.details')} <i className="iconfont icon-arrows"></i></Link>
                        </div>
                    </div>
                </div>
                <div className='basic'>
                    <div className={Style.invest}>
                        <h2>{t('list.myInvest')}</h2>
                        <ul className={Style.invest_total}>
                            <li>
                                <span>{tokenStr ? formatNumSplit(investInfo?.totalRewards || 0) : '--'} {quoteBy}</span>
                                <em>{t('list.totalRewards')}</em>
                            </li>
                            <li>
                                <span>{tokenStr ? formatNumSplit(investInfo?.totalInvestment || 0) : '--'} {quoteBy}</span>
                                <em>{t('list.totalInvest')}</em>
                            </li>
                            <li>
                                {!tokenStr && <a href={`/user/login?callBackPath=${lang === 'en' ? '' : `/${lang}`}/flexible-staking`}>{t('common.loginNow')}</a>}
                            </li>
                            <li>
                                {
                                    tokenStr
                                    &&
                                    <div className={Style.invest_visible} onClick={() => setInvestVisible(!investVisible)}>
                                        {t('common.details')} <i className={investVisible ? 'iconfont icon-arrow-up' : 'iconfont icon-arrow-down'}></i>
                                    </div>
                                }
                            </li>
                        </ul>
                        {
                            investVisible
                            &&
                            <ul className={Style.invest_info}>
                                <li>
                                    <span>{formatNumSplit(investInfo?.lockUpRewards || 0)} {quoteBy}</span>
                                    <em>{t('list.lockUpRewards')}</em>
                                </li>
                                <li>
                                    <span>{formatNumSplit(investInfo?.flexibleRewards || 0)} {quoteBy}</span>
                                    <em>{t('list.flexibleRewards')}</em>
                                </li>
                                <li>
                                    <span>{formatNumSplit(investInfo?.lockUpInvestment || 0)} {quoteBy}</span>
                                    <em>{t('list.lockUpInvest')}</em>
                                </li>
                                <li>
                                    <span>{formatNumSplit(investInfo?.flexibleInvestment || 0)} {quoteBy}</span>
                                    <em>{t('list.flexibleInvest')}</em>
                                </li>
                            </ul>
                        }
                    </div>
                    <div className={Style.list}>
                        <div className={Style.list_title}>
                            <h2>{t('list.flexible')}</h2>
                            <div className={Style.list_search}>
                                {
                                    tokenStr
                                    &&
                                    <div
                                        className={Style.list_search_assets}
                                        onClick={() => {
                                            setLoading(true);
                                            setMmatchMyAssets(!matchMyAssets);
                                        }}
                                    >
                                        <i className={classNames({
                                            'iconfont': true,
                                            'icon-select': matchMyAssets,
                                            'icon-unchecked': !matchMyAssets,
                                            [Style.checked]: matchMyAssets
                                        })} />
                                        <span>{t('list.searchAssets')}</span>
                                    </div>
                                }
                                <div
                                    className={classNames({
                                        [Style.list_search_coin]: true,
                                        [Style.list_search_coin_focus]: coinListVisible
                                    })}
                                    onClick={event => event.nativeEvent.stopImmediatePropagation()}
                                >
                                    <i className="iconfont icon-search"></i>
                                    <input
                                        maxLength={30}
                                        placeholder={t('list.searchCoinPla')}
                                        value={coinVal}
                                        onChange={event => setCoinVal(event.target.value)}
                                        onFocus={() => setCoinListVisible(true)}
                                    />
                                    {
                                        coinVal?.length > 0
                                        &&
                                        <i
                                            className={classNames(['iconfont', 'icon-guanbi', Style.clear])}
                                            onClick={() => {
                                                setCoin('');
                                                setCoinVal('');
                                            }}
                                        />
                                    }
                                    {
                                        coinListVisible
                                        &&
                                        <div className={Style.list_search_coin_list}>
                                            <ul>
                                            {
                                                coinList
                                                .filter(item => item.indexOf(coinVal?.toLowerCase()) > -1)
                                                .map((item, index) => {
                                                    return (
                                                        <li key={index} onClick={() => {
                                                            setCoin(item);
                                                            setCoinVal(item?.toUpperCase());
                                                            setCoinListVisible(false);
                                                        }}>
                                                            <Image width={21} height={21} src={coinIconPath(item)} alt={item?.toUpperCase()} />
                                                            <em>{item?.toUpperCase()}</em>
                                                        </li>
                                                    )
                                                })
                                            }
                                            </ul>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className={Style.list_body}>
                            <div className={Style.list_body_theader}>
                                <div className={Style.coins}>{t('list.listCoin')}</div>
                                <div className={Style.rate}>{t('list.listInterestRate')}</div>
                                <div className={Style.locktime}>{t('list.listLimit')}</div>
                                <div className={Style.amount}>{t('list.listTotalCap')}</div>
                                <div className={Style.myInvest}>{t('list.listInvestment')}</div>
                                <div className={Style.opt}>{t('list.listOperation')}</div>
                            </div>
                            {
                                loading
                                ?
                                <Loading />
                                :
                                (
                                    flexibleData.length > 0
                                    ?
                                    flexibleData.map((item, index) => {
                                        return (
                                            <div key={index} className={Style.list_body_tbody}>
                                                <div className={Style.coins}>
                                                    <Image width={28} height={28} src={coinIconPath(item.coin)} alt={item.coin} />
                                                    <span className={Style.coinp}>{item.coin.toUpperCase()}</span>
                                                    {item.exclusiveForNewcomers && <span className={Style.fornew}>{t('list.listNewUser')}</span>}
                                                </div>
                                                <div className={Style.rate}>
                                                    <span className='rose'>{item.rate}%</span>
                                                </div>
                                                <div className={Style.locktime}>
                                                    {item.campaignType == 0 && <span className="fall">{t('list.listNoLockUp')}</span>}
                                                    {item.campaignType == 1 && <span className={Style.timeRange}>{item.days} {t('list.listDays')}</span>}
                                                </div>
                                                <div className={Style.amount}>{formatNumSplit(item.totalCap)} {item.coin.toUpperCase()}</div>
                                                <div className={Style.myInvest}>
                                                    <span>{tokenStr ? formatNumSplit(item.myInvestment): '--'} {item.coin.toUpperCase()}</span>
                                                    <p>≈{formatNumSplit(item.myInvestmentUsdt)} {quoteBy}</p>
                                                </div>
                                                <div className={Style.opt}>
                                                {
                                                    item.noDetailCode === 302009
                                                    ?
                                                    <span onClick={() => toast({type: 'warn', msg: t('common.notNewUser')})}>{t('common.details')}</span>
                                                    :
                                                    <Link href={`/flexible-staking/${item.coin}${item.campaignType == 1 ? '-new-user' : ''}`}>{t('common.details')}</Link>
                                                }
                                                </div>
                                            </div>
                                        )
                                    })
                                    :
                                    <div className={Style.empty}>
                                        <i class="iconfont icon-empty"></i>
                                        <p>{t('common.noResults')}</p>
                                    </div>
                                )
                            }
                        </div>
                        {
                            totalPage > 50 && pageSize <= 50
                            &&
                            <div className={Style.more} onClick={() => setPageSize(totalPage)}>
                                More <i className='iconfont icon-arrow-down'></i>
                            </div>
                        }
                    </div>
                    <div style={{marginBottom: '80px'}}></div>
                </div>
            </div>
        </>
    )
};

export default FlexibleStaking;