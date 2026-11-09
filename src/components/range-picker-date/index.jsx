import { useEffect, useState, useRef } from 'react';

import { format, addDays } from 'date-fns';
import { DayPicker } from 'react-day-picker';

import Style from './index.module.scss';

const RangePickerDate = (props) => {
    // 日历上默认选项
    const [selectedRange, setSelectedRange] = useState({from:addDays(new Date(), -6), to:new Date()});
    // 输入框 默认 开始时间
    const [fromValue, setFromValue] = useState(format(addDays(new Date(), -6),'y-MM-dd'));
    // 输入框 默认 结束时间
    const [toValue, setToValue] = useState(format(new Date(),'y-MM-dd'));
    // 日历是否展示
    const [isPopperOpen, setIsPopperOpen] = useState(false);

    const popupRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                closePopper();
            };
        }
        
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);


    const handleRangeSelect = (range) => {
        setSelectedRange(range);
        
        props.selectRangeDatCb({
            start:range?.from && format(range.from, 'y-MM-dd'),
            end:range?.to && format(range.to, 'y-MM-dd')
        });

        range?.from ? setFromValue(format(range.from, 'y-MM-dd')) : setFromValue('');
        range?.to ? setToValue(format(range.to, 'y-MM-dd')) : setToValue('');
    };

    const handleButtonClick = () => {
        setIsPopperOpen(true);
    };

    const closePopper = () => {
        setIsPopperOpen(false);
    };

    return (
        <div className={Style.component} ref={popupRef}>
            <div className={Style.inputWrap} onClick={handleButtonClick}>
                <input
                    readOnly
                    className={Style["range-picker-input"]}
                    size={10}
                    placeholder="Start Date"
                    value={fromValue}
                />
                <span>-</span>
                <input
                    readOnly
                    className={Style["range-picker-input"]}
                    size={10}
                    placeholder="End Date"
                    value={toValue}
                />
            </div>
            {
                isPopperOpen
                && 
                <DayPicker
                    min={Number(props.min) || undefined}
                    max={Number(props.max) || undefined}
                    mode="range"
                    selected={selectedRange}
                    onSelect={handleRangeSelect}
                />
            }
        </div>
    )
};

export default RangePickerDate;