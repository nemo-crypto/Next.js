import React from 'react';
import Style from './index.module.scss';

import useTranslation from '@src/lib/i18n/client';

const Table = ({ columns, dataSource, expandedRowRender, expandedRowKeys }) => {
    const { t } = useTranslation('common');

    return (
        <table className={Style.component}>
            <thead>
                <tr>
                    {columns?.map((column) => (
                        <th
                            key={column.key}
                            style={{
                                width: column.width || 'auto',
                                textAlign: column.align || 'left'
                            }}
                        >
                            {typeof column.title === 'string' ? column.title : column.title()}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
            {
                dataSource.length > 0
                ?
                dataSource?.map((row, index) => (
                    <React.Fragment key={index}>
                        <tr className={index % 2 === 0 ? Style['even-row'] : Style['odd-row']}>
                            {columns?.map((column) => (
                                <td
                                    key={column.key}
                                    style={{
                                        width: column.width || 'auto',
                                        textAlign: column.align || 'left'
                                    }}
                                >
                                    {
                                        column.render
                                        ? column.render(row[column.dataIndex], row, index)
                                        : row[column.dataIndex]
                                    }
                                </td>
                            ))}
                        </tr>
                        {
                            expandedRowRender
                            &&
                            expandedRowKeys?.includes(index)
                            &&
                            <tr>
                                <td colSpan={columns.length + 1}>
                                    <div className={Style.details}>{expandedRowRender(row)}</div>
                                </td>
                            </tr>
                        }
                    </React.Fragment>
                ))
                :
                <tr>
                    <td colSpan={columns.length + 1}>
                        <div className={Style.nodata}>
                            <div className={Style.nodata_box}>
                                <p className={Style.nodata_pic}></p>
                                <p>{t('other.noData')}</p>
                            </div>
                        </div>
                    </td>
                </tr>
            }
            </tbody>
        </table>
    );
};

export default Table;
