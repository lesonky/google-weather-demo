import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LocationData } from '@/types/weather';

interface WeatherMapProps {
  location: LocationData | null;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ location }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;
      
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('Google Maps API Key is missing');
        return;
      }

      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      try {
        // 使用unknown作为中间类型进行转换
        const mapsLib = await loader.importLibrary('maps') as unknown;
        // 然后断言为具体类型
        const { Map, Marker, MapTypeId } = mapsLib as {
          Map: typeof google.maps.Map;
          Marker: typeof google.maps.Marker;
          MapTypeId: typeof google.maps.MapTypeId;
        };
        
        const defaultLocation = location || { lat: 39.9042, lng: 116.4074 }; // 默认北京位置
        
        const mapOptions = {
          center: defaultLocation,
          zoom: 10,
          mapTypeId: MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'administrative',
              elementType: 'geometry',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }]
            }
          ]
        };
        
        mapInstanceRef.current = new Map(mapRef.current, mapOptions);
        
        if (location) {
          // 添加标记
          markerRef.current = new Marker({
            position: location,
            map: mapInstanceRef.current,
            title: location.address || '所选位置',
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
  }, []);

  useEffect(() => {
    const updateMap = async () => {
      if (!location || !mapInstanceRef.current) return;
      
      mapInstanceRef.current.setCenter(location);
      
      // 如果已经有标记，则移除它
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      
      try {
        // 使用unknown作为中间类型进行转换
        const mapsLib = await new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
        }).importLibrary('maps') as unknown;
        
        // 然后断言为具体类型
        const { Marker } = mapsLib as {
          Marker: typeof google.maps.Marker;
        };
        
        markerRef.current = new Marker({
          position: location,
          map: mapInstanceRef.current,
          title: location.address || '所选位置',
        });
      } catch (error) {
        console.error('更新地图标记时出错:', error);
      }
    };
    
    updateMap();
  }, [location]);

  return (
    <div className="rounded-lg h-[400px] shadow-lg w-full overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default WeatherMap; 