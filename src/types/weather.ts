export interface WeatherData {
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
    cardinal?: string;
    text?: string;
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
    type?: string;
  };
}

export interface CurrentWeather extends WeatherData {
  observationTime: string;
  weatherCondition: {
    text: string;
    icon: string;
    type?: string;
    typeText?: string;
  };
}

export interface HourlyForecast {
  hours: {
    time: string;
    weatherData: WeatherData;
    weatherCondition: {
      text: string;
      icon: string;
      type?: string;
      typeText?: string;
    };
  }[];
}

export interface DailyForecast {
  days: {
    date: string;
    sunrise: string;
    sunset: string;
    weatherCondition: {
      text: string;
      icon: string;
      type?: string;
      typeText?: string;
    };
    temperatureHigh: {
      value: number;
      unit: string;
    };
    temperatureLow: {
      value: number;
      unit: string;
    };
    precipitationProbability: {
      value: number;
      unit: string;
      type?: string;
    };
    precipitationAmount: {
      value: number;
      unit: string;
    };
    uvIndex: {
      value: number;
    };
    windSpeed: {
      value: number;
      unit: string;
    };
    windDirection?: {
      value: number;
      unit: string;
      cardinal?: string;
      text?: string;
    };
    humidity: {
      value: number;
      unit: string;
    };
  }[];
}

export interface HourlyHistory {
  hours: {
    time: string;
    weatherData: WeatherData;
    weatherCondition: {
      text: string;
      icon: string;
      type?: string;
      typeText?: string;
    };
  }[];
}

export interface LocationData {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
} 