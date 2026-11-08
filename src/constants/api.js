import { Config } from './config';

const API_PREFIX_V1 = `${Config.apiDomain}kline-api/`;
const API_PREFIX_V2 = `${Config.apiDomain}exchange-web-gateway/`;
const API_PREFIX_V3 = `${Config.apiDomain}arcade-web/`;
const API_PREFIX_V4 = `${Config.apiDomainFuture}fe-co-api/`;
const API_Lang = `${Config.staticDomain}/languse/demo-content/`

// 币种详情
export const GET_PRICE_COIN_INFO = `${API_PREFIX_V2}tokenInfo/getCoinIntroduction`;

// 币对详情 - 列表
export const GET_PRICE_COIN_LIST = `${API_PREFIX_V2}coin/list`;

// 增值宝 - 列表
export const GET_FLEXIBLE_LIST = `${API_PREFIX_V3}current/campaignList`;

// 增值宝 - 列表 - 用户收益
export const GET_INVEST_OVERVIEW = `${API_PREFIX_V3}current/investOverview`;

// 增值宝 - 列表 - 币种列表
export const GET_FLEXIBLE_COIN = `${API_PREFIX_V3}current/coinList`;

// 增值宝 - 币种详情
export const GET_FLEXIBLE_DETAIL = `${API_PREFIX_V3}current/campaignDetailName`;

// 增值宝 - 币种详情 - 参与投资
export const POST_FLEXIBLE_JOIN = `${API_PREFIX_V3}current/ppJoin`;

// 增值宝 - 币种详情 - 解锁投资
export const POST_FLEXIBLE_UNFREEZE = `${API_PREFIX_V3}current/ppBack`;

// 增值宝 - VIP - 投资详情
export const GET_FLEXIBLE_VIP_INVEST = `${API_PREFIX_V3}current/investOverview`;

// 增值宝 - VIP - 投资币种列表
export const GET_FLEXIBLE_VIP_COIN = `${API_PREFIX_V3}current/currentVipInvestment`;

// 增值宝 - 记录
export const GET_FLEXIBLE_RECORD_LIST = `${API_PREFIX_V3}current/behaviorList`;

// 增值宝 - 记录 - 定期
export const GET_FIXED_RECORD_LIST = `${API_PREFIX_V3}increaseAct/fixFundRecordByUid`;

// 增值宝 - 记录 - 币种列表
export const GET_FLEXIBLE_RECORD_COIN = `${API_PREFIX_V3}increaseAct/increaseActCoins`;

// BTR锁仓 - 列表页
export const GET_BTRLOCKUP_LIST = `${API_PREFIX_V3}increaseAct/lockCoinInvestList`;

// BTR锁仓 - 详情页
export const GET_BTRLOCKUP_DETAIL = `${API_PREFIX_V3}increaseAct/lockFixProductDetailId`;

// BTR锁仓 - 详情页 - 根据投资数量计算锁仓数量
export const GET_BTRLOCKUP_CALC_LOCKUP_AMOUNT = `${API_PREFIX_V3}increaseAct/fixExtraQuotaLockAmt`;

// BTR锁仓 - 详情页 - 根据锁仓数量计算投资数量
export const GET_BTRLOCKUP_CALC_INVEST_AMOUNT = `${API_PREFIX_V3}increaseAct/calcuInvestAmount`;

// BTR锁仓 - 详情页 - 解锁BTR数量
export const GET_BTRLOCKUP_CALC_BTR_AMOUNT = `${API_PREFIX_V3}increaseAct/calculateRedeemBtr`;

// BTR锁仓 - 详情页 - 解锁
export const POST_BTRLOCKUP_UNFROZEN = `${API_PREFIX_V3}increaseAct/redeem`;

// BTR锁仓 - 详情页 - 锁仓当前币种
export const POST_EXTRAQUOTA_ORDER = `${API_PREFIX_V3}increaseAct/createFixExtraQuotaOrder`;

// BTR锁仓 - 详情页 - 锁仓列表
export const GET_BTRLOCKUP_RECORD = `${API_PREFIX_V3}increaseAct/lockFixFundRecord`;

// 定投 - 首页 - 下单规则
export const GET_ORDER_RULE = `${API_PREFIX_V2}auto-invest/order-rule`;

// 定投 - 首页 - 下单
export const DO_ORDER = `${API_PREFIX_V2}auto-invest/order`;

// 默认下单数据
export const GET_DEFAULT_INVEST = `${API_PREFIX_V2}auto-invest/default-invest`;

// 修改订单
export const UPDATE_ORDER = `${API_PREFIX_V2}auto-invest/update-order`;

// 运行中的定投
export const RUNNING_ORDER = `${API_PREFIX_V2}auto-invest/running-order`;

// 订单详情
export const ORDER_DETAIL = `${API_PREFIX_V2}auto-invest/order-detail`;

// 定投总览
export const INVEST_OVERVIEW = `${API_PREFIX_V2}auto-invest/overview`;

// 推荐
export const RECOMMEND = `${API_PREFIX_V2}auto-invest/recommend`;

// 定投产品列表（首页主列表）
export const INVEST_LIST = `${API_PREFIX_V2}auto-invest/list`;

// 所有定投币（订单页下拉）
export const ALL_COIN = `${API_PREFIX_V2}auto-invest/all-coin`;

// 订单列表（订单页列表）
export const ORDER_LIST = `${API_PREFIX_V2}auto-invest/order-list`;


//颜色
export const COLOR_BGS = `${API_PREFIX_V2}auto-invest/coin-colour`;

// 交易明细（订单页明细）
export const TRADE_LIST = `${API_PREFIX_V2}auto-invest/trade-list`;


// // 交易明细（订单页明细）
// export const RUNNING_ORDER runing-order = `${API_PREFIX_V3}auto-invest/runing-order`;

// landingpage - 多语言
export const GET_LANG_DATA = `${API_Lang}landingpage/`;

// landingPage - 详情页 
export const GET_LANDING_DETAIL = `${API_PREFIX_V4}general/activity_land/detail`;

// landingPage - 详情页 - 报名
export const POST_LANDING_SIGN = `${API_PREFIX_V4}activity_land/sign`;

// Converte 详情页 列表-查询
export const GET_CONVERTER_DETAIAL = `${API_PREFIX_V2}converter/mainInfo`;

// Converte 计算器
export const GET_CONVERTER_CALCULATOR = `${API_PREFIX_V2}converter/calculator`;

// 代币列表
export const GET_COIN_NAME = `${API_PREFIX_V2}converter/openCoinName`;

// 法币列表
export const GET_FIAT_NAME = `${API_PREFIX_V2}converter/fiatName`;

// 历史数据 折线
export const GET_HISTORY_LINE = `${API_PREFIX_V2}converter/historyPrice`;

// topCryptoAssets
export const GET_TOP_ASSETS = `${API_PREFIX_V2}converter/topCryptoAssets`;

// spot 、Futures 、etf - Markets
export const GET_MARKETS = `${API_PREFIX_V2}how-to-buy/coin-info`;