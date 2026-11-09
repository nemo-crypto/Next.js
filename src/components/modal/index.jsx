import { useEffect } from 'react';
import classnames from 'classnames';
import Style from './index.module.scss';

import useTranslation from '@src/lib/i18n/client';

export default function Modal(props) {
    const {
        className, visible, children,
        title, content, onCancel, cancelText, onOk, okText, close, closeFn,
        hideFooter ,hasTitle=true, classNamePro
    } = props;
    const { t } = useTranslation('common');

    useEffect(() => {
        if (visible) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        };
    }, [visible]);

    // 根据 visible 属性来确定是否显示 Modal
    if (!visible) {
        return null;
    };

    return (
        <div className={className}>
            <div className={`${Style.modal} ${classNamePro} ${props.modalbox||''}`}>
                <div className={`${Style.modalheader} ${!hasTitle?Style.modalnoTitleBar:''}     ${props.modalHeader||''}  `} >
                    {
                        hasTitle && <span>{title || t('modal.title')}</span>
                    }
                    {
                        close
                        &&
                        <span className={Style.closeBtn} onClick={closeFn}>
                            <i class="iconfont icon-close"></i>
                        </span>
                    }
                </div>
                {
                    children
                        ?
                        children
                        :
                        <div className={Style.modalcontent} dangerouslySetInnerHTML={{ __html: content || '' }} />
                }
                {!hideFooter?<div className={Style.modalfooter}>
                    {
                        onCancel
                        &&
                        <div
                            className={classnames({
                                [Style.modalbtn]: true,
                                [Style['modalbtncancel']]: true,
                            })}
                            onClick={onCancel}
                        >
                            {cancelText ? cancelText : t('modal.cancelText')}
                        </div>
                    }
                    {
                        onOk
                        &&
                        <div
                            className={classnames({
                                [Style.modalbtn]: true,
                                [Style['modalbtnok']]: true,
                            })}
                            onClick={onOk}
                        >
                            {okText ? okText : t('modal.okText')}
                        </div>
                    }
                </div>:''}
            </div>
            <div className={Style.modalmask}></div>
        </div>
    )
}