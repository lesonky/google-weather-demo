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
  ChartEvent,
  ActiveElement,
  ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HourlyForecast as HourlyForecastType } from '@/types/weather';
import { formatTemperature } from '@/lib/weatherUtils';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HourlyForecastProps {
  data: HourlyForecastType | null;
  isLoading: boolean;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ data, isLoading }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('temperature');
  const [highlightedHourIndex, setHighlightedHourIndex] = useState<number | null>(null);
  const hourItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 当高亮小时索引变化时，滚动到对应项
  useEffect(() => {
    if (highlightedHourIndex !== null && hourItemRefs.current[highlightedHourIndex] && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = hourItemRefs.current[highlightedHourIndex];
      
      if (element) {
        // 计算需要滚动的位置
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // 检查元素是否在可视区域外
        const isInView = (
          elementRect.left >= containerRect.left &&
          elementRect.right <= containerRect.right
        );
        
        if (!isInView) {
          // 自动滚动到元素位置，使其在容器中可见
          const scrollLeft = element.offsetLeft - container.offsetLeft - (containerRect.width / 2) + (elementRect.width / 2);
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [highlightedHourIndex]);

  // 初始化 refs 数组
  useEffect(() => {
    if (data && data.hours) {
      hourItemRefs.current = Array(data.hours.length).fill(null);
    }
  }, [data]);
  
  const metricOptions = [
    { id: 'temperature', label: '温度' },
    { id: 'precipitationProbability', label: '降水概率' },
    { id: 'humidity', label: '湿度' },
    { id: 'windSpeed', label: '风速' }
  ];
  
  // 格式化时间显示
  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.getHours() + ':00';
  };
  
  // 根据湿度值获取对应的样式
  const getHumidityStyle = (humidity: number) => {
    if (humidity < 30) {
      return 'text-yellow-600';
    } else if (humidity < 50) {
      return 'text-green-500';
    } else if (humidity < 70) {
      return 'text-blue-500';
    } else {
      return 'text-blue-700';
    }
  };
  
  const prepareChartData = () => {
    if (!data || !data.hours || data.hours.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: '暂无数据',
          data: [],
          borderColor: 'rgba(53, 162, 235, 0.5)',
          backgroundColor: 'rgba(53, 162, 235, 0.1)',
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
        label = '温度 (°C)';
        color = 'rgba(66, 133, 244, 1)';
        break;
      case 'precipitationProbability':
        chartData = data.hours.map(hour => hour.weatherData.precipitationProbability.value);
        label = '降水概率 (%)';
        color = 'rgba(52, 168, 83, 1)';
        break;
      case 'humidity':
        chartData = data.hours.map(hour => hour.weatherData.humidity.value);
        label = '湿度 (%)';
        color = 'rgba(234, 67, 53, 1)';
        break;
      case 'windSpeed':
        chartData = data.hours.map(hour => hour.weatherData.windSpeed.value);
        label = '风速 (km/h)';
        color = 'rgba(251, 188, 5, 1)';
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
          borderColor: color,
          backgroundColor: `${color.slice(0, -2)}0.2)`,
          fill: true,
          tension: 0.4,
          pointRadius: (ctx: ScriptableContext<'line'>) => {
            const index = ctx.dataIndex;
            return index === highlightedHourIndex ? 6 : 3;
          },
          pointHoverRadius: 8,
          pointBackgroundColor: (ctx: ScriptableContext<'line'>) => {
            const index = ctx.dataIndex;
            return index === highlightedHourIndex ? color : 'white';
          },
          pointBorderColor: color,
          pointBorderWidth: 2,
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
        display: false,
        labels: {
          color: isDarkMode ? '#E8EAED' : '#202124',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(60, 64, 67, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#E8EAED' : '#202124',
        bodyColor: isDarkMode ? '#E8EAED' : '#202124',
        borderColor: isDarkMode ? 'rgba(232, 234, 237, 0.1)' : 'rgba(32, 33, 36, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        bodyFont: {
          size: 12
        },
        titleFont: {
          size: 12,
          weight: 'bold' as const
        },
        callbacks: {
          // 使用自定义标签控制显示内容
          title: function(tooltipItem: {label: string}[]) {
            const { label } = tooltipItem[0];
            return `时间: ${label}`;
          },
          label: function(context: {parsed: {y: number}, dataset: {label?: string}}) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y;
            
            // 为特定指标添加单位
            if (selectedMetric === 'temperature') {
              label += '°C';
            } else if (selectedMetric === 'precipitationProbability' || selectedMetric === 'humidity') {
              label += '%';
            } else if (selectedMetric === 'windSpeed') {
              label += 'km/h';
            }
            
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? 'rgba(232, 234, 237, 0.1)' : 'rgba(32, 33, 36, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#9AA0A6' : '#5F6368',
          font: {
            size: 10,
          }
        },
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(232, 234, 237, 0.1)' : 'rgba(32, 33, 36, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#9AA0A6' : '#5F6368',
          font: {
            size: 10,
          }
        },
        beginAtZero: selectedMetric !== 'temperature', // 温度不从0开始
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    onHover: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        const firstPoint = elements[0];
        setHighlightedHourIndex(firstPoint.index);
      } else {
        setHighlightedHourIndex(null);
      }
    },
  };
  
  // 获取降水概率对应的样式
  const getPrecipitationStyle = (probability: number) => {
    if (probability < 20) {
      return '';
    } else if (probability < 40) {
      return 'text-blue-500';
    } else if (probability < 60) {
      return 'text-blue-600';
    } else if (probability < 80) {
      return 'text-blue-700 font-medium';
    } else {
      return 'text-blue-800 font-bold';
    }
  };
  
  const getItemClassName = (index: number) => {
    return `hourly-card ${
      index === highlightedHourIndex ? 'hourly-card-highlighted' : ''
    }`;
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col animate-pulse">
        <div className="flex justify-center mb-4 space-x-2">
          {metricOptions.map((option) => (
            <div key={option.id} className="h-8 w-16 bg-gray-200 rounded dark:bg-gray-700"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg dark:bg-gray-700 mb-4"></div>
        <div className="flex overflow-x-auto space-x-3 py-2">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex-none w-20 h-28 bg-gray-200 rounded dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.hours || data.hours.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500 dark:text-gray-400">无天气预报数据</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap justify-center mb-4 gap-2">
        {metricOptions.map((option) => (
          <button
            key={option.id}
            className={`py-1 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm rounded-full transition ${
              selectedMetric === option.id
                ? 'bg-google-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedMetric(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      <div className="h-56 sm:h-64 lg:h-72 mb-4 relative">
        <Line data={prepareChartData()} options={chartOptions} />
      </div>
      
      <div className="flex overflow-x-auto pb-3 -mx-1 px-1" ref={scrollContainerRef}>
        {data.hours.map((hour, index) => {
          const date = new Date(hour.time);
          const nowHour = new Date().getHours();
          const hourNumber = date.getHours();
          
          // 计算时间显示
          const isMidnight = hourNumber === 0;
          const isNoon = hourNumber === 12;
          let timeLabel = `${hourNumber}:00`;
          let dateLabel = '';
          
          if (isMidnight) {
            const month = date.getMonth() + 1;
            const day = date.getDate();
            dateLabel = `${month}/${day}`;
            timeLabel = '00:00';
          } else if (isNoon) {
            timeLabel = '12:00';
          }
          
          const isCurrentHour = new Date().getDate() === date.getDate() && hourNumber === nowHour;
          
          return (
            <div
              key={index}
              ref={(el) => { hourItemRefs.current[index] = el; }}
              className={getItemClassName(index)}
              onClick={() => setHighlightedHourIndex(index)}
            >
              <div className="text-center mb-1">
                {dateLabel && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {dateLabel}
                  </div>
                )}
                <div className={`text-xs sm:text-sm font-medium ${isCurrentHour ? 'text-google-blue' : ''}`}>
                  {isCurrentHour ? '现在' : timeLabel}
                </div>
              </div>
              
              {/* 天气图标 */}
              <div className="flex justify-center my-1">
                {hour.weatherCondition?.icon ? (
                  <img 
                    src={hour.weatherCondition.icon} 
                    alt={hour.weatherCondition.text || '天气图标'}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  />
                ) : (
                  <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3V4M12 20V21M4 12H3M21 12H20M6.3 6.3L5.5 5.5M18.7 6.3L19.5 5.5M17.7 17.7L18.5 18.5M6.3 17.7L5.5 18.5M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="text-sm sm:text-base font-medium text-center">
                {formatTemperature(hour.weatherData.temperature.value, hour.weatherData.temperature.unit)}
              </div>
              
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xxs sm:text-xs text-gray-500 dark:text-gray-400">降水</span>
                  <span 
                    className={`text-xxs sm:text-xs font-medium ${getPrecipitationStyle(hour.weatherData.precipitationProbability.value)}`}
                  >
                    {hour.weatherData.precipitationProbability.value}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xxs sm:text-xs text-gray-500 dark:text-gray-400">湿度</span>
                  <span 
                    className={`text-xxs sm:text-xs font-medium ${getHumidityStyle(hour.weatherData.humidity.value)}`}
                  >
                    {hour.weatherData.humidity.value}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xxs sm:text-xs text-gray-500 dark:text-gray-400">风速</span>
                  <span className="text-xxs sm:text-xs font-medium">
                    {hour.weatherData.windSpeed.value} km/h
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast; 