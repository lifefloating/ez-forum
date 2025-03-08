import { FastifyInstance } from 'fastify';
import { postController } from '../controllers/post.controller';
import { authenticate } from '../middlewares/auth';

export async function postRoutes(fastify: FastifyInstance) {
  // 获取帖子列表
  fastify.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['posts'],
        summary: '获取帖子列表',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
            sort: { type: 'string', default: 'createdAt' },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            filter: {
              type: 'string',
              enum: ['latest', 'my', 'liked', 'hot'],
              description: '过滤类型：最新发布、热门推荐、我发布的、我点赞的',
            },
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
                        isLiked: { type: 'boolean' },
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
    postController.getPosts,
  );

  // 获取单个帖子详情
  fastify.get(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['posts'],
        summary: '获取单个帖子详情',
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
              code: { type: 'string', enum: ['success'] },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  content: { type: 'string' },
                  images: { type: 'array', items: { type: 'string' } },
                  views: { type: 'integer' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  authorId: { type: 'string' },
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
                  isLiked: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    postController.getPostById,
  );

  // 创建新帖子
  fastify.post(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['posts'],
        summary: '创建新帖子',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
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
                  id: { type: 'string' },
                  title: { type: 'string' },
                  content: { type: 'string' },
                  images: { type: 'array', items: { type: 'string' } },
                  views: { type: 'integer' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  authorId: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    postController.createPost,
  );

  // 更新帖子
  fastify.put(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['posts'],
        summary: '更新帖子',
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
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
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
                  id: { type: 'string' },
                  title: { type: 'string' },
                  content: { type: 'string' },
                  images: { type: 'array', items: { type: 'string' } },
                  views: { type: 'integer' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  authorId: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    postController.updatePost,
  );

  // 删除帖子
  fastify.delete(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['posts'],
        summary: '删除帖子',
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
              code: { type: 'string', enum: ['success'] },
              message: { type: 'string' },
              data: { type: 'null' },
            },
          },
        },
      },
    },
    postController.deletePost,
  );

  // 点赞帖子
  fastify.post(
    '/:id/like',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['posts'],
        summary: '点赞帖子',
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
              code: { type: 'string', enum: ['success'] },
              message: { type: 'string' },
              data: { type: 'null' },
            },
          },
        },
      },
    },
    postController.likePost,
  );

  // 取消点赞帖子
  fastify.delete(
    '/:id/like',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['posts'],
        summary: '取消点赞帖子',
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
              code: { type: 'string', enum: ['success'] },
              message: { type: 'string' },
              data: { type: 'null' },
            },
          },
        },
      },
    },
    postController.unlikePost,
  );

  // 获取用户的帖子列表
  fastify.get(
    '/user/:userId',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['posts'],
        summary: '获取用户的帖子列表',
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
            sort: { type: 'string', default: 'createdAt' },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
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
                        isLiked: { type: 'boolean' },
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
    postController.getUserPosts,
  );

  // 获取用户点赞的帖子列表
  fastify.get(
    '/liked',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['posts'],
        summary: '获取用户点赞的帖子列表',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
            sort: { type: 'string', default: 'createdAt' },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
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
                        isLiked: { type: 'boolean' },
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
    postController.getUserLikedPosts,
  );
}
