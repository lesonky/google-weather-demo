import React from 'react';
import Image from 'next/image';
import { DailyForecast as DailyForecastType } from '@/types/weather';
import {
  getWeatherTypeColor,
  getUVIndexLevel,
  getPrecipitationDescription,
  getActivitySuggestion,
  formatTemperature,
  formatWindSpeed,
  formatPrecipitation
} from '@/lib/weatherUtils';

interface DailyForecastProps {
  data: DailyForecastType | null;
  isLoading: boolean;
}

const DailyForecast: React.FC<DailyForecastProps> = ({ data, isLoading }) => {
  // 格式化日期
  const formatDate = (dateString: string): string => {
    // 将 YYYY-MM-DD 格式替换为 YYYY/MM/DD 以提高 Safari 兼容性
    const compatibleDateString = dateString.replace(/-/g, '/');
    const date = new Date(compatibleDateString);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid date detected:', dateString);
      return '日期无效'; // 或者返回原始字符串或其他提示
    }

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
  
  // 计算温度条宽度
  const calculateTempBarWidth = (high: number, low: number, maxTemp: number, minTemp: number) => {
    // 防止除以零的情况
    if (maxTemp === minTemp) return { left: 0, width: 100 };
    
    // 计算温度范围在总范围中的比例
    const totalRange = maxTemp - minTemp;
    const leftPosition = Math.max(0, ((low - minTemp) / totalRange) * 100);
    const rightPosition = Math.min(100, ((high - minTemp) / totalRange) * 100);
    const width = rightPosition - leftPosition;
    
    return {
      left: leftPosition,
      width: width
    };
  };

  if (isLoading) {
    return (
      <div className="bg-card-background rounded-lg shadow-md p-6 animate-pulse">
        <div className="rounded bg-gray-200 h-6 mb-4 w-1/2 dark:bg-gray-700"></div>
        <div className="rounded bg-gray-200 h-20 mb-2 w-full dark:bg-gray-700"></div>
        <div className="rounded bg-gray-200 h-20 mb-2 w-full dark:bg-gray-700"></div>
        <div className="rounded bg-gray-200 h-20 w-full dark:bg-gray-700"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-card-background rounded-lg shadow-md p-6">
        <p className="text-gray-500 dark:text-gray-400">请选择一个位置查看每日天气预报</p>
      </div>
    );
  }
  
  // 找出温度最高值和最低值，用于温度条比例计算
  const allTemps = data.days.flatMap(day => [day.temperatureHigh.value, day.temperatureLow.value]);
  const maxTemp = Math.max(...allTemps);
  const minTemp = Math.min(...allTemps);

  return (
    <div className="bg-card-background rounded-lg shadow-md p-6">
      <h2 className="font-bold mb-4 text-2xl">每日天气预报</h2>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.days.map((day, index) => {
          const weatherType = day.weatherCondition.type || '';
          const uvInfo = getUVIndexLevel(day.uvIndex.value);
          const precipitationDesc = getPrecipitationDescription(day.precipitationProbability.value);
          const activitySuggestion = weatherType ? getActivitySuggestion(weatherType) : '';
          const tempBarStyle = calculateTempBarWidth(
            day.temperatureHigh.value, 
            day.temperatureLow.value, 
            maxTemp, 
            minTemp
          );
          
          return (
            <div key={index} className="py-5 first:pt-2 last:pb-2">
              <div className="flex mb-3 items-center justify-between">
                <div className="flex space-x-3 flex-1 items-center">
                  <div className="flex flex-col min-w-[80px]">
                    <span className="font-medium text-lg">{formatDate(day.date)}</span>
                    {index === 0 && <span className="mt-0.5 text-xs text-blue-500">今天</span>}
                  </div>
                  {day.weatherCondition && (
                    <div className="flex space-x-2 items-center">
                      <Image 
                        src={day.weatherCondition.icon} 
                        alt={day.weatherCondition.text} 
                        className="h-10 w-10"
                        width={40}
                        height={40}
                      />
                      <span 
                        className="text-sm"
                        style={{ color: weatherType ? getWeatherTypeColor(weatherType) : 'inherit' }}
                      >
                        {day.weatherCondition.typeText || day.weatherCondition.text}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col text-right ml-2 items-end">
                  <div className="flex space-x-2 items-center">
                    <span className="text-base text-blue-500">{formatTemperature(day.temperatureLow.value, day.temperatureLow.unit)}</span>
                    <div className="rounded-full bg-gray-200 h-2 w-20 relative dark:bg-gray-700">
                      <div 
                        className="bg-gradient-to-r rounded-full from-blue-500 to-red-500 h-2 absolute"
                        style={{ 
                          left: `${tempBarStyle.left}%`,
                          width: `${tempBarStyle.width}%`
                        }}
                      ></div>
                    </div>
                    <span className="font-medium text-lg text-red-500">{formatTemperature(day.temperatureHigh.value, day.temperatureHigh.unit)}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    最低温/最高温
                  </div>
                </div>
              </div>
              
              {index === 0 && activitySuggestion && (
                <div className="rounded bg-blue-50 text-sm mb-3 p-2.5 dark:bg-blue-900/20">
                  <span className="font-medium">今日建议：</span> {activitySuggestion}
                </div>
              )}
              
              <div className="mt-1 grid gap-x-4 gap-y-2.5 grid-cols-2 sm:grid-cols-4">
                <div className="flex flex-col">
                  <span className="text-xs mb-0.5 text-gray-500 dark:text-gray-400">日出</span>
                  <span className="font-medium text-sm">{formatTime(day.sunrise)}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs mb-0.5 text-gray-500 dark:text-gray-400">日落</span>
                  <span className="font-medium text-sm">{formatTime(day.sunset)}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs mb-0.5 text-gray-500 dark:text-gray-400">降水概率</span>
                  <span className="flex font-medium text-sm items-center">
                    {day.precipitationProbability.value}%
                    <span className="text-xs ml-1 text-gray-500">
                      ({precipitationDesc})
                    </span>
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs mb-0.5 text-gray-500 dark:text-gray-400">风向/风速</span>
                  <span className="font-medium text-sm">
                    {day.windDirection?.text || ''} {formatWindSpeed(day.windSpeed.value, day.windSpeed.unit)}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs mb-0.5 text-gray-500 dark:text-gray-400">湿度</span>
                  <span className="font-medium text-sm">{day.humidity.value}%</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs mb-0.5 text-gray-500 dark:text-gray-400">紫外线</span>
                  <span className="flex font-medium text-sm items-center">
                    {day.uvIndex.value}
                    <span 
                      className="rounded text-xs ml-1 py-0.5 px-1" 
                      style={{
                        backgroundColor: uvInfo.color,
                        color: 'white'
                      }}
                    >
                      {uvInfo.level}
                    </span>
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs mb-0.5 text-gray-500 dark:text-gray-400">降水量</span>
                  <span className="font-medium text-sm">{formatPrecipitation(day.precipitationAmount.value, day.precipitationAmount.unit)}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs mb-0.5 text-gray-500 dark:text-gray-400">降水类型</span>
                  <span className="font-medium text-sm">{
                    day.precipitationProbability.type ? 
                      day.precipitationProbability.type === 'RAIN' ? '雨' : 
                      day.precipitationProbability.type === 'SNOW' ? '雪' : 
                      '混合' : '无'
                  }</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast; 