import { FastifyInstance } from 'fastify';
import { adminController } from '../controllers/admin.controller';
import { authorizeAdmin } from '../middlewares/auth';

export async function adminRoutes(fastify: FastifyInstance) {
  // 所有路由都需要管理员权限
  fastify.addHook('onRequest', authorizeAdmin);

  // 获取所有帖子（管理员）
  fastify.get(
    '/posts',
    {
      schema: {
        tags: ['admin'],
        summary: '获取所有帖子（管理员）',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
            sort: { type: 'string', default: 'createdAt' },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            keyword: { type: 'string' },
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
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        images: { type: 'array', items: { type: 'string' } },
                        views: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        author: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            username: { type: 'string' },
                            avatar: { type: 'string', nullable: true },
                          },
                        },
                        commentCount: { type: 'integer' },
                        likeCount: { type: 'integer' },
                      },
                    },
                  },
                  total: { type: 'integer' },
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  totalPages: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    adminController.getAllPosts,
  );

  // 删除帖子（管理员）
  fastify.delete(
    '/posts/:id',
    {
      schema: {
        tags: ['admin'],
        summary: '删除帖子（管理员）',
        security: [{ bearerAuth: [] }],
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
              message: { type: 'string' },
            },
          },
        },
      },
    },
    adminController.deletePost,
  );

  // 获取所有用户（管理员）
  fastify.get(
    '/users',
    {
      schema: {
        tags: ['admin'],
        summary: '获取所有用户（管理员）',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
            sort: { type: 'string', default: 'createdAt' },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            keyword: { type: 'string' },
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
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        avatar: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        _count: {
                          type: 'object',
                          properties: {
                            posts: { type: 'integer' },
                            comments: { type: 'integer' },
                          },
                        },
                      },
                    },
                  },
                  total: { type: 'integer' },
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  totalPages: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    adminController.getAllUsers,
  );

  // 更新用户角色（管理员）
  fastify.put(
    '/users/:id/role',
    {
      schema: {
        tags: ['admin'],
        summary: '更新用户角色（管理员）',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['role'],
          properties: {
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
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
                  role: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    adminController.updateUserRole,
  );
}
