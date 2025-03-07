# EZ-Forum

## ✨ 主要功能 (Key Features)

- 🔐 **用户管理**: 支持用户注册、登录、认证和授权功能，确保论坛安全。
- 💬 **内容管理**: 支持创建、编辑、删除和查询帖子及评论，实现丰富的社区互动。
- 📂 **文件上传**: 集成腾讯云/S3对象存储，支持图片和附件上传功能。
- 🔍 **搜索功能**: 提供高效的内容搜索能力，帮助用户快速找到感兴趣的话题。
- 📱 **RESTful API**: 提供完整的RESTful API接口，支持前端多平台开发。
- 📚 **API文档**: 自动生成Swagger文档，方便开发者调试和集成。

## 🛠️ 技术栈 (Tech Stack)

  <a href="https://www.fastify.io/"><img src="https://img.shields.io/badge/Fastify-404D59?style=flat-square&logo=fastify&logoColor=white" alt="Fastify Badge"/></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js Badge"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript Badge"/></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma Badge"/></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB Badge"/></a>
  <a href="https://cloud.tencent.com/product/cos"><img src="https://img.shields.io/badge/腾讯云COS-3699FF?style=flat-square&logo=tencent-cloud&logoColor=white" alt="Tencent Cloud COS Badge"/></a>
  <a href="https://swagger.io/"><img src="https://img.shields.io/badge/OpenAPI-85EA2D?style=flat-square&logo=swagger&logoColor=black" alt="OpenAPI Badge"/></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker Badge"/></a>

### 环境变量配置说明

`.env.example` 中的环境变量说明：

- **PORT**: 服务器端口号，默认为3009
- **HOST**: 服务器主机地址，默认为0.0.0.0
- **NODE_ENV**: 运行环境，可选值包括development、production
- **DATABASE_URL**: MongoDB数据库连接URI
- **JWT_SECRET**: JWT认证密钥
- **JWT_EXPIRES_IN**: JWT令牌过期时间
- **COS_SECRET_ID**: 腾讯云对象存储SecretId
- **COS_SECRET_KEY**: 腾讯云对象存储SecretKey
- **COS_REGION**: 腾讯云对象存储地区
- **COS_BUCKET**: 腾讯云对象存储桶名称
- **LOG_LEVEL**: 日志级别，可选值包括debug、info、warn、error

## 🚀 快速开始 (Quick Start)

### ⚙️ 环境要求 (Prerequisites)

- [Node.js](https://nodejs.org/en/download/): 版本 >= 22.0.0
- [pnpm](https://pnpm.io/): 包管理器
- [MongoDB](https://www.mongodb.com/try/download/community): 数据库服务
- [对象存储](https://cloud.tencent.com/product/cos): 用于文件上传功能，后续可能切换

### 👣 步骤 (Steps)

1. **克隆代码仓库 (Clone the repository)**
   ```bash
   git clone https://github.com/lifefloating/ez-forum.git
   cd ez-forum
   ```

2. **安装依赖 (Install dependencies)**
   ```bash
   pnpm install
   ```

3. **配置环境变量 (Configure environment variables)**

   在项目根目录下创建 `.env` 文件，并根据 `.env.example` 文件中的示例配置环境变量：

   ```env
   # 服务器配置
   PORT=3009
   HOST=0.0.0.0
   NODE_ENV=development

   # 数据库配置
   DATABASE_URL="mongodb://username:password@localhost:27017/ez-forum?authSource=admin"

   # JWT配置
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d

   # 腾讯云对象存储配置
   COS_SECRET_ID=your_cos_secret_id
   COS_SECRET_KEY=your_cos_secret_key
   COS_REGION=ap-guangzhou
   COS_BUCKET=your-bucket-name

   # 日志配置
   LOG_LEVEL=info

   ... 其他后续会添加
   ```

4. **生成Prisma客户端 (Generate Prisma Client)**
   ```bash
   pnpm prisma:generate
   ```

5. **运行开发服务 (Run development server)**
   ```bash
   pnpm dev
   ```

   服务默认运行在 `http://localhost:3009`。

6. **构建生产版本 (Build for production)**
   ```bash
   pnpm build
   pnpm start
   ```

### 🐳 Docker部署 (Docker Deployment)

#### 前提条件
- 已安装 [Docker](https://www.docker.com/get-started) 和 [Docker Compose](https://docs.docker.com/compose/install/)
- 已克隆 ez-forum 代码仓库

#### 运行步骤

1. **构建Docker镜像**
   ```bash
   pnpm docker:build
   ```

2. **使用Docker Compose启动服务**
   ```bash
   docker-compose up -d
   ```

   服务将在 `http://localhost:3009` 上运行。

### 🔗 访问API

服务启动后，您可以通过以下方式访问API：

- **API文档**: 访问 `pnpm docs:serve` 查看Swagger文档
- **API导出**: 运行 `pnpm docs:export` 导出OpenAPI规范文件

### ℹ️ 错误处理 (Error Handling)

EZ-Forum 采用统一的错误响应格式，便于前端处理和用户反馈。所有API响应遵循以下格式：

#### 成功响应格式

```json
{
  "code": "success",
  "message": "操作成功",
  "data": { ... }
}
```

#### 错误响应格式

```json
{
  "code": "error",
  "message": "错误描述",
  "data": {
    "type": "错误类型",
    "errorCode": "错误代码",
    "status": 400,
    "param": "可选错误参数"
  }
}
```

#### 错误类型 (Error Types)

| 错误类型 | 描述 |
|--------------|------|
| `authentication_error` | 认证错误，如登录失败或无效令牌 |
| `permission_error` | 权限错误，如无权访问特定资源 |
| `resource_error` | 资源错误，如资源不存在或冲突 |
| `invalid_request_error` | 请求错误，如参数验证失败 |
| `rate_limit_error` | 限流错误，如请求过多 |
| `server_error` | 服务器错误，如内部异常 |

#### 常见错误代码 (Common Error Codes)

##### 认证错误代码 (Authentication Error Codes)

| 错误代码 | HTTP状态码 | 描述 |
|--------------|------------|------|
| `invalid_credentials` | 401 | 邮箱或密码不正确 |
| `invalid_token` | 401 | 无效的认证令牌 |
| `token_expired` | 401 | 认证令牌已过期 |

##### 资源错误代码 (Resource Error Codes)

| 错误代码 | HTTP状态码 | 描述 |
|--------------|------------|------|
| `resource_not_found` | 404 | 请求的资源不存在 |
| `resource_already_exists` | 409 | 资源已存在，如已注册的邮箱 |
| `resource_conflict` | 409 | 资源冲突 |

更多错误代码请参考API文档。

### 📝 开发工具 (Development Tools)

- **代码格式化**
  ```bash
  pnpm format
  ```

- **代码检查**
  ```bash
  pnpm lint
  ```

- **代码检查并修复**
  ```bash
  pnpm lint:fix
  ```

- **Prisma Studio (数据库管理界面)**
  ```bash
  pnpm prisma:studio
  ```

## 📋 项目结构 (Project Structure)

```
ez-forum/
├── src/                  # 源代码目录
│   ├── config/           # 配置文件
│   ├── controllers/      # 控制器
│   ├── middlewares/      # 中间件
│   ├── models/           # 数据模型
│   ├── plugins/          # Fastify插件
│   ├── routes/           # 路由定义
│   ├── services/         # 业务逻辑服务
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   ├── app.ts            # 应用程序配置
│   └── index.ts          # 入口文件
├── prisma/               # Prisma配置和模型
├── public/               # 静态资源
├── logs/                 # 日志文件
├── .env                  # 环境变量
├── .env.example          # 环境变量示例
├── docker-compose.yml    # Docker Compose配置
├── Dockerfile            # Docker构建文件
├── package.json          # 项目依赖和脚本
└── tsconfig.json         # TypeScript配置
```

---

## 📄 许可证 (License)

本项目采用 [MIT 许可证](LICENSE)。

---

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Status-In%20Development-yellow" alt="Project Status: In Development"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-brightgreen" alt="License: MIT"/></a>
</p>
