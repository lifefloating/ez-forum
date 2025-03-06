# 使用Node.js 22作为基础镜像
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package.json和pnpm-lock.yaml（如果存在）
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install

# 复制所有源代码
COPY . .

# 生成Prisma客户端
RUN pnpm prisma generate

# 构建应用
RUN pnpm build

# 第二阶段：运行阶段
FROM node:22-alpine AS runner

# 设置工作目录
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 设置环境变量
ENV NODE_ENV=production

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 只安装生产依赖
RUN pnpm install --prod

# 从构建阶段复制构建产物和必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 创建日志和上传目录
RUN mkdir -p logs public/uploads

# 暴露端口
EXPOSE 3009

# 启动应用
CMD ["node", "dist/index.js"]
