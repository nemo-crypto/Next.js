import { get, post,postArr } from "@utils/http";
import {
    GET_BTRLOCKUP_LIST, GET_BTRLOCKUP_DETAIL, GET_BTRLOCKUP_CALC_INVEST_AMOUNT,
    GET_BTRLOCKUP_CALC_LOCKUP_AMOUNT, GET_BTRLOCKUP_RECORD, GET_BTRLOCKUP_CALC_BTR_AMOUNT,
    POST_EXTRAQUOTA_ORDER, POST_BTRLOCKUP_UNFROZEN,

    
    DO_ORDER,GET_ORDER_RULE, GET_DEFAULT_INVEST, UPDATE_ORDER,
  RUNNING_ORDER, ORDER_DETAIL, INVEST_OVERVIEW,
  RECOMMEND, INVEST_LIST, ALL_COIN,
  ORDER_LIST, TRADE_LIST,COLOR_BGS
} from '@constants/api';
 
// 币种列表
export function getAvailableList(params){
    return get(GET_BTRLOCKUP_LIST, params);
};

// 币种详情
export function getProductDetail(params){
    return get(GET_BTRLOCKUP_DETAIL, params);
};

// 币种详情 - 计算需要锁仓的当前币种
export function getCalcInvestAmount(params){
    return get(GET_BTRLOCKUP_CALC_INVEST_AMOUNT, params);
};

// 币种详情 - 计算需要锁仓的BTR
export function getCalcLockUpAmount(params){
    return get(GET_BTRLOCKUP_CALC_LOCKUP_AMOUNT, params);
};

// 币种详情 - 锁仓BTR增加额外额度 - 下单
export function postExtraQuotaOrder(params) {
    return post(POST_EXTRAQUOTA_ORDER, params);
};

// 币种详情 - 解锁 - BTR数量
export function getCalcLockUpBtrAmount(params) {
    return get(GET_BTRLOCKUP_CALC_BTR_AMOUNT, params);
};

// 币种详情 - 解锁
export function postUnfrozenAmount(params) {
    return post(POST_BTRLOCKUP_UNFROZEN, params);
};

// 币种锁仓记录
export function getProductRecord(params){
    return get(GET_BTRLOCKUP_RECORD, params);
};



//定投规则
export function getOrder_Rule(params){
    return get(GET_ORDER_RULE, params);
};

export function doOrder(params){
  const config = {
    'Content-Type': 'application/json',
    
  }
    return postArr(DO_ORDER, params, config);
};


export function getGetDefaultInvest(params) {
  return get(GET_DEFAULT_INVEST, params);
};

export function UpdateOrder(params) {
  const config = {
    'Content-Type': 'application/json',
    
  }
  return postArr(UPDATE_ORDER, params,config);
};

export function getRunningOrder(params) {
  return get(RUNNING_ORDER, params);
};

export function getOrderDetail(params) {
  return get(ORDER_DETAIL, params);
};

export function getInvestOverview(params) {
  return get(INVEST_OVERVIEW, params);
};

export function getRecommend(params) {
  return get(RECOMMEND, params);
};

export function getInvestList(params) {
  return get(INVEST_LIST, params);
};

export function getAllCoin(params) {
  return get(ALL_COIN, params);
};

export function getOrderList(params) {
  return get(ORDER_LIST, params);
};

export function getTradeList(params) {
  return get(TRADE_LIST, params);
};


export function getColorBgs(params) {
  return get(COLOR_BGS, params);
};
