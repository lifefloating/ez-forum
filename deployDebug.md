# EZ-Forum 使用PM2直接运行源码部署指南

本文档提供了使用PM2直接运行源码部署EZ-Forum的步骤。个人用

## 前提条件

- Node.js >= 22.0.0
- pnpm 包管理器
- MongoDB 数据库（已安装并运行）
- PM2 进程管理器 (`npm install -g pm2`)
- tsx (`npm install -g tsx`)

## 快速部署步骤

### 1. 准备工作

```bash
# 克隆代码库
git clone https://github.com/lifefloating/ez-forum.git
cd ez-forum

# 安装依赖
pnpm install

# 复制并配置环境变量
cp .env.example .env
# 编辑.env文件设置正确的DATABASE_URL和JWT_SECRET

# 生成Prisma客户端
pnpm prisma:generate
```

### 2. 使用PM2直接运行源码

```bash
# 创建pm2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: "ez-forum",
    script: "pnpm",
    args: "dev",
    cwd: "./",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
  }]
}
EOF

# 使用PM2启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

## PM2常用命令

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs ez-forum

# 实时监控应用
pm2 monit

# 重启应用
pm2 restart ez-forum

# 重载应用(不重启进程)
pm2 reload ez-forum

# 停止应用
pm2 stop ez-forum

# 删除应用
pm2 delete ez-forum
```

## 配置Nginx反向代理（可选）
- 自己改下


## 故障排除

### 连接MongoDB失败

- 确认MongoDB服务正在运行
- 检查.env文件中的DATABASE_URL是否正确
- 确认MongoDB用户名和密码正确
- 检查网络连接和防火墙设置

### 应用启动失败

- 检查Node.js版本是否满足要求（>=22.0.0）
- 确认所有依赖已正确安装：`pnpm install`
- 检查环境变量配置是否正确
- 查看应用日志获取详细错误信息

### API文档访问问题

- 确保应用正常运行
- 使用`pnpm docs:serve`命令启动文档服务
- 检查浏览器是否能访问http://localhost:3009/documentation

## 更新应用

```bash
# 拉取最新代码
git pull

# 安装可能的新依赖
pnpm install

# 重新生成Prisma客户端
pnpm prisma:generate

# 重新构建应用
pnpm build

# 如果使用PM2，重启应用
pm2 restart ez-forum
```
