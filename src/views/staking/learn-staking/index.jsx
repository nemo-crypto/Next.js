
import Style from './index.module.scss';

import { mapLocalesIdToKoot } from '@utils/common';
import { translate } from '@src/lib/i18n/server';

const LearnStaking = ({ locale: lang, messages }) => {
    const t = (key, values) => translate(messages, key, values);
    const convertLocaleID = lang === 'en' ? '' : `?hl=${mapLocalesIdToKoot(lang)}`;

    return (
        <>

            <div className={Style.component}>
                <div className={Style.container}>
                    <h1>{t('main.title')}</h1>
                    <div className={Style.container_box}>
                        <h2>{t('main.section1_title')}</h2>
                        <ul>
                            <li>{t('main.section1_content1')}</li>
                        </ul>
                    </div>
                    <div className={Style.container_box}>
                        <h2>{t('main.section2_title')}</h2>
                        <ul>
                            <li dangerouslySetInnerHTML={{ __html: t('main.section2_content1', {
                                Ethereum: `<a href="/trade/eth_usdt${convertLocaleID}" target="_bank">Ethereum</a>`,
                                Cardano: `<a href="/trade/ada_usdt${convertLocaleID}" target="_bank">Cardano</a>`,
                                Solana: `<a href="/trade/sol_usdt${convertLocaleID}" target="_bank">Solana</a>`,
                                Bitcoin: `<a href="/trade/btc_usdt${convertLocaleID}" target="_bank">Bitcoin</a>`
                            }) }} />
                            <li>{t('main.section2_content2')}</li>
                            <li>{t('main.section2_content3')}</li>
                            <li dangerouslySetInnerHTML={{ __html: t('main.section2_content4') }} />
                        </ul>
                    </div>
                    <div className={Style.container_box}>
                        <h2>{t('main.section3_title')}</h2>
                        <ul>
                            <li>{t('main.section3_content1')}</li>
                            <li>
                                <div className={Style.table}>
                                    <div className={Style.table_tr}>
                                        <div className={Style.table_td}>Coin</div>
                                        <div className={Style.table_td}>APR*</div>
                                    </div>
                                    <div className={Style.table_tr}>
                                        <div className={Style.table_td}>Solana SOL</div>
                                        <div className={Style.table_td}>6.61%</div>
                                    </div>
                                    <div className={Style.table_tr}>
                                        <div className={Style.table_td}>Avalanche AVAX</div>
                                        <div className={Style.table_td}>20.18%</div>
                                    </div>
                                    <div className={Style.table_tr}>
                                        <div className={Style.table_td}>Fantom FTM</div>
                                        <div className={Style.table_td}>8.63%</div>
                                    </div>
                                    <div className={Style.table_tr}>
                                        <div className={Style.table_td}>Polkadot DOT</div>
                                        <div className={Style.table_td}>16%</div>
                                    </div>
                                </div>
                            </li>
                            <li>{t('main.section3_content2')}</li>
                        </ul>
                    </div>
                    <div className={Style.container_box}>
                        <h2>{t('main.section4_title')}</h2>
                        <ul>
                            <li dangerouslySetInnerHTML={{ __html: t('main.section4_content1',{
                                registerUrl: `/user/register${convertLocaleID}`
                            }) }} />
                            <li>{t('main.section4_content2')}</li>
                            <li>{t('main.section4_content3')}</li>
                            <li>{t('main.section4_content4')}</li>
                        </ul>
                    </div>
                    <div className={Style.container_box}>
                        <h2>{t('main.section5_title')}</h2>
                        <ul>
                            <li dangerouslySetInnerHTML={{ __html: t('main.section5_content1',{
                                powerPiggyUrl: `${lang === 'en' ? '' : `/${lang}`}/flexible-staking`
                            }) }} />
                            <li dangerouslySetInnerHTML={{ __html: t('main.section5_content2') }} />
                            <li dangerouslySetInnerHTML={{ __html: t('main.section5_content3',{
                                yieldFramUrl: `/yield-farming/${convertLocaleID}`
                            }) }} />
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
};

export default LearnStaking;