import axios from 'axios';

// 这里应该放置您的Google Maps API密钥
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const BASE_URL = 'https://weather.googleapis.com/v1';

// 获取当前天气状况
export const getCurrentWeather = async (lat: number, lng: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/currentConditions:lookup`, {
      params: {
        key: API_KEY,
        'location.latitude': lat,
        'location.longitude': lng,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取当前天气失败:', error);
    throw error;
  }
};

// 获取每小时天气预报
export const getHourlyForecast = async (lat: number, lng: number, hours = 24) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast/hours:lookup`, {
      params: {
        key: API_KEY,
        'location.latitude': lat,
        'location.longitude': lng,
        hours,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取每小时天气预报失败:', error);
    throw error;
  }
};

// 获取每日天气预报
export const getDailyForecast = async (lat: number, lng: number, days = 7) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast/days:lookup`, {
      params: {
        key: API_KEY,
        'location.latitude': lat,
        'location.longitude': lng,
        days,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取每日天气预报失败:', error);
    throw error;
  }
};

// 获取每小时历史记录
export const getHourlyHistory = async (lat: number, lng: number, hours = 24) => {
  try {
    const response = await axios.get(`${BASE_URL}/history/hours:lookup`, {
      params: {
        key: API_KEY,
        'location.latitude': lat,
        'location.longitude': lng,
        hours,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取每小时历史记录失败:', error);
    throw error;
  }
};

// 通过地址搜索获取位置信息
export const getLocationByAddress = async (address: string) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address,
        key: API_KEY,
      },
    });
    return response.data.results[0]?.geometry.location;
  } catch (error) {
    console.error('获取位置信息失败:', error);
    throw error;
  }
}; 