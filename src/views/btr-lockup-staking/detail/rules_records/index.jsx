'use client';

import { useState, useEffect, useMemo } from 'react';

import Style from './index.module.scss';
import Table from '@components/table';
import Pagination from '@components/pagination';

import { formatNumSplit, formatDate } from '@utils/common';
import useTranslation from 'next-translate/useTranslation';

import { getProductRecord } from '@service/btr-lockup';

const RelesRecords = ({ tokenStr, coinDetail })  => {
    const [tabsId, setTabsId] = useState(0);
    const [records, setRecords] = useState([]);
    const [pageNo, setPgeNo] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const { t } = useTranslation('btrlockup');

    const progressId = useMemo(() => {
        return coinDetail?.progressId;
    }, [coinDetail]);

    // 获取锁仓币种列表
    function lockUpCoinList () {
        const params = {
            progressId,
            page: pageNo
        };
        getProductRecord(params).then(res => {
            const { code, data } = res;
            if (code === '200') {
                const pageSize = Math.ceil(data.totalCount / data?.pageSize) || 1;

                setRecords(data.records);
                setTotalPage(pageSize);
            };
        });
    };

    useEffect(() => {
        if (!progressId) return;
        lockUpCoinList();
    }, [progressId, pageNo]);

    const columns = [
        { // 开始时间
            title: t('detail.startTime'),
            key: 'profitStartTimestamp',
            dataIndex: 'profitStartTimestamp',
            render: text => formatDate(text, 'yyyy-MM-dd hh:mm:ss')
        },
        { // 结束时间
            title: t('detail.endTime'),
            key: 'profitEndTimestamp',
            dataIndex: 'profitEndTimestamp',
            render: text => formatDate(text, 'yyyy-MM-dd hh:mm:ss')
        },
        { // 币种
            title: t('detail.coin'),
            key: 'Coin Detail',
            render: (text, record) => (
                <>
                    <p>{record.orderCoin.toUpperCase()}</p>
                    <p>{record.lockCoin.toUpperCase()}</p>
                </>
            )
        },
        { // 数量
            title: t('detail.amount'),
            key: 'Amount Detail',
            render: (text, record) => (
                <>
                    <p>{formatNumSplit(record.orderAmount)}</p>
                    <p>{formatNumSplit(record.lockAmount)}</p>
                </>
            )
        },
        { // 利率
            title: t('detail.interestRate'),
            key: 'Rate Detail',
            render: (text, record) => (
                <>
                    <p>{record.orderCoinRate}%</p>
                    <p>{record.lockCoinRate}%</p>
                </>
            )
        },
        { // 周期
            title: t('detail.period'),
            key: 'Period Detail',
            render: (text, record) => (
                <span>{record.interval} {t('detail.days')}</span>
            )
        },
        { // 收益
            title: t('detail.totalRewards'),
            key: 'Rewards',
            render: (text, record) => (
                <>
                    <p>{record.orderCoinReward} {record.orderCoin.toUpperCase()}</p>
                    <p>{record.lockCoinReward} {record.lockCoin.toUpperCase()}</p>
                </>
            )
        },
        { // 状态
            title: t('detail.status'),
            key: 'Status Detail',
            render: (text, record) => (
                <span>
                    {record.status == 0 && t('detail.invested')}
                    {record.status == 1 && t('detail.disbursed')}
                </span>
            )
        }
    ];

    return (
        <>
            <div className={Style.tabs}>
                <ul>
                    <li
                        className={tabsId === 0 ? Style.current : ''}
                        onClick={() => setTabsId(0)}
                    >{t('detail.rules')}</li>
                    {
                        tokenStr
                        &&
                        <li
                            className={tabsId === 1 ? Style.current : ''}
                            onClick={() => setTabsId(1)}
                        >{t('detail.records')}</li>
                    }
                </ul>
            </div>
            {
                tabsId === 0
                &&
                <div className={Style.rules}>
                <ol>
                        <li>{t('detail.rules1',{rate: '0.4'})}</li>
                        <li>{t('detail.rules2')}</li>
                        <li>{t('detail.rules3')}</li>
                        <li>{t('detail.rules4')}</li>
                        <li>{t('detail.rules5')}</li>
                    </ol>
                </div>
            }
            {
                tabsId === 1
                &&
                <div className={Style.list}>
                    <Table columns={columns} dataSource={records || []} />
                    {
                        totalPage > 0
                        &&
                        <Pagination
                            currentPage={pageNo}
                            pageSize={10}
                            total={records?.length || 0}
                            totalPages={totalPage || 0}
                            onPageChange={(page) => setPgeNo(page)}
                        />
                    }
                </div>
            }
        </>
    )
};

export default RelesRecords;