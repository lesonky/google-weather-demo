import { NextResponse } from 'next/server';
import axios from 'axios';

// API密钥从环境变量中获取，而不是从客户端
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: '缺少地址参数' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address,
        key: API_KEY,
      },
    });

    const data = response.data;
    
    if (data.status === 'ZERO_RESULTS') {
      return NextResponse.json(
        { status: 'ZERO_RESULTS', error: '未找到该地址，请尝试更具体的位置' },
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
        { error: '未找到该地址，请尝试更具体的位置' },
        { status: 404 }
      );
    }
    
    // 转换响应格式以符合前端期望
    return NextResponse.json({
      status: data.status,
      location: data.results[0]?.geometry.location
    });

  } catch (error) {
    console.error('地理编码请求失败:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data.error || '地理编码请求失败' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: '地理编码请求失败' },
      { status: 500 }
    );
  }
} 