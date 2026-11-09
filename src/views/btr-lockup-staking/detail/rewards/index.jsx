'use client';

import Style from './index.module.scss';

import useTranslation from 'next-translate/useTranslation';
import { formatNumSplit } from '@utils/common';

const Rewards = ({ coinName, tokenStr, coinDetail, lockCoinName })  => {
    const { t } = useTranslation('btrlockup');

    return ( 
        <div className={Style.rewards}>
            <h2>{t('detail.myRewards')}</h2>
            <ul>
                <li>
                    <p className="rose">{tokenStr ? formatNumSplit(coinDetail?.totalEarning || 0) : '--'} {coinName}</p>
                    <span>{coinName} {t('detail.rewards')}</span>
                </li>
                <li>
                    <p className="rose">{tokenStr ? formatNumSplit(coinDetail?.lockCoinEarning || 0) : '--'} {lockCoinName}</p>
                    <span>{lockCoinName} {t('detail.rewards')}</span>
                </li>
                <li>
                    <p>{tokenStr ? formatNumSplit(coinDetail?.totalInvestment || 0) : '--'} {coinName}</p>
                    <span>{coinName} {t('detail.investment')}</span>
                </li>
                <li>
                    <p>{tokenStr ? formatNumSplit(coinDetail?.lockCoinInvestAmount || 0) : '--'} {lockCoinName}</p>
                    <span>{lockCoinName} {t('detail.investment')}</span>
                </li>
            </ul>
        </div>
    )
};

export default Rewards;