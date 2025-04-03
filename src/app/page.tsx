'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import LocationSearch from '@/components/LocationSearch';
import ErrorDisplay from '@/components/ErrorDisplay';
import { 
  LocationData, 
  CurrentWeather as CurrentWeatherType,
  HourlyForecast as HourlyForecastType,
  DailyForecast as DailyForecastType,
  HourlyHistory as HourlyHistoryType
} from '@/types/weather';
import {
  getCurrentWeather,
  getHourlyForecast,
  getDailyForecast,
  getHourlyHistory,
  CurrentWeather as ApiCurrentWeather,
  ForecastResponse,
  HourlyForecastResponse,
  HourlyHistoryResponse,
  ApiError
} from '@/lib/api';

// 动态导入地图组件，避免SSR问题
const WeatherMap = dynamic(() => import('@/components/WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg flex bg-gray-200 h-[400px] w-full items-center justify-center">
      <p>地图加载中...</p>
    </div>
  ),
});

// 动态导入图表组件
const CurrentWeather = dynamic(() => import('@/components/CurrentWeather'));
const HourlyForecast = dynamic(() => import('@/components/HourlyForecast'));
const DailyForecast = dynamic(() => import('@/components/DailyForecast'));
const HourlyHistory = dynamic(() => import('@/components/HourlyHistory'));

// 定义中间数据转换接口
interface HourDataItem {
  time: string;
  weatherData: {
    temperature: {
      value: number;
      unit: string;
    };
    apparentTemperature: {
      value: number;
      unit: string;
    };
    humidity: {
      value: number;
      unit: string;
    };
    dewPoint: {
      value: number;
      unit: string;
    };
    windSpeed: {
      value: number;
      unit: string;
    };
    windDirection: {
      value: number;
      unit: string;
    };
    uvIndex: {
      value: number;
    };
    visibility: {
      value: number;
      unit: string;
    };
    pressure: {
      value: number;
      unit: string;
    };
    cloudCover: {
      value: number;
      unit: string;
    };
    precipitationProbability: {
      value: number;
      unit: string;
    };
  };
  weatherCondition: {
    text: string;
    icon: string;
  };
}

// 生成完整的图标URL
const generateIconUrl = (iconBaseUri: string, isDarkMode: boolean = false): string => {
  // 如果URL已经包含.svg，先移除它
  const baseUri = iconBaseUri.endsWith('.svg') 
    ? iconBaseUri.substring(0, iconBaseUri.length - 4) 
    : iconBaseUri;
  
  // 如果需要深色模式，添加 _dark 后缀
  const themeSuffix = isDarkMode ? '_dark' : '';
  // 图标文件扩展名
  const extension = '.svg';
  
  // 构建完整URL
  return `${baseUri}${themeSuffix}${extension}`;
};

// 转换API返回的数据格式为组件需要的格式
const convertCurrentWeather = (data: ApiCurrentWeather, isDarkMode: boolean = false): CurrentWeatherType => {
  return {
    observationTime: data.currentTime,
    temperature: {
      value: data.temperature.degrees,
      unit: data.temperature.unit,
    },
    apparentTemperature: {
      value: data.feelsLikeTemperature.degrees,
      unit: data.feelsLikeTemperature.unit,
    },
    humidity: {
      value: data.relativeHumidity,
      unit: '%',
    },
    dewPoint: {
      value: data.dewPoint.degrees,
      unit: data.dewPoint.unit,
    },
    windSpeed: {
      value: data.wind.speed.value,
      unit: data.wind.speed.unit,
    },
    windDirection: {
      value: data.wind.direction.degrees,
      unit: 'degrees',
    },
    uvIndex: {
      value: data.uvIndex,
    },
    visibility: {
      value: data.visibility.distance,
      unit: data.visibility.unit,
    },
    pressure: {
      value: data.airPressure.meanSeaLevelMillibars,
      unit: 'mb',
    },
    cloudCover: {
      value: data.cloudCover,
      unit: '%',
    },
    precipitationProbability: {
      value: data.precipitation.probability.percent,
      unit: '%',
    },
    weatherCondition: {
      text: data.weatherCondition.description.text,
      icon: generateIconUrl(data.weatherCondition.iconBaseUri, isDarkMode),
    },
  };
};

const convertHourlyForecast = (data: HourlyForecastResponse, isDarkMode: boolean = false): HourlyForecastType => {
  // 初始化结果数组
  const hourlyData: HourDataItem[] = [];
  
  // 检查data和data.forecastHours是否存在
  if (!data || !data.forecastHours || !Array.isArray(data.forecastHours)) {
    console.log('无效的每小时天气预报数据:', data);
    return { hours: [] }; // 返回空数组
  }
  
  // 直接使用forecastHours数组
  for (const hour of data.forecastHours) {
    // 检查必要的属性是否存在
    if (!hour.interval || !hour.interval.startTime) {
      continue;
    }

    // 获取时间
    const timeStr = hour.interval.startTime;
    
    hourlyData.push({
      time: timeStr,
      weatherData: {
        temperature: {
          value: hour.temperature.degrees,
          unit: hour.temperature.unit,
        },
        apparentTemperature: {
          value: hour.feelsLikeTemperature.degrees,
          unit: hour.feelsLikeTemperature.unit,
        },
        humidity: {
          value: hour.relativeHumidity,
          unit: '%',
        },
        dewPoint: {
          value: hour.dewPoint.degrees,
          unit: hour.dewPoint.unit,
        },
        windSpeed: {
          value: hour.wind.speed.value,
          unit: hour.wind.speed.unit,
        },
        windDirection: {
          value: hour.wind.direction.degrees,
          unit: 'degrees',
        },
        uvIndex: {
          value: hour.uvIndex,
        },
        visibility: {
          value: hour.visibility.distance,
          unit: hour.visibility.unit,
        },
        pressure: {
          value: hour.airPressure.meanSeaLevelMillibars,
          unit: 'mb',
        },
        cloudCover: {
          value: hour.cloudCover,
          unit: '%',
        },
        precipitationProbability: {
          value: hour.precipitation.probability.percent,
          unit: '%',
        },
      },
      weatherCondition: {
        text: hour.weatherCondition.description.text,
        icon: generateIconUrl(hour.weatherCondition.iconBaseUri, isDarkMode),
      },
    });
  }
  
  return {
    hours: hourlyData
  };
};

const convertDailyForecast = (data: ForecastResponse, isDarkMode: boolean = false): DailyForecastType => {
  return {
    days: data.forecastDays.map(day => {
      return {
        date: `${day.displayDate.year}-${day.displayDate.month}-${day.displayDate.day}`,
        sunrise: day.sunEvents.sunriseTime,
        sunset: day.sunEvents.sunsetTime,
        weatherCondition: {
          text: day.daytimeForecast.weatherCondition.description.text,
          icon: generateIconUrl(day.daytimeForecast.weatherCondition.iconBaseUri, isDarkMode),
        },
        temperatureHigh: {
          value: day.maxTemperature.degrees,
          unit: day.maxTemperature.unit,
        },
        temperatureLow: {
          value: day.minTemperature.degrees,
          unit: day.minTemperature.unit,
        },
        precipitationProbability: {
          value: day.daytimeForecast.precipitation.probability.percent,
          unit: '%',
        },
        precipitationAmount: {
          value: day.daytimeForecast.precipitation.qpf.quantity,
          unit: day.daytimeForecast.precipitation.qpf.unit,
        },
        uvIndex: {
          value: day.daytimeForecast.uvIndex,
        },
        windSpeed: {
          value: day.daytimeForecast.wind.speed.value,
          unit: day.daytimeForecast.wind.speed.unit,
        },
        humidity: {
          value: day.daytimeForecast.relativeHumidity,
          unit: '%',
        },
      };
    }),
  };
};

const convertHourlyHistory = (data: HourlyHistoryResponse, isDarkMode: boolean = false): HourlyHistoryType => {
  return {
    hours: data.historyHours.map(hour => {
      return {
        time: hour.interval.startTime,
        weatherData: {
          temperature: {
            value: hour.temperature.degrees,
            unit: hour.temperature.unit,
          },
          apparentTemperature: {
            value: hour.feelsLikeTemperature.degrees,
            unit: hour.feelsLikeTemperature.unit,
          },
          humidity: {
            value: hour.relativeHumidity,
            unit: '%',
          },
          dewPoint: {
            value: hour.dewPoint.degrees,
            unit: hour.dewPoint.unit,
          },
          windSpeed: {
            value: hour.wind.speed.value,
            unit: hour.wind.speed.unit,
          },
          windDirection: {
            value: hour.wind.direction.degrees,
            unit: 'degrees',
          },
          uvIndex: {
            value: hour.uvIndex,
          },
          visibility: {
            value: hour.visibility.distance,
            unit: hour.visibility.unit,
          },
          pressure: {
            value: hour.airPressure.meanSeaLevelMillibars,
            unit: 'mb',
          },
          cloudCover: {
            value: hour.cloudCover,
            unit: '%',
          },
          precipitationProbability: {
            value: hour.precipitation.probability.percent,
            unit: '%',
          },
        },
        weatherCondition: {
          text: hour.weatherCondition.description.text,
          icon: generateIconUrl(hour.weatherCondition.iconBaseUri, isDarkMode),
        },
      };
    }),
  };
};

export default function Home() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('current');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherType | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastType | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastType | null>(null);
  const [hourlyHistory, setHourlyHistory] = useState<HourlyHistoryType | null>(null);
  const [apiError, setApiError] = useState<Error | ApiError | null>(null);
  
  // 处理和分类错误
  const handleApiError = (error: unknown): void => {
    console.error('API错误:', error);
    
    // 设置错误对象
    if (error instanceof ApiError || error instanceof Error) {
      setApiError(error);
    } else {
      // 处理其他未知类型的错误
      setApiError(new Error('获取数据时发生未知错误，请稍后再试'));
    }
  };
  
  const fetchWeatherData = async (lat: number, lng: number) => {
    setLoading(true);
    setApiError(null);
    
    try {
      // 获取当前天气数据
      const currentData = await getCurrentWeather(lat, lng);
      setCurrentWeather(convertCurrentWeather(currentData, isDarkMode));
    } catch (error) {
      console.error('获取当前天气失败:', error);
      handleApiError(error);
      setCurrentWeather(null);
    }
    
    try {
      // 获取每小时预报
      const hourlyData = await getHourlyForecast(lat, lng);
      console.log('每小时预报数据:', hourlyData);
      if (!hourlyData || !hourlyData.forecastHours || !Array.isArray(hourlyData.forecastHours) || hourlyData.forecastHours.length === 0) {
        console.error('每小时预报数据格式不正确:', hourlyData);
        setHourlyForecast({ hours: [] });
      } else {
        setHourlyForecast(convertHourlyForecast(hourlyData, isDarkMode));
      }
    } catch (error) {
      console.error('获取每小时预报失败:', error);
      if (!apiError) handleApiError(error);
      setHourlyForecast({ hours: [] });
    }
    
    try {
      // 获取每日预报
      const dailyData = await getDailyForecast(lat, lng);
      setDailyForecast(convertDailyForecast(dailyData, isDarkMode));
    } catch (error) {
      console.error('获取每日预报失败:', error);
      if (!apiError) handleApiError(error);
      setDailyForecast(null);
    }
    
    try {
      // 获取历史数据
      const historyData = await getHourlyHistory(lat, lng);
      setHourlyHistory(convertHourlyHistory(historyData, isDarkMode));
    } catch (error) {
      console.error('获取历史数据失败:', error);
      if (!apiError) handleApiError(error);
      setHourlyHistory(null);
    }
    
    setLoading(false);
  };
  
  const handleLocationChange = async (newLocation: LocationData) => {
    setLocation(newLocation);
    try {
      await fetchWeatherData(newLocation.lat, newLocation.lng);
    } catch (error) {
      handleApiError(error);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (location) {
      fetchWeatherData(location.lat, location.lng);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // 如果有location，重新加载数据以更新图标
    if (location) {
      fetchWeatherData(location.lat, location.lng);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-blue-400 shadow-md text-white p-6">
        <div className="container flex flex-col mx-auto justify-between items-center md:flex-row">
          <div className="flex mb-4 items-center md:mb-0">
            <svg className="h-10 mr-3 w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3V4M12 20V21M4 12H3M21 12H20M6.3 6.3L5.5 5.5M18.7 6.3L19.5 5.5M17.7 17.7L18.5 18.5M6.3 17.7L5.5 18.5M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="font-bold text-3xl">Google 天气</h1>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={toggleDarkMode}
              className="p-2 mr-4 bg-white bg-opacity-20 rounded-full"
              aria-label={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
            >
              {isDarkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <LocationSearch onLocationChange={handleLocationChange} />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        {location && (
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-2">
              {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
            </h2>
          </div>
        )}
        
        {apiError && (
          <div className="mb-6">
            <ErrorDisplay error={apiError} onRetry={handleRetry} />
          </div>
        )}
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <WeatherMap location={location} />
            
            <div className="mt-6">
              <CurrentWeather data={currentWeather} isLoading={loading} />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md mb-6 p-4">
              <div className="border-b flex">
                <button
                  className={`py-2 px-4 font-medium ${activeTab === 'current' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('current')}
                >
                  当前
                </button>
                <button
                  className={`py-2 px-4 font-medium ${activeTab === 'hourly' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('hourly')}
                >
                  每小时预报
                </button>
                <button
                  className={`py-2 px-4 font-medium ${activeTab === 'daily' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('daily')}
                >
                  每日预报
                </button>
                <button
                  className={`py-2 px-4 font-medium ${activeTab === 'history' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('history')}
                >
                  历史记录
                </button>
              </div>
              
              <div className="mt-4">
                {activeTab === 'current' && <CurrentWeather data={currentWeather} isLoading={loading} />}
                {activeTab === 'hourly' && <HourlyForecast data={hourlyForecast} isLoading={loading} />}
                {activeTab === 'daily' && <DailyForecast data={dailyForecast} isLoading={loading} />}
                {activeTab === 'history' && <HourlyHistory data={hourlyHistory} isLoading={loading} />}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 mt-12 text-white p-6">
        <div className="container mx-auto">
          <div className="flex flex-col justify-between items-center md:flex-row">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold text-xl mb-2">Google 天气</h3>
              <p className="text-gray-400">
                基于 Google Maps Platform Weather API 的全球天气信息服务
              </p>
            </div>
            <div>
              <p className="text-gray-400">© {new Date().getFullYear()} Google Weather</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
