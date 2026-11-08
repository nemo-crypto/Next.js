import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

import Style from './index.module.scss';
import classNames from 'classnames';
import Loading from '@components/loading';
import CustomSelect from '@components/select';
import Modal from '@components/modal';
import { toast } from '@components/toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import DontCharts from './DonutChart'
import BigNumber from 'bignumber.js';




import RulesList from './rules'


import { coinIconPath, formatDate, formatNumSplit } from '@utils/common';
import Cookies from 'js-cookie';
import { token } from '@constants/cookies';
import useTranslation from 'next-translate/useTranslation';




import {
    getOrder_Rule, doOrder,
    getGetDefaultInvest,
    UpdateOrder,
    getRunningOrder,
    getOrderDetail,
    getInvestOverview,
    getRecommend,
    getInvestList,
    getColorBgs,
} from '@service/autoInvest';
const AutoInvest = () => {
    const [loading, setLoading] = useState(true);
    const [tokenStr, setTokenStr] = useState('');
    const [investInfo, setInvestInfo] = useState({});

    const [modalVisible, setModalVisible] = useState(false);
    const [noticeModalVisible, setNoticeModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [terminateModalVisible, setTerminateModalVisible] = useState(false)
    const [viewModalLoading, setViewModalLoading] = useState(false);


    const [modalType, setModalType] = useState('');
    const [modalOkText, setModalOkText] = useState('');
    const [modalCancelText, setModalCancelText] = useState('');



    // 百分比输入框是否更改过
    const [inputEdit, setInputEdit] = useState(false);
    const [amountEdit, setAmountEdit] = useState(false)
    // 保持数据不清空
    const [holdData, setHoldData] = useState(false);
    const [rules, setRules] = useState({});
    const [hasRead, setHasRead] = useState(false);
    const [planPageState, setPlanPageState] = useState({
        isSwiperBegin: true,
        isSwiperEnd: false
    })

    // 币种列表
    const [baseCoinList, setBaseCoinList] = useState([]);
    const [colorBgs,setColorBgs] =useState([])



    //投资概况
    const [overViewInfo, setOverViewInfo] = useState({})


    //推荐

    const [recomInfo, setRecomInfo] = useState([])



    const [investList, setInvestList] = useState([])
    const [lessInvestList, setLessInvestList] = useState([])
    const [fullInvestList, setFullInvestList] = useState([])
    const [showHasMore,setShowHasMore] = useState(false)

    const [runningOrderInfo, setRunningOrderInfo] = useState([])

    const [blance, setBlance] = useState('')
    const [frequency, setFrequency] = useState([])
    const [maxAmount, setMaxAmount] = useState(0)
    const [planViewData, setPlanViewData] = useState(
        {
            "coins": [
                {
                    coin: 'btr',
                    "proportion": 100
                },
            ],
            "frequency": "every_hour",
            "amount": "15"
        }
        // {}
    )
    const [defaultPlanViewData, setDefaultPlanViewData] = useState({})
    const [proportionTip, setProportionTip] = useState(false)

    // amoutTip={
    //     min,
    //     max
    // }
    const [minAmountTip, setMinAmountTip] = useState(false);
    const [maxAmountTip, setMaxAmountTip] = useState(false);
    const [blanceTip, setBlanceTip] = useState(false);

    const [orderId, setOrderId] = useState('');
    const [terminateOrderId, setTerminateOrderId] = useState('');
    const [enbaleSumbit, setEnbaleSumbit] = useState(false)




    const { t, lang } = useTranslation('autoinvest');

    const swiperRef = useRef(null);





    //下单规则
    const fetchOrder_Rule = useCallback(async () => {
        const fetchData = await getOrder_Rule();

        if (fetchData?.code == 0) {
            const ruleInfo = fetchData?.data || {};

            setBlance(ruleInfo.balance || 0);
            setMaxAmount(ruleInfo.balance < ruleInfo.maxAmount ? ruleInfo.balance : ruleInfo.maxAmount || 0)
            setFrequency(ruleInfo.frequency || [])
            let _coin = ruleInfo.coins || [];
            _coin.map(item => { item.value = item.coin; item.label = item.coin });
            setBaseCoinList(_coin)

        };
    }, []);



    // 收益总览
    // todo  配合  React.memo
    const fetchInvestOverview = useCallback(async () => {
        const fetchData = await getInvestOverview();

        if (fetchData?.code != 0) return

        const overViewInfo = fetchData?.data || {};
        setOverViewInfo(overViewInfo);


    }, []);


    //    默认下单币对
    const fetchDefault = async () => {
        const fetchData = await getGetDefaultInvest();

        if (fetchData?.code == 0) {
            const dataInfo = fetchData?.data || {};
            dataInfo.amount= '';
            let planViewData = JSON.parse(JSON.stringify(dataInfo))
            let defaultPlanViewData = JSON.parse(JSON.stringify(dataInfo))
            
            setPlanViewData(planViewData)
            setDefaultPlanViewData(defaultPlanViewData)
        };
    };



    //    在投订单
    const fetchRunningOrder = useCallback(async () => {
        const param = {
            pageNum: 1,
            pageSize: 100
        }
        const fetchData = await getRunningOrder(param);

        if (fetchData?.code == 0) {
            const runningOrderInfo = fetchData?.data || {};

            setRunningOrderInfo(runningOrderInfo.data || [])


        };
    }, []);
    // 推荐
    const fetchRecommend = useCallback(async () => {

        const fetchData = await getRecommend();

        if (fetchData?.code == 0) {
            const RecomInfo = fetchData?.data || {};
            // RecomInfo[1].coins=[
            //     {coin: "btc", proportion: 10},
            //     {coin: "btc", proportion: 10},
            //     {coin: "btc", proportion: 10},
            //     {coin: "btc", proportion: 10},
            //     {coin: "btc", proportion: 10},
            //     {coin: "btc", proportion: 10},
            //     {coin: "btc", proportion: 10},
            //     {coin: "btc", proportion: 10},
            //     {coin: "btc", proportion: 10},
            //     {coin: "btc", proportion: 10}]

            //     RecomInfo[0].incomeProportion = -.020;
            setRecomInfo(RecomInfo)
        };
    }, []);
    //  可投币种列表
    const fetchInvestList = useCallback(async () => {
        const param = {
            pageNum: 1,
            pageSize: 100
        }
        const fetchData = await getInvestList(param);

        if (fetchData?.code == 0) {
            let _investInfo = fetchData?.data || {};

            _investInfo.data = modifyCheckData(_investInfo.data)

            // setLessInvestList([..._investInfo.data].slice(0,10))
            setInvestList([..._investInfo.data].slice(0,10))

            setFullInvestList([..._investInfo.data])
            
            setShowHasMore([..._investInfo.data].length>10)

            // setInvestList(_investInfo.data || [])
        };
    }, []);

    const fetchColorBgs = async ()=>{
        const fetchData = await  getColorBgs();
        if (fetchData?.code == 0) {
            let _Info = fetchData?.data || {};

            setColorBgs(_Info || [])
        };
    }

    //  获取可投币种的最大收益周期


    //     data.map(item => {
    //         const numbers = [item.rate30,item.rate90,item.rate180];
    //        max = Math.max(...numbers);
    //        if (item.rate30==max) {
    //            return 'rate30'
    //        } else if (item.rate90) {
    //            return 'rate90'
    //        } else if (item.rate180) {
    //            return 'rate180'
    //        }

    //    })
    const modifyCheckData = (data) => {
        return data.map((item) => {

            // return Math.max([item['rate30'], item['rate90'], item['rate180']])
            // // 获取收益最大的周期，并返回周期
            // // todo

            const maxRate = (() => {
                const max = Math.max(item.rate30, item.rate90, item.rate180);

                if (item.rate30 == max) {
                    return 'rate30'
                } else if (item.rate90 == max) {
                    return 'rate90'
                } else if (item.rate180 == max) {
                    return 'rate180'
                }
            })()
            // const maxRate = ['rate30', 'rate90', 'rate180'].reduce((max, rate) => {
            //     // 验证下
            //     return Math.max( item[max],item[rate])
            //     // if (item[rate] > item[max]) {
            //     //     return rate;
            //     // }
            //     // return max;
            // }, 'rate30');

            return {
                ...item,
                btData: times100(item[maxRate]),
                rateChecked: maxRate,
            };
        });
    };





    /**
     * 
     * @param {*} coin 
     * @returns 
     * 返会对应的index
     */
    const getBaseCoinIndex = (coin) => {

        let match = baseCoinList.findIndex((item) => item.value == coin.toLowerCase());
        // 如果没有匹配到，就选中列表的第一个
        return match === -1 ? 0 : match;
    }

    // 根据币获取rate
    const getRateByCoin = (coin) => {
        let obj = baseCoinList.find((item) => item.value == coin.toLowerCase());
        return times100(obj?.ppRate || 0);
    }

    const setStyleByNO = (val, greyZero) => {
        if (val < 0) {
            return Style.down;
        } else if (val == 0) {
            if (greyZero) {
                return Style.zero
            } else {
                return Style.up
            }
        } else {
            return Style.up
        }
    }



    const SubmitData = async (status) => {
        // if (!orderId && !terminateOrderId) return;

        const params = terminateOrderId?{}:{ ...planViewData }

       
        if (status) {
            params.status = status;
           
        }

        if(status==2){
            params.id = terminateOrderId
        }else{
            params.orderId = orderId;
        }
        let orderMethod = (params.orderId||terminateOrderId) ? UpdateOrder : doOrder;

        
        const fetchData = await orderMethod({ ...params });
        // 先处理异常 ，http.js 统一处理  新框架处理
        // ToDo
        // code 11110   
        if (fetchData?.code == 0) {
            let msg='';
            if(status==2){
                msg = t('ORDER_CLOSE')
            }else if(orderId){
                msg = t('EditedSuccessfully')
            }else{
                msg = t('planCreatedSuccessfully')
            }
            toast({ type: 'success', msg })
            setModalVisible(false)
            fetchRunningOrder()
            setTerminateOrderId('')
            setOrderId('')
        } else {
            let msg = getMsgByCode(fetchData?.code)
            toast({ type: 'warn', msg: (msg || fetchData?.code) })
        }
    }
    const getCoinImgs = (coins = []) => (
        <div className={Style.imgs}>
            {coins.map((item, index) => (
                <Image key={index} src={coinIconPath(item.coin)} width='16' height='16' alt=""
                    // todo
                    onError={e => e.target.src = "/images/demo-coin.svg"}

                />
            ))}
        </div>
    )
    // 获取开关状态
    const getSwitch = (id, status) => (
        <div
            onClick={() => setOrderStatus(id, status)}
            className={`${Style.switch} ${status == 0 ? Style.dis : ''}`}
        >
            <div className={Style.toogle}></div>
        </div>
    );


    // 修改订单状态
    const setOrderStatus = useCallback(async (id, status) => {
        let info = getOrderById(id);
        let param = {
            id,
            status: !status - 0,
            coins: info.coins,
            frequency: info.frequency,
            amount: info.amount,
        }


        const fetchData = await UpdateOrder(param);

        if (fetchData?.code == 0) {
            let succMsg = '';
            switch (status) {
                case 0:
                    succMsg = t('planWillContinueUntilUSDT')
                    break;
                case 1:
                    succMsg = t('successfullySuspended');
                    break;
                default:

                    break;
            }
            toast({ type: 'success', msg: succMsg || fetchData?.code + '' })
            fetchRunningOrder()

        } else {
            let msg = getMsgByCode(fetchData?.code) || fetchData?.code
            toast({ type: 'warn', msg })
        };
    }, [runningOrderInfo]);

    const getOrderById = (id) => {
        let order = runningOrderInfo.find((item) => item.id === id);
        return order;
    }

    // 删除掉推荐币种里的 不支持理财的币
    const checkCoinValid = (planViewData) => {
        // 遍历 planViewData.coins
        for (let i = planViewData.coins.length - 1; i >= 0; i--) {
            const coinData = planViewData.coins[i];
            const matchingBaseCoin = baseCoinList.find((baseCoin) => baseCoin.coin === coinData.coin.toLowerCase());

            if (!matchingBaseCoin) {
                // 如果没有找到匹配的 baseCoin，删除当前 coinData
                planViewData.coins.splice(i, 1);
            }
        }

        // 假如都下掉了
        if (planViewData.coins.length === 0) {
            // 如果 coins 的长度为 0，插入 baseCoinList 的第一个元素并将 proportion 设置为 100
            const firstBaseCoin = baseCoinList[0];
            planViewData.coins.push({
                coin: firstBaseCoin.coin,
                proportion: "100",
            });
        }

        return planViewData;



    }

    const doRecommend = (id) => {
        if (!tokenStr) {
            jumpToLogin();
        } else {
            let info = getRecomById(id);
            let _planViewData = { ...info }
            _planViewData.coins = JSON.parse(JSON.stringify(info.coins));
            _planViewData.frequency = defaultPlanViewData.frequency;
            

            setPlanViewData(JSON.parse(JSON.stringify(_planViewData)));
            setHasRead(!hasRead)
            setModalVisible(true)
        }
    }
    const getRecomById = (id) => {
        let order = recomInfo.find((item) => item.id === id);
        // 返回找到的订单或者undefined
        return order;
    }


    const editPlan = (id) => {
        let info = getOrderById(id);
        setOrderId(id);
        setPlanViewData(JSON.parse(JSON.stringify(info)));
        setHasRead(false)
        setModalVisible(true)

    }
    // 监听变化
    // useEffect（{}, [...info]）


    const viewPlan = useCallback(async (orderId) => {

        setViewModalVisible(true)
        setViewModalLoading(true)
        setOrderId(orderId)
        const param = {
            orderId
        }
        const fetchData = await getOrderDetail(param);

        if (fetchData?.code == 0) {

            const planInfo = fetchData?.data || {};
            setPlanViewData(Object.assign({}, planInfo))


        };
    }, []);

    const coinDelete = (index) => planViewData.coins.length > 1 && deleteCoin(index);

    const CheckClick = () => setHasRead(!hasRead)

    const setProp = (index, e) => {
        setInputEdit(true)
        var regex = /(?:^|[^\\d])([1-9][0-9]?|100)(?:$|[^\\d])/g;
        // 使用match方法，返回一个包含匹配项的数组
        e.target.value = e.target.value.match(regex);

        planViewData.coins[index].proportion = e.target.value - 0;
        // let maxMinInvestment = getMinAmount();

        // let coins = planViewData.coins;
        // const proportionCount = coins.reduce((total, item) => total + item.proportion, 0);

        // let showProportionTip = 100 != proportionCount;
        // let showMinAmountTip = planViewData.amount < maxMinInvestment;



        // setProportionTip(showProportionTip);
        // setMinAmountTip(showMinAmountTip);


        setPlanViewData(Object.assign({}, planViewData));
    }
    const changeAmount = (e) => {
        setAmountEdit(true)
        // 输入0-9
        planViewData.amount = e.target.value.replace(/[^0-9]/g, '');
        let maxMinInvestment = getMinAmount();
        //小于最大可投
        let showMinAmountTip = planViewData.amount < maxMinInvestment;

        let showMaxAmountTip = checkMaxAmountTip();
        setMinAmountTip(showMinAmountTip);
        setMaxAmountTip(showMaxAmountTip);
        setPlanViewData(Object.assign({}, planViewData));
    }
    const checkMaxAmountTip = () => {
        // 小于余额 并且 小于最大可投
        // return planViewData.amount >= blance || planViewData.amount >= maxAmount;
        return planViewData.amount > maxAmount && planViewData.amount <= blance;
    }
    const getMinAmount = (tempData) => {
        let sourcePlanViewData = tempData || planViewData;
        // 遍历 planViewData.coins，查找对应的 minAmount
        const minInvestments = sourcePlanViewData?.coins.map((coinData) => {
            const baseCoin = baseCoinList.find((baseCoin) => baseCoin.coin === coinData.coin.toLocaleLowerCase());
            if (baseCoin) {
                const minAmount = baseCoin.minAmount;
                const proportion = parseFloat(coinData.proportion || 0);
                const minInvestment = proportion ? Math.ceil(minAmount / (proportion / 100)) : 0;
                return minInvestment;
            }
            return 0; // 如果未找到匹配的 coin，则默认最小可投为 0
        });

        // 计算最小可投的最大值
        const maxMinInvestment = Math.max(...minInvestments);

        return maxMinInvestment;


    }
    const checkData = () => {

        let coins = planViewData.coins;
        const proportionCount = coins.reduce((total, item) => total + item.proportion, 0);
        let maxMinInvestment = getMinAmount();


        let showProportionTip = 100 != proportionCount;
        let showMinAmountTip = planViewData.amount < maxMinInvestment;
        let showMaxAmountTip = checkMaxAmountTip();


        return !showProportionTip && !showMinAmountTip && !showMaxAmountTip && hasRead



    }
   
    // todo  计算比例用单独函数处理
    const addCoin = () => {

        let coinsAll = baseCoinList;
        let coins = [...planViewData.coins];
        // coins的长度
        let len = coins.length;
        if (len >= 10) {
            toast({ type: 'warn', msg: t('max10') });
            return;
        }

        let lenAll = coinsAll.length;
        // coins中的所有 coin 的值
        let values = coins.map(item => item.coin.toLowerCase());

        for (let i = 0; i < lenAll; i++) {
            // 获取 coinsAll 中的第 i 个元素的 value
            let value = coinsAll[i].value;
            // 如果 value 不在 values 中，说明 coins 中不存在这个 coin
            if (!values.includes(value)) {
                // 在这里计算新 coin 的 proportion
                let totalProportion = coins.reduce((acc, curr) => acc + curr.proportion, 0);
                let remain = 100 - totalProportion;
                let newProportion = inputEdit ? Math.max(remain, 1) : Math.floor(100 / coins.length);

                // 将这个 coin 添加到 coins 中，使用计算好的 proportion
                coins.push({ coin: value, proportion: newProportion });

                if (!inputEdit) {
                    // 如果不是编辑模式，按照原来的逻辑计算其他 coin 的 proportion
                    let avg = Math.floor(100 / coins.length);
                    remain = 100 - avg * coins.length;
                    for (let j = 0; j < coins.length; j++) {
                        coins[j].proportion = j === 0 ? avg + remain : avg;
                    }
                }

                break;
            }
        }
        // !amountEdit && (planViewData.amount = getMinAmount(planViewData))
        // planViewData.amount= ''
        !amountEdit && (planViewData.amount = '')

        setPlanViewData(JSON.parse(JSON.stringify({ ...planViewData, coins })));

    }
   
    const deleteCoin = (index) => {
        let coins = planViewData.coins;
    
        // 如果 inputEdit 为 true，直接删除 coin，不调整 proportion
        if (inputEdit) {
            coins.splice(index, 1);
        } else {
           
            // 使用 splice 方法，从 coins 中删除指定的 coin
            coins.splice(index, 1);
    
           
            // coins 的新长度
            let newLen = coins.length;
    
            // 如果 coins 长度大于 0，将剩余的 proportion 平均分给其他 coin
            if (newLen > 0) {
                let avg = Math.floor(100 / newLen);
                let extra = 100 - avg * newLen;
    
                for (let i = 0; i < newLen; i++) {
                    coins[i].proportion = avg + (i === 0 ? extra : 0);
                }
            }
        }
    
        setPlanViewData(JSON.parse(JSON.stringify(planViewData)));
    }
    
    const filterPPCoin = ()=>{
        // BaseCoinList=[{
        //     coin:'btc',
        //     ppRate:0
        // }]
        // planViewData.coins=[{
        //     coin:'btc',
        // }]

        const filteredCoins = planViewData.coins.filter((coinData) => {
            const baseCoin = baseCoinList.find((baseCoin) => baseCoin.coin === coinData.coin);
            return baseCoin && baseCoin.ppRate > 0;
          });

          return filteredCoins;
    }



    // 币种选择
    const renderCoinOption = (item) => (
        <div className={Style.search_select_coin}>
            {
                item.label === 'All'
                    ?
                    <em style={{ width: '16px', marginRight: '5px' }} />
                    :
                    <img width='16' height='16' style={{ width: '16px', height: '16px' }} src={coinIconPath(item.label)} />

            }
            <span>{item.label.toUpperCase()}</span>
        </div>
    );

    // 选择币
    const handleBaseCoinSelect = (item, index) => {
        if (index < 0 || index > planViewData.coins.length) {
            return;
        }
        let editPlanView = JSON.parse(JSON.stringify(planViewData));
        const targetCoin = editPlanView.coins[index];

        if (targetCoin) {
            targetCoin.coin = item.coin;
        }
        setPlanViewData(JSON.parse(JSON.stringify(editPlanView)))

    };
    const fillColorRectangles = (coins) => {
        const proportionCount = coins.reduce((sum, coin) => sum + coin.proportion, 0);

        const calculateWidth = (proportion) => {
            // 根据proportion计算宽度

            return `${proportion / proportionCount * 100}%`;
        };
        return (
            <div className={Style.container}>
                {coins.map((coin, index) => (
                    <div
                        key={index}
                        //   className={`${Style['coinColor'+index+1]}`}
                        className={`${Style.rectangle} ${Style['coinColor' + (index + 1)]}`}
                        // style={{backgroundColor:colorBgs?.[index]||'unset'}}

                        style={{ width: calculateWidth(coin.proportion),backgroundColor:colorBgs?.[index]||'auto' }}
                    //   style={{ width: '50%' }}
                    >

                    </div>
                ))}
            </div>
        );
    }

    const fillColorBg = (coins) => {
        const proportionCount = coins.reduce((sum, coin) => sum + coin.proportion, 0);

        const calculateWidth = (proportion) => {
            // 根据proportion计算宽度

            return `${proportion / proportionCount * 100}%`;
        };
        return (
            <div className={Style.fcpContainer}>
                {coins.map((item, index) => (
                    <div
                        key={index}
                        className={Style.coinbox}

                    >
                        <div className={`${Style['coinColor' + (index + 1)]}  ${Style.fcpCoin} `} style={{backgroundColor:colorBgs?.[index]||'auto'}} ></div>
                        <div className={Style.colorName} >{item.coin.toUpperCase()}</div>
                        <div className={Style.percent} >{(item.proportion)}%</div>

                    </div>
                ))}
            </div>
        );
    }
    const getmodalContent = (modalType) => {
        let modalDiv = <div></div>

        switch (modalType) {
            case 'notice':
                // modalDiv = getNoticeContent();
                modalDiv = <div className={Style.modalnotice + " "}>

                    <div className={Style.noticeConBox} >
                    <div className={Style.noticeCon}>

                        <div className={Style.noticeline}>
                            <div className={Style.noticeIndex}>1.</div>
                            <div className={Style.noticeText}>{t('Agreement1')}</div>
                        </div>
                        <div className={Style.noticeline}>
                            <div className={Style.noticeIndex}>2.</div>
                            <div className={Style.noticeText}>{t('Agreement2')}</div>
                        </div>
                        <div className={Style.noticeline}>
                            <div className={Style.noticeIndex}>3.</div>
                            <div className={Style.noticeText}>{t('Agreement3')}</div>
                        </div>
                        <div className={Style.noticeline}>
                            <div className={Style.noticeIndex}>4.</div>
                            <div className={Style.noticeText}>{t('Agreement4')}</div>
                        </div>
                        <div className={Style.noticeline}>
                            <div className={Style.noticeIndex}>5.</div>
                            {/* <div className={Style.noticeText}>{t('Agreement5')}</div> */}
                            <div className={Style.noticeText} dangerouslySetInnerHTML={{ __html: t('Agreement5') }} />

                        </div>
                    </div>
                    </div>
                    <div className={Style.noticebtn} >

                        <div className={Style.confirm + "  " + Style.btn} onClick={() => {
                            setNoticeModalVisible(false)
                            setModalVisible(true)

                        }} >{t('Got_it')}</div>
                    </div>
                </div>
                break;
            case 'edit':
                modalDiv = <div className={Style.modalEdit + " "}>
                    <div className={Style.planScrollBox} >
                    <div className={`${Style.planScroll}  `}>
                        <div className={Style.planHead}>
                            <div className={Style.planHeadLeft}>{t('Select_coins')}</div>
                            <div className={Style.planHeadRight}>{t('Interests_rate')}
                            <div className={Style.tipContent}>
                                        <em>{t('The_flexible_interests_rate_of_this_currency_in_Power_Piggy')}</em>
                                    </div>
                            </div>
                        </div>
                        <div className={Style.planBody}>
                            {
                                planViewData?.coins?.map((item, index) => {
                                    return <div key={index} className={Style.planLine}>
                                        <div className={Style.planlineLeft}>
                                            <div className={Style.planCoin}>
                                                {/* <div className={Style.Coinimg}>
                                    {getCoinImgs()}
                                </div>
                                <div className={Style.CoinName}>
                                    <div className={Style.CoinText}>BTC</div>
                                    <i className='iconfont icon-arrow-down ' ></i>
                                </div> */}

                                                <div className={Style.coinSelect} >
                                                    <CustomSelect
                                                        renderLabelProp={option => option ? renderCoinOption(option) : 'All'}
                                                        showSearch={true}
                                                        options={baseCoinList}
                                                        key={item.coin + item.index}
                                                        defaultValue={getBaseCoinIndex(item.coin)}
                                                        styleP={{ opt: Style.opt, com: Style.com, selList: Style.selList }}
                                                        onSelect={(val) => {
                                                            handleBaseCoinSelect(val, index)
                                                        }}
                                                        renderListOption={item => renderCoinOption(item)}
                                                    />
                                                </div>
                                            </div>
                                            <div className={Style.planinp}>
                                                <input className={Style.planinpInn} value={item.proportion} onChange={(e) => { setProp(index, e) }} />
                                                %</div>
                                            <div className={`${Style.planRate} ${setStyleByNO(getRateByCoin(item.coin))}  `}>{getRateByCoin(item.coin)}%</div>   </div>
                                        <div className={Style.planlineRight + ' ' + (planViewData?.coins?.length == 1 ? Style.deleteOpacity : '')} onClick={() => {
                                                coinDelete(index)
                                            }}>

                                            {/* <i className='iconfont icon-arrow-down'></i> */}

                                            {/* <i className='iconfont icon-shanchu'></i> */}
                                            <div className={Style.delete} ></div>
                                        </div>

                                    </div>
                                })}



                        </div>


                        {proportionTip ? <div className={Style.proportionTip} >{`*${t('SUM_PROPORTION_NOT_HUNDRED')}`}</div> : ''}

                        <div className={Style.addCoin} onClick={addCoin}>
                            <i className='iconfont icon-jia'  ></i>

                            <div className={Style.addCointext}>{t('addCoin')}</div>
                        </div>
                        <div className={Style.cycletitle}>{t('Frequency_')}</div>
                        <div className={Style.cycleData}>
                            {frequency.map((item, index) => {
                                return <div key={index} onClick={() => { chooseFrequency(item) }} className={Style.cycled + " " + (planViewData.frequency == item ? Style.checked : '')}>{t(item)}</div>
                            })}
                        </div>

                        <div className={Style.cycleAT}>{t('Amount_per_investUSDT')}</div>
                        <div className={Style.inputbox}>
                            <input placeholder={`${t('amount_needs_to_more', { msg: getMinAmount() })}`} value={planViewData.amount} type="number" onChange={changeAmount} className={Style.inputinner} />
                            <div className={Style.inputcs}>
                                <Image src={coinIconPath('USDT')} width='16' height='16' alt="" />
                                <div className={Style.inputtext}>USDT</div>
                            </div>
                        </div>
                        <div className={Style.blance}>
                            <div className={Style.blancedetailbox}>
                                <div className={Style.blancedetailboxname}>{t('Spot_balance')}</div>
                                <div className={Style.blancedetailboxno}>{formatNumSplit(blance)}USDT</div>
                            </div>
                            <div className={Style.tocharge} onClick={() => {
                                location.href = '/assets/spot/deposit'
                            }}>
                                <div className={Style.chargetext}>{t('Deposit')}</div>
                                <i className='iconfont icon-arrow-right'> </i>
                            </div>
                        </div>
                        <div className={Style.tipbox}>
                            {planViewData.amount && minAmountTip ? <div className={Style.proportionTip} >{`*${t('amount_needs_to_more', { msg: getMinAmount() })} USDT`}</div> : ''}
                            {planViewData.amount & maxAmountTip ? <div className={Style.proportionTip} >{`*${t('amount_needs_to_Less', { msg: maxAmount })} USDT`} </div> : ''}

                            {planViewData.amount && blanceTip ? <div className={Style.proportionTip} >{`*${t('balanceInsufficient')}`} </div> : ''}

                        </div>


                        

                    </div>
                    </div>
                    <div className={Style.modalbtm} >
                        <div className={Style.checkbox} >
                            <i classname1="iconfont icon-unchecked" onClick={CheckClick} className={classNames(['iconfont ', hasRead ? 'icon-select' : 'icon-unchecked', hasRead ? Style.read : Style.unread])} attr="iconfont icon-select"></i>
                            <div className={Style.agree}>{t('I_have_read_agreed')}</div>

                            <div className={Style.toview} onClick={() => {
                                setHoldData(true)
                                setModalVisible(false)
                                setNoticeModalVisible(true)
                            }}>{t('User_Agreement_of_Auto_Invest_')}</div>
                        </div>
                        <div className={Style.planbtn} >
                        {orderId ? <div className={Style.ter + "  " + Style.btn} onClick={() => {
                            // SubmitData(2)
                            setHoldData(false)
                            setModalVisible(false)
                            setTerminateModalVisible(true)
                            setTerminateOrderId(orderId)
                        }}
                        >{t('Terminate')}</div> : ''}
                        <div onClick={() => {
                            SubmitData()
                        }} className={Style.confirm + "  " + (!orderId ? Style.w400 : '') + ' ' + Style.btn + ` ` + (!enbaleSumbit ? Style.disabled : '')} >{t('Save')}</div>
                    </div>
                    </div>
                    



                </div>
                break;

            case 'terminate':
                modalDiv = getTermateModal()
                break;
            default: //默认是查看详情
                modalDiv = <div className={Style.modalView + " "}>
                    <div className={`${Style.planScroll}  ${Style.editScroll}`}>
                        <div className={Style.l1}>
                            <div className={`${Style.opi} ${Style.inner} ${Style.profitLoss}`}>
                                {t('Profit__LossUSDT')}
                                <div className={Style.tipContent}>
                                            <em>{t('The_profit__loss_is_floating')}</em>
                                        </div>
                            </div>
                            <div className={`${Style.pl} ${Style.inner}`}>
                                {/* Profit & Loss */}
                                {t('Total_investedUSDT')}
                            </div>
                            <div className={`${Style.pl} ${Style.inner}`}>
                                {t('Invested_rounds')}
                            </div>
                        </div>

                        <div className={Style.l2}>
                            <div className={`${Style.plData} ${Style.inner}`}>
                                <div className={`${Style.plDataLeft} ${setStyleByNO(planViewData?.incomeU || 0)}`}>{formatNumSplit(planViewData?.incomeU || 0)}</div>
                                <div className={`${Style.plDataRight} ${setStyleByNO(planViewData.incomeProportion)}`}>{times100(planViewData.incomeProportion)}%</div>
                            </div>
                            <div className={`${Style.totalInvest} ${Style.inner}`}>
                                {formatNumSplit(planViewData?.investedAmount) || 0}
                            </div>
                            <div className={`${Style.investRounds} ${Style.inner}`}>
                                {planViewData?.investedTimes || 0}
                            </div>
                        </div>

                        <div className={`${Style.l1} ${Style.mt24}`}>
                            <div className={`${Style.opi} ${Style.inner}`}>
                                {t('Amount_per_investUSDT')}
                            </div>
                            <div className={`${Style.pl} ${Style.inner}`}>
                                {/* Profit & Loss */}
                                {t('Frequency')}
                            </div>
                            <div className={`${Style.pl} ${Style.inner}`}>
                                {t('Power_piggy_earning')}
                            </div>
                        </div>

                        <div className={Style.l2}>
                            <div className={`${Style.plData} ${Style.inner}`}>
                                {formatNumSplit(planViewData.amount)} USDT
                            </div>
                            <div className={`${Style.totalInvest} ${Style.inner}`}>
                                {t(planViewData.frequency)}
                            </div>
                            <div className={`${Style.investRounds} ${Style.inner}`} onClick={() => {
                                if(filterPPCoin()?.length==0)return;
                                location.href = '/assets/financial?tab=2'
                            }}>{filterPPCoin()?.length>0?<>
                            {getCoinImgs(filterPPCoin())} <i className='iconfont  icon-arrow-right'></i></>:'--'}
                                
                            </div>
                        </div>
                        <div className={Style.dataAlloc}>
                            {t('Asset_allocation')}
                        </div>
                        <div className={Style.dataAllocView}>
                            {fillColorRectangles(planViewData.coins)}
                        </div>

                        <div className={Style.coinPerView}>
                            {fillColorBg(planViewData.coins)}
                        </div>
                        <div className={Style.profitDetail} >
                            {t('Asset_Details')}
                        </div>
                        <div className={Style.profitList} >
                            {planViewData.coins.map((item, index) => {
                                return <div key={index} className={Style.pdBox} >
                                    <div className={`${Style.pdTitle} ${Style.pdCont}`} >
                                        <div className={Style.imgbox} >
                                            <Image src={coinIconPath(item.coin)} width='16' height='16' alt="" />
                                            <div className={Style.coinName} >
                                                {item.coin.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className={Style.prop} >
                                            {item?.proportion || 0}%
                                        </div>

                                    </div>
                                    <div className={Style.pdCont} >
                                        <div className={Style.contLeft} >{t('Total_invested')}</div>
                                        <div className={Style.contRight} >{item?.investedAmount || 0} USDT</div>
                                    </div>
                                    <div className={Style.pdCont} >
                                        <div className={Style.contLeft} >{t('Purchased_amount')}</div>
                                        <div className={Style.contRight} >{item?.receiveAmount || 0} {item.coin.toUpperCase()}</div>
                                    </div>
                                    <div className={Style.pdCont} >
                                        <div className={Style.contLeft} >{t('Average_price')}</div>
                                        <div className={Style.contRight} >{item?.avgPrice || 0} USDT</div>
                                    </div>
                                    <div className={Style.pdCont} >
                                        <div className={Style.contLeft} >{t('Profit__loss')}</div>
                                        <div className={`${Style.contRight} ${setStyleByNO(item.incomeU)}`} >{item.incomeU || 0} USDT</div>
                                    </div>

                                </div>
                            })}
                        </div>









                    </div>
                    <div className={Style.planbtn} >
                        {orderId ? <div className={Style.ter + "  " + Style.btn} onClick={() => {
                            setViewModalVisible(false)
                            editPlan(orderId)
                        }}
                        >{t('Edit')}</div> : ''}
                        <div onClick={() => {
                            setViewModalVisible(false)
                        }} className={Style.confirm + "  " + ' ' + Style.btn + ` `} >{t('Got_it')}</div>
                    </div>



                </div>

                break;
        }


        return modalDiv;


    }

    const getTermateModal = () => {
        return <div className={Style.modalnotice + " "}>
            <div className={Style.noticeCon}>

<div className={Style.noticeline}>
    <div className={Style.noticeText}>{t('TerminatedDeleted')}</div>
</div>

</div>
            
            
            <div className={Style.noticebtn} >
                {terminateOrderId ? <div className={Style.ter + "  " + Style.btn} onClick={() => {
                    setOrderId(terminateOrderId);
                    SubmitData(2);
                    setTerminateModalVisible(false);

                }}
                >{t('Terminate')}</div> : ''}
                <div className={Style.think + "  " + Style.btn} onClick={() => {
                    setNoticeModalVisible(false)
                    setTerminateModalVisible(false)
                    setModalVisible(true)
                    setTerminateOrderId('')

                }} >{t('Later')}</div>
            </div>
        </div>
    }


    const handleModalOkClick = () => {
        setModalVisible(false)
        setHoldData(false)

    }

    const handleModalCancleClick = () => {
        setModalVisible(false)
        setHoldData(false)
    }
    const setRulesMethod = () => {
        let rule = {}

        rule.title = 'FAQ';
        rule.ruleBlock = [
            {
                "type": 0,
                "name": t('Q1'),
                "rulesList": [
                    t('A1')
                ]
            },
            {
                "type": 0,
                "name": t('Q2'),
                "rulesList": [
                    t('A21'),
                    t('A22'),
                    t('A23'),
                    t('A24'),
                ]
            },
            {
                "type": 0,
                "name": t('Q3'),
                "rulesList": [
                    t('A31'),
                    t('A32'),
                    t('A33')]

            },
            {
                "type": 0,
                "name": t('Q4'),
                "rulesList": [
                    t('A41'),
                    t('A42'),
                    t('A43'),

                ]
            },
            {
                "type": 0,
                "name": t('Q5'),
                "rulesList": [
                    t('A5'),

                ]
            },
            {
                "type": 0,
                "name": t('Q6'),
                "rulesList": [
                    t('A6'),

                ]
            },
            {
                "type": 0,
                "name": t('Q7'),
                "rulesList": [
                    t('A7'),

                ]
            },
            {
                "type": 0,
                "name": t('Q8'),
                "rulesList": [
                    t('A8'),

                ]
            },
            {
                "type": 0,
                "name": t('Q9'),
                "rulesList": [
                    t('A91'),
                    t('A92'),

                ]
            }
        ]

        // setRules(t('rule'))
        setRules(rule)
    }

    const setPlanCoin = (coin) => {
        let param = {
            "coins": [
                {
                    coin,
                    "proportion": "100"
                },
            ],
            "frequency": "every_hour",
            "amount": ''
        }

        setPlanViewData(param);
    }

    const chooseFrequency = (val) => {
        // console.log(val)
        planViewData.frequency = val;


        // console.log(planViewData)
        setPlanViewData(Object.assign({}, planViewData));
    }
    const coinRangeClick = (index, range) => {

        investList[index].rateChecked = `rate${range}`;
        investList[index].btData = times100(investList[index][`rate${range}`]);

        setInvestList(Object.assign([], investList))


    }

    const handleSwiperChange = (swiper) => {
        setPlanPageState({
            isSwiperBegin: swiper.isBeginning,
            isSwiperEnd: swiper.isEnd
        });
    }


    // 去登录
    function jumpToLogin() {
        const langUrlFix = lang === 'en' ? '' : `/${lang}`;
        location.href = `/user/login?callBackPath=${langUrlFix}/btc-xrp-eth-trading-bot/`;
    };

    const times100 = (val) => {
        return new BigNumber(val - 0).times(100).toNumber();
    }

    const getMsgByCode = (code) => {
        let msg = ''
        switch (code) {
            case 500001:
                //'未登录';
                msg = t('NO_LOGIN')
                break;
            case 500002:
                //'参数为空';
                msg = t('PARAMETER_EMPTY')
                break;
            case 500003:
                //'币种参数为空';
                msg = t('COIN_PARAMETER_EMPTY')
                break;
            case 500004:
                //'币种数量超限';
                msg = t('COIN_COUNT_TOO_LARGE')
                break;
            case 500005:
                //'比例之和不为100';
                msg = t('SUM_PROPORTION_NOT_HUNDRED')
                break;
            case 500006:
                //'比例值错误';
                msg = t('PROPORTION_VALUE_INVALID')
                break;
            case 500007:
                //'存在不支持的币种';
                msg = t('COIN_INVALID')
                break;
            case 500008:
                //'投资频率为空';
                msg = t('FREQUENCY_EMPTY')
                break;
            case 500009:
                //'不支持的投资频率';
                msg = t('FREQUENCY_INVALID')
                break;
            case 500010:
                //'投资金额为空';
                msg = t('AMOUNT_EMPTY')
                break;
            case 500011:
                //'投资金额精度错误';
                msg = t('AMOUNT_SCALE_INVALID')
                break;
            case 500012:
                //'投资金额太小';
                msg = t('AMOUNT_LESS_THAN_MIN', { msg: getMinAmount() })
                break;
            case 500013:
                //'投资金额太大';
                msg = t('AMOUNT_MORE_THAN_MAX', { msg: maxAmount })
                break;
            case 500014:
                //'订单数量超限';
                msg = t('ORDER_MORE_THAN_LIMIT')
                break;
            case 500015:
                //'订单号为空';
                msg = t('ORDER_ID_EMPTY')
                break;
            case 500016:
                //'订单不存在';
                msg = t('ORDER_NOT_PRESENT')
                break;
            case 500017:
                //'订单已关闭';
                msg = t('ORDER_CLOSE')
                break;
            case 500018:
                //'状态参数错误';
                msg = t('STATUS_INVALID')
                break;
            default:

                break;
        }
        return msg;
    }





    useEffect(() => {
        // toast({ type: 'error', msg: t('success') ,duration:5000})
        window.gtag && gtag('event', 'pc_autoinves_view');
        const _tokenStr = Cookies.get(token) || '';
        setTokenStr(_tokenStr);
    }, []);

    useEffect(() => {

        if (tokenStr) {
            fetchRunningOrder();
            return
        }

        fetchOrder_Rule()
        fetchInvestOverview();
        fetchDefault();
        fetchRecommend();
        fetchInvestList()
        fetchColorBgs()
        setRulesMethod()
    }, [tokenStr])

    //关闭弹框后清空数据和id
    useEffect(() => {
        if (defaultPlanViewData.hasOwnProperty('coins') && !modalVisible && !holdData) {
            setPlanViewData(JSON.parse(JSON.stringify(defaultPlanViewData)));
            // setPlanViewData(Object.assign({}, defaultPlanViewData))
            setOrderId('')
            setInputEdit(false)
            setAmountEdit(false);
        }
    }, [modalVisible])

    useEffect(() => {
        //最小可投
        let maxMinInvestment = getMinAmount();
        let coins = planViewData.coins;
        const proportionCount = coins.reduce((total, item) => total + item.proportion, 0);
        //最大可投
        let showMaxAmountTip = checkMaxAmountTip();

        let showProportionTip = 100 != proportionCount;
        // 小于 最小可投
        let showMinAmountTip = planViewData.amount < maxMinInvestment;

        setProportionTip(showProportionTip);
        if (planViewData.amount > blance) {  // 小于 持仓
            setBlanceTip(true)
            setMinAmountTip(false); //修改
        } else {
            setBlanceTip(false)
            setMinAmountTip(showMinAmountTip);
        }

        setEnbaleSumbit(!showProportionTip && !showMinAmountTip && !showMaxAmountTip && hasRead)
    }, [JSON.stringify(planViewData), hasRead])

    useEffect(() => {
        console.log(defaultPlanViewData.coins);
    }, [JSON.stringify(defaultPlanViewData.coins)])



    return (
        <>
            <Head>
                <title>{t('tdk.title')}</title>
                <meta name="keywords" content={('tdk.keywords')} />
                <meta name="description" content={('tdk.description')} />
            </Head>
            <div className={Style.component}>
                <div className={Style.banner}>
                    <div className={classNames(['basic', Style.banner_box])}>
                        <div className={Style.info}>
                            <div className={Style.info1}>
                                {/* Auto Invest */}

                                {t('Auto_Invest')}
                            </div>
                            <div className={Style.info2}>
                                <span>{t('Spread_out_your_investments_')}</span>

                                <span>{t('Grab_long-term_profit_and_flexible_interests_')}</span>
                            </div>
                            <div className={Style.info3} onClick={() => {
                                if (tokenStr) {
                                    setPlanViewData(JSON.parse(JSON.stringify(defaultPlanViewData)));
                                    setOrderId('')
                                    setHasRead(false)
                                    setModalVisible(true)
                                } else {
                                    jumpToLogin()
                                }
                            }}>
                                <div className={Style.btn}>
                                    {tokenStr ? t('Create') : t('Login')}
                                </div>
                            </div>


                        </div>


                        <div className={tokenStr ? Style.piccenter : Style.piccenternotlogin}></div>
                        {tokenStr ? <div className={Style.topinfo}>
                            <div className={Style.l1}>
                                <div className={Style.l1left}>
                                    {/* My Invest */}
                                    {t('My_Invest')}


                                </div>
                                <div className={Style.l1right} onClick={() => {
                                    location.href = '/order/saving/autoInvest'
                                }}>
                                    <div className={Style.more}>
                                        <span>
                                            {t('Details')}
                                        </span> <i className={classNames(['iconfont icon-arrow-right', Style.more_icon])}></i>
                                    </div>
                                </div>

                            </div>

                            <div className={Style.l2}>
                                <div className={Style.datatitle}>
                                    <div className={`${Style.opi} ${Style.ongoing}`}>
                                        {/* Ongoing plans invested (USDT) */}
                                        {t('Ongoing_invested_USDT')}
                                        <div className={Style.tipContent}>
                                            <em>{t('The_total_amount_of_usdt_invested_in_all_ongoing_')}</em>
                                        </div>
                                    </div>
                                    <div className={`${Style.pl} ${Style.profit}`}>
                                        {/* Profit & Loss */}
                                        {t('Profit__LossUSDT')}

                                        <div className={Style.tipContent}>
                                            <em>{t('The_profit__loss_is_floating')}</em>
                                        </div>
                                    </div>

                                </div>
                                <div className={Style.dataview}>
                                    <div className={Style.opi}>{formatNumSplit(overViewInfo?.currentInvested || 0)}</div>
                                    <div className={Style.icbox} >
                                        <div className={`${Style.plc} ${setStyleByNO(overViewInfo?.currentIncome)}`}>{formatNumSplit(overViewInfo?.currentIncome || 0)}</div>
                                        <div className={`${Style.chg} ${setStyleByNO(overViewInfo?.currentIncomeProportion)}`}>{times100(overViewInfo?.currentIncomeProportion || 0)}%</div>
                                    </div>



                                </div>
                            </div>
                            <div className={Style.l2 + '  ' + Style.l3}>
                                <div className={Style.datatitle}>
                                    <div className={`${Style.opi} ${Style.totalInvest}`}>
                                        {t('Total_investedUSDT')}
                                        <div className={Style.tipContent}>
                                            <em>{t('The_total_amount_invested_in_all_auto_invest_plans_including_')}</em>
                                        </div>
                                    </div>
                                    <div className={`${Style.pl}  ${Style.totalPlan}`}>{t('Total_plans')}
                                        <div className={Style.tipContent}>
                                            <em>{t('total_plans')}</em>
                                        </div>
                                    </div>

                                </div>
                                <div className={Style.dataview}>
                                    <div className={Style.opi}>{formatNumSplit(overViewInfo?.totalInvested || 0)}</div>
                                    <div className={Style.pl}>{overViewInfo?.orderCount || 0}</div>
                                    {/* <div className={Style.chg}>+13.42%</div> */}


                                </div>
                            </div>



                        </div> : ''}

                    </div>
                </div>
                <div className={classNames(['basic', Style.planBox])}>
                    {tokenStr && runningOrderInfo?.length > 0 ? <>
                        <div className={Style.titlebox}>
                            <h2>{t('All_ongoing_plans')}</h2>
                            {runningOrderInfo?.length > 3 ? <div className={Style.prevNext}>
                                {!planPageState.isSwiperBegin && <div className={Style.prev} onClick={() => {
                                    swiperRef.current?.slidePrev()
                                }}>
                                </div>}
                                {!planPageState.isSwiperEnd && <div className={Style.next} onClick={() => {
                                    swiperRef.current?.slideNext();
                                }}>
                                </div>}
                            </div> : ''}

                        </div>

                        <div className={Style.plans}>
                            {runningOrderInfo?.length > 0 ? <Swiper
                                loop={false} // 是否循环
                                slidesPerView={3} // 一屏显示4个
                                spaceBetween={20}
                                uniqueNavElements={false}
                                // direction='horizontal'
                                onBeforeInit={swiper => {
                                    // 在初始化之前回调，将 swiper 赋值给 ref
                                    if (swiperRef.current === null) {
                                        swiperRef.current = swiper;
                                    }
                                }}
                                onSlideChange={swiper => {
                                    handleSwiperChange(swiperRef.current);
                                }}

                            >
                                {
                                    runningOrderInfo?.map((item, index) => {
                                        return (
                                            <SwiperSlide key={index}>

                                                <div className={`${Style.listbox} ${item?.attention == 'SOME_COIN_INVALID' ? Style.invalid : ''}`}>
                                                    <div className={Style.titlebox}>
                                                        <div className={Style.titleboxl}>
                                                            <div className={Style.titlei} >
                                                                {item.coins.length>1?t('Portfolio'):item.coins[0]?.coin?.toUpperCase()}
                                                            </div>
                                                            <div className={Style.plani} >
                                                                <i className='iconfont icon-info'></i>
                                                                <div className={Style.tipContent}>
                                                                    <em>{t('cryptosUnavailable')}</em>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <div className={Style.titleboxr}>
                                                            <div className={Style.titleboxedit} onClick={() => {
                                                                editPlan(item.id)
                                                            }}>
                                                                <i className='iconfont icon-lianxikefu'></i>
                                                            </div>
                                                            {<div className={Style.titleboxview} onClick={() => {
                                                                viewPlan(item.id)
                                                            }}>
                                                                <i className='iconfont icon-recordIcon'></i>
                                                            </div>}
                                                        </div>
                                                    </div>
                                                    <div className={Style.coinactbox}>
                                                        {getCoinImgs(item.coins)}
                                                        {getSwitch(item.id, item.status)}
                                                    </div>

                                                    <div className={Style.plandatas}>
                                                        <div className={Style.l2}>
                                                            <div className={Style.datatitle}>
                                                                <div className={Style.opi}>{t('Profit__LossUSDT')}</div>
                                                                <div className={Style.pl}> {t('Total_investedUSDT')}</div>

                                                            </div>
                                                            <div className={Style.dataview}>
                                                                <div className={Style.incomeBox} >
                                                                    <div className={Style.income} >{formatNumSplit(item.incomeU)}</div>

                                                                    <div className={`${Style.opichg}   ${item.incomeProportion < 0 ? Style.down : Style.up}`}>{times100(item.incomeProportion)}%</div>
                                                                </div>
                                                                <div className={Style.pl}>{formatNumSplit(item.investedAmount)}</div>
                                                                {/* <div className={Style.chg}>+13.42%</div> */}


                                                            </div>
                                                        </div>
                                                        <div className={Style.l2 + '  ' + Style.l3}>
                                                            <div className={Style.datatitle}>
                                                                <div className={Style.opi}>{t('Frequency_')}</div>
                                                                <div className={Style.pl}>{t('Amount_per_investUSDT')}</div>

                                                            </div>
                                                            <div className={Style.dataview}>
                                                                <div className={Style.opi}>{t(item.frequency)}</div>
                                                                <div className={Style.pl}>{formatNumSplit(item.amount)}</div>
                                                                {/* <div className={Style.chg}>+13.42%</div> */}


                                                            </div>
                                                        </div>
                                                        <div className={Style.actinfo}>
                                                            <div className={Style.actword}>{t('Created_at')}</div>
                                                            <div className={Style.acttiem}>{formatDate(item.ctime, 'yyyy-MM-dd hh:mm:ss')}</div>
                                                        </div>

                                                    </div>


                                                </div>
                                            </SwiperSlide>

                                        )
                                    })
                                }
                            </Swiper> : ''}
                            {runningOrderInfo?.length == 0 ? <div className={Style.toAdd} >
                                <div className={Style.noData} ></div>
                                <div className={Style.addDataBtn} onClick={() => {
                                    setOrderId('')
                                    setHasRead(false)
                                    setModalVisible(true)
                                }} >{t('Create')}</div>
                            </div> : ''}

                        </div></> : ''}


                    {runningOrderInfo?.length == 0 ? <div className={Style.process}>

                        <div className={Style.inner + ' ' + Style.p1}>
                            <div className={Style.imgtop}></div>
                            <div className={Style.infobox}>
                                <div className={`${Style.info} ${Style.infoCharge}`} onClick={()=>{location.href = '/assets/spot/deposit'}}>{t('Deposit1')}</div>
                                <div className={Style.line}></div>
                            </div>

                            <div className={Style.desc}>{t('Deposit_USDT_into_spot_wallet')}</div>
                        </div>
                        <div className={Style.inner + ' ' + Style.p2}>
                            <div className={Style.imgtop}></div>
                            <div className={Style.infobox}>
                                <div className={Style.info}>{t('_Create')}</div>
                                <div className={Style.line}></div>

                            </div>

                            <div className={Style.desc}>{t('Set_the_frequency_amount_and_cryptos_for_auto_invest_plans')}</div>
                        </div>
                        <div className={Style.inner + ' ' + Style.p3}>
                            <div className={Style.imgtop}></div>
                            <div className={Style.infobox}>
                                <div className={Style.info}>{t('_Earn')}</div>

                            </div>

                            <div className={Style.desc}>{t('Invest_your_cryptos_into_Power_piggy_to_earn_flexible_daily_rewards_')}</div>
                        </div>
                    </div> : ''}

                    <h2 className={Style.investPlans}>{t('Create_auto_invest_plans')}</h2>

                    <div className={Style.epbox}>
                        {

                            recomInfo?.map((item, index) => {
                                return (<div key={index} className={Style.epinner}>
                                    <div className={`${Style.epdata}  ${item?.label?Style.labelbox:''}`}>
                                        <div className={Style.epdatatop}>
                                            <div className={Style.epdl1}>
                                                <div className={Style.epdtitle}>{item.title}</div>
                                                <div className={Style.epperson}>
                                                    <i className='iconfont icon-gerenxinxi'></i>
                                                    <div className={Style.eppcount}>{item.userCount}</div>
                                                </div>
                                            </div>
                                            <div className={Style.epdl2}>
                                                {item.introduction}
                                            </div>
                                            {item?.label ? <div className={Style.epLabel} >
                                                <span>{item?.label}</span>
                                            </div> : ''}
                                        </div>
                                        <div className={Style.epdatabtm}>
                                            <div className={Style.chg}>{t('_days_backtested')}</div>
                                            <div className={Style.chgdatas}>
                                                <div className={`${Style.data} ${setStyleByNO(item.incomeProportion)}`}>{item.incomeProportion > 0 ? '+' : ''}{times100(item.incomeProportion)}%</div>
                                                <div className={Style.view}>
                                                    <Sparklines
                                                        data={item.priceHist || []}
                                                        style={{ fill: "none" }}
                                                        width={100}
                                                        height={32}
                                                        margin={0}
                                                    >
                                                        <SparklinesLine
                                                            style1={{ strokeWidth: 6, stroke: "#336aff", fill: "none" }}
                                                            color={item.incomeProportion >= 0 ? 'rgba(0, 191, 156, .5)' : 'rgba(247, 81, 81, .5)'}
                                                            style={{ fill: "none" }}
                                                        />
                                                    </Sparklines>
                                                </div>
                                            </div>
                                            <div className={Style.coins}>
                                                {getCoinImgs(item.coins)}
                                                <div className={Style.circleView} >

                                                <div className={Style.moreData} >
                                                    <div className={Style.mdTitle} >
                                                        {t('Details_of_auto_invest_plan')}
                                                    </div>
                                                    <div className={Style.chartCoins} >
                                                       {colorBgs?.length>0? <DontCharts item={item.coins} colors={colorBgs} chartId={`chart${index}`} ></DontCharts>:''}
                                                        <div className={Style.mdCoins}>
                                                            {item.coins.map((item, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={Style.mdCoinbox}

                                                                >
                                                                    <div className={`${Style['coinColor' + (index + 1)]}  ${Style.mdCoin} `} style={{backgroundColor:colorBgs?.[index]||'auto'}} ></div>
                                                                    <div className={Style.colorName} >{item.coin.toUpperCase()}</div>
                                                                    <div className={Style.percent} >{(item.proportion)}%</div>

                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>


                                                </div>
                                                </div>
                                               
                                            </div>
                                            <div className={Style.btn} onClick={() => {

                                                doRecommend(item.id)
                                            }}>
                                                {tokenStr ? t('Create') : t('Login')}
                                            </div>
                                        </div>
                                    </div>
                                </div>)
                            })}
                    </div>
                    <h2>{t('All_cryptos')}</h2>

                    <div className={Style.datadetail}>
                        <div className={Style.datadetailHead}>
                            <div className={Style.Crypto}>{t('Crypto')}</div>
                            <div className={Style.data}>{t('Backtested_datas')}</div>
                            <div className={Style.rate}>

                                <span> {t('Flexible_interests_rate')}</span>
                                <i className={`iconfont icon-info ${Style.interestRate}`}>
                                    <div className={Style.tipContent}>
                                        <em>{t('The_flexible_interests_rate_of_this_currency_in_Power_Piggy')}</em>
                                    </div>
                                </i>
                            </div>
                            <div className={Style.action}></div>



                        </div>
                        <div className={Style.content}>
                            {true ?
                                // [0, 1, 2, 3, 3, 3]
                                investList?.map((item, index) => {
                                    return <div key={index} className={Style.datadetailview}>
                                        <div className={Style.Crypto}>
                                            <div className={Style.CryptoLogo}>
                                                <Image key={index} src={coinIconPath(item.coin)} width='16' height='16' alt="" />
                                            </div>
                                            <div className={Style.CryptoName}>{item?.coin.toUpperCase()}</div>
                                        </div>
                                        <div className={Style.data}>
                                            <div className={`${Style.dataPer} ${setStyleByNO(item.btData, true)}  `}>{item.btData == 0 ? '--' : item.btData + '%'}</div>
                                            {item.btData == 0 ? <span className={Style.noData}>{t('No_data_yet')}</span> : <><div onClick={() => { coinRangeClick(index, 30) }} className={(item.rate30 == 0 ? Style.hidden : '') + ' ' + Style.data30 + ' ' + Style.datam + ' ' + (item.rateChecked != 'rate30' ? '' : Style.enable)}>30 D</div>
                                                <div onClick={() => { coinRangeClick(index, 90) }} className={(item.rate90 == 0 ? Style.hidden : '') + ' ' + Style.data180 + ' ' + Style.datam + ' ' + (item.rateChecked != 'rate90' ? '' : Style.enable)}>90 D</div>
                                                <div onClick={() => { coinRangeClick(index, 180) }} className={(item.rate180 == 0 ? Style.hidden : '') + ' ' + Style.data360 + ' ' + Style.datam + ' ' + (item.rateChecked != 'rate180' ? '' : Style.enable)}>180 D</div></>}

                                        </div>


                                        <div className={`${Style.rate} `}>{item.ppRate == 0 ? '--' : ('') + times100(item.ppRate) + '%'}</div>
                                        <div className={Style.action}>

                                            <div onClick={() => {
                                                if (!tokenStr) {
                                                    jumpToLogin();
                                                } else {
                                                    setOrderId('')
                                                    setPlanCoin(item.coin)
                                                    setHasRead(false)
                                                    setModalVisible(true)
                                                }

                                            }} className={Style.actBtn}>
                                                {tokenStr ? t('Create') : t('Login')}
                                            </div>
                                        </div>
                                    </div>
                                }) : ''}


                            {investList?.length == 0 ? <div className={Style['history-empty']}><i className="iconfont icon-empty"></i><p>{t('noRecords')}</p></div> : ''}
                            {showHasMore ? <div className={Style.hasmore} >
                                <div className={Style.more} disabled={false} onClick={() => { 
                                    setInvestList([...fullInvestList]);
                                    setShowHasMore(false)
                                }}>
                                    <span>{t('More')}</span> <i className='iconfont icon-arrow-down'></i>
                                </div>
                            </div> : ''}
                        </div>


                    </div>
                    

                    <RulesList ruleLang={rules} />
                </div>

                <Modal
                    visible={modalVisible}
                    className={Style.modala}
                    title={
                        orderId ? t('Edit_auto_invest_plans_') : t('Create_auto_invest_plans')
                    }
                    modalbox={Style.modalbox}
                    modalHeader={Style.modalViewHeader}
                    onCancel={handleModalCancleClick}
                    closeFn={handleModalCancleClick}
                    onOk={handleModalOkClick}
                    hideFooter={true}
                    cancelText={modalCancelText}
                    okText={modalOkText}
                    close={true}
                >{getmodalContent('edit')}</Modal>

                <Modal
                    visible={noticeModalVisible}
                    className={Style.modala}
                    // children={getmodalContent('notice')}
                    title={t('User_Agreement_of_Auto_Invest_')}
                    modalbox={Style.modalbox}
                    modalHeader={Style.modalViewHeader}
                    hideFooter={true}
                    cancelText={modalCancelText}
                    okText={modalOkText}
                    close={true}
                    closeFn={() => {
                        setNoticeModalVisible(false)
                        setModalVisible(true)

                    }}
                >{getmodalContent('notice')}</Modal>

                <Modal
                    visible={viewModalVisible}
                    className={Style.modala}
                    // children={getmodalContent('notice')}
                    title={t('Details_of_auto_invest_plan')}
                    modalbox={Style.modalViewBox}
                    modalHeader={Style.modalViewHeader}
                    hideFooter={true}
                    cancelText={modalCancelText}
                    okText={modalOkText}
                    close={true}
                    closeFn={() => {
                        setViewModalVisible(false)
                    }}
                    onOk={() => {
                        setViewModalVisible(false)
                    }}
                >{getmodalContent('view')}</Modal>

                <Modal
                    visible={terminateModalVisible}
                    className={Style.modala}
                    modalHeader={Style.modalViewHeader}
                    // children={getmodalContent('notice')}
                    title={t('TerminationPlan')}
                    modalbox={Style.modalViewBox+" "+Style.modalTerBox}
                    
                    hideFooter={true}
                    close={true}
                    closeFn={() => {
                        setTerminateModalVisible(false)
                        setTerminateOrderId('')
                    }}
                >{getmodalContent('terminate')}</Modal>


            </div>
        </>
    )
};

export default AutoInvest;