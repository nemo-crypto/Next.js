'use client';

import { useState, useEffect, useCallback } from 'react';

import Style from './index.module.scss';
import classNames from 'classnames';

import Loading from '@components/loading';
import Rewards from './rewards';
import Proinfo from './proinfo'
import InvestMent from './investment'
import RulesRecord from './rules_records';

import Cookies from 'js-cookie';
import { token } from '@constants/cookies';
import useTranslation from 'next-translate/useTranslation';

import { getProductDetail } from '@service/btr-lockup';

const FlexibleStaking = ({ coinName })  => {
    const [loading, setLoading] = useState(true);
    const [tokenStr, setTokenStr] = useState('');
    const [coinDetail, setCoinDetail] = useState({});
    const lockCoinName = 'BTR';

    const { t } = useTranslation('btrlockup');

    useEffect(() => {
        const _tokenStr = Cookies.get(token) || '';
        setTokenStr(_tokenStr);
        setLoading(false);
    }, []);

    // 获取币种详情
    const fetchCoinDetail = useCallback(async () => {
        const params = {
            coin: coinName
        };
        const fetchData = await getProductDetail(params);
        const _coinDetail = fetchData?.code == 200 ? fetchData?.data : [];

        setCoinDetail({..._coinDetail});
    }, []);

    useEffect(() => {
        fetchCoinDetail();
    }, [fetchCoinDetail]);

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
                        <div className={classNames(['basic', Style.banner_box])}>
                            <div className={Style.banner_slogan}>
                                <h1>{t('detail.sloganTitle')}</h1>
                                <h2>{t('detail.sloganTitleSub', {coin: coinName, period: coinDetail?.period || '', rate: coinDetail?.expectRate || ''})}</h2>
                            </div>
                        </div>
                    </div>
                    <div className='basic'>
                        <Proinfo
                            tokenStr={tokenStr}
                            coinDetail={coinDetail}
                            coinName={coinName}
                            lockCoinName={lockCoinName}
                        />
                        <Rewards
                            tokenStr={tokenStr}
                            coinDetail={coinDetail}
                            coinName={coinName}
                            lockCoinName={lockCoinName}
                        />
                        <InvestMent
                            tokenStr={tokenStr}
                            coinDetail={coinDetail}
                            coinName={coinName}
                        />
                        <RulesRecord
                            tokenStr={tokenStr}
                            coinDetail={coinDetail}
                        />
                    </div>
                </>
            }
            </div>
        </>
    )
};

export default FlexibleStaking;