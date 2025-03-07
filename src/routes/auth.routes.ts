import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

export async function authRoutes(fastify: FastifyInstance) {
  // 注册路由
  fastify.post(
    '/register',
    {
      schema: {
        tags: ['auth'],
        summary: '用户注册',
        body: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              code: { type: 'string', enum: ['success'] },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      username: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string' },
                    },
                  },
                  token: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    authController.register,
  );

  fastify.post(
    '/login',
    {
      schema: {
        tags: ['auth'],
        summary: '用户登录',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              code: { type: 'string', enum: ['success'] },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      username: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string' },
                    },
                  },
                  token: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    authController.login,
  );

  fastify.get(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['auth'],
        summary: '获取当前登录用户信息',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              code: { type: 'string', enum: ['success'] },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  bio: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
      },
    },
    authController.getCurrentUser,
  );

  fastify.post(
    '/logout',
    {
      schema: {
        tags: ['auth'],
        summary: '退出登录',
        response: {
          200: {
            type: 'object',
            properties: {
              code: { type: 'string', enum: ['success'] },
              message: { type: 'string' },
              data: { type: 'null' },
            },
          },
        },
      },
    },
    authController.logout,
  );
}
