'use client';
import { sanitizeRichHtml } from '@src/lib/safe-content';
import { safeNavigationUrl } from '@src/lib/safe-url';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from '@src/lib/navigation';
import Link from '@src/components/localized-link';
import Image from '@components/image';

import Style from './index.module.scss';
import classNames from 'classnames';

import Loading from '@components/loading';
import CustomSelect from '@components/select';
import useTranslation from '@src/lib/i18n/client';
import { coinIconPath, formatNumSplit } from '@utils/common';
import cmcLogo from '@static/images/price/cmc_logo.png';

import level01 from '@static/images/price/saveEvaluate/level01.png'
import level02 from '@static/images/price/saveEvaluate/level02.png'
import level03 from '@static/images/price/saveEvaluate/level03.png'
import level04 from '@static/images/price/saveEvaluate/level04.png'
import level05 from '@static/images/price/saveEvaluate/level05.png'
import certikLogo from '@static/images/price/saveEvaluate/certik-logo.png'
import downUp from '@static/images/price/saveEvaluate/down-up.png'
import yellowDown from '@static/images/price/saveEvaluate/yellow-down.png'

import { getPriceCoinList } from '@service/price';

const PriceDetail = ({ coinName, coinDetail })  => {
    const [coinList, setCoinList] = useState([]);

    const { t } = useTranslation('price');
    const router = useRouter();

    const coinFullName = coinDetail?.info?.coinFullName || '';

    const coinDescription = useRef();
    const [isMobileFlag, setIsMobileFlag] = useState(false);
    const [hightlightShow, setHightlightShow] = useState(false);
    const [isShowMore, setIsShowMore] = useState(false); //详情内容过多
    const [isExtCoinDetail, setIsExtCoinDetail] = useState(false);//是否展开
    const highlightsFileds = [
        "audit_history",
        "coderepo_health",
        "bug_bounty",
        "team_identity",
        "kyc",
        "twitter_follower",
        "market_cap",
        "trading_volume",
        "token_activity"
    ];
    const alertsFileds = [
        "audit_history",
        "coderepo_health",
        "team_identity",
        "twitter_closure",
        "price_slippage"
    ];

    // 获取币对列表
    const fetchCoinList = useCallback(async () => {
        const fetchData = await getPriceCoinList();
        const coinList = fetchData?.code == 0 ? fetchData?.data?.baseCoins : [];
        coinList.map((item, index) => !item.isOn && coinList.splice(index, 1));

        setCoinList(coinList);
    }, []);
    useEffect(() => {
        fetchCoinList();
    }, [fetchCoinList]);

    useEffect(() => {
        const _width =window.innerWidth || e.target.innerWidth;
        if (_width <= 750) {
            setIsMobileFlag(true)
        }
    },[])

    useEffect(() => {
        let descriptionText = coinDetail?.info?.description;
        if (descriptionText&&descriptionText.length>2500) {
            !isShowMore && setIsShowMore(true);
        }
    },[coinDetail])

    // 币种选择
	const renderCoinOption = (item) => (
		<div className={Style.search_select}>
			<Image
				src={coinIconPath(item.coinName)}
				alt={item.coinName}
				width={24}
				height={24}
			/>
			<span>{item.coinName}</span>
		</div>
	);

    // 选择币种
	const handleBaseCoinSelect = (item) => {
        let url = `/price/${item?.coinName?.toUpperCase()}`;

        if (item.etf) {
            url = `/price/${item?.target?.toUpperCase()}-ETF-${item?.leverage}${item?.ls?.toUpperCase()}`;
        };

        router.push(url);
	};

    const judeLevelGrade = (level) => {
        let levelObj = {};
        if (level >= 80) {
            levelObj = {
                color: '#0ABE82',
                iconUrl: level01
            }
        } else if(level >= 60 && level <= 79.99) {
            levelObj = {
                color: '#E6AA1E',
                iconUrl: level02
            }
        } else if(level >= 40 && level <= 59.99) {
            levelObj = {
                color: '#FE8736',
                iconUrl: level03
            }
        } else if(level >= 20 && level <= 39.99) {
            levelObj = {
                color: '#E93C77',
                iconUrl: level04
            }
        } else {
            levelObj = {
                color: '#F04B55',
                iconUrl: level05
            }
        }
        return levelObj;
    }

    const extendHighLights = () => {
        setHightlightShow(!hightlightShow)
    }

    const exchangeCoinDetail = () => {
        setIsExtCoinDetail(!isExtCoinDetail);
    }

    return (
        <>
            <div className={Style.component}>
            {
                coinDetail?.info
                ?
                <div className={Style.container}>
                    <div className={Style.header}>
                        <h1 className={Style.pageTitle}>{t('coinPrice', { coinFullName: coinFullName || coinName })}</h1>
                        <div className={Style.search}>
                            <CustomSelect
                                renderLabelProp={option => option ? renderCoinOption(option) : 'All'}
                                showSearch={true}
                                searchField='coinName'
                                options={coinList}
                                onSelect={handleBaseCoinSelect}
                                renderListOption={item => renderCoinOption(item)}
                            />
                        </div>
                    </div>
                    <div className={Style.coin}>
                        <Image
                            src={coinIconPath(coinName)}
                            alt={coinName}
                            width={36}
                            height={36}
                        />
                        <h3>{t('coinPrice', { coinFullName })}</h3>
                        <h4>({coinDetail?.info?.coinName?.toUpperCase()})</h4>
                        {
                            coinDetail?.market?.increase
                            &&
                            <div className={classNames({
                                [Style.rose]: coinDetail?.market?.increase > 0,
                                [Style.fall]: coinDetail?.market?.increase < 0,
                                [Style.equal]: coinDetail?.market?.increase == 0
                            })}>
                                <em>{coinDetail?.market?.currentPrice}</em>
                                <span >{parseFloat(coinDetail?.market?.increase * 100).toFixed(2)}%</span>
                            </div>
                        }
                    </div>
                    <div className={Style.modal}>
                        <h3>{t('BasicInfo', { coinName })}</h3>
                        {
                            coinDetail?.isEtf
                            &&
                            <div className={Style.modal_list}>
                                <ul>
                                    <li>
                                        {/* 标的资产 */}
                                        <span>{t('UnderlyingAsset')}</span>
                                        <span>{coinDetail?.info?.etfUnderlyingAssets || '-'}</span>
                                    </li>
                                    <li>
                                        {/* 当前净值 */}
                                        <span>{t('NetValue')}</span>
                                        <span>{formatNumSplit(coinDetail?.info?.currentEquity || 0)} USDT</span>
                                    </li>
                                    <li>
                                        {/* 资金管理费率 */}
                                        <span>{t('DailyManagementFee')}</span>
                                        <span>{formatNumSplit(coinDetail?.info?.fundManagementRate * 100 || 0)}%</span>
                                    </li>
                                </ul>
                                <ul className={Style.lr}>
                                    <li>
                                        {/* 已发行代币 */}
                                        <span>{t('totalSupply')}</span>
                                        <span>{formatNumSplit(coinDetail?.info?.tokensIssued || 0)} {coinDetail?.info?.coinName?.toUpperCase()}</span>
                                    </li>
                                    <li>
                                        {/* 总资产价值 */}
                                        <span>{t('MarketCap')}</span>
                                        <span>{formatNumSplit(coinDetail?.info?.totalAssets || 0)} USDT</span>
                                    </li>
                                </ul>
                            </div>
                        }
                        {
                            !coinDetail?.isEtf
                            &&
                            <div className={Style.modal_list}>
                                <ul>
                                    <li>
                                        {/* 排名 */}
                                        <span>{t('rank')}</span>
                                        <span>{coinDetail?.info?.rank || 0}</span>
                                    </li>
                                    <li>
                                        {/* 流通量 */}
                                        <span>{t('CirculatingSupply')}</span>
                                        <span>{formatNumSplit(coinDetail?.info?.availableSupply || 0)}</span>
                                    </li>
                                    <li>
                                        {/* 总供应量 */}
                                        <span>{t('totalSupply')}</span>
                                        <span>{formatNumSplit(coinDetail?.info?.totalCoinSupply || 0)}</span>
                                    </li>
                                </ul>
                                <ul className={Style.lr}>
                                    <li>
                                        {/* 流通市值 */}
                                        <span>{t('MarketCap')}</span>
                                        <span>${formatNumSplit(coinDetail?.info?.marketCap || 0)}</span>
                                    </li>
                                    <li>
                                        {/* 最大供应量 */}
                                        <span>{t('MaximumSupply')}</span>
                                        <span>{formatNumSplit(coinDetail?.info?.maxSupply || 0)}</span>
                                    </li>
                                </ul>
                            </div>
                        }
                    </div>
                    {/* 相关链接 现货币种有，ETF币种没有 */}
                    {
                        !coinDetail?.isEtf
                        &&
                        <div className={Style.modal}>
                            <h3>{t('relatedLinks', { coinName })}</h3>
                            <div className={Style.modal_list}>
                                <ul className={Style.full}>
                                    <li>
                                        {/* 官网 */}
                                        <span>{t('OfficialWebsite')}</span>
                                        <div className={Style.link}>
                                        {
                                            coinDetail?.info?.website
                                            ?
                                            <Link href={safeNavigationUrl(coinDetail?.info?.website) || '#'} target="_blank" rel="noopener noreferrer">
                                                {coinDetail?.info?.website} <i className='iconfont icon-tiaozhuan'></i>
                                            </Link>
                                            :
                                            '--'
                                        }
                                        </div>
                                    </li>
                                    <li>
                                        {/* 区块链浏览器 */}
                                        <span>{t('explorer')}</span>
                                        <div className={Style.link}>
                                        {
                                            coinDetail?.info?.explorerList?.length > 0
                                            ?
                                            coinDetail?.info?.explorerList?.map((item, index)=>{
                                                return  (
                                                    <Link key={index} href={safeNavigationUrl(item) || '#'} target="_blank" rel="noopener noreferrer">
                                                        {item} <i className='iconfont icon-tiaozhuan'></i>
                                                    </Link>
                                                )
                                            })
                                            :
                                            '--'
                                        }
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    }
                    {
                        coinDetail?.market?.symbols
                        &&
                        <div className={Style.modal}>
                            <h3>{t('markets', { coinName })}</h3>
                            <div className={Style.modal_market}>
                                {
                                    coinDetail?.market?.symbols?.map((item, index) => {
                                        return (
                                            <div key={index} className={Style.spinBox}>
                                                <p>{item.baseCoin.toUpperCase()} / {item.quoteCoin.toUpperCase()}</p>
                                                <p className={classNames({
                                                    [Style.rose]: item.increase > 0,
                                                    [Style.fall]: item.increase < 0,
                                                    [Style.equal]: item.increase == 0
                                                })}
                                                >{item.currentPrice} <span>{parseFloat(item.increase * 100).toFixed(2)}%</span></p>
                                                <p>{t('24HVolume')}: {item?.dealVolume} {item?.baseCoin?.toUpperCase()} </p>
                                                <a href={`/trade/${item?.baseCoin?.toLowerCase()}_${item?.quoteCoin?.toLowerCase()}`} />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    }
                    {
                        coinDetail?.info?.description
                        &&
                        <div className={`${Style.modal} ${Style.coinDescriptionModal} ${isShowMore&&!isExtCoinDetail&&coinDetail.certikInfoVo?Style.coinDescription:''}`}>
                            <h3>{t('coinIntroduction', { coinFullName, coinName })}</h3>
                            <div ref={coinDescription} className={Style.modal_content} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(coinDetail?.info?.description)}} />
                            {
                                (isShowMore && coinDetail.certikInfoVo) &&
                                <div className={`${Style.coinDescriptionModal_maskExtend} ${isExtCoinDetail?Style.coinDescriptionModal_transparentBG:''}`}>
                                    {/* <p className={`${Style.coinDescriptionModal_maskExtend_moreBtn} ${isExtCoinDetail?Style.coinDescriptionModal_maskExtend_extPosition:Style.coinDescriptionModal_maskExtend_shinkPosition}`} onClick={exchangeCoinDetail}>
                                        <span>{isExtCoinDetail?t('CertikInfoVo.ViewLess'):t('CertikInfoVo.ViewMore')}</span>
                                        <Image className={isExtCoinDetail ? Style.coinDescriptionModal_maskExtend_moreBtn_yeup : Style.coinDescriptionModal_maskExtend_moreBtn_yedown} src={yellowDown} alt="" />
                                    </p> */}
                                </div>
                            }
                        </div>
                    }
                    {
                        (isShowMore && coinDetail.certikInfoVo) &&
                        <p className={`${Style.coinDescriptionModal_maskExtend_moreBtn} ${isExtCoinDetail?Style.coinDescriptionModal_maskExtend_extPosition:Style.coinDescriptionModal_maskExtend_shinkPosition}`} onClick={exchangeCoinDetail}>
                            <span>{isExtCoinDetail?t('CertikInfoVo.ViewLess'):t('CertikInfoVo.ViewMore')}</span>
                            <Image className={isExtCoinDetail ? Style.coinDescriptionModal_maskExtend_moreBtn_yeup : Style.coinDescriptionModal_maskExtend_moreBtn_yedown} src={yellowDown} alt="" />
                        </p>
                    }
                    {
                        coinDetail?.info.platform=='coinMarketCap'
                        &&
                        <div className={Style.powerby}>
                            <Link href={safeNavigationUrl(coinDetail?.info?.cmcUrl) || 'https://coinmarketcap.com/'} target="_blank">
                                Powered by: <Image src={cmcLogo} alt="CoinMarketCap" width={96} height={16} />
                            </Link>
                        </div>
                    }
                    {
                        coinDetail?.certikInfoVo && 
                        <>
                            <div className={Style.modal + ' ' + Style.saveEvaluate}>
                                <h3>{t('CertikInfoVo.SaveEvalue')}</h3>
                                {
                                    isMobileFlag &&
                                    <div className={Style.dataCertik}>
                                        <span>{t('CertikInfoVo.DataFrom')}</span>
                                        <a href={safeNavigationUrl(coinDetail.certikInfoVo.projectWebsite)}>
                                            <Image src={certikLogo} alt="save-icon" />
                                            <span>CERTIK</span>
                                        </a>
                                    </div>
                                }
                                <div className={Style.saveEvaluate_baseContent}>
                                    <Image src={judeLevelGrade(coinDetail?.certikInfoVo?.score)['iconUrl']} alt="save-icon" />
                                    <span className={Style.saveEvaluate_bigScore} style={{color: judeLevelGrade(coinDetail?.certikInfoVo?.score)['color']}}>{coinDetail?.certikInfoVo?.score}</span>
                                    <span className={Style.saveEvaluate_allScore}>/100</span>
                                </div>
                            </div>

                            <div className={Style.highlights}>
                                <p className={Style.highlights_modalTitle} style={{marginBottom: 0}} onClick={extendHighLights}>
                                    <span>{t('CertikInfoVo.HighlightsAlerts')}</span>
                                    <span className={`${Style.highlights_modalTitle_imgWrap} ${hightlightShow ? Style.highlights_modalTitle_up : Style.highlights_modalTitle_down}`}>
                                        <Image src={downUp} alt="" />
                                    </span>
                                </p>
                                <div className={`${Style.highlights_baseContent} ${!hightlightShow ? Style.highlights_bottomHide : ''}`}>
                                    <span>{t('CertikInfoVo.thirdParty')}</span>
                                    {
                                        !isMobileFlag &&
                                        <a href={safeNavigationUrl(coinDetail.certikInfoVo.projectWebsite)} target="_blank" rel="noreferrer">
                                            <Image src={certikLogo} alt="save-icon" />
                                            <span>CERTIK</span>
                                        </a>
                                    }
                                </div>
                                <div className={`${Style.highlights_highlightDetail} ${!hightlightShow ? Style.highlights_hidden : ''}`}>
                                    {
                                        coinDetail?.certikInfoVo?.highlights?.length>0 &&
                                        <div className={Style.highlights_highlightsList}>
                                            <p className={Style.highlights_highlightsList_listTitle}>{t('CertikInfoVo.HighlightsAlerts').split("&")[0]}</p>
                                            <ul>
                                                {
                                                    coinDetail.certikInfoVo?.highlights.length>0 &&
                                                    coinDetail.certikInfoVo?.highlights?.filter(item => {
                                                        return highlightsFileds.includes(item.label)
                                                    })
                                                    .map((item,index) => {
                                                        return (
                                                            <li key={index}>
                                                                {
                                                                    t(`CertikInfoVo.Highlights.${item.label}`, { data: `${item.data*100}%` })
                                                                }
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    }
                                    {
                                        coinDetail.certikInfoVo?.alerts.length>0 &&
                                        <div className={Style.highlights_alertsList}>
                                            <p className={Style.highlights_alertsList_listTitle}>{t('CertikInfoVo.HighlightsAlerts').split("&")[1]}</p>
                                            <ul>
                                            {
                                                coinDetail.certikInfoVo?.alerts.length>0 &&
                                                coinDetail.certikInfoVo?.alerts?.filter(item => {
                                                    return alertsFileds.includes(item.label)
                                                })
                                                .map((item,index) => {
                                                    return (
                                                        <li key={index}>
                                                            {
                                                                t(`CertikInfoVo.Alerts.${item.label}`, { data: `${item.data*100}%` })
                                                            }
                                                        </li>
                                                    )
                                                })
                                            }
                                            </ul>
                                        </div>
                                    }
                                </div>
                            </div>
                        </>
                    }
                </div>
                :
                <Loading />
            }
            </div>
        </>
    )
};

export default PriceDetail;
