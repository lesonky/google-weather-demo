import React from 'react';
import { DailyForecast as DailyForecastType } from '@/types/weather';

interface DailyForecastProps {
  data: DailyForecastType | null;
  isLoading: boolean;
}

const DailyForecast: React.FC<DailyForecastProps> = ({ data, isLoading }) => {
  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('zh-CN', { weekday: 'short' });
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${weekday} ${month}/${day}`;
  };
  
  // 格式化时间
  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-card-background rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-card-background rounded-lg shadow-md">
        <p className="text-gray-500 dark:text-gray-400">请选择一个位置查看每日天气预报</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-card-background rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">每日天气预报</h2>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.days.map((day, index) => (
          <div key={index} className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="font-bold">{formatDate(day.date)}</span>
                  {index === 0 && <span className="text-xs text-blue-500">今天</span>}
                </div>
                {day.weatherCondition && (
                  <img 
                    src={day.weatherCondition.icon} 
                    alt={day.weatherCondition.text} 
                    className="w-12 h-12"
                  />
                )}
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="font-bold">{day.temperatureHigh.value}°</span>
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"
                      style={{ 
                        width: '100%'
                      }}
                    ></div>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">{day.temperatureLow.value}°</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {day.weatherCondition?.text}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">日出</span>
                <span className="text-sm">{formatTime(day.sunrise)}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">日落</span>
                <span className="text-sm">{formatTime(day.sunset)}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">降水概率</span>
                <span className="text-sm">{day.precipitationProbability.value}%</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">风速</span>
                <span className="text-sm">{day.windSpeed.value} {day.windSpeed.unit}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">湿度</span>
                <span className="text-sm">{day.humidity.value}%</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">紫外线</span>
                <span className="text-sm">{day.uvIndex.value}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">降水量</span>
                <span className="text-sm">{day.precipitationAmount.value} {day.precipitationAmount.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast; 