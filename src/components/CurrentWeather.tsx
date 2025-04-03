import React from 'react';
import { CurrentWeather as CurrentWeatherType } from '@/types/weather';

interface CurrentWeatherProps {
  data: CurrentWeatherType | null;
  isLoading: boolean;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-card-background rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-card-background rounded-lg shadow-md">
        <p className="text-gray-500 dark:text-gray-400">请选择一个位置查看天气信息</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-card-background rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">当前天气</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            观测时间：{new Date(data.observationTime).toLocaleString('zh-CN')}
          </p>
        </div>
        {data.weatherCondition && (
          <div className="flex flex-col items-center">
            <img 
              src={data.weatherCondition.icon} 
              alt={data.weatherCondition.text} 
              className="w-16 h-16"
            />
            <span className="text-sm font-medium">{data.weatherCondition.text}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="text-5xl font-bold mb-4">
          {data.temperature.value}°{data.temperature.unit}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400">体感温度</span>
            <span className="font-medium">
              {data.apparentTemperature.value}°{data.apparentTemperature.unit}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400">湿度</span>
            <span className="font-medium">{data.humidity.value}{data.humidity.unit}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400">风速</span>
            <span className="font-medium">
              {data.windSpeed.value} {data.windSpeed.unit}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400">风向</span>
            <span className="font-medium">{data.windDirection.value}°</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400">气压</span>
            <span className="font-medium">
              {data.pressure.value} {data.pressure.unit}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400">能见度</span>
            <span className="font-medium">
              {data.visibility.value} {data.visibility.unit}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400">紫外线指数</span>
            <span className="font-medium">{data.uvIndex.value}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400">云量</span>
            <span className="font-medium">{data.cloudCover.value}{data.cloudCover.unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather; 