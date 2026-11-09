import React, { useEffect } from 'react';
import * as echarts from 'echarts/core';
import { LineChart as EChartsLine, CandlestickChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([EChartsLine, CandlestickChart, GridComponent, MarkLineComponent, CanvasRenderer]);
import { coinIconPath, formatDate, formatNumSplit } from '@utils/common';
import { el } from 'date-fns/locale';

const LineChart = ({ array, chartId, curChartTab }) => {
  useEffect(() => {

    // 初始化图表
    const myChart = echarts.init(document.getElementById(chartId));

    let datax = []
    let datay = []
    let min_price = 0
    let max_price = 0
    // 折线
    array.forEach(item => {
      if (curChartTab === 1) {
        datax.push(formatDate(item?.timestamp, 'hh:mm'))
        datay.push(item?.close)
        //  取最大、最小值
        let sortArray = array.slice(0).sort((a, b) => a['close'] - b['close']);
        min_price = sortArray[0]?.close
        max_price = sortArray[sortArray.lenght - 1]?.close
      } else {
        datax.push(formatDate(item?.timestamp, 'hh:mm'))
        datay.push([item?.open, item?.high, item?.low, item?.close])
        //  取最大、最小值
        let sortArrayLow = array.slice(0).sort((a, b) => a['low'] - b['low']);
        min_price = sortArrayLow[0]?.low
        let sortArrayHigh = array.slice(0).sort((a, b) => a['high'] - b['high']);
        max_price = sortArrayHigh[sortArrayHigh.lenght - 1]?.high
      }
    })

    // 折线图
    let lineOption = {
      grid: {
        left: '0%',
        right: '0%',
        bottom: '5%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        axisTick: {
          show: false // 不显示坐标轴刻度线
        },
        axisLine: {
          show: true, // 坐标轴线
          lineStyle: {    //坐标轴的线
            color: '#EBEDEF',   //线的颜色
            width: 1,    //线的粗细程度    (用数字表示)
          }
        },
        axisLabel: {
          show: true, // 不显示坐标轴上的文字
          margin: 13, // 距离X轴距离
          textStyle: {
            color: '#828C9B',
            fontSize: '12px',
            fontWeight: '400',
          }
        },
        type: 'category',
        boundaryGap: true,
        data: datax
      },
      yAxis: {
        type: 'value',
        position: 'right',
        min: min_price, // 配置 Y 轴刻度最小值
        max: max_price,
        axisLine: {       //y轴
          show: true,
          lineStyle: {    //坐标轴的线
            color: '#EBEDEF',   //线的颜色
            width: 1,    //线的粗细程度    (用数字表示)
          }
        },
        axisTick: {       //y轴刻度线
          show: false
        },
        splitLine: {     //网格线
          show: true,
          lineStyle: {    //坐标轴的线
            color: '#EBEDEF',   //线的颜色
            width: 1,    //线的粗细程度    (用数字表示)
          }
        },
        axisLabel: {
          show: true, // 不显示坐标轴上的文字
          textStyle: {
            color: '#828C9B',
            fontSize: '12px',
            fontWeight: '400',
          }
        },
      },
      series: [
        {
          data: datay,
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          itemStyle: {
            color: '#E6AA1E'
          },
          lineStyle: {
            width: 2,  //设置折线粗细
          },
          markLine: {
            data: [
              {
                yAxis: 5000,
                name: '平均值',
                lineStyle:
                {
                  type: 'dotted',
                  color: '#0ABE82',
                  width: 1
                }
              },
            ],
            symbol: ['none', 'none'],
            label: {
              normal: {
                formatter: '599M',
                textStyle: {
                  color: "0ABE82",
                  align: "right",
                  fontSize: 12,
                },
              }
            }
          }
        }
      ]
    };

    // 蜡烛图
    let candleOption = {
      grid: {
        left: '0%',
        right: '0%',
        bottom: '5%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        data: datax,
        axisTick: {
          show: false // 不显示坐标轴刻度线
        },
        axisLine: {
          show: true, // 坐标轴线
          lineStyle: {    //坐标轴的线
            color: '#EBEDEF',   //线的颜色
            width: 1,    //线的粗细程度    (用数字表示)
          }
        },
        axisLabel: {
          show: true, // 不显示坐标轴上的文字
          margin: 13, // 距离X轴距离
          textStyle: {
            color: '#828C9B',
            fontSize: '12px',
            fontWeight: '400',
          }
        },
        type: 'category',
        boundaryGap: true,
      },
      yAxis: {
        type: 'value',
        position: 'right',
        min: min_price, // 配置 Y 轴刻度最小值
        max: max_price,
        axisLine: {       //y轴
          show: true,
          lineStyle: {    //坐标轴的线
            color: '#EBEDEF',   //线的颜色
            width: 1,    //线的粗细程度    (用数字表示)
          }
        },
        axisTick: {       //y轴刻度线
          show: false
        },
        splitLine: {     //网格线
          show: true,
          lineStyle: {    //坐标轴的线
            color: '#EBEDEF',   //线的颜色
            width: 1,    //线的粗细程度    (用数字表示)
          }
        },
        axisLabel: {
          show: true, // 不显示坐标轴上的文字
          textStyle: {
            color: '#828C9B',
            fontSize: '12px',
            fontWeight: '400',
          }
        },
      },
      series: [
        {
          type: 'candlestick',
          data: datay,
        }
      ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(curChartTab === 1 ? lineOption : candleOption);

    // 在组件销毁时销毁图表
    return () => {
      myChart.dispose();
    };
  }, [array, chartId, curChartTab]);

  return <div id={chartId} style={{ width: '100%', height: '100%' }}></div>;
};

export default LineChart;
