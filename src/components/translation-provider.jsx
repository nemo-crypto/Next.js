'use client';
import { useMemo } from 'react';
import I18nContext from 'next-translate/context';
import transCore from 'next-translate/transCore';

// 不使用依赖 Pages Router 或 globalThis 的 provider，SSR 语言状态属于当前 React 树。
export default function TranslationProvider({ locale, namespaces, children }) {
    const value = useMemo(() => ({
        lang: locale,
        t: transCore({ config: {}, allNamespaces: namespaces, pluralRules: new Intl.PluralRules(locale), lang: locale }),
    }), [locale, namespaces]);
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
