'use client';

import { useState, useEffect } from 'react';
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
import React from 'react';

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
  // 检查URL是否已经有_dark后缀
  const hasDarkSuffix = iconBaseUri.includes('_dark');
  
  // 移除现有的_dark后缀和.svg扩展名
  let baseUri = iconBaseUri;
  if (hasDarkSuffix) {
    baseUri = baseUri.replace('_dark', '');
  }
  if (baseUri.endsWith('.svg')) {
    baseUri = baseUri.substring(0, baseUri.length - 4);
  }
  
  // 检查当前文档主题 - 仅在客户端环境中执行
  let useDarkTheme = isDarkMode;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    // 如果设置了明确的主题，使用该主题
    if (currentTheme === 'dark') {
      useDarkTheme = true;
    } else if (currentTheme === 'light') {
      useDarkTheme = false;
    } else if (currentTheme === null) {
      // 如果没有明确设置主题（自动模式），检查系统颜色方案偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        useDarkTheme = true;
      } else {
        useDarkTheme = isDarkMode;
      }
    }
  }
  
  // 如果需要深色模式，添加 _dark 后缀
  const themeSuffix = useDarkTheme ? '_dark' : '';
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

// 定义主题模式枚举
enum ThemeMode {
  AUTO = 'auto',
  LIGHT = 'light',
  DARK = 'dark'
}

export default function Home() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('current');
  const [loading, setLoading] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.AUTO);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState<boolean>(false);
  
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherType | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastType | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastType | null>(null);
  const [hourlyHistory, setHourlyHistory] = useState<HourlyHistoryType | null>(null);
  const [apiError, setApiError] = useState<Error | ApiError | null>(null);
  
  const themeMenuRef = React.useRef<HTMLDivElement>(null);
  const themeButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // 组件挂载后设置isMounted为true并从本地存储恢复主题设置
  useEffect(() => {
    setIsMounted(true);
    
    // 从localStorage恢复主题设置
    if (typeof window !== 'undefined') {
      const savedThemeMode = localStorage.getItem('themeMode');
      if (savedThemeMode) {
        try {
          const parsedThemeMode = savedThemeMode as ThemeMode;
          if (Object.values(ThemeMode).includes(parsedThemeMode)) {
            setThemeMode(parsedThemeMode);
          }
        } catch (e) {
          console.error('无法解析保存的主题模式:', e);
        }
      }
    }
  }, []);
  
  // 将主题设置保存到本地存储
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('themeMode', themeMode);
    }
  }, [themeMode, isMounted]);
  
  // 在组件挂载时检查系统主题并监听系统主题变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // 如果是自动模式，则使用系统主题
      if (themeMode === ThemeMode.AUTO) {
        setIsDarkMode(darkModeMediaQuery.matches);
      }
      
      // 监听系统主题变化
      const handleChange = (e: MediaQueryListEvent) => {
        if (themeMode === ThemeMode.AUTO) {
          setIsDarkMode(e.matches);
        }
      };
      
      darkModeMediaQuery.addEventListener('change', handleChange);
      return () => darkModeMediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);
  
  // 根据themeMode状态更新isDarkMode
  useEffect(() => {
    if (themeMode === ThemeMode.LIGHT) {
      setIsDarkMode(false);
    } else if (themeMode === ThemeMode.DARK) {
      setIsDarkMode(true);
    }
    // 如果是AUTO，已在系统主题检测中处理
  }, [themeMode]);
  
  // 应用当前主题到文档
  useEffect(() => {
    if (!isMounted) return;
    
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
      
      // 如果已经有天气数据，更新所有数据以刷新图标
      if (location) {
        // 仅在已经加载了数据的情况下更新图标，避免不必要的API调用
        if (currentWeather) {
          setCurrentWeather(prevData => {
            if (!prevData) return null;
            return {
              ...prevData,
              weatherCondition: {
                ...prevData.weatherCondition,
                icon: generateIconUrl(prevData.weatherCondition.icon, isDarkMode)
              }
            };
          });
        }
        
        if (hourlyForecast && hourlyForecast.hours.length > 0) {
          setHourlyForecast(prevData => {
            if (!prevData || !prevData.hours.length) return { hours: [] };
            return {
              hours: prevData.hours.map(hour => ({
                ...hour,
                weatherCondition: {
                  ...hour.weatherCondition,
                  icon: generateIconUrl(hour.weatherCondition.icon, isDarkMode)
                }
              }))
            };
          });
        }
        
        if (dailyForecast && dailyForecast.days.length > 0) {
          setDailyForecast(prevData => {
            if (!prevData || !prevData.days.length) return null;
            return {
              days: prevData.days.map(day => ({
                ...day,
                weatherCondition: {
                  ...day.weatherCondition,
                  icon: generateIconUrl(day.weatherCondition.icon, isDarkMode)
                }
              }))
            };
          });
        }
        
        if (hourlyHistory && hourlyHistory.hours.length > 0) {
          setHourlyHistory(prevData => {
            if (!prevData || !prevData.hours.length) return null;
            return {
              hours: prevData.hours.map(hour => ({
                ...hour,
                weatherCondition: {
                  ...hour.weatherCondition,
                  icon: generateIconUrl(hour.weatherCondition.icon, isDarkMode)
                }
              }))
            };
          });
        }
      }
    }
  }, [isDarkMode, isMounted]);
  
  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        themeMenuRef.current && 
        themeButtonRef.current &&
        !themeMenuRef.current.contains(event.target as Node) &&
        !themeButtonRef.current.contains(event.target as Node)
      ) {
        setThemeMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 处理主题菜单切换
  const toggleThemeMenu = () => {
    setThemeMenuOpen(!themeMenuOpen);
  };
  
  // 处理主题选择
  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    setThemeMenuOpen(false);
  };
  
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

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--main-bg)' }}>
      <header 
        className="shadow-md text-white p-4" 
        style={{ 
          background: `linear-gradient(to right, var(--header-bg-from), var(--header-bg-to))` 
        }}
      >
        <div className="container flex flex-col mx-auto justify-between items-center md:flex-row">
          <div className="flex items-center">
            <svg className="h-8 mr-2 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3V4M12 20V21M4 12H3M21 12H20M6.3 6.3L5.5 5.5M18.7 6.3L19.5 5.5M17.7 17.7L18.5 18.5M6.3 17.7L5.5 18.5M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="font-normal text-2xl">Google 天气</h1>
          </div>
          
          <div className="flex mt-4 items-center md:mt-0">
            {isMounted && (
              <div className="flex items-center relative">
                <button 
                  ref={themeButtonRef}
                  onClick={toggleThemeMenu}
                  className="dark-mode-toggle relative"
                  aria-label="切换主题选项"
                  title={themeMode === ThemeMode.AUTO 
                    ? "跟随系统" 
                    : themeMode === ThemeMode.LIGHT 
                      ? "亮色模式" 
                      : "暗色模式"
                  }
                >
                  {themeMode === ThemeMode.AUTO ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  ) : isDarkMode ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                  <div 
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full flex items-center justify-center transition-transform duration-200 ${themeMenuOpen ? 'transform rotate-180' : ''}`}
                    style={{ 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(66, 133, 244, 0.2)',
                    }}
                  >
                    <svg 
                      className="h-2 w-2"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {/* 主题选择下拉菜单 */}
                <div 
                  ref={themeMenuRef}
                  className={`absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 transition-all duration-200 transform ${
                    themeMenuOpen 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-[-10px] invisible'
                  }`}
                  style={{ background: 'var(--card-background)' }}
                >
                  {/* 添加小三角形指示器 */}
                  <div 
                    className="absolute right-4 -top-2 w-4 h-4 rotate-45 transform"
                    style={{ background: 'var(--card-background)' }}
                  ></div>
                  
                  <div className="py-1 relative" role="menu" aria-orientation="vertical">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${
                        themeMode === ThemeMode.AUTO 
                          ? 'font-medium' 
                          : ''
                      } hover:bg-opacity-10 transition-colors duration-150`}
                      role="menuitem"
                      onClick={() => handleThemeSelect(ThemeMode.AUTO)}
                      style={{ 
                        backgroundColor: themeMode === ThemeMode.AUTO ? 'var(--tab-active)' : 'transparent',
                        color: themeMode === ThemeMode.AUTO ? '#ffffff' : 'var(--foreground)'
                      }}
                    >
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        跟随系统
                      </div>
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${
                        themeMode === ThemeMode.LIGHT 
                          ? 'font-medium' 
                          : ''
                      } hover:bg-opacity-10 transition-colors duration-150`}
                      role="menuitem"
                      onClick={() => handleThemeSelect(ThemeMode.LIGHT)}
                      style={{ 
                        backgroundColor: themeMode === ThemeMode.LIGHT ? 'var(--tab-active)' : 'transparent',
                        color: themeMode === ThemeMode.LIGHT ? '#ffffff' : 'var(--foreground)'
                      }}
                    >
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        亮色模式
                      </div>
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${
                        themeMode === ThemeMode.DARK 
                          ? 'font-medium' 
                          : ''
                      } hover:bg-opacity-10 transition-colors duration-150`}
                      role="menuitem"
                      onClick={() => handleThemeSelect(ThemeMode.DARK)}
                      style={{ 
                        backgroundColor: themeMode === ThemeMode.DARK ? 'var(--tab-active)' : 'transparent',
                        color: themeMode === ThemeMode.DARK ? '#ffffff' : 'var(--foreground)'
                      }}
                    >
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        暗色模式
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="container mx-auto mt-4 p-4">
        <div className="mx-auto max-w-md mb-6 w-full">
          <LocationSearch onLocationChange={handleLocationChange} />
        </div>
      </div>
      
      <main className="container flex-grow mx-auto p-4">
        {location && (
          <div className="mb-6">
            <h2 className="font-normal text-xl mb-2 text-google-gray-800">
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
            <div 
              className="rounded-lg shadow-sm mb-6 p-4" 
              style={{ background: 'var(--card-background)' }}
            >
              <div className="border-b flex overflow-x-auto">
                <button
                  className={`py-2 px-4 font-medium whitespace-nowrap ${
                    activeTab === 'current' 
                      ? 'border-b-2' 
                      : ''
                  }`}
                  style={{ 
                    color: activeTab === 'current' ? 'var(--tab-active)' : 'var(--tab-inactive)',
                    borderColor: activeTab === 'current' ? 'var(--tab-border)' : 'transparent' 
                  }}
                  onClick={() => setActiveTab('current')}
                >
                  当前
                </button>
                <button
                  className={`py-2 px-4 font-medium whitespace-nowrap ${
                    activeTab === 'hourly' 
                      ? 'border-b-2' 
                      : ''
                  }`}
                  style={{ 
                    color: activeTab === 'hourly' ? 'var(--tab-active)' : 'var(--tab-inactive)',
                    borderColor: activeTab === 'hourly' ? 'var(--tab-border)' : 'transparent' 
                  }}
                  onClick={() => setActiveTab('hourly')}
                >
                  每小时预报
                </button>
                <button
                  className={`py-2 px-4 font-medium whitespace-nowrap ${
                    activeTab === 'daily' 
                      ? 'border-b-2' 
                      : ''
                  }`}
                  style={{ 
                    color: activeTab === 'daily' ? 'var(--tab-active)' : 'var(--tab-inactive)', 
                    borderColor: activeTab === 'daily' ? 'var(--tab-border)' : 'transparent'
                  }}
                  onClick={() => setActiveTab('daily')}
                >
                  每日预报
                </button>
                <button
                  className={`py-2 px-4 font-medium whitespace-nowrap ${
                    activeTab === 'history' 
                      ? 'border-b-2' 
                      : ''
                  }`}
                  style={{ 
                    color: activeTab === 'history' ? 'var(--tab-active)' : 'var(--tab-inactive)',
                    borderColor: activeTab === 'history' ? 'var(--tab-border)' : 'transparent' 
                  }}
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
      
      <footer 
        className="mt-auto text-white p-4"
        style={{ background: 'var(--footer-bg)' }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col justify-between items-center md:flex-row">
            <div className="mb-4 md:mb-0">
              <h3 className="font-normal text-lg mb-2">Google 天气</h3>
              <p style={{ color: 'var(--footer-text-muted)' }}>
                基于 Google Maps Platform Weather API 的全球天气信息服务
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--footer-text-muted)' }}>© {new Date().getFullYear()} Google Weather</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
