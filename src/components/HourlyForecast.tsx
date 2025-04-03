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
import { 
  getWeatherTypeColor, 
  getPrecipitationDescription,
  formatTemperature
} from '@/lib/weatherUtils';

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
  
  // 根据湿度值获取对应的样式和描述
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

  const getHumidityDescription = (humidity: number) => {
    if (humidity < 30) {
      return '干燥';
    } else if (humidity < 50) {
      return '舒适';
    } else if (humidity < 70) {
      return '潮湿';
    } else {
      return '非常潮湿';
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
        text: '24小时天气预报',
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
        beginAtZero: selectedMetric === 'precipitationProbability' || selectedMetric === 'humidity',
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
    return `flex flex-col items-center min-w-[100px] py-2 px-1 rounded-lg transition-all duration-200 ${
      index === highlightedHourIndex ? 'bg-blue-50 dark:bg-blue-900/30 shadow-md transform scale-105' : ''
    }`;
  };
  
  if (isLoading) {
    return (
      <div className="bg-card-background rounded-lg shadow-md p-6 animate-pulse">
        <div className="rounded bg-gray-200 h-6 mb-4 w-1/2 dark:bg-gray-700"></div>
        <div className="rounded bg-gray-200 h-48 w-full dark:bg-gray-700"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-card-background rounded-lg shadow-md p-6">
        <p className="text-gray-500 dark:text-gray-400">请选择一个位置查看每小时天气预报</p>
      </div>
    );
  }

  return (
    <div className="bg-card-background rounded-lg shadow-md p-6">
      <div className="flex mb-4 justify-between items-center">
        <h2 className="font-bold text-2xl">每小时天气预报</h2>
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
      
      <div className="h-[300px] w-full">
        <Line 
          options={chartOptions} 
          data={prepareChartData()} 
        />
      </div>
      
      <div className="mt-6 overflow-x-auto" ref={scrollContainerRef}>
        <div className="pb-2 gap-4 inline-flex">
          {data && data.hours && data.hours.length > 0 ? (
            data.hours.slice(0, 24).map((hour, index) => {
              const weatherType = hour.weatherCondition.type || '';
              const precipProbability = hour.weatherData.precipitationProbability.value;
              const humidity = hour.weatherData.humidity.value;
              return (
                <div 
                  key={index} 
                  className={getItemClassName(index)}
                  onMouseEnter={() => setHighlightedHourIndex(index)}
                  onMouseLeave={() => setHighlightedHourIndex(null)}
                  ref={el => {
                    hourItemRefs.current[index] = el;
                  }}
                >
                  <span className="font-medium text-sm">
                    {formatTime(hour.time)}
                  </span>
                  {hour.weatherCondition && (
                    <div className="flex flex-col my-1 items-center">
                      <img 
                        src={hour.weatherCondition.icon} 
                        alt={hour.weatherCondition.text} 
                        className="h-10 w-10"
                      />
                      <span className="text-xs text-center" style={{ 
                        color: weatherType ? getWeatherTypeColor(weatherType) : 'inherit'
                      }}>
                        {hour.weatherCondition.typeText || hour.weatherCondition.text}
                      </span>
                    </div>
                  )}
                  <span className="font-bold">
                    {formatTemperature(hour.weatherData.temperature.value, hour.weatherData.temperature.unit)}
                  </span>
                  
                  <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 w-full px-1">
                    <div className="flex flex-col items-center" title={getPrecipitationDescription(precipProbability)}>
                      <span className="text-xs text-gray-500 dark:text-gray-400">降水</span>
                      <span className={`text-xs ${getPrecipitationStyle(precipProbability)}`}>
                        {precipProbability}%
                      </span>
                    </div>
                    <div className="flex flex-col items-center" title={getHumidityDescription(humidity)}>
                      <span className="text-xs text-gray-500 dark:text-gray-400">湿度</span>
                      <span className={`text-xs ${getHumidityStyle(humidity)}`}>
                        {humidity}%
                      </span>
                    </div>
                    <div className="flex flex-col items-center col-span-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-full truncate">
                        {hour.weatherData.windDirection.text || ''}
                        {hour.weatherData.windSpeed.value < 5 ? '' : 
                          ` ${hour.weatherData.windSpeed.value} km/h`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center w-full py-4 text-gray-500 dark:text-gray-400">暂无每小时天气数据</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast; 