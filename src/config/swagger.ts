import { SwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerOptions: SwaggerOptions = {
  openapi: {
    openapi: '3.1.0',
    info: {
      title: 'EZ-Forum API',
      description: 'EZ-Forum API',
      version: '1.0.0',
    },
    externalDocs: {
      url: 'https://github.com/lifefloating/ez-forum',
      description: '项目代码仓库',
    },
    servers: [
      {
        url: `http://${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3009}`,
        description: '开发服务器',
      },
    ],
    tags: [
      { name: 'auth', description: '认证相关接口' },
      { name: 'posts', description: '帖子相关接口' },
      { name: 'comments', description: '评论相关接口' },
      { name: 'users', description: '用户相关接口' },
      { name: 'uploads', description: '文件上传相关接口' },
      { name: 'admin', description: '管理后台相关接口' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
};
