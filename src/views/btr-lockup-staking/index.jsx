import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

import Style from './index.module.scss';
import classNames from 'classnames';
import Loading from '@components/loading';

import { formatNumSplit, coinIconPath } from '@utils/common';
import Cookies from 'js-cookie';
import { token } from '@constants/cookies';
import useTranslation from 'next-translate/useTranslation';

import { getAvailableList } from '@service/btr-lockup';

const FlexibleStaking = ()  => {
    const [loading, setLoading] = useState(true);
    const [tokenStr, setTokenStr] = useState('');
    const [investInfo, setInvestInfo] = useState({});

    const { t } = useTranslation('btrlockup');

    useEffect(() => {
        const _tokenStr = Cookies.get(token) || '';
        setTokenStr(_tokenStr);
    }, []);

    // 获取产品列表
    const fetchInvestList = useCallback(async () => {
        const fetchData = await getAvailableList();

        if (fetchData?.code == 200) {
            const _investInfo = fetchData?.data || {};

            setInvestInfo({..._investInfo});
            setLoading(false);
        };
    }, []);

    // init
    useEffect(() => {
        fetchInvestList();
    }, [fetchInvestList]);

    return (
        <>
            <Head>
                <title>{t('list.title')}</title>
                <meta name="keywords" content={t('list.keywords')} />
                <meta name="description" content={t('list.description')} />
            </Head>
            <div className={Style.component}>
                <div className={Style.banner}>
                    <div className={classNames(['basic', Style.banner_box])}>
                        <div className={Style.banner_slogan}>
                            <h1>{t('list.sloganTitle')}</h1>
                            <h2>{t('list.sloganTitleSub')}</h2>
                        </div>
                    </div>
                </div>
                <div className='basic'>
                    <h2>{t('list.myRewards')}</h2>
                    <div className={Style.rewards}>
                        <ul>
                            <li>
                                <p className="rose">{tokenStr ? formatNumSplit(investInfo?.totalEarning || 0) : '--'} USDT</p>
                                <span>{t('list.totalRewards')}</span>
                            </li>
                            <li>
                                <p>{tokenStr ? formatNumSplit(investInfo?.totalFoundBalance || 0) : '--'} USDT</p>
                                <span>{t('list.totalAmount')}</span>
                            </li>
                        </ul>
                    </div>
                    <h2>{t('list.availableCoins')}</h2>
                    <div className={Style.list}>
                    {
                        loading
                        ?
                        <Loading />
                        :
                        <table>
                            <tbody>
                            {
                                investInfo?.fixRecords?.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <Image width={28} height={28} src={coinIconPath(item.baseCoin)} alt={item.baseCoin.toUpperCase()} /> {item.baseCoin.toUpperCase()}
                                            </td>
                                            <td>
                                                <p className="rose">{item.rate}%</p>
                                                <span>{t('list.listRate')}</span>
                                            </td>
                                            <td>
                                                <p>{item.period} {t('list.listDays')}</p>
                                                <span>{t('list.listPeriod')}</span>
                                            </td>
                                            <td>
                                                <p>{tokenStr ? formatNumSplit(item.investAmount || 0) : '--'} {item.baseCoin.toUpperCase()}</p>
                                                <span>{t('list.listMyInvest')}</span>
                                            </td>
                                            <td>
                                                <p>{tokenStr ? formatNumSplit(item.lockCoinAmount || 0) : '--'} {item.lockCoin.toUpperCase()}</p>
                                                <span>{t('list.listBtrLockUp')}</span>
                                            </td>
                                            <td>
                                                <Link href={`/btr-lockup-staking/${item.baseCoin}`}>{t('list.listDetails')}</Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                    }
                    </div>
                </div>
            </div>
        </>
    )
};

export default FlexibleStaking;
