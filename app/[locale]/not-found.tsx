'use client';
import Link from '@components/localized-link';
import useTranslation from '@src/lib/i18n/client';
export default function NotFound() {
    const { t } = useTranslation('common');
    return <main className='page-feedback'><h1>404 — {t('feedback.notFoundTitle')}</h1>
        <p>{t('feedback.notFoundDescription')}</p><Link href='/'>{t('feedback.home')}</Link></main>;
}
