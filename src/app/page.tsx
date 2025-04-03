'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import LocationSearch from '@/components/LocationSearch';
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
  getHourlyHistory
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

export default function Home() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('current');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherType | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastType | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastType | null>(null);
  const [hourlyHistory, setHourlyHistory] = useState<HourlyHistoryType | null>(null);
  
  const handleLocationChange = async (newLocation: LocationData) => {
    setLocation(newLocation);
    setLoading(true);
    
    try {
      // 使用API获取天气数据
      const currentData = await getCurrentWeather(newLocation.lat, newLocation.lng);
      setCurrentWeather(currentData);
      
      const hourlyData = await getHourlyForecast(newLocation.lat, newLocation.lng);
      setHourlyForecast(hourlyData);
      
      const dailyData = await getDailyForecast(newLocation.lat, newLocation.lng);
      setDailyForecast(dailyData);
      
      const historyData = await getHourlyHistory(newLocation.lat, newLocation.lng);
      setHourlyHistory(historyData);
      
      setLoading(false);
    } catch (error) {
      console.error('获取天气数据失败:', error);
      setLoading(false);
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
          
          <LocationSearch onLocationChange={handleLocationChange} />
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
