import React, { useState, useRef, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler,
  BarElement,
  ChartEvent,
  ActiveElement,
  ScriptableContext
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { HourlyHistory as HourlyHistoryType } from '@/types/weather';
import Image from 'next/image';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HourlyHistoryProps {
  data: HourlyHistoryType | null;
  isLoading: boolean;
}

const HourlyHistory: React.FC<HourlyHistoryProps> = ({ data, isLoading }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('temperature');
  const [highlightedHourIndex, setHighlightedHourIndex] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // 当高亮小时索引变化时，滚动到对应行
  useEffect(() => {
    if (highlightedHourIndex !== null && rowRefs.current[highlightedHourIndex] && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const element = rowRefs.current[highlightedHourIndex];
      
      if (element) {
        // 计算需要滚动的位置
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // 检查元素是否在可视区域内
        const isInView = (
          elementRect.top >= containerRect.top &&
          elementRect.bottom <= containerRect.bottom
        );
        
        if (!isInView) {
          // 自动滚动到元素位置，使其在容器中可见
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }
    }
  }, [highlightedHourIndex]);

  // 初始化 refs 数组
  useEffect(() => {
    if (data && data.hours) {
      rowRefs.current = Array(data.hours.length).fill(null);
    }
  }, [data]);
  
  const metricOptions = [
    { id: 'temperature', label: '温度' },
    { id: 'precipitation', label: '降水' },
    { id: 'humidity', label: '湿度' },
    { id: 'windSpeed', label: '风速' }
  ];
  
  // 格式化时间显示
  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return `${date.getHours()}:00`;
  };
  
  const prepareChartData = () => {
    if (!data || !data.hours || data.hours.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: '暂无数据',
          data: [],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }],
      };
    }
    
    const labels = data.hours.map(hour => formatTime(hour.time));
    let chartData: number[] = [];
    let label = '';
    let color = '';
    
    switch (selectedMetric) {
      case 'temperature':
        chartData = data.hours.map(hour => hour.weatherData.temperature.value);
        label = '历史温度 (°C)';
        color = 'rgba(66, 133, 244, 1)'; // Google 蓝色
        break;
      case 'precipitation':
        chartData = data.hours.map(hour => hour.weatherData.precipitationProbability.value);
        label = '历史降水概率 (%)';
        color = 'rgba(52, 168, 83, 1)'; // Google 绿色
        break;
      case 'humidity':
        chartData = data.hours.map(hour => hour.weatherData.humidity.value);
        label = '历史湿度 (%)';
        color = 'rgba(234, 67, 53, 1)'; // Google 红色
        break;
      case 'windSpeed':
        chartData = data.hours.map(hour => hour.weatherData.windSpeed.value);
        label = '历史风速 (km/h)';
        color = 'rgba(251, 188, 5, 1)'; // Google 黄色
        break;
      default:
        break;
    }
    
    return {
      labels,
      datasets: [
        {
          label,
          data: chartData,
          backgroundColor: (ctx: ScriptableContext<'bar'>) => {
            const index = ctx.dataIndex;
            // 给高亮项添加透明度变化
            return index === highlightedHourIndex 
              ? color 
              : `${color.slice(0, -2)}0.8)`;  // 提高不透明度以增强暗色模式可见性
          },
          borderColor: color,
          borderWidth: (ctx: ScriptableContext<'bar'>) => {
            const index = ctx.dataIndex;
            return index === highlightedHourIndex ? 3 : 1;  // 增加边框宽度
          },
          borderRadius: 4,
          hoverBackgroundColor: color,
        },
      ],
    };
  };
  
  // 根据暗色主题调整颜色
  const isDarkMode = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Roboto, "Helvetica Neue", Arial, sans-serif',
            size: 12
          },
          color: isDarkMode ? '#e8eaed' : '#5f6368'
        }
      },
      title: {
        display: true,
        text: '过去24小时天气历史',
        font: {
          family: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          size: 16,
          weight: 'normal' as const
        },
        color: isDarkMode ? '#ffffff' : '#202124'
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDarkMode ? 'rgba(32, 33, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? '#ffffff' : '#202124',
        bodyColor: isDarkMode ? '#e8eaed' : '#5f6368',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        titleFont: {
          family: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          family: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          size: 14
        },
        padding: 12,
        displayColors: true,
        boxShadow: isDarkMode ? 
          '0 2px 5px 0 rgba(0, 0, 0, 0.5), 0 2px 10px 0 rgba(0, 0, 0, 0.5)' :
          '0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12)'
      }
    },
    scales: {
      y: {
        beginAtZero: selectedMetric === 'precipitation' || selectedMetric === 'humidity',
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
        },
        ticks: {
          color: isDarkMode ? '#e8eaed' : '#5f6368',
          font: {
            family: 'Roboto, "Helvetica Neue", Arial, sans-serif'
          }
        }
      },
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
        },
        ticks: {
          color: isDarkMode ? '#e8eaed' : '#5f6368',
          font: {
            family: 'Roboto, "Helvetica Neue", Arial, sans-serif'
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    hover: {
      mode: 'nearest' as const,
      intersect: false
    },
    onHover: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements && elements.length > 0) {
        setHighlightedHourIndex(elements[0].index);
      } else {
        setHighlightedHourIndex(null);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 bg-card-background rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-card-background rounded-lg shadow-md">
        <p className="text-gray-500 dark:text-gray-400">请选择一个位置查看历史天气数据</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-card-background rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">历史天气数据</h2>
        <div className="flex gap-2">
          {metricOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedMetric(option.id)}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedMetric === option.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="w-full h-[300px]">
        <Bar options={chartOptions} data={prepareChartData()} />
      </div>
      
      <div className="mt-6" ref={tableContainerRef} style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left py-2">时间</th>
              <th className="text-left py-2">天气状况</th>
              <th className="text-left py-2">温度</th>
              <th className="text-left py-2">降水概率</th>
              <th className="text-left py-2">湿度</th>
              <th className="text-left py-2">风速</th>
            </tr>
          </thead>
          <tbody>
            {data.hours.map((hour, index) => (
              <tr 
                key={index} 
                className={`border-b dark:border-gray-700 transition-colors duration-200 ${
                  index === highlightedHourIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
                onMouseEnter={() => setHighlightedHourIndex(index)}
                onMouseLeave={() => setHighlightedHourIndex(null)}
                ref={el => {
                  rowRefs.current[index] = el;
                }}
              >
                <td className="py-2">{formatTime(hour.time)}</td>
                <td className="py-2">
                  {hour.weatherCondition && (
                    <div className="flex items-center">
                      <Image 
                        src={hour.weatherCondition.icon} 
                        alt={hour.weatherCondition.text} 
                        className="w-6 h-6 mr-1"
                        width={24}
                        height={24}
                      />
                      <span>{hour.weatherCondition.typeText || hour.weatherCondition.text}</span>
                    </div>
                  )}
                </td>
                <td className="py-2">{hour.weatherData.temperature.value}°C</td>
                <td className="py-2">{hour.weatherData.precipitationProbability.value}%</td>
                <td className="py-2">{hour.weatherData.humidity.value}%</td>
                <td className="py-2">{hour.weatherData.windSpeed.value} km/h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HourlyHistory; 