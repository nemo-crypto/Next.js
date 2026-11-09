'use client';

import React, { useState } from 'react'

// import './index.scss'
import Style from './index.module.scss';
import useTranslation from 'next-translate/useTranslation';
// @ts-ignore
import ReactHtmlParser from 'html-react-parser';
// const ReactHtmlParser = (a:any)=>{return a}

export default function RulesList(props:any) {
  const { ruleLang } = props;
  const [questionIndex, setQuestionIndex] = useState<number | string>(-1);

  // 问答切换
  const handleQaIndexChange = (index:any) => {
    setQuestionIndex(questionIndex === index ? '' : index)
  };
  const { t ,lang} = useTranslation('autoinvest');

  return (
    <div className={Style['trade-rule-block']}>
      <div  className={Style['rule-title']}>{ ruleLang?.title }</div>
      {
        ruleLang&&ruleLang.ruleBlock&&ruleLang.ruleBlock.length>1&&ruleLang.ruleBlock.map((item:any, index:any) => {
          return (
            <div  className={Style['rule-column']} key={index}>
              <div  className={Style['colume-title']} onClick={() => handleQaIndexChange(index)}>
                <span>{index+1}.{item.name}</span>
                <i onClick={() => handleQaIndexChange(index)} className={`iconfont ${questionIndex === index ? 'icon-arrow-up' : 'icon-arrow-down'}`} />
              </div>
              {
                questionIndex === index && 
                <>
                  {
                    item.type == 1 
                    ? 
                    item.rulesList&&item.rulesList.length>0&&item.rulesList.map((itemType:any,indexType:any) => {
                      return (
                        <div  className={Style['erList']} key={indexType}>
                          <div  className={Style['erTitle']}>{itemType.name}</div>
                          {itemType.rulesList&&itemType.rulesList.length>0&&itemType.rulesList.map((innerItem:any, innnerIndex:any) => {
                            return <div  className={Style['rule-content-line']} key={innnerIndex}>{ReactHtmlParser(innerItem)}</div>
                          })}
                        </div>
                      )
                    })
                    :
                    item.rulesList&&item.rulesList.length>0&&item.rulesList.map((innerItem:any, innnerIndex:any) => {
                      return <div  className={Style['rule-content-line']} key={innnerIndex}>{ReactHtmlParser(innerItem)}</div>
                    })
                  }
                </>
              }
            </div>
          )
        })
      }
    </div>
  )
}
