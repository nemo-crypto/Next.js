'use client';

import { useState, useEffect, useRef } from 'react';
import Style from './index.module.scss';


const Faq = ({ faqList, onChange }) => {

    useEffect(() => {

    }, []);

    const handleExpand = (row) => {
        faqList.forEach(item => {
            if (row.id === item.id) {
                item.expand = !item.expand
            }
        })
        onChange(faqList)
    }

    return (
        <>
            <div className={Style.component}>
                <div className={Style.fqa}>
                    <div className={Style.commonTitle}>FAQ</div>
                    <div className={Style.faqList}>
                        {
                            faqList.map((item, index) => (
                                <div className={Style.fqaItem} key={index}>
                                    <div className={Style.header} onClick={() => handleExpand(item)}>
                                        <div className={Style.title}>{item?.q}</div>
                                        <i className={`iconfont ${item.expand ? 'icon-arrow-up' : "icon-arrow-down"}`}></i>
                                    </div>
                                    {item.expand && <div className={Style.desc}>
                                        {item?.a}
                                    </div>}
                                </div>
                            ))
                        }
                    </div >
                </div>
            </div>
        </>
    )
};

export default Faq;