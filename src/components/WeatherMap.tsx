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

// 创建一个带API密钥的Loader实例
const mapLoader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAdut5XSt2dbcQE8B5wZHVtvdsSjtRkGF8',
  version: 'weekly',
  libraries: ['places']
});

const WeatherMap: React.FC<WeatherMapProps> = ({ location }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const googleRef = useRef<typeof google | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAdut5XSt2dbcQE8B5wZHVtvdsSjtRkGF8';
  
  // 添加组件挂载状态引用
  const isMountedRef = useRef<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);

  // 组件挂载状态管理
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      // 组件卸载时，清除引用
      isMountedRef.current = false;
      
      // 清理地图实例和标记
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      
      if (mapInstanceRef.current) {
        // 尝试销毁地图实例 (虽然Google Maps没有官方的销毁方法)
        const mapDiv = mapInstanceRef.current.getDiv();
        if (mapDiv) {
          // 尝试清空地图容器
          while (mapDiv.firstChild) {
            mapDiv.removeChild(mapDiv.firstChild);
          }
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 检测系统主题
  useEffect(() => {
    if (!isMountedRef.current) return;
    
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
      if (!isMountedRef.current) {
        observer.disconnect();
        return;
      }
      
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
    if (!isMountedRef.current) return;
    
    if (mapInstanceRef.current && googleRef.current) {
      try {
        mapInstanceRef.current.setOptions({
          styles: isDarkMode ? darkModeMapStyles : lightModeMapStyles
        });
      } catch (error) {
        console.error('更新地图样式时出错:', error);
      }
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!isMountedRef.current || !mapRef.current || !apiKey) return;
    
    let isInitializing = true;
    
    const initMap = async () => {
      try {
        // 导入maps库
        await mapLoader.load();
        
        // 如果组件已卸载，不继续执行
        if (!isMountedRef.current) return;
        
        googleRef.current = window.google;
        
        // 如果地图容器被移除，不继续执行
        if (!mapRef.current) return;
        
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
        
        // 创建地图实例
        mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
        
        // 如果组件已卸载，不继续执行
        if (!isMountedRef.current) return;
        
        if (location) {
          // 添加标记
          try {
            markerRef.current = new google.maps.Marker({
              position: location,
              map: mapInstanceRef.current,
              title: location.address || '所选位置',
              animation: google.maps.Animation.DROP
            });
            
            // 设置地图中心
            mapInstanceRef.current.setCenter(location);
            mapInstanceRef.current.setZoom(10);
          } catch (markerError) {
            console.error('创建地图标记时出错:', markerError);
          }
        }
        
        isInitializing = false;
      } catch (error) {
        console.error('加载Google Maps时出错:', error);
        if (isMountedRef.current) {
          setMapError(true);
        }
        isInitializing = false;
      }
    };

    initMap();
    
    // 添加清理函数
    return () => {
      // 如果初始化过程中组件被卸载，标记为不再挂载
      if (isInitializing) {
        isMountedRef.current = false;
      }
    };
  }, [isDarkMode, apiKey]);

  useEffect(() => {
    if (!isMountedRef.current || !location || !mapInstanceRef.current) return;
    
    let isUpdating = true;
    
    const updateMap = async () => {
      try {
        if (!isMountedRef.current) return;
        
        mapInstanceRef.current?.setCenter(location);
        
        // 如果已经有标记，则移除它
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }
        
        // 确保google对象已加载
        if (!googleRef.current && apiKey) {
          await mapLoader.load();
          
          // 如果组件已卸载，不继续执行
          if (!isMountedRef.current) return;
          
          googleRef.current = window.google;
        }
        
        // 如果组件已卸载或地图实例不存在，不继续执行
        if (!isMountedRef.current || !mapInstanceRef.current) return;
        
        // 创建新标记
        markerRef.current = new google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          title: location.address || '所选位置',
          animation: google.maps.Animation.DROP
        });
        
        isUpdating = false;
      } catch (error) {
        console.error('更新地图标记时出错:', error);
        isUpdating = false;
      }
    };
    
    if (googleRef.current) {
      updateMap();
    }
    
    // 添加清理函数
    return () => {
      // 如果更新过程中组件被卸载，标记为不再挂载
      if (isUpdating) {
        isMountedRef.current = false;
      }
    };
  }, [location, apiKey]);

  if (mapError) {
    return (
      <div 
        className="rounded-lg h-[250px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 shadow-lg w-full transition-colors duration-300 overflow-hidden sm:h-[300px] md:h-[400px]"
      >
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">加载地图时出错</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">请检查网络连接或稍后再试</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-lg h-[250px] shadow-lg w-full transition-colors duration-300 overflow-hidden sm:h-[300px] md:h-[400px]"
      ref={mapRef}
      style={{
        position: 'relative',
        background: isDarkMode ? '#222' : '#f1f3f4'
      }}
    />
  );
};

export default WeatherMap; 