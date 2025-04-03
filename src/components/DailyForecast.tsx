import React from 'react';
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
  
  // 找出温度最高值和最低值，用于温度条比例计算
  const allTemps = data.days.flatMap(day => [day.temperatureHigh.value, day.temperatureLow.value]);
  const maxTemp = Math.max(...allTemps);
  const minTemp = Math.min(...allTemps);

  return (
    <div className="p-6 bg-card-background rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">每日天气预报</h2>
      
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
            <div key={index} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <span className="font-bold">{formatDate(day.date)}</span>
                    {index === 0 && <span className="text-xs text-blue-500">今天</span>}
                  </div>
                  {day.weatherCondition && (
                    <div className="flex flex-col items-center">
                      <img 
                        src={day.weatherCondition.icon} 
                        alt={day.weatherCondition.text} 
                        className="w-12 h-12"
                      />
                      <span 
                        className="text-xs text-center mt-1"
                        style={{ color: weatherType ? getWeatherTypeColor(weatherType) : 'inherit' }}
                      >
                        {day.weatherCondition.typeText || day.weatherCondition.text}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{formatTemperature(day.temperatureHigh.value, day.temperatureHigh.unit)}</span>
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-red-500 rounded-full absolute"
                        style={{ 
                          left: `${tempBarStyle.left}%`,
                          width: `${tempBarStyle.width}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">{formatTemperature(day.temperatureLow.value, day.temperatureLow.unit)}</span>
                  </div>
                </div>
              </div>
              
              {index === 0 && activitySuggestion && (
                <div className="mt-2 mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                  <span className="font-medium">今日建议：</span> {activitySuggestion}
                </div>
              )}
              
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
                  <span className="text-sm flex items-center">
                    {day.precipitationProbability.value}%
                    <span className="ml-1 text-xs text-gray-500">
                      ({precipitationDesc})
                    </span>
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">风向/风速</span>
                  <span className="text-sm">
                    {day.windDirection?.text || ''} {formatWindSpeed(day.windSpeed.value, day.windSpeed.unit)}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">湿度</span>
                  <span className="text-sm">{day.humidity.value}%</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">紫外线</span>
                  <span className="text-sm flex items-center">
                    {day.uvIndex.value}
                    <span 
                      className="ml-1 text-xs px-1 py-0.5 rounded" 
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">降水量</span>
                  <span className="text-sm">{formatPrecipitation(day.precipitationAmount.value, day.precipitationAmount.unit)}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">降水类型</span>
                  <span className="text-sm">{
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