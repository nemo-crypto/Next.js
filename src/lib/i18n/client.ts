'use client';
import { useTranslation as useI18next } from 'react-i18next';
export default function useTranslation(namespace = 'common') {
    const { t, i18n } = useI18next(namespace);
    return { t, lang: i18n.language };
}
