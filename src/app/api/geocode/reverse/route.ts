import { NextResponse } from 'next/server';
import axios from 'axios';

// API密钥从环境变量中获取，而不是从客户端
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 定义地理编码结果类型
interface GeocodingResult {
  formatted_address: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
}

interface GeocodingResponse {
  status: string;
  results: GeocodingResult[];
  error_message?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: '缺少经纬度参数' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get<GeocodingResponse>(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        latlng: `${lat},${lng}`,
        key: API_KEY,
      },
    });

    const data = response.data;
    
    if (data.status === 'ZERO_RESULTS') {
      return NextResponse.json(
        { status: 'ZERO_RESULTS', error: '未找到该地址' },
        { status: 404 }
      );
    }
    
    if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
      return NextResponse.json(
        { 
          status: data.status, 
          error: `请求地理编码失败: ${data.error_message || data.status}` 
        },
        { status: 400 }
      );
    }
    
    if (!data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: '未找到该地址' },
        { status: 404 }
      );
    }
    
    // 查找城市级别的结果
    const locality = data.results.find((result: GeocodingResult) => result.types.includes('locality'));
    
    return NextResponse.json({
      status: data.status,
      // 如果找到城市级别的结果，使用它，否则使用第一个结果
      address: locality ? locality.formatted_address : data.results[0].formatted_address,
      results: data.results
    });

  } catch (error) {
    console.error('反向地理编码请求失败:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data.error || '反向地理编码请求失败' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: '反向地理编码请求失败' },
      { status: 500 }
    );
  }
} 