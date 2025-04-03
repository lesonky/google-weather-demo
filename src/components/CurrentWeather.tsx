import React from 'react';
import { CurrentWeather as CurrentWeatherType } from '@/types/weather';

interface CurrentWeatherProps {
  data: CurrentWeatherType | null;
  isLoading: boolean;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-card-background rounded-lg shadow-md p-6 animate-pulse">
        <div className="rounded bg-gray-200 h-6 mb-4 w-1/2 dark:bg-gray-700"></div>
        <div className="rounded bg-gray-200 h-10 mb-4 w-1/4 dark:bg-gray-700"></div>
        <div className="rounded bg-gray-200 h-4 mb-2 w-3/4 dark:bg-gray-700"></div>
        <div className="rounded bg-gray-200 h-4 mb-2 w-1/2 dark:bg-gray-700"></div>
        <div className="rounded bg-gray-200 h-4 w-5/6 dark:bg-gray-700"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-card-background rounded-lg shadow-md p-6">
        <p className="text-gray-500 dark:text-gray-400">请选择一个位置查看天气信息</p>
      </div>
    );
  }

  return (
    <div className="bg-card-background rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">当前天气</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            观测时间：{new Date(data.observationTime).toLocaleString('zh-CN')}
          </p>
        </div>
        {data.weatherCondition && (
          <div className="flex flex-col items-center">
            <img 
              src={data.weatherCondition.icon} 
              alt={data.weatherCondition.text} 
              className="h-16 w-16"
            />
            <span className="font-medium text-sm">{data.weatherCondition.text}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="font-bold mb-4 text-5xl">
          {data.temperature.value}°{data.temperature.unit}
        </div>
        
        <div className="grid gap-4 grid-cols-2">
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