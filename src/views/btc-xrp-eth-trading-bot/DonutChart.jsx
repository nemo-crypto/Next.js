import React, { useEffect } from 'react';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, CanvasRenderer]);

const DonutChart = ({ item, colors,chartId }) => {
  useEffect(() => {

    // 初始化图表
    const myChart = echarts.init(document.getElementById(chartId));

    // 提取数据
    const coins = item || [];
    const proportions = coins.map((coin) => coin.proportion);
    // const colors = colorBgs||[ '#5B8FF9', '#FF99C3', '#269A99', '#FF9D4D', '#9270CA', '#6DC8EC', '#E8684A', '#F6BD16', '#5D7092', '#5B8FF9']; // 自定义颜色

    // 计算总和
    const total = proportions.reduce((acc, val) => acc + val, 0);

    // 计算角度
    const angles = proportions.map((proportion) => (360 * proportion) / total);

    // 计算扇形的起始角度和结束角度
    let startAngle = 0;
    const data = angles.map((angle, index) => {
      const endAngle = startAngle + angle;
      const color = colors[index % colors.length];
      const coinName = coins[index].coin;
      startAngle = endAngle;

      return {
        value: angle,
        itemStyle: {
          color: color,
        },
        emphasis: {
          itemStyle: {
            color: color,
          },
        },
        name: coinName,
      };
    });

    // 图表配置
    const options = {
      title: {
        show: false, // 隐藏标题
        text: '圆环形饼图示例',
        subtext: 'React + ECharts',
        left: 'center',
      },
      series: [
        {
          name: 'Proportion',
          type: 'pie',
          radius: ['65%', '100%'],
        //   radius: '90%',
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            scale:1,
            // label: {
            //   show: true,
            //   fontSize: '30',
            //   fontWeight: 'bold',
            // },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(options);

    // 在组件销毁时销毁图表
    return () => {
      myChart.dispose();
    };
  }, [item, chartId]);

  return <div id={chartId} style={{ width: '97px', height: '97px' }}></div>;
};

export default DonutChart;
