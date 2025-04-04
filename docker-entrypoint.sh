#!/bin/sh
# 生成运行时环境变量文件
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" > /app/.env.local
echo "GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY:-$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}" >> /app/.env.local

# 执行原始命令
exec "$@" 