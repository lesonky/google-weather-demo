# Google Weather应用部署指南（GCP Cloud Run）

## 前提条件

1. 安装 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. 配置 Google Cloud CLI：`gcloud auth login`
3. 设置项目ID：`gcloud config set project YOUR_PROJECT_ID`
4. 确保已启用必要的API：
   ```
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

## 部署步骤

### 1. 构建并推送Docker镜像

```bash
# 设置环境变量
export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-east1  # 可根据需要更改区域
export SERVICE_NAME=google-weather

# 构建镜像
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# 或者使用Docker本地构建后推送
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME .
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME
```

### 2. 部署到Cloud Run

```bash
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here"
```

### 3. 配置环境变量

确保在Cloud Run服务设置中添加所有必要的环境变量：

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`：您的Google Maps API密钥（前端和后端API都会使用）

您可以通过以下命令更新环境变量：

```bash
gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --set-env-vars "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here"
```

#### 环境变量问题排查

如果您遇到"缺少 Google Maps API Key"的错误，可能是由于以下原因：

1. **确认环境变量已正确设置**：
   在Cloud Run控制台中，检查您的服务配置中是否有正确设置环境变量。

2. **检查变量名称是否正确**：
   确保环境变量名称为 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`。

3. **重新部署应用**：
   有时候需要重新部署应用才能使环境变量生效：
   ```bash
   gcloud run deploy $SERVICE_NAME \
     --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
     --platform managed \
     --region $REGION \
     --allow-unauthenticated \
     --set-env-vars "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here"
   ```

4. **验证API密钥是否有效**：
   确保您的Google Maps API密钥有效，并且已启用了必要的API服务（Maps JavaScript API）。

### 4. 访问应用

部署完成后，您将获得一个URL，可以通过该URL访问您的应用：

```bash
gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'
```

## 故障排除

1. 查看日志：
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --limit=10
   ```

2. 如果应用无法启动，请确保：
   - 所有必要的环境变量都已设置
   - Docker镜像构建正确
   - 应用在本地可以正常运行

3. 如果需要更新应用，只需重新构建并推送新的Docker镜像，然后更新Cloud Run服务即可。 