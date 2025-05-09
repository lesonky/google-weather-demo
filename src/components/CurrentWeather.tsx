import React from 'react';
import Image from 'next/image';
import { CurrentWeather as CurrentWeatherType } from '@/types/weather';
import {
  getUVIndexLevel,
  formatVisibility,
  getPrecipitationDescription,
  getActivitySuggestion,
  getHumidityDescription,
  getCloudCoverDescription,
  formatTemperature,
  formatWindSpeed
} from '@/lib/weatherUtils';

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

  // 获取UV指数等级信息
  const uvIndexInfo = getUVIndexLevel(data.uvIndex.value);
  
  // 获取能见度信息
  const visibilityInfo = formatVisibility(data.visibility.value, data.visibility.unit);
  
  // 获取降水概率描述
  const precipitationDesc = getPrecipitationDescription(data.precipitationProbability.value);
  
  // 获取活动建议
  const activitySuggestion = data.weatherCondition.type ? 
    getActivitySuggestion(data.weatherCondition.type) : '';
  
  // 湿度描述
  const humidityInfo = getHumidityDescription(data.humidity.value);
  
  // 云量描述
  const cloudCoverDesc = getCloudCoverDescription(data.cloudCover.value);

  return (
    <div className="bg-card-background rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl">当前天气</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            观测时间：{new Date(data.observationTime).toLocaleString('zh-CN')}
          </p>
        </div>
        {data.weatherCondition && (
          <div className="flex flex-row sm:flex-col items-center mt-2 sm:mt-0">
            <Image 
              src={data.weatherCondition.icon} 
              alt={data.weatherCondition.text} 
              className="h-12 w-12 sm:h-16 sm:w-16"
              width={64}
              height={64}
            />
            <span className="font-medium text-sm text-center ml-3 sm:ml-0">
              {data.weatherCondition.typeText || data.weatherCondition.text}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="font-bold mb-4 text-4xl sm:text-5xl">
          {formatTemperature(data.temperature.value, data.temperature.unit)}
        </div>
        
        {/* 天气建议 */}
        {activitySuggestion && (
          <div className="mb-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs sm:text-sm">
            <span className="font-medium">今日建议：</span> {activitySuggestion}
          </div>
        )}
        
        <div className="grid gap-3 sm:gap-4 grid-cols-2">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">体感温度</span>
            <span className="font-medium text-sm sm:text-base">
              {formatTemperature(data.apparentTemperature.value, data.apparentTemperature.unit)}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">湿度</span>
            <span className="font-medium text-sm sm:text-base">
              {data.humidity.value}{data.humidity.unit}
              <span className="text-xxs sm:text-xs ml-1">({humidityInfo.description})</span>
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">风速</span>
            <span className="font-medium text-sm sm:text-base">
              {formatWindSpeed(data.windSpeed.value, data.windSpeed.unit)}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">风向</span>
            <span className="font-medium text-sm sm:text-base">
              {data.windDirection.text || `${data.windDirection.value}°`}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">气压</span>
            <span className="font-medium text-sm sm:text-base">
              {data.pressure.value} {data.pressure.unit}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">能见度</span>
            <span className="font-medium text-sm sm:text-base">
              {visibilityInfo.text}
              <span className="text-xxs sm:text-xs ml-1">({visibilityInfo.description})</span>
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">紫外线指数</span>
            <span className="font-medium text-sm sm:text-base">
              {data.uvIndex.value}
              <span 
                className="text-xxs sm:text-xs ml-1 px-1 py-0.5 rounded" 
                style={{ backgroundColor: uvIndexInfo.color, color: 'white' }}
              >
                {uvIndexInfo.level}
              </span>
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">云量</span>
            <span className="font-medium text-sm sm:text-base">
              {data.cloudCover.value}{data.cloudCover.unit}
              <span className="text-xxs sm:text-xs ml-1">({cloudCoverDesc})</span>
            </span>
          </div>
          
          <div className="flex flex-col col-span-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">降水概率</span>
            <span className="font-medium text-sm sm:text-base">
              {data.precipitationProbability.value}{data.precipitationProbability.unit}
              <span className="text-xxs sm:text-xs ml-1">({precipitationDesc})</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather; 