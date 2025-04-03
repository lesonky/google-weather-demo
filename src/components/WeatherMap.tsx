import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LocationData } from '@/types/weather';

interface WeatherMapProps {
  location: LocationData | null;
}

// Google Maps 亮色和暗色主题样式
const lightModeMapStyles = [
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }, { lightness: 17 }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#f2f2f2' }, { lightness: 19 }]
  },
];

const darkModeMapStyles = [
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d8d8d8' }]
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ visibility: 'on' }, { color: '#3e3e3e' }, { weight: 2 }, { gamma: 0.84 }]
  },
  {
    featureType: 'all',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2a2a2a' }]
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2a2a2a' }, { weight: 1.2 }]
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#2a2a2a' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#3a3a3a' }, { visibility: 'simplified' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#444444' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#444444' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#222222' }]
  }
];

// 创建单例Loader实例
const mapLoader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places']
});

const WeatherMap: React.FC<WeatherMapProps> = ({ location }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const googleRef = useRef<typeof google | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // 检测系统主题
  useEffect(() => {
    // 检测当前主题模式
    const checkTheme = () => {
      if (typeof document !== 'undefined') {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        setIsDarkMode(isDark);
        
        // 如果使用自动模式，则检查系统偏好
        if (document.documentElement.getAttribute('data-theme') === null) {
          const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          setIsDarkMode(darkModeMediaQuery.matches);
        }
      }
    };
    
    checkTheme();
    
    // 监听主题变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          checkTheme();
        }
      });
    });
    
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    }
    
    return () => observer.disconnect();
  }, []);

  // 当主题模式变化时更新地图样式
  useEffect(() => {
    if (mapInstanceRef.current && googleRef.current) {
      mapInstanceRef.current.setOptions({
        styles: isDarkMode ? darkModeMapStyles : lightModeMapStyles
      });
    }
  }, [isDarkMode]);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;
      
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('Google Maps API Key is missing');
        return;
      }

      try {
        // 导入maps库
        await mapLoader.load();
        googleRef.current = window.google;
        
        const defaultLocation = location || { lat: 39.9042, lng: 116.4074 }; // 默认北京位置
        
        const mapOptions = {
          center: defaultLocation,
          zoom: 10,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: isDarkMode ? darkModeMapStyles : lightModeMapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false
        };
        
        mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
        
        if (location) {
          // 添加标记
          markerRef.current = new google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            title: location.address || '所选位置',
            animation: google.maps.Animation.DROP
          });
          
          // 设置地图中心
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(10);
        }
      } catch (error) {
        console.error('加载Google Maps时出错:', error);
      }
    };

    initMap();
  }, [isDarkMode]); // 添加isDarkMode作为依赖，以便主题切换时重新初始化地图

  useEffect(() => {
    const updateMap = async () => {
      if (!location || !mapInstanceRef.current) return;
      
      mapInstanceRef.current.setCenter(location);
      
      // 如果已经有标记，则移除它
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      
      try {
        // 确保google对象已加载
        if (!googleRef.current) {
          await mapLoader.load();
          googleRef.current = window.google;
        }
        
        // 创建新标记
        markerRef.current = new google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          title: location.address || '所选位置',
          animation: google.maps.Animation.DROP
        });
      } catch (error) {
        console.error('更新地图标记时出错:', error);
      }
    };
    
    if (googleRef.current) {
      updateMap();
    }
  }, [location]);

  return (
    <div 
      className="rounded-lg h-[400px] shadow-lg w-full overflow-hidden transition-colors duration-300"
      style={{ background: isDarkMode ? '#202124' : '#ffffff' }}
    >
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default WeatherMap; 