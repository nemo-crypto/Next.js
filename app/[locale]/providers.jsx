'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import Cookies from 'js-cookie';
import StoreContext from '@utils/hooks/storeContext';
import { Config } from '@constants/config';
import { languages } from '@constants/cookies';
import { mapLocalesIdToKoot } from '@utils/common';
import Layout from '@components/layout';
import TranslationProvider from '@components/translation-provider';

export default function Providers({ locale, messages, children }) {
    const [store] = useState(() => ({}));
    useEffect(() => {
        Cookies.set(languages, mapLocalesIdToKoot(locale), { domain: Config.cookieDomain, sameSite: 'lax' });
    }, [locale]);
    useEffect(() => {
        if (!window.currencyexchange) return;
        const previous = window.jsBridge;
        const callbacks = new Map();
        const bridge = {
            invoke(api, data, callback) {
                callbacks.set(api, callback);
                window.currencyexchange.postMessage(JSON.stringify({ api, data: data || {} }));
            },
            receiveMessage(msg) { callbacks.get(msg.api)?.(msg); },
        };
        window.jsBridge = bridge;
        return () => { callbacks.clear(); if (window.jsBridge === bridge) window.jsBridge = previous; };
    }, []);
    const analyticsId = process.env.NEXT_PUBLIC_GA_ID;
    return <TranslationProvider locale={locale} namespaces={{ common: messages }}>
        <StoreContext.Provider value={store}>
            <Layout>{children}</Layout>
            {analyticsId && /^G-[A-Z0-9]+$/.test(analyticsId) && <>
                <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} strategy='afterInteractive' />
                <Script id='analytics' strategy='afterInteractive'>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(analyticsId)});`}</Script>
            </>}
        </StoreContext.Provider>
    </TranslationProvider>;
}
