import axios, { AxiosResponse, AxiosError } from 'axios';

// 这里应该放置您的Google Maps API密钥
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const BASE_URL = 'https://weather.googleapis.com/v1';

// 创建自定义错误类型
class ApiError extends Error {
  response?: AxiosResponse;
  code: string;
  isLocationNotSupported: boolean;

  constructor(message: string, code: string = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.isLocationNotSupported = false;
  }
}

// 创建axios实例，增加超时和重试配置
const weatherApi = axios.create({
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
});

// axios响应拦截器
weatherApi.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;
    
    // 如果是404错误，说明位置不支持，直接返回错误
    if (response && response.status === 404) {
      const customError = new ApiError("该位置不被支持，请尝试其他位置。您可以尝试更具体的地址或者附近的城市。", 'LOCATION_NOT_SUPPORTED');
      customError.response = response;
      customError.isLocationNotSupported = true;
      return Promise.reject(customError);
    }

    // 如果请求已经重试过或不是网络错误，直接返回错误
    if (!config || config.__retryCount >= 2) {
      return Promise.reject(error);
    }

    // 重试计数
    config.__retryCount = config.__retryCount || 0;
    config.__retryCount += 1;

    // 重试延迟
    const delay = new Promise(resolve => setTimeout(resolve, 1000 * config.__retryCount));
    
    // 重试请求
    await delay;
    return weatherApi(config);
  }
);

// 统一的错误处理函数
const handleApiError = (error: unknown, errorMessage: string): never => {
  console.error(errorMessage, error);

  // 如果是Axios错误，检查是否为404或位置不支持
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      const customError = new ApiError("该位置不被支持，请尝试其他位置。您可以尝试更具体的地址或者附近的城市。", 'LOCATION_NOT_SUPPORTED');
      customError.response = axiosError.response;
      customError.isLocationNotSupported = true;
      throw customError;
    }
  }

  // 如果是ApiError，直接抛出
  if (error instanceof ApiError) {
    throw error;
  }

  // 将普通错误转换为ApiError
  if (error instanceof Error) {
    const apiError = new ApiError(error.message);
    throw apiError;
  }

  // 处理未知类型的错误
  throw new ApiError(errorMessage, 'UNKNOWN_ERROR');
};

// 当前天气状况接口返回类型
export interface CurrentWeather {
  currentTime: string;
  timeZone: {
    id: string;
  };
  isDaytime: boolean;
  weatherCondition: {
    iconBaseUri: string;
    description: {
      text: string;
      languageCode: string;
    };
    type: string;
  };
  temperature: {
    degrees: number;
    unit: string;
  };
  feelsLikeTemperature: {
    degrees: number;
    unit: string;
  };
  dewPoint: {
    degrees: number;
    unit: string;
  };
  heatIndex: {
    degrees: number;
    unit: string;
  };
  windChill: {
    degrees: number;
    unit: string;
  };
  relativeHumidity: number;
  uvIndex: number;
  precipitation: {
    probability: {
      percent: number;
      type: string;
    };
    qpf: {
      quantity: number;
      unit: string;
    };
  };
  thunderstormProbability: number;
  airPressure: {
    meanSeaLevelMillibars: number;
  };
  wind: {
    direction: {
      degrees: number;
      cardinal: string;
    };
    speed: {
      value: number;
      unit: string;
    };
    gust: {
      value: number;
      unit: string;
    };
  };
  visibility: {
    distance: number;
    unit: string;
  };
  cloudCover: number;
  currentConditionsHistory: {
    temperatureChange: {
      degrees: number;
      unit: string;
    };
    maxTemperature: {
      degrees: number;
      unit: string;
    };
    minTemperature: {
      degrees: number;
      unit: string;
    };
    qpf: {
      quantity: number;
      unit: string;
    };
  };
}

// 天气预报接口共享类型
export interface ForecastInterval {
  startTime: string;
  endTime: string;
}

export interface DisplayDate {
  year: number;
  month: number;
  day: number;
}

export interface WeatherCondition {
  iconBaseUri: string;
  description: {
    text: string;
    languageCode: string;
  };
  type: string;
}

export interface Precipitation {
  probability: {
    percent: number;
    type: string;
  };
  qpf: {
    quantity: number;
    unit: string;
  };
}

export interface Wind {
  direction: {
    degrees: number;
    cardinal: string;
  };
  speed: {
    value: number;
    unit: string;
  };
  gust: {
    value: number;
    unit: string;
  };
}

export interface Temperature {
  degrees: number;
  unit: string;
}

export interface DayPartForecast {
  interval: ForecastInterval;
  weatherCondition: WeatherCondition;
  relativeHumidity: number;
  uvIndex: number;
  precipitation: Precipitation;
  thunderstormProbability: number;
  wind: Wind;
  cloudCover: number;
}

export interface ForecastDay {
  interval: ForecastInterval;
  displayDate: DisplayDate;
  daytimeForecast: DayPartForecast;
  nighttimeForecast: DayPartForecast;
  maxTemperature: Temperature;
  minTemperature: Temperature;
  feelsLikeMaxTemperature: Temperature;
  feelsLikeMinTemperature: Temperature;
  sunEvents: {
    sunriseTime: string;
    sunsetTime: string;
  };
  moonEvents: {
    moonPhase: string;
    moonriseTimes: string[];
    moonsetTimes: string[];
  };
  maxHeatIndex: Temperature;
  iceThickness: {
    thickness: number;
    unit: string;
  };
}

// 天气预报接口返回类型
export interface ForecastResponse {
  forecastDays: ForecastDay[];
  timeZone: {
    id: string;
  };
}

// 历史天气接口返回类型
export interface DisplayDateTime extends DisplayDate {
  hours: number;
  utcOffset: string;
}

export interface HistoryHour {
  interval: ForecastInterval;
  displayDateTime: DisplayDateTime;
  isDaytime: boolean;
  weatherCondition: WeatherCondition;
  temperature: Temperature;
  feelsLikeTemperature: Temperature;
  dewPoint: Temperature;
  heatIndex: Temperature;
  windChill: Temperature;
  wetBulbTemperature: Temperature;
  relativeHumidity: number;
  uvIndex: number;
  precipitation: Precipitation;
  thunderstormProbability: number;
  airPressure: {
    meanSeaLevelMillibars: number;
  };
  wind: Wind;
  visibility: {
    distance: number;
    unit: string;
  };
  cloudCover: number;
  iceThickness: {
    thickness: number;
    unit: string;
  };
}

export interface HourlyHistoryResponse {
  historyHours: HistoryHour[];
  timeZone: {
    id: string;
  };
}

// 位置信息返回类型
export interface LocationResponse {
  lat: number;
  lng: number;
}

// 导出ApiError类型供其他模块使用
export { ApiError };

/**
 * 获取当前天气状况
 * @param lat 纬度
 * @param lng 经度
 * @returns 当前天气状况数据
 */
export const getCurrentWeather = async (lat: number, lng: number): Promise<CurrentWeather> => {
  try {
    const response = await weatherApi.get(`${BASE_URL}/currentConditions:lookup`, {
      params: {
        key: API_KEY,
        'location.latitude': lat,
        'location.longitude': lng,
      },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, '获取当前天气失败');
  }
};

/**
 * 获取每小时天气预报
 * @param lat 纬度
 * @param lng 经度
 * @param hours 需要获取的小时数
 * @returns 每小时天气预报数据
 */
export const getHourlyForecast = async (lat: number, lng: number, hours = 24): Promise<ForecastResponse> => {
  try {
    const response = await weatherApi.get(`${BASE_URL}/forecast/hours:lookup`, {
      params: {
        key: API_KEY,
        'location.latitude': lat,
        'location.longitude': lng,
        hours,
      },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, '获取每小时天气预报失败');
  }
};

/**
 * 获取每日天气预报
 * @param lat 纬度
 * @param lng 经度
 * @param days 需要获取的天数
 * @returns 每日天气预报数据
 */
export const getDailyForecast = async (lat: number, lng: number, days = 7): Promise<ForecastResponse> => {
  try {
    const response = await weatherApi.get(`${BASE_URL}/forecast/days:lookup`, {
      params: {
        key: API_KEY,
        'location.latitude': lat,
        'location.longitude': lng,
        days,
      },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, '获取每日天气预报失败');
  }
};

/**
 * 获取每小时历史天气记录
 * @param lat 纬度
 * @param lng 经度
 * @param hours 需要获取的小时数
 * @returns 每小时历史天气数据
 */
export const getHourlyHistory = async (lat: number, lng: number, hours = 24): Promise<HourlyHistoryResponse> => {
  try {
    const response = await weatherApi.get(`${BASE_URL}/history/hours:lookup`, {
      params: {
        key: API_KEY,
        'location.latitude': lat,
        'location.longitude': lng,
        hours,
      },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, '获取每小时历史记录失败');
  }
};

/**
 * 通过地址搜索获取位置信息
 * @param address 地址字符串
 * @returns 包含纬度和经度的位置信息
 */
export const getLocationByAddress = async (address: string): Promise<LocationResponse> => {
  try {
    const response = await weatherApi.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address,
        key: API_KEY,
      },
    });
    
    if (response.data.status === 'ZERO_RESULTS') {
      throw new ApiError('未找到该地址，请尝试更具体的位置', 'ADDRESS_NOT_FOUND');
    }
    
    if (response.data.status === 'REQUEST_DENIED' || response.data.status === 'INVALID_REQUEST') {
      throw new ApiError(`请求地理编码失败: ${response.data.error_message || response.data.status}`, 'GEOCODING_ERROR');
    }
    
    if (!response.data.results || response.data.results.length === 0) {
      throw new ApiError('未找到该地址，请尝试更具体的位置', 'ADDRESS_NOT_FOUND');
    }
    
    return response.data.results[0]?.geometry.location;
  } catch (error) {
    return handleApiError(error, '获取位置信息失败');
  }
}; 