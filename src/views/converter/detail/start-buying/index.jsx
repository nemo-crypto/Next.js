'use client';

import { useState, useEffect, useRef } from 'react';
import Style from './index.module.scss';
import Image from '@components/image';
import card_1 from '@static/images/converter/card_1.png';
import card_2 from '@static/images/converter/card_2.png';
import card_3 from '@static/images/converter/card_3.png';
import card_left from '@static/images/converter/card_left.png';
import Link from '@src/components/localized-link';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from '@src/lib/navigation';


const StartBuying = ({ resInfo, isMobile, type }) => {

    const { t } = useTranslation('converter');
    const router = useRouter();
    // Start buying Bitcoin (BTC)
    const [cardList, setCardList] = useState([
        { url: card_1, path: 'user/register', title: t('home.startBuying_step1_title'), desc: t('home.startBuying_step1_desc') },
        { url: card_2, path: '/account/verification', title: t('home.startBuying_step2_title'), desc: t('home.startBuying_step2_desc') },
        { url: card_3, path: '/creditcard', title: t('home.startBuying_step3_title'), desc: t('home.startBuying_step3_desc', { coinFullName: resInfo?.baseCoin?.fullName }) }
    ])

    useEffect(() => {

    }, []);


    return (
        <>
            <div className={Style.component}>
                {/* Start buying Bitcoin (BTC) */}
                <div className={Style.startBuying}>
                    <div className={Style.commom_title}>{t('home.startBuying_title')}</div>
                    <div className={Style.sub}>{t('home.startBuying_sub')}</div>
                    <div className={Style.desc}>
                        <Link href="/how-to-buy/btc-bitcoin" rel="noopener noreferrer">
                            {t('home.startBuying_desc')}
                        </Link>
                    </div>
                    <div className={Style.cards}>
                        {cardList.map((item, index) => {
                            return (
                                <div className={Style.cardItem} key={index} onClick={() => {
                                    if (index == 0) {
                                        if (type == 'index') {
                                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_HomePage_startbuy_register_Button_Click') : window.gtag('event', 'Web_Converter_HomePage_startbuy_register_Button_Click'));
                                        } else {
                                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_startbuy_register_Button_Click') : window.gtag('event', 'Web_Converter_startbuy_register_Button_Click'));
                                        }
                                    }
                                    if (index == 1) {
                                        if (type == 'index') {
                                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_HomePage_startbuy_verify_Button_Click') : window.gtag('event', 'Web_Converter_HomePage_startbuy_verify_Button_Click'));
                                        } else {
                                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_startbuy_verify_Button_Click') : window.gtag('event', 'Web_Converter_startbuy_verify_Button_Click'));
                                        }
                                    }
                                    if (index == 2) {
                                        if (type == 'index') {
                                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_HomePage_startbuy_buy_Button_Click') : window.gtag('event', 'Web_Converter_HomePage_startbuy_buy_Button_Click'));
                                        } else {
                                            window.gtag && (isMobile ? window.gtag('event', 'H5_Converter_startbuy_buy_Button_Click') : window.gtag('event', 'Web_Converter_startbuy_buy_Button_Click'));
                                        }
                                    }
                                    router.push(`${item.path}`)
                                }}>
                                    <div className={Style.imgs}>
                                        <Image className={Style.card_icon} width={54} height={54} src={item?.url} alt='' />
                                        <Image className={Style.card_left} width={23} height={23} src={card_left} alt='' />
                                    </div>
                                    <h2>{item?.title}</h2>
                                    <h4>{item?.desc}</h4>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </>
    )
};

export default StartBuying;