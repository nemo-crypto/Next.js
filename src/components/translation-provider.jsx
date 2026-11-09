'use client';
import { useMemo } from 'react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';

// 实例属于当前 React 树；无全局语言变量，不依赖 Pages Router。
export default function TranslationProvider({ locale, namespaces, children }) {
    const instance = useMemo(() => {
        const i18n = createInstance();
        i18n.init({
            lng: locale, fallbackLng: false,
            resources: { [locale]: namespaces },
            ns: Object.keys(namespaces), defaultNS: 'common',
            initImmediate: false,
            interpolation: { escapeValue: false },
            react: { useSuspense: false },
        });
        return i18n;
    }, [locale, namespaces]);
    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
