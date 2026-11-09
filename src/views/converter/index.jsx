'use client';

import { useState, useEffect, useRef } from 'react';
import Image from '@components/image';
import Link from '@src/components/localized-link';
import { Config } from '@constants/config';
import { useRouter } from '@src/lib/navigation';
import Style from './index.module.scss';
import StartBuying from './detail/start-buying';
import Convert from './detail/convert';
import Loading from '@components/loading';
import useTranslation from 'next-translate/useTranslation';
import { getConverterCalculator, getTopCryptoAssets, getConverterDetail } from '@service/converter';
import { coinIconPath, formatDate, formatNumSplit } from '@utils/common';
import { handelDecimal } from '@utils/decimal';

const Converter = () => {

    const router = useRouter();
    const [rateInfo, setRateInfo] = useState({});
    const [topList, setTopList] = useState([]);
    const [resInfo, setResInfo] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    const { t } = useTranslation('converter');

    useEffect(() => {
        // 判断是否移动设备
        if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
            setIsMobile(true);
        };
        getDetailData()
        getCalculator()
        getTopCryptoAssetsList()
    }, []);

    // 获取 各个列表数据
    const getDetailData = () => {
        getConverterDetail({
            key: `btc-to-usd`
        }).then(res => {
            if (res.code === 0) {
                setResInfo(res?.data || {})
                // 埋点 区分 H5&PC
                window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_HomePage_Expose') : window.gtag('event', 'Web_Converter_HomePage_Expose'));
            };
        });
    }

    // 获取 计算器相关
    const getCalculator = () => {
        getConverterCalculator({
            base: 'btc',
            quote: 'usd',
            amount: 1
        }).then(res => {
            if (res.code === 0) {
                setRateInfo(res?.data)
            };
        });
    }

    // TOP 30
    const getTopCryptoAssetsList = () => {
        getTopCryptoAssets().then(res => {
            if (res.code === 0) {
                setTopList(res?.data || [])
            };
        });
    }

    return (
        <>

            <div className={Style.component}>
                <div className={Style.banner}>
                    <div className={Style.banner_content}>
                        <div className={Style.banner_left}>
                            <div className={Style.breadcrumbs}>
                                <span className={Style.links}>{t('home.breadcrumbs_home')}</span>
                                <i className='iconfont icon-arrow-right'></i>
                                <span className={Style.links}>{t('home.breadcrumbs_converter')}</span>
                                <i className='iconfont icon-arrow-right'></i>
                                <span className={Style.coinNames}>{t('home.breadcrumbs_title', { coinName: 'BTC', fiatName: 'USD' })}</span>
                            </div>
                            <h2>{t('home.breadcrumbs_title', { coinName: 'Bitcoin', fiatName: 'USD' })}</h2>
                            <h4>{t('home.banner_h4', { coinFullName: 'Bitcoin', price: formatNumSplit(handelDecimal(1, resInfo?.baseToQuoteRate)), fiatFullName: 'United States Dollar' })}</h4>
                            <h3>1 BTC = $ {formatNumSplit(handelDecimal(1, resInfo?.baseToQuoteRate))} USD</h3>
                            <h5>{t('home.banner_h5', { coinFullName: 'Bitcoin', fiatFullName: 'USD' })}</h5>
                            <h6>{t('home.banner_h6', { coinName: 'BTC', price: formatNumSplit(handelDecimal(1, resInfo?.baseToQuoteRate)), fiatName: 'USD' })}</h6>
                            <div className={Style.btns} onClick={() => {
                                // 埋点 区分 H5&PC
                                window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_HomePage_Head_Buy_Button_Click') : window.gtag('event', 'Web_Converter_HomePage_Head_Buy_Button_Click'));
                                router.push('/creditcard')
                            }}>
                                {t('home.buy_btn', { coinFullName: 'Bitcoin', coinName: 'BTC' })}
                            </div>
                        </div>
                        <div className={Style.banner_right}>
                            <Convert
                                fromCoinCount={1}
                                fromName={'BTC'}
                                toName={'USD'}
                                rateInfo={rateInfo}
                                resInfo={resInfo}
                                isMobile={isMobile}
                                type={"index"}
                            />
                        </div>
                    </div>
                </div>
                <div className={Style.converter}>
                    {/* 描述 */}
                    <div className={Style.convertDesc}>
                        <p>Use DemoExchange's cryptocurrency conversion tool to obtain the exchange rates between your favorite cryptocurrencies and fiat currencies. Instantly check live price data, Bitcoin exchange rates, and historical price data for BTC, ETH, and other cryptocurrencies to USD, EUR, GBP, INR, and more.</p>
                        <p>Select the fiat currency you'd like to obtain exchange rates for from the table below to view a list of popular cryptocurrency to fiat currency (and vice versa) conversion tables and tools.</p>
                    </div>

                    {/* Cryptocurrency Exchange Rates for the Top 50 Crypto Assets */}
                    <div className={Style.top50}>
                        <div className={Style.commom_title}>Cryptocurrency Exchange Rates for the Top 50 Crypto Assets</div>
                        <div className={Style.sub}>Instantly see exchange rates for the top 50 cryptocurrencies by market cap</div>
                        <div className={Style.list}>
                            {topList.map((item, index) => {
                                return (
                                    <div key={index}>
                                        <div className={Style.listItem}>
                                            <h2>{item?.coinName.toUpperCase()}兑换</h2>
                                            <div className={Style.coinList}>
                                                {item?.fiatNames?.map((curitem, index_) => {
                                                    return (
                                                        <span className={Style.symbolItem} key={index_} onClick={() => {
                                                            // 埋点 区分 H5&PC
                                                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_HomePage_top50_convert_Button_Click') : window.gtag('event', 'Web_Converter_HomePage_top50_convert_Button_Click'));
                                                            router.push(`/converter/${item?.coinName}-to-${curitem}`)
                                                        }}>
                                                            {item?.coinName.toUpperCase()}兑换{curitem.toUpperCase()}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                        </div>
                    </div>
                </div>

                <StartBuying resInfo={resInfo} isMobile={isMobile}  type={"index"} />

                <div className={Style.converterLines} />
            </div>
        </>
    )
};

export default Converter;