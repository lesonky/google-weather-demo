import { NextResponse } from 'next/server';
import axios from 'axios';

// API密钥从环境变量中获取，而不是从客户端
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://weather.googleapis.com/v1';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const days = searchParams.get('days') || '7';

  if (!lat || !lng) {
    return NextResponse.json(
      { error: '缺少经纬度参数' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(`${BASE_URL}/forecast/days:lookup`, {
      params: {
        key: API_KEY,
        'location.latitude': lat,
        'location.longitude': lng,
        days,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('获取每日天气预报失败:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data.error || '获取每日天气预报失败' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: '获取每日天气预报失败' },
      { status: 500 }
    );
  }
} 