# 使用Node.js作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci

# 复制其余文件
COPY . .

# 赋予入口脚本执行权限
RUN chmod +x /app/docker-entrypoint.sh

# 构建应用
RUN npm run build

# 设置环境变量
ENV PORT=8080
ENV NODE_ENV=production

# 暴露端口
EXPOSE 8080

# 设置入口点脚本
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# 启动应用
CMD ["npm", "start"] 