'use client';

import { useState, useEffect, useRef } from 'react';
import Image from '@components/image';
import Link from '@src/components/localized-link';
import { Config } from '@constants/config';
import { useRouter } from '@src/lib/navigation';
import Style from './index.module.scss';
import BitcoinMarkets from './bitcoin-markets';
import Faq from './faq';
import Convert from './convert';
import Loading from '@components/loading';
import useTranslation from 'next-translate/useTranslation';
import { getConverterDetail, getConverterCalculator } from '@service/converter';
import { coinIconPath, formatDate, formatNumSplit } from '@utils/common';
import { handelDecimal } from '@utils/decimal';


const Converter = ({ fromCount, fromName, toName, initialData }) => {

    const router = useRouter();
    const { t } = useTranslation('converter');
    const [fromCoinCount, setFromCoinCount] = useState(initialData?.baseCoin?.amount ?? fromCount);
    const [coinName, setCoinName] = useState(fromName);
    const [fiatName, setFiatName] = useState(toName);

    const [faqList, setFaqList] = useState([]);



    const [moreCryptocurrency, setMoreCryptocurrency] = useState([]);
    const [moreCryptocurrencyExchangeRate, setMoreCryptocurrencyExchangeRate] = useState([]);
    const [moreFiat, setMoreFiat] = useState([]);
    const [moreAmount, setMoreAmount] = useState([]);
    const [resInfo, setResInfo] = useState(initialData || {});

    const [rateInfo, setRateInfo] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // 判断是否移动设备
        if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
            setIsMobile(true);
        };
        getCalculator()
        getDetailData()
    }, [fromCount, fromName, toName]);

    // 获取 各个列表数据
    const getDetailData = () => {
        getConverterDetail({
            key: `${fromCount}-${fromName}-to-${toName}`
        }).then(res => {
            if (res.code === 0) {
                setFromCoinCount(res?.data?.baseCoin?.amount || 0)
                setMoreCryptocurrency(res?.data?.moreCryptocurrency || [])
                setMoreCryptocurrencyExchangeRate(res?.data?.moreCryptocurrencyExchangeRate || [])
                setMoreFiat(res?.data?.moreFiat || [])
                setMoreAmount(res?.data?.moreAmount || [])
                setResInfo(res?.data || {})

                // 设置多语言list
                setFaqList([
                    { id: 1, expand: false, q: t('home.faq_q1'), a: t('home.faq_a1') },
                    { id: 2, expand: false, q: t('home.faq_q2', { fiatSymbol: res?.data?.quoteCoin?.sign, coinName: res?.data?.baseCoin?.name?.toUpperCase() }), a: t('home.faq_a2', { coinName: res?.data?.baseCoin?.name?.toUpperCase(), fiatName: res?.data?.quoteCoin?.name?.toUpperCase() }) },
                    { id: 3, expand: false, q: t('home.faq_q3'), a: t('home.faq_a3') },
                    { id: 4, expand: false, q: t('home.faq_q4'), a: t('home.faq_a4') },
                    { id: 5, expand: false, q: t('home.faq_q5'), a: t('home.faq_a5') },
                ])

                // 埋点 区分 H5&PC Converter{{amount}}{{coins}}to{{fiat}}详情页的曝光监测
                window.gtag && (isMobile ? window.gtag('event', `H5_Converter_${res?.data?.baseCoin?.amount}${res?.data?.baseCoin?.name}to${res?.data?.quoteCoin?.name}_Expose`) : window.gtag('event', `Web_Converter_${res?.data?.baseCoin?.amount}${res?.data?.baseCoin?.name}to${res?.data?.quoteCoin?.name}_Expose`));
            };
        });
    }

    // 获取 计算器相关
    const getCalculator = () => {
        getConverterCalculator({
            base: fromName,
            quote: toName,
            amount: fromCount
        }).then(res => {
            if (res.code === 0) {
                setRateInfo(res?.data)
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
                                <span className={Style.coinNames}>{t('home.breadcrumbs_title_amount', { amount: fromCoinCount, coinName, fiatName })}</span>
                            </div>
                            <h2>{t('home.breadcrumbs_title_amount', { amount: fromCoinCount, coinName, fiatName })}</h2>
                            <h4>{t('home.banner_h4', { coinFullName: 'Bitcoin', price: formatNumSplit(handelDecimal(1, resInfo?.baseToQuoteRate)), fiatFullName: 'United States Dollar' })}</h4>
                            <h3>{fromCoinCount} {fromName} {'='} {resInfo?.quoteCoin?.sign} {fromCoinCount && resInfo?.baseToQuoteRate ? formatNumSplit(handelDecimal(1, resInfo?.baseToQuoteRate * fromCoinCount)) : '-'} {toName}</h3>
                            <h5>{t('home.banner_h5', { coinFullName: 'Bitcoin', fiatFullName: 'USD' })}</h5>
                            <h6>{t('home.banner_h6', { coinName: coinName, price: formatNumSplit(handelDecimal(1, resInfo?.baseToQuoteRate)), fiatName })}</h6>
                            <div className={Style.btns} onClick={() => {
                                // 埋点 区分 H5&PC
                                window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_Head_Buy_Button_Click') : window.gtag('event', 'Web_Converter_Head_Buy_Button_Click'));
                                router.push('/creditcard')
                            }} >
                                {t('home.buy_btn', { coinFullName: 'Bitcoin', coinName })}
                            </div>
                        </div>
                        <div className={Style.banner_right}>
                            <Convert
                                fromCoinCount={fromCoinCount}
                                fromName={coinName}
                                toName={fiatName}
                                rateInfo={rateInfo}
                                resInfo={resInfo}
                                isMobile={isMobile}
                                type={"detail"}
                                onConvertChange={(fromInput_, toInput_, selectFromOption_, selectToOption_, convertSwitch_) => {
                                    console.log(fromInput_, '===fromInput_')
                                    console.log(toInput_, '===toInput_')
                                    console.log(selectFromOption_, '===selectFromOption_')
                                    console.log(selectToOption_, '===selectToOption_')
                                    console.log(convertSwitch_, '===convertSwitch_')
                                }} />
                        </div>
                    </div>
                </div>
                <div className={Style.converter}>
                    <BitcoinMarkets
                        moreCryptocurrency={moreCryptocurrency}
                        moreCryptocurrencyExchangeRate={moreCryptocurrencyExchangeRate}
                        moreFiat={moreFiat}
                        moreAmount={moreAmount}
                        fromCount={fromCoinCount}
                        fromCoinName={coinName}
                        toCoinName={fiatName}
                        resInfo={resInfo}
                        isMobile={isMobile}
                    />
                    <Faq faqList={faqList} onChange={(arr) => setFaqList(arr.slice())} />
                </div>
            </div>
        </>
    )
};

export default Converter;