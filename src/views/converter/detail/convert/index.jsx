'use client';

import { useState, useEffect, useRef } from 'react';
import Style from './index.module.scss';
import Image from '@components/image';
import { useRouter } from '@src/lib/navigation';
import convert from '@static/images/converter/convert.png';
import coin_icon from '@static/images/converter/coin_icon.png';
import arrow_right from '@static/images/converter/arrow_right.png';
import CustomSelect from '@components/select';
import { coinIconPath, formatDate, formatNumSplit, legalIconPath } from '@utils/common';
import useTranslation from 'next-translate/useTranslation';
import { getFiatName, getCoinName, getConverterCalculator } from '@service/converter';

const Convert = ({ fromCoinCount, fromName, toName, rateInfo, resInfo, isMobile, type, onConvertChange }) => {

    const { t } = useTranslation('converter');
    const router = useRouter();
    const [fromInput, setFromInput] = useState(0);
    const [toInput, setToInput] = useState(0);
    const [convertSwitch, setConvertSwitch] = useState(true);
    const [selectFromValue, setSelectFromValue] = useState(0); // 数组索引
    const [selectToValue, setSelectToValue] = useState(0); // 数组索引
    const [selectFromOption, setSelectFromOption] = useState({});
    const [selectToOption, setSelectToOption] = useState({});
    const [rate, setRate] = useState();

    // 币种列表
    const [baseCoinList, setBaseCoinList] = useState([]);

    // 法币列表
    const [baseLegalList, setBaseLegalList] = useState([]);

    useEffect(() => {
        getCoinNameList()
        getFiatNameList()
    }, [fromName, toName]);

    useEffect(() => {
        // 初始化from to 输入框 根据汇率
        if (rateInfo && fromCoinCount) {
            setFromInput(fromCoinCount)
            setToInput(rateInfo?.amount)
            setRate(rateInfo?.rate)
        }
    }, [rateInfo, fromCoinCount]);

    useEffect(() => {
        if (resInfo) {
            setConvertSwitch(resInfo?.quoteCoin?.fiat)
        }
    }, [resInfo]);

    const getCoinNameList = () => {
        getCoinName().then(res => {
            if (res.code === 0) {
                let array_ = []
                res.data.forEach((item, index) => {
                    let obj = {
                        label: item?.name,
                        value: item?.name,
                        fullName: item?.fullName
                    }
                    array_.push(obj)
                    // 初始化选择
                    if (fromName == obj.label.toUpperCase()) {
                        setSelectFromOption(obj)
                        setSelectFromValue(index)
                    }
                })
                setBaseCoinList(array_)
            };
        });
    }

    const getFiatNameList = () => {
        getFiatName().then(res => {
            // resInfo?.baseCoin?.fiat false
            if (res.code === 0) {
                let array_ = []
                res.data.forEach((item, index) => {
                    let obj = {
                        label: item?.name,
                        value: item?.name
                    }
                    array_.push(obj)

                    // 初始化选择
                    if (toName === obj.label.toUpperCase()) {
                        setSelectToOption(obj)
                        setSelectToValue(index)
                    }
                })
                setBaseLegalList(array_)
            };
        });
    }

    // 代币 法币 下拉框切换时候 查询汇率计算信息
    const getCalculator = (base, quote, amount) => {
        getConverterCalculator({
            base,
            quote,
            amount
        }).then(res => {
            if (res.code === 0) {
                setToInput(res?.data?.amount || 0)
                setRate(res?.data?.rate || 0)
            };
        });
    }

    // From变动 、To变动 、fromInput变动、toInput变动 、 convertSwitch变动
    const handleConvertChange = (fromInput_, toInput_, selectFromOption_, selectToOption_, convertSwitch_) => {
        onConvertChange && onConvertChange(fromInput_, toInput_, selectFromOption_, selectToOption_, convertSwitch_)
    }

    const fromValueChange = (e) => {
        let val = e.target.value
        setFromInput(val)
        setToInput(val == '' ? '' : rate * parseFloat(val))
        handleConvertChange(val, toInput, selectFromOption, selectToOption, convertSwitch)
    }

    const toValueChange = (e) => {
        let val = e.target.value
        setToInput(val)
        setFromInput(val == '' ? '' : parseFloat(val) / rate)
        handleConvertChange(fromInput, val, selectFromOption, selectToOption, convertSwitch)
    }

    // 选择代币
    const handleCoinSelect = (item) => {
        getCalculator(item.label, selectToOption.label, fromInput)
        setSelectFromOption(item)
        baseCoinList.forEach((list, index) => {
            if (item.label === list.label) {
                setSelectFromValue(index)
            }
        })

        if (type == 'index') {
            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_HomePage_convert_coin_Button_Click') : window.gtag('event', 'Web_Converter_HomePage_convert_coin_Button_Click'));
        } else {
            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_convert_coin_Button_Click') : window.gtag('event', 'Web_Converter_convert_coin_Button_Click'));
        }
        handleConvertChange(fromInput, toInput, item, selectToOption, convertSwitch)
    };

    // 选择法币
    const handleLegalCoinSelect = (item) => {
        getCalculator(selectFromOption.label, item.label, fromInput)
        setSelectToOption(item)
        baseLegalList.forEach((list, index) => {
            if (item.label === list.label) {
                setSelectToValue(index)
            }
        })
        if (type == 'index') {
            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_HomePage_convert_fait_Button_Click') : window.gtag('event', 'Web_Converter_HomePage_convert_fait_Button_Click'));
        } else {
            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_convert_fait_Button_Click') : window.gtag('event', 'Web_Converter_convert_fait_Button_Click'));
        }
        handleConvertChange(fromInput, toInput, selectFromOption, item, convertSwitch)
    };

    const renderCoinOption = (item, isCoin) => (
        <div className={Style.search_select_coin}>
            <Image width={16} height={16} alt='coin' src={isCoin ? coinIconPath(item.label) : legalIconPath(item.label)} />
            <span>{item?.label?.toUpperCase()}</span>
            {/* <div>{item?.fullName}</div> */}
        </div>
    );

    // 代币
    const renderCoinSelectOption = (item) => (
        <div className={Style.coinLeft}>
            <Image className={Style.iconImg} width={32} height={32} src={coinIconPath(item?.label)} alt='coin' />
            <div className={Style.coinName}>
                <div className={Style.symbol}>{item?.label.toUpperCase()}</div>
                <div className={Style.network}>{item?.fullName}</div>
            </div>
            <Image className={Style.arrImg} width={10} height={10} src={coin_icon} alt='' />
        </div>
    );

    // 法币
    const renderLegalSelectOption = (item) => (
        <div className={Style.coinLeft}>
            <Image className={Style.iconImg} width={32} height={32} src={legalIconPath(item?.label)} alt='coin' />
            <div className={Style.coinName}>
                <div className={Style.symbol}>{item?.label.toUpperCase()}</div>
            </div>
            <Image className={Style.arrImg} width={10} height={10} src={coin_icon} alt='' />
        </div>
    );

    // 异常没有数据下拉框 默认
    const renderCoinSelectOptionNull = () => (
        <div className={Style.coinLeft_null}>
            <Image width={10} height={10} src={coin_icon} alt='' />
        </div>
    );

    const handleTrans = () => {
        setConvertSwitch(!convertSwitch)
        // 切换 只有 to 变化
        let val = convertSwitch ? parseFloat(fromInput) / rate : parseFloat(fromInput) * rate
        console.log(parseFloat(fromInput) / rate, ' parseFloat(fromInput) / rate')
        setToInput(val)

        if (type == 'index') {
            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_HomePage_convert_change_Button_Click') : window.gtag('event', 'Web_Converter_HomePage_convert_change_Button_Click'));
        } else {
            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_convert_change_Button_Click') : window.gtag('event', 'Web_Converter_convert_change_Button_Click'));
        }
        handleConvertChange(fromInput, toInput, selectFromOption, selectToOption, !convertSwitch)
    }

    const getConverterPath = () => {
        let strFrom = fromInput === '' ? '1-' : fromInput + '-'
        let str_ = convertSwitch ? selectFromOption?.label + '-to-' + selectToOption?.label : selectToOption?.label + '-to-' + selectFromOption?.label
        return strFrom + str_
    }

    return (
        <>
            <div className={Style.component}>
                <div className={Style.content}>
                    <h2> {t('home.converter_name')}</h2>
                    <div className={Style.from}>
                        <h3>{convertSwitch ? t('home.from') : t('home.to')}</h3>
                        <div className={Style.coinInfo}>
                            {/* from 代币 */}
                            {convertSwitch && <CustomSelect
                                renderLabelProp={option => option ? renderCoinSelectOption(option) : renderCoinSelectOptionNull()}
                                showSearch={true}
                                options={baseCoinList}
                                defaultValue={selectFromValue}
                                styleP={{ opt: Style.opt, com: Style.com, selList: Style.selList }}
                                onSelect={(val) => {
                                    handleCoinSelect(val)
                                }}
                                renderListOption={item => renderCoinOption(item, true)}
                            />}
                            {/* to 法币 */}
                            {!convertSwitch && <CustomSelect
                                renderLabelProp={option => option ? renderLegalSelectOption(option) : renderCoinSelectOptionNull()}
                                showSearch={true}
                                options={baseLegalList}
                                defaultValue={selectToValue}
                                styleP={{ opt: Style.opt, com: Style.com, selList: Style.selList }}
                                onSelect={(val) => {
                                    handleLegalCoinSelect(val)
                                }}
                                renderListOption={item => renderCoinOption(item, false)}
                            />}
                            <input type='number' className={Style.left_input} value={fromInput} onChange={(e) => fromValueChange(e)} placeholder='0.00' />
                        </div>
                    </div>
                    <div className={Style.tranBtn} onClick={() => handleTrans()}>
                        <Image width={24} height={24} src={convert} alt='convert' />
                    </div>
                    <div className={Style.to}>
                        <h3>{convertSwitch ? t('home.to') : t('home.from')}</h3>
                        <div className={Style.coinInfo}>
                            {/* to 法币 */}
                            {convertSwitch && <CustomSelect
                                renderLabelProp={option => option ? renderLegalSelectOption(option) : renderCoinSelectOptionNull()}
                                showSearch={true}
                                options={baseLegalList}
                                defaultValue={selectToValue}
                                styleP={{ opt: Style.opt, com: Style.com, selList: Style.selList }}
                                onSelect={(val) => {
                                    handleLegalCoinSelect(val)
                                }}
                                renderListOption={item => renderCoinOption(item, false)}
                            />}
                            {/* from 代币 */}
                            {!convertSwitch &&
                                <CustomSelect
                                    renderLabelProp={option => option ? renderCoinSelectOption(option) : renderCoinSelectOptionNull()}
                                    showSearch={true}
                                    options={baseCoinList}
                                    defaultValue={selectFromValue}
                                    styleP={{ opt: Style.opt, com: Style.com, selList: Style.selList }}
                                    onSelect={(val) => {
                                        handleCoinSelect(val)
                                    }}
                                    renderListOption={item => renderCoinOption(item, true)}
                                />
                            }
                            <input className={Style.left_input} value={toInput} onChange={(e) => toValueChange(e)} placeholder='0.00' />
                        </div>
                    </div>
                    <div className={Style.convert_btn} onClick={() => {
                        // 埋点 区分 H5&PC
                        if (type == 'index') {
                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_HomePage_convert_convert_Button_Click') : window.gtag('event', 'Web_Converter_HomePage_convert_convert_Button_Click'));
                        } else {
                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_convert_convert_Button_Click') : window.gtag('event', 'Web_Converter_convert_convert_Button_Click'));
                        }
                        router.push(`/converter/${getConverterPath()}`)
                    }}>
                        {t('home.converter_btn')}
                        <Image width={24} height={24} src={arrow_right} alt='' />
                    </div>
                    <div className={Style.times}>{t('home.lastUpdated')} {formatDate(rateInfo?.lastUpdate, 'yyyy/MM/dd hh:mm')}</div>
                </div>

            </div>
        </>
    )
};

export default Convert;