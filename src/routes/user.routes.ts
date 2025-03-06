import { FastifyInstance } from 'fastify';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';

export async function userRoutes(fastify: FastifyInstance) {
  // 获取用户信息
  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['users'],
        summary: '获取用户信息',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  bio: { type: 'string', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    userController.getUserProfile,
  );

  // 更新用户信息
  fastify.put(
    '/profile',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['users'],
        summary: '更新用户信息',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            bio: { type: 'string' },
            avatar: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  bio: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
      },
    },
    userController.updateUserProfile,
  );
}
