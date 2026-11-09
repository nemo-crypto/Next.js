'use client';

import { useState, useEffect, useRef } from 'react';
import Image from '@components/image';
import Link from '@src/components/localized-link';
import { useRouter } from '@src/lib/navigation';
import Style from './index.module.scss';
import btc from '@static/images/converter/btc.png';
import dynamic from 'next/dynamic';
const LineCharts = dynamic(() => import('./lineChart'), { ssr: false })
import StartBuying from '../start-buying';
import { coinIconPath, formatDate, formatNumSplit, RESPONSIVE, legalIconPath } from '@utils/common';
import { handelDecimal } from '@utils/decimal';
import useTranslation from '@src/lib/i18n/client';
import { getHistoryPriceLine, getMarkets } from '@service/converter';


const BitcoinMarkets = ({ moreCryptocurrency, moreCryptocurrencyExchangeRate, moreFiat, moreAmount, fromCount, fromCoinName, toCoinName, resInfo, isMobile }) => {

    const { t } = useTranslation('converter');
    const router = useRouter();
    const tabList = [
        { tabName: 'Spot', key: 1 },
        { tabName: 'Futures', key: 2 },
        { tabName: 'ETF', key: 3 }
    ]
    const [curTab, setCurTab] = useState(1)

    // sppt\futrues\ETF 币对数据列表
    const [coinListSpot, setCoinListSpot] = useState([])
    const [coinListFutures, setCoinListFutures] = useState([])
    const [coinListEtf, setCoinListEtf] = useState([])

    // conversions
    const [isShowAll1, setIsShowAll1] = useState(false);

    // Top Cryptocurrency Exchange Rates
    const [cryptocurrencyH5, setCryptocurrencyH5] = useState([])

    const [cryptab, setCryptab] = useState(['USD', 'INR', 'EUR', 'BRL', 'RUB', 'TRY'])
    const [curCryptab, setCurCryptab] = useState('USD')
    const [isShowAll2, setIsShowAll2] = useState(false);

    // Discover More Cryptocurrencies 
    const [isShowAll3, setIsShowAll3] = useState(false);

    const [timeTabList, setTimeTabList] = useState([
        { label: '1H', value: "HOUR_1", name: '1 hour' },
        { label: '24H', value: "DAY_1", name: '24 hours' },
        { label: '1W', value: "WEEK_1", name: '1 week' },
        { label: '1M', value: "MONTH_1", name: '1 month' },
        { label: '1Y', value: "YEAR_1", name: '1 year' },
        { label: '3Y', value: "YEAR_3", name: '1 year' },
    ])
    const [curChartTab, setCurChartTab] = useState(1) // 1折线
    const [curTimeTab, setCurTimeTab] = useState('HOUR_1')
    const [curTime, setCurTime] = useState(timeTabList[0].name)
    const [rose, setRose] = useState(0)
    const [chartArray, setChartArray] = useState([])

    useEffect(() => {
        if (document.documentElement.clientWidth <= RESPONSIVE.MD) {
            setIsShowAll1(true)
            setIsShowAll2(true)
            setIsShowAll3(true)
        }
        getMarketsList()
    }, []);

    useEffect(() => {
        if (fromCount) {
            getHistoryPriceLineList(curTimeTab)
        }
    }, [fromCount]);

    useEffect(() => {
        if (moreCryptocurrencyExchangeRate) {
            onTypeChange(curCryptab)
        }
    }, [moreCryptocurrencyExchangeRate]);

    // 获取历史数据
    const getHistoryPriceLineList = (scale_) => {
        getHistoryPriceLine({
            coin: fromCoinName,
            fiat: toCoinName,
            amount: fromCount,
            scale: scale_
        }).then(res => {
            if (res.code === 0) {
                setChartArray(res?.data?.list || [])
                let rose_ = res?.data?.rose * 100 || 0
                setRose(rose_)
            };
        });
    }

    const getMarketsList = () => {
        getMarkets({
            coinName: fromCoinName
        }).then(res => {
            if (res.code === 0) {
                setCoinListSpot(res?.data?.spotSymbol || [])
                setCoinListFutures(res?.data?.futuresSymbol || [])
                setCoinListEtf(res?.data?.etfSymbol || [])
            };
        });
    }

    const onTabChange = (index) => {
        setCurTab(index)
    }

    const onTimeTabChange = (item) => {
        setCurTimeTab(item?.value)
        setCurTime(item?.name)
        getHistoryPriceLineList(item?.value)
    }

    // const onChartTabChange = (value) => {
    //     setCurChartTab(value)
    // }

    const onTypeChange = (item) => {
        setCurCryptab(item)
        let arr_ = []
        moreCryptocurrencyExchangeRate.forEach(list => {
            arr_.push({
                name: list?.coinName?.toUpperCase(),
                price: list?.rate[item.toLowerCase()]
            })
        });
        setCryptocurrencyH5(arr_)
    }

    const handleClick = (url) => {
        // 埋点 区分 H5&PC
        window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_top10_convert_Button_Click') : window.gtag('event', 'Web_Converter_top10_convert_Button_Click'));
        router.push(url)
    }

    return (
        <>
            <div className={Style.component}>
                <div className={Style.bitcoinInfo}>
                    {/* Bitcoin Markets */}
                    <div className={Style.bitcoinMarkets}>
                        {/* TODO 千分位插件 */}
                        <div className={Style.commom_title}>Bitcoin Markets</div>
                        <div className={Style.desc1}>
                            <a className={Style.link}>The current price of {fromCoinName}</a> is <span className={Style.lights}>{formatNumSplit(resInfo?.baseToQuoteRate)} {toCoinName}</span>. This means that 1 {resInfo?.baseCoin?.fullName} is worth {formatNumSplit(resInfo?.baseToQuoteRate)} {toCoinName}. Conversely, 1 {toCoinName} will allow you to purchase {1 / resInfo?.baseToQuoteRate} {resInfo?.baseCoin?.fullName}.
                        </div>
                        <div className={Style.desc2}>
                            The value of  {toCoinName} has increased by <span className={resInfo?.percentChange24h > 0 ? Style.percent_positive : Style.percent_negative}>{resInfo?.percentChange24h}%</span> over the past 24 hours, while declined by <span className={resInfo?.percentChange7d > 0 ? Style.percent_positive : Style.percent_negative}>{resInfo?.percentChange7d}%</span> over the past 7 days.
                        </div>
                        <div className={Style.desc3}>
                            With a circulating supply of <span className={Style.lights}>{formatNumSplit(resInfo?.supply)}</span>  {resInfo?.baseCoin?.fullName} ,  {resInfo?.baseCoin?.fullName} currently has a market cap of  <span className={Style.lights}>{resInfo?.quoteCoin?.sign}{formatNumSplit(resInfo?.marketCap)}</span>.
                        </div>

                        <div className={Style.tabs}>
                            {tabList.map((item, index) => {
                                return (
                                    <div className={curTab === item.key ? Style.active : ''} key={index} onClick={() => onTabChange(item.key)}>{item?.tabName}</div>
                                )
                            })}
                        </div>
                        <div className={Style.coinList}>
                            {curTab === 1 && coinListSpot.map((item, index) => {
                                return (
                                    <div className={Style.coinInfo} key={index}>
                                        <h2>{item?.showSymbol}</h2>
                                        <div className={Style.coinPrice}>
                                            <h3>{item?.price}</h3>
                                            <h4 className={item?.priceChangePercent > 0 ? Style.percent_positive : Style.percent_negative}>{item?.percent > 0 ? '+' + item?.priceChangePercent : item?.priceChangePercent}%</h4>
                                        </div>
                                    </div>
                                )
                            })}
                            {curTab === 2 && coinListFutures.map((item, index) => {
                                return (
                                    <div className={Style.coinInfo} key={index}>
                                        <h2>{item?.showSymbol}</h2>
                                        <div className={Style.coinPrice}>
                                            <h3>{item?.price}</h3>
                                            <h4 className={item?.priceChangePercent > 0 ? Style.percent_positive : Style.percent_negative}>{item?.percent > 0 ? '+' + item?.priceChangePercent : item?.priceChangePercent}%</h4>
                                        </div>
                                    </div>
                                )
                            })}
                            {curTab === 3 && coinListEtf.map((item, index) => {
                                return (
                                    <div className={Style.coinInfo} key={index}>
                                        <h2>{item?.showSymbol}</h2>
                                        <div className={Style.coinPrice}>
                                            <h3>{item?.price}</h3>
                                            <h4 className={item?.priceChangePercent > 0 ? Style.percent_positive : Style.percent_negative}>{item?.percent > 0 ? '+' + item?.priceChangePercent : item?.priceChangePercent}%</h4>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* charts */}
                    <div className={Style.exchangeRate}>
                        <div className={Style.commom_title}>{t('home.exchange_rate', {
                            amount: fromCount,
                            coinFullName: resInfo?.baseCoin?.fullName,
                            fiatName: resInfo?.quoteCoin?.name?.toUpperCase(),
                        })}</div>
                        {/* <div className={Style.desc}>BTC to USD rate today is <span>34,143.60</span> USD, down <span>1.78%</span> in the last 24 hours. Bitcoin (BTC) is trending upwards, increasing <span>29.99%</span> in the last 30 days.</div> */}
                        <div className={Style.desc}>{t('home.exchange_desc', {
                            amount: fromCount,
                            coinName: resInfo?.baseCoin?.name?.toUpperCase(),
                            fiatName: resInfo?.quoteCoin?.name?.toUpperCase(),
                            price: resInfo?.baseToQuoteRate,
                            percent_24: resInfo?.percentChange24h + '%',
                            coinFullName: resInfo?.baseCoin?.fullName,
                            percent_30: resInfo?.percentChange30d + '%'
                        })}</div>
                        <div className={Style.charts}>
                            <div className={Style.charts_header}>
                                {/* <div className={Style.left}>
                                    <Image width={32} height={32} src={coinIconPath(resInfo?.baseCoin?.name)} alt='coin' />
                                    <span className={Style.name}>{resInfo?.baseCoin?.fullName}</span>
                                    <span className={Style.count}>{formatNumSplit(resInfo?.baseToQuoteRate || 0)}</span>
                                    <span className={rose > 0 ? Style.percent_positive : Style.percent_negative}>{rose > 0 ? '+' + rose : rose}%</span>
                                    <span className={Style.times}>({curTime})</span>
                                </div> */}
                                <div className={Style.right}>
                                    <div className={Style.timeTab}>
                                        {timeTabList.map((item, index) => {
                                            return (
                                                <div className={item?.value === curTimeTab ? Style.active : ''} key={index} onClick={() => onTimeTabChange(item)}>
                                                    {item?.label}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {/* <div className={Style.chartTab}>
                                        <div onClick={() => onChartTabChange(1)} className={curChartTab === 1 ? Style.active : ''}><Image width={16} height={16} src={btc} alt='coin' /></div>
                                        <div onClick={() => onChartTabChange(2)} className={curChartTab === 2 ? Style.active : ''}><Image width={16} height={16} src={btc} alt='coin' /></div>
                                    </div> */}
                                </div>
                            </div>

                            <div className={Style.charts_main}>
                                <div className={Style.charts_info}>
                                    <LineCharts array={chartArray} chartId={`chartId`} curChartTab={curChartTab} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bitcoin Exchange Rates for Different Amount */}
                    <div className={Style.bitcoinLive}>
                        <div className={Style.commom_title}>{t('home.bitcoinLive_title', { coinFullName: resInfo?.baseCoin?.fiat ? resInfo?.quoteCoin?.fullName : resInfo?.baseCoin?.fullName })}</div>
                        <div className={Style.tableList}>
                            <div className={Style.listLeft}>
                                <div className={Style.title}>{t('home.breadcrumbs_title', { coinName: moreAmount[resInfo?.baseCoin?.fiat ? 1 : 0]?.baseCoin.toUpperCase() || '', fiatName: moreAmount[resInfo?.baseCoin?.fiat ? 1 : 0]?.quoteCoin.toUpperCase() || '' })}</div>
                                <div className={Style.list}>
                                    <div className={Style.list_header}>
                                        <span>{t('home.amount')}</span>
                                        <span>{t('home.lastUpdated')} {formatDate(moreAmount[0]?.lastUpdate, 'yyyy/MM/dd hh:mm')}</span>
                                    </div>
                                    <div className={Style.list_row_h5}>
                                        <div className={Style.list_row_h5_left}>
                                            <Image width={19} height={19} src={coinIconPath(moreAmount[0]?.baseCoin)} alt='coin' />
                                            <span>{moreAmount[0]?.baseCoin.toUpperCase()}</span>
                                        </div>
                                        <div className={Style.list_row_h5_right}>
                                            <Image width={19} height={19} src={coinIconPath(moreAmount[0]?.quoteCoin)} alt='coin' />
                                            <span>{moreAmount[0]?.quoteCoin.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    {moreAmount[0] && moreAmount[0]?.list.map((item, index) => {
                                        return (
                                            <Link href={`/converter/${item?.baseAmount + '-' + fromCoinName?.toLowerCase() + '-to-' + toCoinName?.toLowerCase()}`} key={index} rel="noopener noreferrer">
                                                <div className={Style.listCoinInfo} >
                                                    <div className={Style.coin_mount}>
                                                        <h3>{item?.baseAmount}</h3>
                                                        <h4>{fromCoinName}</h4>
                                                    </div>
                                                    <div className={Style.coin_price}>
                                                        <h3>{formatNumSplit(handelDecimal(!resInfo?.baseCoin?.fiat ? 1 : 2, item?.quoteAmount))}</h3>
                                                        <h4>{toCoinName}</h4>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className={Style.listRight}>
                                <div className={Style.title}>{t('home.breadcrumbs_title', { coinName: moreAmount[resInfo?.baseCoin?.fiat ? 0 : 1]?.baseCoin.toUpperCase() || '', fiatName: moreAmount[resInfo?.baseCoin?.fiat ? 0 : 1]?.quoteCoin.toUpperCase() || '' })}</div>
                                <div className={Style.list}>
                                    <div className={Style.list_header}>
                                        <span>{t('home.amount')}</span>
                                        <span>{t('home.lastUpdated')} {formatDate(moreAmount[1]?.lastUpdate, 'yyyy/MM/dd hh:mm')}</span>
                                    </div>
                                    <div className={Style.list_row_h5}>
                                        <div className={Style.list_row_h5_left}>
                                            <Image width={18} height={18} src={coinIconPath(moreAmount[1]?.baseCoin)} alt='coin' />
                                            <span>{moreAmount[1]?.baseCoin.toUpperCase()}</span>
                                        </div>
                                        <div className={Style.list_row_h5_right}>
                                            <Image width={18} height={18} src={coinIconPath(moreAmount[1]?.quoteCoin)} alt='coin' />
                                            <span>{moreAmount[1]?.quoteCoin.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    {moreAmount[1] && moreAmount[1]?.list.map((item, index) => {
                                        return (
                                            <Link href={`/converter/${item?.baseAmount + '-' + toCoinName?.toLowerCase() + '-to-' + fromCoinName?.toLowerCase()}`} key={index} rel="noopener noreferrer">
                                                <div className={Style.listCoinInfo}>
                                                    <div className={Style.coin_mount}>
                                                        <h3>{item?.baseAmount}</h3>
                                                        <h4>{toCoinName}</h4>
                                                    </div>
                                                    <div className={Style.coin_price}>
                                                        <h3>{formatNumSplit(handelDecimal(resInfo?.baseCoin?.fiat ? 2 : 1, item?.quoteAmount))}</h3>
                                                        <h4>{fromCoinName}</h4>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Start buying Bitcoin (BTC) */}
                    <StartBuying resInfo={resInfo} isMobile={isMobile} type={"detail"} />

                    {/* Bitcoin Conversions  - 兑换方向不变，比如：当前url为usd-to-btc,列表仍为btc兑换各种法币。*/}
                    <div className={Style.conversions}>
                        <div className={Style.commom_title}>{t('home.conversions_title', { coinFullName: resInfo?.baseCoin?.fiat ? resInfo?.quoteCoin?.fullName : resInfo?.baseCoin?.fullName })}</div>
                        <div className={Style.list}>
                            <div className={Style.list_left}>
                                {moreFiat.map((item, index) => {
                                    if (index < (isShowAll1 ? 6 : moreFiat.length)) {
                                        return (
                                            <div className={Style.listItem} key={index}>
                                                <div className={Style.cell1} onClick={() => {
                                                    // 埋点 区分 H5&PC
                                                    window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_coinconversions_coin_Button_Click') : window.gtag('event', 'Web_Converter_coinconversions_coin_Button_Click'));
                                                    router.push(`/converter/${resInfo?.baseCoin?.name + '-to-' + item?.fiatName}`)
                                                }}>
                                                    <Image width={32} height={32} src={legalIconPath(item?.fiatName)} alt='' />
                                                    <div>
                                                        <span>{`1 ${resInfo?.baseCoin?.name} to ${item?.fiatName.toUpperCase()}`}</span>
                                                        <div className={Style.cell2_h5}>{formatNumSplit(handelDecimal(1, item?.amount))}</div>
                                                    </div>
                                                </div>
                                                <div className={Style.cell2}>{item?.sign}{formatNumSplit(handelDecimal(1, item?.amount))} {item?.fiatName.toUpperCase()}</div>
                                                {/* 击buy跳转对应的simplex页面 /creditcard */}
                                                <div className={Style.cell3} onClick={() => {
                                                    // 埋点 区分 H5&PC
                                                    window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_coinconversions_buy_Button_Click') : window.gtag('event', 'Web_Converter_coinconversions_buy_Button_Click'));
                                                    router.push(`/creditcard`)
                                                }}>{t('home.conversions_buy', { fiatName: item?.fiatName?.toUpperCase() })}</div>
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                            {isShowAll1 && moreFiat.length > 0 && <div className={Style.moreBtn_h5} onClick={() => setIsShowAll1(false)}>More<i className='iconfont icon-arrow-right'></i></div>}
                        </div>
                    </div>

                    {/* Top Cryptocurrency Exchange Rates */}
                    <div className={Style.topCryptocurrency}>
                        <div className={Style.commom_title}>{t('home.top_cryptocurrency')}</div>
                        <div className={Style.table}>
                            <div className={Style.header}>
                                <div className={Style.cell1}>Crypto</div>
                                <div className={Style.cell2}>USD</div>
                                <div className={Style.cell3}>INR</div>
                                <div className={Style.cell4}>EUR</div>
                                <div className={Style.cell5}>BRL</div>
                                <div className={Style.cell6}>RUB</div>
                                <div className={Style.cell7}>TRY</div>
                            </div>
                            {moreCryptocurrencyExchangeRate.map((item, index) => {
                                return (
                                    <div className={Style.listItem} key={index}>
                                        <div className={Style.cell1} onClick={() => {
                                            // 埋点 区分 H5&PC
                                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_top10_coin_Button_Click') : window.gtag('event', 'Web_Converter_top10_coin_Button_Click'));
                                            router.push(`/price/${item?.coinName}`)
                                        }}>
                                            <Image width={24} height={24} src={coinIconPath(item?.coinName)} alt='' />
                                            <h4>{item?.coinName?.toUpperCase()}</h4>
                                            <h5>{item?.coinFullName}</h5>
                                        </div>
                                        <div onClick={() => handleClick(`/converter/${item?.coinName + '-to-usd'}`)} className={Style.cell2}>{formatNumSplit(handelDecimal(1, item?.rate?.usd))}</div>
                                        <div onClick={() => handleClick(`/converter/${item?.coinName + '-to-inr'}`)} className={Style.cell3}>{formatNumSplit(handelDecimal(1, item?.rate?.inr))}</div>
                                        <div onClick={() => handleClick(`/converter/${item?.coinName + '-to-eur'}`)} className={Style.cell4}>{formatNumSplit(handelDecimal(1, item?.rate?.eur))}</div>
                                        <div onClick={() => handleClick(`/converter/${item?.coinName + '-to-brl'}`)} className={Style.cell5}>{formatNumSplit(handelDecimal(1, item?.rate?.brl))}</div>
                                        <div onClick={() => handleClick(`/converter/${item?.coinName + '-to-rub'}`)} className={Style.cell6}>{formatNumSplit(handelDecimal(1, item?.rate?.rub))}</div>
                                        <div onClick={() => handleClick(`/converter/${item?.coinName + '-to-try'}`)} className={Style.cell7}>{formatNumSplit(handelDecimal(1, item?.rate?.try))}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className={Style.table_h5}>
                            <div className={Style.tabs_h5}>
                                {cryptab.map((item, index) => {
                                    return (
                                        <div onClick={() => onTypeChange(item)} className={item === curCryptab ? Style.active : ""} key={index}>{item}</div>
                                    )
                                })}

                            </div>
                            <div className={Style.list_h5}>
                                {cryptocurrencyH5.map((item, index) => {
                                    if (index < (isShowAll2 ? 5 : cryptocurrencyH5.length)) {
                                        return (
                                            <div className={Style.listItem} key={index}>
                                                <div className={Style.coins} onClick={() => {
                                                    // 埋点 区分 H5&PC
                                                    window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_top10_coin_Button_Click') : window.gtag('event', 'Web_Converter_top10_coin_Button_Click'));
                                                    router.push(`/price/${item?.coinName}`)
                                                }}>
                                                    <Image width={32} height={32} src={coinIconPath(item?.name)} alt='' />
                                                    <h2>{item?.name}</h2>
                                                </div>
                                                <h3>{formatNumSplit(handelDecimal(1, item?.price))}</h3>
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                            {isShowAll2 && <div className={Style.moreBtn_h5} onClick={() => setIsShowAll2(false)}>More<i className='iconfont icon-arrow-right'></i></div>}
                        </div>
                    </div>

                    {/* Discover More Cryptocurrencies */}
                    <div className={Style.discover}>
                        <div className={Style.commom_title}>{t('home.discover_title')}</div>
                        <div className={Style.sub}>{t('home.discover_desc')}</div>
                        <div className={Style.discoverList}>
                            {moreCryptocurrency.map((item, index) => {
                                if (index < (isShowAll3 ? 6 : moreCryptocurrency.length)) {
                                    return (
                                        <div className={Style.listItem} key={index} onClick={() => {
                                            // 埋点 区分 H5&PC
                                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_discover_coin_Button_Click') : window.gtag('event', 'Web_Converter_discover_coin_Button_Click'));
                                            router.push(`/price/${item?.coinName}`)
                                        }}>
                                            <Image width={32} height={32} src={coinIconPath(item.coinName)} alt='' />
                                            <div className={Style.coins}>
                                                <h4>{item?.coinName?.toUpperCase()}</h4>
                                                <h5>{item?.coinFullName}</h5>
                                            </div>
                                        </div>

                                    )
                                }
                            })}
                        </div>
                        {isShowAll3 && moreCryptocurrency.length > 0 && <div className={Style.moreBtn_h5} onClick={() => setIsShowAll3(false)}>More<i className='iconfont icon-arrow-right'></i></div>}
                    </div>
                </div>
            </div>
        </>
    )
};

export default BitcoinMarkets;