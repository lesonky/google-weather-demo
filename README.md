# Google 天气应用

这是一个基于Google Maps Platform Weather API的全球天气信息服务网站。该应用提供了全面的天气信息展示，包括当前天气状况、每小时天气预报、每日天气预报和历史天气数据。

## 功能特点

- **现代化UI设计**：清晰直观的用户界面，响应式设计适配各种设备
- **地址搜索**：通过输入地址或城市名称查找位置
- **交互式地图**：基于Google Maps的地图显示
- **全面天气数据**：
  - 当前天气状况：温度、体感温度、湿度、风速等
  - 每小时天气预报：图表显示未来24小时天气变化
  - 每日天气预报：未来7天的详细天气信息
  - 历史天气数据：过去24小时的天气记录
- **数据可视化**：使用图表直观展示天气数据变化趋势

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Chart.js
- Google Maps JavaScript API
- Google Weather API

## 安装与使用

1. 克隆代码库

```bash
git clone https://github.com/yourusername/google-weather.git
cd google-weather
```

2. 安装依赖

```bash
npm install
```

3. 创建环境变量文件

复制`.env.local.example`文件并重命名为`.env.local`，然后添加您的Google Maps API密钥：

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

4. 运行开发服务器

```bash
npm run dev
```

5. 访问应用

打开浏览器并访问`http://localhost:3000`

## 获取Google Maps API密钥

要获取Google Maps API密钥和使用Weather API，请按照以下步骤操作：

1. 访问[Google Cloud Console](https://console.cloud.google.com/)
2. 创建一个新项目
3. 启用以下API:
   - Maps JavaScript API
   - Geocoding API
   - Weather API
4. 创建API密钥并设置适当的限制

## 贡献指南

欢迎提交问题和功能请求！如果您想贡献代码，请先创建一个issue讨论您想要更改的内容。

## 许可证

MIT
