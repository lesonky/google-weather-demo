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
  Filler,
  BarElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { HourlyHistory as HourlyHistoryType } from '@/types/weather';

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
        color = 'rgba(255, 99, 132, 1)';
        break;
      case 'precipitation':
        chartData = data.hours.map(hour => hour.weatherData.precipitationProbability.value);
        label = '历史降水概率 (%)';
        color = 'rgba(53, 162, 235, 1)';
        break;
      case 'humidity':
        chartData = data.hours.map(hour => hour.weatherData.humidity.value);
        label = '历史湿度 (%)';
        color = 'rgba(75, 192, 192, 1)';
        break;
      case 'windSpeed':
        chartData = data.hours.map(hour => hour.weatherData.windSpeed.value);
        label = '历史风速 (km/h)';
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
          backgroundColor: color,
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
        text: '过去24小时天气历史',
      },
    },
    scales: {
      y: {
        beginAtZero: selectedMetric === 'precipitation' || selectedMetric === 'humidity',
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
      
      <div className="h-[300px]">
        <Bar options={chartOptions} data={prepareChartData()} />
      </div>
      
      <div className="mt-6">
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
              <tr key={index} className="border-b dark:border-gray-700">
                <td className="py-2">{formatTime(hour.time)}</td>
                <td className="py-2">
                  {hour.weatherCondition && (
                    <div className="flex items-center">
                      <img 
                        src={hour.weatherCondition.icon} 
                        alt={hour.weatherCondition.text} 
                        className="w-6 h-6 mr-1"
                      />
                      <span>{hour.weatherCondition.text}</span>
                    </div>
                  )}
                </td>
                <td className="py-2">{hour.weatherData.temperature.value}°{hour.weatherData.temperature.unit}</td>
                <td className="py-2">{hour.weatherData.precipitationProbability.value}%</td>
                <td className="py-2">{hour.weatherData.humidity.value}%</td>
                <td className="py-2">{hour.weatherData.windSpeed.value} {hour.weatherData.windSpeed.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HourlyHistory; 