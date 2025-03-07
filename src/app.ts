import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cookie from '@fastify/cookie';
import staticFiles from '@fastify/static';
import path from 'path';
import { registerErrorResponseSchema } from './schemas/errorResponse.schema';

import { registerRoutes } from './routes';
import { PrismaPlugin } from './plugins/prisma';
import { errorHandler } from './middlewares/errorHandler';
import { swaggerOptions, swaggerUiOptions } from './config/swagger';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    trustProxy: true,
  });

  // 注册错误处理中间件
  app.setErrorHandler(errorHandler);

  // 注册插件
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET as string,
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  });

  await app.register(cookie, {
    secret: process.env.JWT_SECRET as string,
    parseOptions: {},
  });

  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 限制文件大小为5MB
    },
  });

  await app.register(staticFiles, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/public/',
  });

  // 注册Swagger文档
  await app.register(swagger, swaggerOptions);
  await app.register(swaggerUi, swaggerUiOptions);

  // 注册错误响应 schema 到 OpenAPI 文档
  registerErrorResponseSchema(app);

  // 注册Prisma插件
  await app.register(PrismaPlugin);

  // 注册所有路由
  await app.register(registerRoutes);

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
}
