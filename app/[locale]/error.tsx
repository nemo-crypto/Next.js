'use client';
import useTranslation from '@src/lib/i18n/client';
export default function ErrorPage({ reset }: { reset: () => void }) {
    const { t } = useTranslation('common');
    return <main className='page-feedback' role='alert'>
        <h1>{t('feedback.errorTitle')}</h1><p>{t('feedback.errorDescription')}</p>
        <button type='button' onClick={reset}>{t('feedback.retry')}</button>
    </main>;
}
