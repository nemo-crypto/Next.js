'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from '@components/image';

import Style from './index.module.scss';

import CustomSelect from '@components/select';
import Table from '@components/table';
import Pagination from '@components/pagination';
import RangePickerDate from '@components/range-picker-date';
import { format, addDays, getTime } from 'date-fns';

import { coinIconPath, formatDate, formatNumSplit } from '@utils/common';
import Cookies from 'js-cookie';
import { token } from '@constants/cookies';
import useTranslation from '@src/lib/i18n/client';

import { getFlexibleRecordCoinList, getFlexibleRecordList, getFixedRecordList } from '@service/flexible-staking';

const FlexibleStaking = ()  => {
    const [tokenStr, setTokenStr] = useState('');
    const [startDate, setStartDate] = useState(format(addDays(new Date(), -6), 'y-MM-dd'));
	const [endDate, setEndDate] = useState(format(new Date(), 'y-MM-dd'));
    const [baseCoin, setBaseCoin] = useState('');
    const [baseCoinList, setBaseCoinList] = useState([]);
    const [type, setType] = useState(2);
    const [recordList, setRecordList] = useState([]);
    const [pageCount, setPageCount] = useState(0);
	const [pageNo, setPageNo] = useState(1);

    const pageSize = 10;
    const { t } = useTranslation('flexible');

    const typeList = [
        { value: '2', label: t('record.investmentOrdinary') },
        { value: '3', label: t('record.investmentUnfreeze') },
        { value: '4', label: t('record.investmentEarnings') },
        { value: '7', label: t('record.investmentVip') },
        { value: '8', label: t('record.investmentVipEarn') },
        { value: '11', label: t('record.investmentFixed') },
        { value: '12', label: t('record.fixedRedemption') },
        { value: '13', label: t('record.fixedInterest') }
    ];

    useEffect(() => {
        const _tokenStr = Cookies.get(token) || '';
        setTokenStr(_tokenStr);
    }, []);

    // 获取产品列表
    const fetchCoinList = useCallback(async () => {
        const fetchCoin = await getFlexibleRecordCoinList();
        let _coinList = [{ value: '', label: 'All' }];

        if (fetchCoin?.code == 200) {
            fetchCoin?.data?.map(item => _coinList.push({ value: item, label: item }));
            setBaseCoinList(_coinList);
        };
    }, []);

    useEffect(() => {
        fetchCoinList();
    }, [fetchCoinList]);

    // 日期选择
	function selectRangeDateFn(data) {
		setStartDate(data.start);
		setEndDate(data.end);
	};

    // 获取定期订单列表
	const fetchFixedRecordList = () => {
		const startTime = `${startDate} 00:00:00`;
		const endTime = `${endDate} 23:59:59`;
        let initType = '';

        if (type == '11') {
            initType = 1;
        } else if (type == '12') {
            initType = 2;
        } else if (type == '13') {
            initType = 3;
        };

		const params = {
            startTime,
			endTime,
			pageSize,
			page: pageNo,
            coin: baseCoin,
			type: initType
		};

		getFixedRecordList(params).then(res => {
            const { code, data } = res;

            if (code == 200) {
                const pageTotal = Math.ceil(data.totalCount / data.pageSize) || 0;
                setRecordList(data.records || []);
			    setPageCount(pageTotal);
            };
		});
	};

    // 获取订单列表
	const fetchRecordList = () => {
		const startTime = getTime(new Date(`${startDate} 00:00:00`));
		const endTime = getTime(new Date(`${endDate} 23:59:59`));
		const params = {
            startTime,
			endTime,
			pageSize,
			pageNo,
            coin: baseCoin,
			type
		};

		getFlexibleRecordList(params).then(res => {
            const { code, data } = res;

            if (code == 0) {
                setRecordList(data.data || []);
			    setPageCount(data.totalPageCount || 0)
            };
		});
	};

    useEffect(() => {
        fetchRecordList();
    }, []);

    // 币种选择
	const renderCoinOption = (item) => (
		<div className={Style.search_select_coin}>
			{
				item.label === 'All'
				?
				<em style={{width: '16px', marginRight: '5px'}}/>
				:
				<Image
					src={coinIconPath(item.label)}
					alt={item.label}
					width={16}
					height={16}
					onError={e => e.target.src = '/media/images/default_icon.png'}
				/>
			}
			<span>{item.label.toUpperCase()}</span>
		</div>
	);

    // 选择基础币
	const handleBaseCoinSelect = (item) => {
		setBaseCoin(item);
	};

    // 选择类型
	const handleTypeSelect = (item) => {
		setType(item.value)
	};

    // 搜索
	const handleSearchClick = () => {
		setPageNo(1);

        if (type == '11' || type == '12' || type == '13') {
            fetchFixedRecordList();
        } else {
            fetchRecordList();
        };
	};

    // 翻页
	const handlePageChange = (page) => {
		setPageNo(page);

        if (type == '11' || type == '12' || type == '13') {
            fetchFixedRecordList();
        } else {
            fetchRecordList();
        };
	};

    const columns = [
        {
			title: t('record.time'),
			key: "time",
			dataIndex: 'time',
			render: (text) => formatDate(text, 'yyyy-MM-dd hh:mm:ss')
		},
		{
			title: t('record.pair'),
			key: 'coin',
            dataIndex: 'coin',
            align: 'center',
			render: (text) => text.toUpperCase()
		},
		{
			title: t('record.type'),
			dataIndex: 'type',
			key: 'type',
            align: 'center',
			render: (text, item) => 
                <>
                    {item.id && text == 2 && t('record.investmentOrdinary')}
                    {item.id && text == 3 && t('record.investmentUnfreeze')}
                    {item.id && text == 4 && t('record.investmentEarnings')}
                    {item.id && text == 7 && t('record.investmentVip')}
                    {item.id && text == 8 && t('record.investmentVipEarn')}
                    {item.uid && text == 1 && t('record.investmentFixed')}
                    {item.uid && text == 2 && t('record.fixedRedemption')}
                    {item.uid && text == 3 && t('record.fixedInterest')}
                </>
		},
		{
			title: t('record.amount'),
			dataIndex: 'side',
			key: 'side',
            align: 'right',
			render: (text, item) => `${formatNumSplit(item.amount)} ${item.coin.toUpperCase()}`
		},
    ];

    return (
        <>

            <div className={Style.component}>
                <div className="basic">
                    <h2>{t('record.pageTitle')}</h2>
                    <div className={Style.search}>
                        <div className={Style.search_name}>{t('record.date')}:</div>
                        <RangePickerDate selectRangeDatCb={selectRangeDateFn} max="92"/>
                        <div className={Style.ml20}></div>
                        <div className={Style.search_name}>{t('record.pair')}:</div>
                        <div className={Style.search_select}>
                            <CustomSelect
                                renderLabelProp={option => option ? renderCoinOption(option) : 'All'}
                                showSearch={true}
                                options={baseCoinList}
                                onSelect={handleBaseCoinSelect}
                                renderListOption={item => renderCoinOption(item)}
                            />
                        </div>
                        <div className={Style.ml20}></div>
                        <div className={Style.search_name}>{t('record.type')}:</div>
                        <div className={Style.search_select}>
                            <CustomSelect
                                options={typeList}
                                onSelect={handleTypeSelect}
                                defaultValue={0}
                            />
                        </div>
                        <div className={Style.ml20}></div>
					    <div className={Style.search_btn} onClick={handleSearchClick}>{t("record.search")}</div>
                    </div>
                    <div className={Style.list}>
                        <Table
                            columns={columns}
                            dataSource={recordList}
                        />
                        {
                            pageCount > 1
                            &&
                            <Pagination
                                currentPage={pageNo}
                                pageSize={pageSize}
                                total={recordList.length || 0}
                                totalPages={pageCount}
                                onPageChange={handlePageChange}
                            />
                        }
                    </div>
                </div>
            </div>
        </>
    )
};

export default FlexibleStaking;