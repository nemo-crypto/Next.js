'use client';

import { useState, useEffect, useRef } from 'react';
import Image from '@components/image';
import { Config } from '@constants/config';
import { useRouter } from '@src/lib/navigation';

import Style from './index.module.scss';
import classNames from 'classnames';
import CountDown from '@components/countdown';
import share from '@static/images/landing-page/share.png';
import share_h5 from '@static/images/landing-page/share_h5.svg';
import fb from '@static/images/landing-page/fb.png';
import telegram from '@static/images/landing-page/telegram.png';
import twitter from '@static/images/landing-page/twitter.png';

import Cookies from 'js-cookie';
import { token, languages } from '@constants/cookies';
import { ACTIVITY_CODE, RESPONSIVE, getParameterByName } from '@utils/common';

import Modal from '@components/modal';

import { getLang, getLandingDetail, postLandingSign } from '@service/landing-page';

const LandingPage = ({ activityId, initialData }) => {
    const [langData, setLangData] = useState({});
    const [tokenMsg, setTokenMsg] = useState({
        'exchange-token': '',
        'dfp': '',
        'exchange-client': 'pc',
    });

    const [loginModal, setLoginModal] = useState(false)
    const [shareModal, setShareModal] = useState(false)
    const [statusModal, setStatusModal] = useState(false)
    const [shareData, setShareData] = useState({
        tw: 'https://twitter.com/intent/tweet',
        fb: 'https://www.facebook.com/sharer/sharer.php',
        tg: 'https://telegram.me/share/url'
    })
    const [userInviteCode, setUserInviteCode] = useState('');
    const [shareSlogon, setShareSlogon] = useState('');

    const [landInfo, setLandInfo] = useState(initialData || {});
    const [errorInfo, setErrorInfo] = useState('');
    const [isH5, setIsH5] = useState(false);
    const [isSignDis, setiIsSignDis] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // 将Flutter登陆回调挂载至window，离开页面时恢复。
        const previous = window.changeIsLogined;
        window.changeIsLogined = appInitial;

        appInitial();
        setIsH5(document.documentElement.clientWidth <= RESPONSIVE.MD);
        return () => { if (window.changeIsLogined === appInitial) window.changeIsLogined = previous; };
    }, []);

    useEffect(() => {
        getLangFun();
    }, [tokenMsg['exchange-token']])

    // 客户端初始化
    const appInitial = () => {
        let coverHeader = {};
        // app端
        if (window.currencyexchange) {
            window?.jsBridge?.invoke('getUserInfo', {}, res => {
                
                const resData = JSON.parse(res.data);
                if (resData && resData.token && resData.deviceDfp) {
                    coverHeader = {
                        'exchange-token': resData.token || '',
                        'dfp': resData.deviceDfp || '',
                        'exchange-client': 'app',
                    };
                    setTokenMsg(coverHeader)
                };
            });
        } else {
            const isAppToken = Cookies.get(token);
            if (isAppToken) {
                coverHeader = {
                    'exchange-token': isAppToken || '',
                    'dfp': '',
                    'exchange-client': 'pc',
                };
                setTokenMsg(coverHeader)
            }
        };
    };

    // 获取多语言
    const getLangFun = () => {
        const localeId = Cookies.get(languages) || 'en_US';
        getLang({ localeId }).then(res => {
            if (res) {
                setLangData(res);
                fetchLandingDetail(res)
            }
        }).catch(error => {
            fetchLandingDetail({})
        })
    }

    // 获取活动详情
    const fetchLandingDetail = (langData_) => {
        getLandingDetail({
            activityId,
            from: getParameterByName('from')
        }, tokenMsg).then(res => {
            setLandInfo(res?.data || {})
            setShareSlogon(res?.data?.shareContent?.desc || '')
            setUserInviteCode(res?.data?.inviteCode || '')
            setiIsSignDis(res?.data?.isSign)
            modalShow(res, langData_)
        });
    };

    // 活动报名
    const landingSign = () => {
        postLandingSign({
            code: activityId,
            inviteCode: Cookies.get('inviteCode')
        }, tokenMsg).then(res => {
            if (res.code == 0) {
                // 报名成功 重新请求下详情
                fetchLandingDetail(langData)
            };
            // modalShow(res, langData)
        });
    };

    // 弹窗处理
    const modalShow = (res, langData_) => {
        if (res.code == ACTIVITY_CODE.EVENT_NULL) {
            setErrorInfo(langData_?.eventNull)
            setiIsSignDis(false)
            setStatusModal(true)
        } else if (res.code == ACTIVITY_CODE.EVENT_OVER) {
            setErrorInfo(langData_?.eventOver)
            setiIsSignDis(true)
            setStatusModal(true)
        } else if (res.code == ACTIVITY_CODE.EVENT_UNSTART) {
            setErrorInfo(langData_?.eventUnstart)
            setiIsSignDis(false)
            setStatusModal(true)
        } else if (res.code == ACTIVITY_CODE.EVENT_UNONLINE) {
            setErrorInfo(langData_?.eventNull)
            setiIsSignDis(false)
            setStatusModal(true)
        } else {
            setErrorInfo('')
            setStatusModal(false)
        }
    }

    const newLink = (url) => {
        if (url === '' || url === null) return
        const w = window.open('about:blank')
        w.location.href = url
    }

    const handlShare = () => {
        if (userInviteCode) {
            setShareModal(true)
        } else {
            setLoginModal(true)
        }
    }

    const nologinToShare = () => {
        setLoginModal(false)
        setShareModal(true)
    }

    // 去登录（pc和h5）
    const joinActivityForApp = () => {
        setLoginModal(false);
        if (window.currencyexchange) {
            window?.jsBridge?.invoke('loginFromWeb');
        } else {
            window.location.href = `/user/login?callBackPath=${window.location.pathname}${window.location.search}`
        };
    };

    const gotoSign = () => {
        if (userInviteCode) {
            // 未报名
            !landInfo?.isSign && landingSign()
        } else {
            joinActivityForApp()
        }
    }

    const shareTg = () => {
        if (window.currencyexchange) {
            window?.jsBridge?.invoke('openTelegramUrl', {
                url: shareData?.tg
            });
        } else {
            newLink(shareData?.tg)
        }
    }

    useEffect(() => {
        handleShare()
    }, [shareSlogon, userInviteCode])

    //分享 type 分享类型 facebook ，telegram ，twitter
    const handleShare = () => {
        let shareTxt = encodeURIComponent(shareSlogon);
        let shareUrl = `${Config.websiteDomain}${window.location.pathname}`;
        let twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(`${shareUrl}?cn=${getParameterByName('cn')}${!userInviteCode ? '' : `&inviteCode=${userInviteCode}`}`)}&text=${shareTxt}`;
        let facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${shareUrl}?cn=${getParameterByName('cn')}${!userInviteCode ? '' : `&inviteCode=${userInviteCode}`}`)}&text=${shareTxt}`;
        let telegramUrl = `https://telegram.me/share/url?url=${encodeURIComponent(`${shareUrl}?cn=${getParameterByName('cn')}${!userInviteCode ? '' : `&inviteCode=${userInviteCode}`}`)}&text=${shareTxt}`;
        setShareData({
            tw: twitterUrl,
            fb: facebookUrl,
            tg: telegramUrl
        })
    }

    const goHome = () => {
        router.push('/');
    }

    return (
        <>

            <div className={Style.component} style={{ background: isH5 ? landInfo?.color || 'transparent' : 'transparent' }}>
                {(Object.keys(landInfo)).length > 0 && <div className={Style.banner} style={{ background: isH5 ? 'transparent' : landInfo?.color || 'transparent' }}>
                    <div className={classNames(['basic', Style.banner_box])}>
                        {isH5 && <div className={Style.h5_share_content}>
                            {landInfo?.shareContent?.content && <div className={Style.h5_share} onClick={handlShare}>
                                <span className={Style.share_btn} >
                                    <Image src={share_h5} alt="share" width={24} height={24} />
                                    <p className={Style.share_text}>{landInfo?.shareContent?.content}</p>
                                </span>
                            </div>}
                        </div>}
                        <div className={Style.left}>
                            <h1 dangerouslySetInnerHTML={{__html:landInfo?.title}}></h1>
                            <h2 dangerouslySetInnerHTML={{__html:landInfo?.depict}}></h2>
                            <div className={Style.countdownContent}>{landInfo?.countdownContent}</div>
                            {landInfo?.countdownTime && <CountDown
                                mode='coinm'
                                showDay={true}
                                value={landInfo?.countdownTime}
                                timeOverCb={fetchLandingDetail}
                            />}
                            {landInfo?.signContent && <span className={`${Style.account} ${isSignDis ? `account_dis` : ''}`} onClick={() => {
                                !isSignDis && gotoSign()
                            }}>{landInfo?.signContent}</span>}
                            {/* {!isH5 && <div className={Style.seize_a_seat} />} */}
                        </div>
                        <div className={Style.right}>
                            <img className={Style.backPic_pcPic} src={landInfo?.backPic?.pcPic} alt="" />
                            <img className={Style.backPic_h5Pic} src={landInfo?.backPic?.h5Pic} alt="" />
                        </div>
                    </div>
                </div>}

                <div className={Style.landContent}>
                    <div className='basic'>
                        <div className={Style.share_content}>
                            {landInfo?.shareContent?.content && <div className={Style.share}>
                                <span className={Style.share_btn} onClick={handlShare}>
                                    <Image src={share} alt="share" width={16} height={16} />
                                    <p className={Style.share_text}>{landInfo?.shareContent?.content}</p>
                                </span>
                            </div>}
                        </div>
                        <div className={Style.list}>
                            {
                                landInfo?.content && landInfo?.content.map((item, index) => {
                                    return (
                                        <div key={index} className={Style.land_body}>
                                            <h1 onClick={() => newLink(item?.titleLink)} dangerouslySetInnerHTML={{__html:item?.title}}></h1>
                                            <h2 onClick={() => newLink(item?.descLink)}  dangerouslySetInnerHTML={{__html:item?.desc}}></h2>
                                            {item?.pcPic && item?.pcPic.map((item, index) => {
                                                return (
                                                    <img key={index} className={Style.land_imgInfo_pc} src={item} alt="" />
                                                )
                                            })}
                                            {item?.h5Pic && item?.h5Pic.map((item, index) => {
                                                return (
                                                    <img key={index} className={Style.land_imgInfo_h5} src={item} alt="" />
                                                )
                                            })}
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                {/* H5 端底部报名按钮 */}
                {landInfo?.signContent && <div className={Style.creat_btn_h5}>
                    <div className={`${Style.creat_sign} ${isSignDis ? `account_dis` : ''}`} onClick={() => {
                        !isSignDis && gotoSign()
                    }} >
                        {landInfo?.signContent}
                    </div>
                </div>}

                {/* 分享前置弹框 */}
                <Modal
                    visible={loginModal}
                    close={isH5?false:true}
                    hasTitle={false}
                    onCancel={nologinToShare}
                    onOk={joinActivityForApp}
                    cancelText={langData?.confirm}
                    okText={langData?.login}
                    closeFn={() => { setLoginModal(false) }}
                    classNamePro={Style.share_confirm}
                >
                    <div className={Style.modalLogin}>{langData?.shareTitle}</div>
                    <div className={Style.modalLogin_text}>{langData?.shareTips}</div>
                </Modal>

                {/* 分享弹框 */}
                <Modal
                    visible={shareModal}
                    close={isH5?false:true}
                    hasTitle={false}
                    closeFn={() => { setShareModal(false) }}
                    classNamePro={Style.shareH5}
                >
                    <div className={Style.modalLogin}>{langData?.shareTitle}</div>
                    <div className={Style.shareBtns}>
                        <a href={shareData?.fb} target="_blank" rel="noreferrer">
                            <Image src={fb} alt="share" width={40} height={40} />
                        </a>
                        <a href={shareData?.tw} target="_blank" rel="noreferrer">
                            <Image src={twitter} alt="twitter" width={40} height={40} />
                        </a>
                        <a onClick={shareTg}>
                            <Image src={telegram} alt="telegram" width={40} height={40} />
                        </a>

                    </div>
                    <div className={Style.cancelBtn} onClick={() => { setShareModal(false) }}>{langData?.cancel}</div>
                </Modal>

                {/* 活动状态弹窗展示 */}
                <Modal
                    visible={statusModal}
                    close={true}
                    hasTitle={false}
                    hideFooter={true}
                    closeFn={() => { setStatusModal(false) }}
                    classNamePro={Style.activity_status_modal}
                >
                    <div className={Style.errorTitle}>{langData?.errorTitle}</div>
                    <div className={Style.errorInfo}>{errorInfo}</div>
                    <div className={Style.lines} />
                    <div className={Style.goHome_btn} onClick={goHome}>{langData?.returnHome}</div>
                </Modal>
            </div>
        </>
    )
};

export default LandingPage;