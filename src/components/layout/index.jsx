import { useEffect, useState } from 'react';
import Script from 'next/script';

import Cookies from 'js-cookie';
import { Config } from '@constants/config';
import { getParameterByName } from '@utils/common';


const Layout = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isAPP, setIsAPP] = useState(false);


    useEffect(() => {
        setIsAPP(Boolean(window.currencyexchange));
        // 判断是否移动设备
        if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
            setIsMobile(true);
        };


    }, []);

    useEffect(() => {
        // 邀请码
        const urlInvitCode = getParameterByName('inviteCode');
        urlInvitCode ? Cookies.set('inviteCode', urlInvitCode, 7) : '';

        // 合约 渠道号
        const fcn = parseInt(getParameterByName('fcn'));
        fcn ? Cookies.set('fcn', fcn, 7) : '';

        // 现货 渠道号
        const urlChannelId = getParameterByName('cn');
        urlChannelId ? Cookies.set('channelId', urlChannelId, 7) : '';
    }, []);

    return (
        <>
            <div id="page-common-header"></div>
            {Config.staticDomain && !isAPP && <div className='h5-placeholder'></div>}
            {children}
            <div id="page-common-footer"></div>
            {process.env.NEXT_PUBLIC_APP_ENV === 'qa' && isMobile && <Script src="https://unpkg.com/vconsole@latest/dist/vconsole.min.js" onLoad={() => { new window.VConsole(); }} />}
            <style jsx>{`
            @media screen and (max-width:750px){
                .h5-placeholder{
                    height: 54px;
                    background: #090C10;
                }
            }
            `}</style>
            {Config.staticDomain && <Script
                src={`${Config.staticDomain}/uniframe/js/main.uniframe.bundle.js`}
                onLoad={() => {
                    if (window.currencyexchange || !window.Widgets?.uniFrame) return;

                    // 初始化Header
                    const headerInit = new window.Widgets.uniFrame.Header({
                        getContainer: 'page-common-header',
                        apiDomain: Config.apiDomain,
                        apiDomainFuture: Config.apiDomainFuture,
                        i18nPathType: 'router'
                    });
                    headerInit?.render();

                    // 初始化Footer
                    const footerInit = new window.Widgets.uniFrame.Footer({
                        getContainer: 'page-common-footer',
                    });
                    footerInit?.render();
                }}
            />}
        </>
    );
};

export default Layout;