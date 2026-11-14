import { sanitizeRichHtml } from '@src/lib/safe-content';
import { useEffect, useId, useRef } from 'react';
import classnames from 'classnames';
import Style from './index.module.scss';

import useTranslation from '@src/lib/i18n/client';

const activeDialogs = [];
let bodyWasLocked = false;

export default function Modal(props) {
    const {
        className, visible, children,
        title, content, onCancel, cancelText, onOk, okText, close, closeFn,
        hideFooter ,hasTitle=true, classNamePro
    } = props;
    const { t } = useTranslation('common');

    const titleId = useId();
    const dialogRef = useRef(null);
    const dismissRef = useRef(null);
    useEffect(() => { dismissRef.current = closeFn || onCancel; }, [closeFn, onCancel]);
    useEffect(() => {
        if (!visible || !dialogRef.current) return;
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;
        if (activeDialogs.length === 0) bodyWasLocked = document.body.classList.contains('no-scroll');
        activeDialogs.push(dialog);
        document.body.classList.add('no-scroll');
        const focusables = () => [...dialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
            .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length > 0);
        (focusables()[0] || dialog).focus();
        const handleKey = event => {
            if (activeDialogs.at(-1) !== dialog) return;
            if (event.key === 'Escape' && dismissRef.current) {
                event.preventDefault();
                event.stopPropagation();
                dismissRef.current();
            }
            if (event.key !== 'Tab') return;
            const elements = focusables();
            const first = elements[0] || dialog;
            const last = elements.at(-1) || dialog;
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
                event.preventDefault(); first.focus();
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('keydown', handleKey);
            const wasTop = activeDialogs.at(-1) === dialog;
            const index = activeDialogs.indexOf(dialog);
            if (index !== -1) activeDialogs.splice(index, 1);
            if (activeDialogs.length === 0 && !bodyWasLocked) document.body.classList.remove('no-scroll');
            if (wasTop && previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
        };
    }, [visible]);

    // 根据 visible 属性来确定是否显示 Modal
    if (!visible) {
        return null;
    };

    return (
        <div className={className}>
            <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1}
                aria-labelledby={hasTitle ? titleId : undefined} aria-label={!hasTitle ? (title || t('modal.title')) : undefined}
                className={`${Style.modal} ${classNamePro} ${props.modalbox||''}`}>
                <div className={`${Style.modalheader} ${!hasTitle?Style.modalnoTitleBar:''}     ${props.modalHeader||''}  `} >
                    {
                        hasTitle && <span id={titleId}>{title || t('modal.title')}</span>
                    }
                    {
                        close
                        &&
                        <button type="button" aria-label={t('accessibility.close')} className={Style.closeBtn} onClick={closeFn}>
                            <i className="iconfont icon-close" aria-hidden="true"></i>
                        </button>
                    }
                </div>
                {
                    children
                        ?
                        children
                        :
                        <div className={Style.modalcontent} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }} />
                }
                {!hideFooter?<div className={Style.modalfooter}>
                    {
                        onCancel
                        &&
                        <button type="button"
                            className={classnames({
                                [Style.modalbtn]: true,
                                [Style['modalbtncancel']]: true,
                            })}
                            onClick={onCancel}
                        >
                            {cancelText ? cancelText : t('modal.cancelText')}
                        </button>
                    }
                    {
                        onOk
                        &&
                        <button type="button"
                            className={classnames({
                                [Style.modalbtn]: true,
                                [Style['modalbtnok']]: true,
                            })}
                            onClick={onOk}
                        >
                            {okText ? okText : t('modal.okText')}
                        </button>
                    }
                </div>:''}
            </div>
            <div className={Style.modalmask}></div>
        </div>
    )
}