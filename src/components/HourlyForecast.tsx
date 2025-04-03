import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HourlyForecast as HourlyForecastType } from '@/types/weather';

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
        color = 'rgba(255, 99, 132, 1)';
        break;
      case 'precipitationProbability':
        chartData = data.hours.map(hour => hour.weatherData.precipitationProbability.value);
        label = '降水概率 (%)';
        color = 'rgba(53, 162, 235, 1)';
        break;
      case 'humidity':
        chartData = data.hours.map(hour => hour.weatherData.humidity.value);
        label = '湿度 (%)';
        color = 'rgba(75, 192, 192, 1)';
        break;
      case 'windSpeed':
        chartData = data.hours.map(hour => hour.weatherData.windSpeed.value);
        label = '风速 (km/h)';
        color = 'rgba(255, 206, 86, 1)';
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
          backgroundColor: `${color.slice(0, -2)}0.1)`,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '24小时天气预报',
      },
    },
    scales: {
      y: {
        beginAtZero: selectedMetric === 'precipitationProbability' || selectedMetric === 'humidity',
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-48 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">请选择一个位置查看每小时天气预报</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">每小时天气预报</h2>
        <div className="flex gap-2">
          {metricOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedMetric(option.id)}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedMetric === option.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[300px]">
        <Line options={chartOptions} data={prepareChartData()} />
      </div>
      
      <div className="mt-6 overflow-x-auto">
        <div className="inline-flex gap-4 pb-2">
          {data.hours.slice(0, 24).map((hour, index) => (
            <div key={index} className="flex flex-col items-center min-w-16">
              <span className="text-sm font-medium">
                {formatTime(hour.time)}
              </span>
              {hour.weatherCondition && (
                <img 
                  src={hour.weatherCondition.icon} 
                  alt={hour.weatherCondition.text} 
                  className="w-10 h-10 my-1"
                />
              )}
              <span className="font-bold">
                {hour.weatherData.temperature.value}°
              </span>
              <span className="text-xs text-gray-500">
                {hour.weatherData.precipitationProbability.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast; 