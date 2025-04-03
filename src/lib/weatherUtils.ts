// 天气类型枚举映射
export interface WeatherTypeMapping {
  text: string;  // 中文描述
  icon: string;  // 推荐使用的图标名（可用于后续替换）
  color?: string; // 可选的颜色标识
  description?: string; // 可选的额外描述
}

// 天气类型映射表
export const WEATHER_TYPE_MAPPING: Record<string, WeatherTypeMapping> = {
  // 晴朗相关
  'TYPE_UNSPECIFIED': { text: '天气状况未指定', icon: 'question' },
  'CLEAR': { text: '晴朗', icon: 'sun', color: '#FFD700' },
  'MOSTLY_CLEAR': { text: '大部晴朗', icon: 'sun-cloud', color: '#FFDB58' },
  'PARTLY_CLOUDY': { text: '局部多云', icon: 'partly-cloudy', color: '#87CEEB' },
  'MOSTLY_CLOUDY': { text: '大部多云', icon: 'mostly-cloudy', color: '#B0C4DE' },
  'CLOUDY': { text: '阴天', icon: 'cloudy', color: '#708090' },
  
  // 风相关
  'WINDY': { text: '大风', icon: 'wind', color: '#B0C4DE' },
  'WIND_AND_RAIN': { text: '大风伴有降水', icon: 'wind-rain', color: '#4682B4' },
  
  // 雨相关
  'LIGHT_RAIN_SHOWERS': { text: '小阵雨', icon: 'shower-light', color: '#87CEFA' },
  'CHANCE_OF_SHOWERS': { text: '可能有阵雨', icon: 'shower-chance', color: '#6495ED' },
  'SCATTERED_SHOWERS': { text: '零星阵雨', icon: 'shower-scattered', color: '#4682B4' },
  'RAIN_SHOWERS': { text: '阵雨', icon: 'shower', color: '#4169E1' },
  'HEAVY_RAIN_SHOWERS': { text: '强阵雨', icon: 'shower-heavy', color: '#191970' },
  'LIGHT_TO_MODERATE_RAIN': { text: '小到中雨', icon: 'rain-light-moderate', color: '#87CEFA' },
  'MODERATE_TO_HEAVY_RAIN': { text: '中到大雨', icon: 'rain-moderate-heavy', color: '#4169E1' },
  'RAIN': { text: '中雨', icon: 'rain', color: '#4682B4' },
  'LIGHT_RAIN': { text: '小雨', icon: 'rain-light', color: '#B0E0E6' },
  'HEAVY_RAIN': { text: '大雨', icon: 'rain-heavy', color: '#000080' },
  'RAIN_PERIODICALLY_HEAVY': { text: '雨，间歇性大雨', icon: 'rain-periodic-heavy', color: '#000080' },
  
  // 雪相关
  'LIGHT_SNOW_SHOWERS': { text: '小阵雪', icon: 'snow-shower-light', color: '#E0FFFF' },
  'CHANCE_OF_SNOW_SHOWERS': { text: '可能有雪', icon: 'snow-shower-chance', color: '#E0FFFF' },
  'SCATTERED_SNOW_SHOWERS': { text: '零星降雪', icon: 'snow-scattered', color: '#E0FFFF' },
  'SNOW_SHOWERS': { text: '阵雪', icon: 'snow-shower', color: '#E6E6FA' },
  'HEAVY_SNOW_SHOWERS': { text: '强阵雪', icon: 'snow-shower-heavy', color: '#D8BFD8' },
  'LIGHT_TO_MODERATE_SNOW': { text: '小到中雪', icon: 'snow-light-moderate', color: '#E6E6FA' },
  'MODERATE_TO_HEAVY_SNOW': { text: '中到大雪', icon: 'snow-moderate-heavy', color: '#DDA0DD' },
  'SNOW': { text: '中雪', icon: 'snow', color: '#E6E6FA' },
  'LIGHT_SNOW': { text: '小雪', icon: 'snow-light', color: '#F0F8FF' },
  'HEAVY_SNOW': { text: '大雪', icon: 'snow-heavy', color: '#9370DB' },
  'SNOWSTORM': { text: '暴风雪', icon: 'snowstorm', color: '#483D8B' },
  'SNOW_PERIODICALLY_HEAVY': { text: '雪，间歇性大雪', icon: 'snow-periodic-heavy', color: '#9370DB' },
  'HEAVY_SNOW_STORM': { text: '强暴风雪', icon: 'heavy-snowstorm', color: '#483D8B' },
  'BLOWING_SNOW': { text: '风雪', icon: 'blowing-snow', color: '#7B68EE' },
  'RAIN_AND_SNOW': { text: '雨夹雪', icon: 'rain-snow', color: '#6A5ACD' },
  
  // 冰雹相关
  'HAIL': { text: '冰雹', icon: 'hail', color: '#4169E1' },
  'HAIL_SHOWERS': { text: '阵冰雹', icon: 'hail-shower', color: '#4169E1' },
  
  // 雷暴相关
  'THUNDERSTORM': { text: '雷暴', icon: 'thunderstorm', color: '#4B0082' },
  'THUNDERSHOWER': { text: '雷阵雨', icon: 'thundershower', color: '#4B0082' },
  'LIGHT_THUNDERSTORM_RAIN': { text: '轻度雷雨', icon: 'thunderstorm-light', color: '#9400D3' },
  'SCATTERED_THUNDERSTORMS': { text: '零星雷暴', icon: 'thunderstorm-scattered', color: '#8A2BE2' },
  'HEAVY_THUNDERSTORM': { text: '强雷暴', icon: 'thunderstorm-heavy', color: '#800080' },
  
  // 特殊天气
  'SLEET': { text: '冻雨', icon: 'sleet', color: '#5F9EA0' },
  'FREEZING_RAIN': { text: '冰雨', icon: 'freezing-rain', color: '#4682B4' },
};

// 风向枚举映射
export const CARDINAL_DIRECTION_MAPPING: Record<string, string> = {
  'CARDINAL_DIRECTION_UNSPECIFIED': '未指定方向',
  'NORTH': '北风',
  'NORTH_NORTHEAST': '北偏东北风',
  'NORTHEAST': '东北风',
  'EAST_NORTHEAST': '东北偏东风',
  'EAST': '东风',
  'EAST_SOUTHEAST': '东南偏东风',
  'SOUTHEAST': '东南风',
  'SOUTH_SOUTHEAST': '南偏东南风',
  'SOUTH': '南风',
  'SOUTH_SOUTHWEST': '南偏西南风',
  'SOUTHWEST': '西南风',
  'WEST_SOUTHWEST': '西南偏西风',
  'WEST': '西风',
  'WEST_NORTHWEST': '西北偏西风',
  'NORTHWEST': '西北风',
  'NORTH_NORTHWEST': '北偏西北风',
};

// 速度单位映射
export const SPEED_UNIT_MAPPING: Record<string, string> = {
  'SPEED_UNIT_UNSPECIFIED': '未知单位',
  'KILOMETERS_PER_HOUR': '公里/小时',
  'MILES_PER_HOUR': '英里/小时',
};

// 距离单位映射
export const DISTANCE_UNIT_MAPPING: Record<string, string> = {
  'UNIT_UNSPECIFIED': '未知单位',
  'KILOMETERS': '公里',
  'MILES': '英里',
};

// 温度单位映射
export const TEMPERATURE_UNIT_MAPPING: Record<string, string> = {
  'TEMPERATURE_UNIT_UNSPECIFIED': '未知单位',
  'CELSIUS': '°C',
  'FAHRENHEIT': '°F',
};

// 降水类型映射
export const PRECIPITATION_TYPE_MAPPING: Record<string, string> = {
  'PRECIPITATION_TYPE_UNSPECIFIED': '未知降水',
  'NONE': '无降水',
  'SNOW': '雪',
  'RAIN': '雨',
  'LIGHT_RAIN': '小雨',
  'HEAVY_RAIN': '大雨',
  'RAIN_AND_SNOW': '雨夹雪',
  'SLEET': '冻雨',
  'FREEZING_RAIN': '冰雨',
};

/**
 * 获取天气类型的本地化描述
 * @param type 天气类型
 * @returns 本地化的天气描述
 */
export const getWeatherTypeText = (type: string): string => {
  return WEATHER_TYPE_MAPPING[type]?.text || '未知天气状况';
};

/**
 * 获取天气类型对应的颜色
 * @param type 天气类型
 * @returns 天气类型对应的颜色
 */
export const getWeatherTypeColor = (type: string): string => {
  return WEATHER_TYPE_MAPPING[type]?.color || '#808080'; // 默认灰色
};

/**
 * 获取风向的本地化描述
 * @param cardinal 风向
 * @returns 本地化的风向描述
 */
export const getWindDirectionText = (cardinal: string): string => {
  return CARDINAL_DIRECTION_MAPPING[cardinal] || '未知风向';
};

/**
 * 格式化温度显示
 * @param temp 温度值
 * @param unit 温度单位
 * @returns 格式化的温度显示
 */
export const formatTemperature = (temp: number, unit: string): string => {
  const unitText = TEMPERATURE_UNIT_MAPPING[unit] || unit;
  return `${Math.round(temp)}${unitText}`;
};

/**
 * 格式化风速显示
 * @param speed 风速值
 * @param unit 风速单位
 * @returns 格式化的风速显示
 */
export const formatWindSpeed = (speed: number, unit: string): string => {
  const unitText = SPEED_UNIT_MAPPING[unit] || unit;
  return `${Math.round(speed)} ${unitText}`;
};

/**
 * 根据紫外线指数返回风险等级和描述
 * @param uvIndex 紫外线指数
 * @returns 风险等级和描述
 */
export const getUVIndexLevel = (uvIndex: number): { level: string; description: string; color: string } => {
  if (uvIndex <= 2) {
    return { level: '低', description: '无需防晒', color: '#3C763D' }; // 绿色
  } else if (uvIndex <= 5) {
    return { level: '中', description: '需要防晒', color: '#FFA500' }; // 橙色
  } else if (uvIndex <= 7) {
    return { level: '高', description: '需要加强防晒', color: '#FF8C00' }; // 深橙色
  } else if (uvIndex <= 10) {
    return { level: '很高', description: '需要特别防晒', color: '#FF0000' }; // 红色
  } else {
    return { level: '极高', description: '尽量避免外出', color: '#800080' }; // 紫色
  }
};

/**
 * 格式化能见度显示
 * @param distance 能见度距离
 * @param unit 距离单位
 * @returns 格式化的能见度显示和描述
 */
export const formatVisibility = (distance: number, unit: string): { text: string; description: string } => {
  const unitText = DISTANCE_UNIT_MAPPING[unit] || unit;
  const isKilometers = unit === 'KILOMETERS' || unitText.includes('公里');
  
  // 根据公里或英里设置不同的能见度描述标准
  const threshold = isKilometers ? 
    { low: 1, medium: 5, high: 10 } : 
    { low: 0.6, medium: 3, high: 6 };
  
  let description = '';
  if (distance < threshold.low) {
    description = '能见度很低，请注意安全';
  } else if (distance < threshold.medium) {
    description = '能见度较低';
  } else if (distance < threshold.high) {
    description = '能见度一般';
  } else {
    description = '能见度良好';
  }
  
  return {
    text: `${distance.toFixed(1)} ${unitText}`,
    description
  };
};

/**
 * 获取降水概率对应的描述
 * @param probability 降水概率（百分比）
 * @returns 降水概率描述
 */
export const getPrecipitationDescription = (probability: number): string => {
  if (probability < 10) {
    return '几乎不会有降水';
  } else if (probability < 30) {
    return '可能有少量降水';
  } else if (probability < 50) {
    return '有可能会有降水';
  } else if (probability < 70) {
    return '较大可能会有降水';
  } else if (probability < 90) {
    return '很可能会有降水';
  } else {
    return '几乎确定会有降水';
  }
};

/**
 * 根据天气类型获取建议的活动
 * @param weatherType 天气类型
 * @returns 活动建议
 */
export const getActivitySuggestion = (weatherType: string): string => {
  // 根据天气类型大类划分
  if (['CLEAR', 'MOSTLY_CLEAR'].includes(weatherType)) {
    return '天气晴好，非常适合户外活动，如散步、跑步、野餐等。';
  } else if (['PARTLY_CLOUDY', 'MOSTLY_CLOUDY'].includes(weatherType)) {
    return '天气尚可，适合户外活动，但建议带上防晒用品。';
  } else if (['CLOUDY'].includes(weatherType)) {
    return '天气较阴，适合轻度户外活动，如散步、购物等。';
  } else if (['LIGHT_RAIN', 'LIGHT_RAIN_SHOWERS', 'LIGHT_TO_MODERATE_RAIN'].includes(weatherType)) {
    return '有小雨，建议带伞出行，可进行部分户外活动。';
  } else if (['RAIN', 'RAIN_SHOWERS', 'MODERATE_TO_HEAVY_RAIN'].includes(weatherType)) {
    return '有中雨，不建议进行户外活动，外出请带伞。';
  } else if (['HEAVY_RAIN', 'HEAVY_RAIN_SHOWERS', 'RAIN_PERIODICALLY_HEAVY'].includes(weatherType)) {
    return '有大雨，建议尽量避免户外活动，注意交通安全。';
  } else if (weatherType.includes('SNOW')) {
    return '有降雪，路面可能湿滑，请注意保暖并谨慎出行。';
  } else if (weatherType.includes('THUNDER')) {
    return '有雷电，请避免户外活动，不要在树下、空旷地带停留。';
  } else if (['WINDY', 'WIND_AND_RAIN', 'BLOWING_SNOW'].includes(weatherType)) {
    return '有大风，外出注意防风，不要在临时搭建物附近停留。';
  } else if (['HAIL', 'HAIL_SHOWERS'].includes(weatherType)) {
    return '有冰雹，建议避免外出，保护好车辆和易损物品。';
  } else {
    return '请关注天气变化，合理安排出行计划。';
  }
};

/**
 * 获取云量描述
 * @param cloudCover 云量百分比
 * @returns 云量描述
 */
export const getCloudCoverDescription = (cloudCover: number): string => {
  if (cloudCover < 10) {
    return '晴朗';
  } else if (cloudCover < 30) {
    return '少云';
  } else if (cloudCover < 60) {
    return '多云';
  } else if (cloudCover < 90) {
    return '大部多云';
  } else {
    return '阴天';
  }
};

/**
 * 获取湿度描述
 * @param humidity 湿度百分比
 * @returns 湿度描述和建议
 */
export const getHumidityDescription = (humidity: number): { description: string; suggestion: string } => {
  if (humidity < 30) {
    return { 
      description: '干燥', 
      suggestion: '注意保湿，多补充水分。' 
    };
  } else if (humidity < 40) {
    return { 
      description: '偏干', 
      suggestion: '建议适当补充水分。' 
    };
  } else if (humidity < 60) {
    return { 
      description: '舒适', 
      suggestion: '湿度适宜。' 
    };
  } else if (humidity < 80) {
    return { 
      description: '潮湿', 
      suggestion: '湿度较高，注意通风。' 
    };
  } else {
    return { 
      description: '非常潮湿', 
      suggestion: '湿度很高，注意防潮、防霉。' 
    };
  }
}; 