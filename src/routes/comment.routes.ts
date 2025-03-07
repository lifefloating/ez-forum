import { FastifyInstance } from 'fastify';
import { commentController } from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth';

export async function commentRoutes(fastify: FastifyInstance) {
  // 获取评论的回复列表
  fastify.get(
    '/:commentId/replies',
    {
      schema: {
        tags: ['comments'],
        summary: '获取评论的回复列表',
        params: {
          type: 'object',
          required: ['commentId'],
          properties: {
            commentId: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
            sort: { type: 'string', default: 'createdAt' },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
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
                        content: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        authorId: { type: 'string' },
                        postId: { type: 'string' },
                        parentId: { type: 'string' },
                        author: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            username: { type: 'string' },
                            avatar: { type: 'string', nullable: true },
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
    commentController.getCommentReplies,
  );
  // 获取帖子的评论列表
  fastify.get(
    '/post/:postId',
    {
      schema: {
        tags: ['comments'],
        summary: '获取帖子的评论列表',
        params: {
          type: 'object',
          required: ['postId'],
          properties: {
            postId: { type: 'string' },
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
                        content: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        authorId: { type: 'string' },
                        postId: { type: 'string' },
                        parentId: { type: 'string', nullable: true },
                        author: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            username: { type: 'string' },
                            avatar: { type: 'string', nullable: true },
                          },
                        },
                        replies: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              content: { type: 'string' },
                              createdAt: { type: 'string', format: 'date-time' },
                              authorId: { type: 'string' },
                              author: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string' },
                                  username: { type: 'string' },
                                  avatar: { type: 'string', nullable: true },
                                },
                              },
                            },
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
    commentController.getPostComments,
  );

  // 创建评论
  fastify.post(
    '/post/:postId',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['comments'],
        summary: '创建评论',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['postId'],
          properties: {
            postId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string' },
            parentId: { type: 'string', description: '父评论ID，用于回复评论' },
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
                  content: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  authorId: { type: 'string' },
                  postId: { type: 'string' },
                  parentId: { type: 'string', nullable: true },
                  author: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      username: { type: 'string' },
                      avatar: { type: 'string', nullable: true },
                    },
                  },
                  parent: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'string' },
                      content: { type: 'string' },
                      author: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          username: { type: 'string' },
                          avatar: { type: 'string', nullable: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    commentController.createComment,
  );

  // 更新评论
  fastify.put(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['comments'],
        summary: '更新评论',
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
          required: ['content'],
          properties: {
            content: { type: 'string' },
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
                  content: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  authorId: { type: 'string' },
                  postId: { type: 'string' },
                  author: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      username: { type: 'string' },
                      avatar: { type: 'string', nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    commentController.updateComment,
  );

  // 删除评论
  fastify.delete(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['comments'],
        summary: '删除评论',
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
    commentController.deleteComment,
  );

  // 获取用户的评论列表
  fastify.get(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['comments'],
        summary: '获取当前用户的评论列表',
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
                        content: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        authorId: { type: 'string' },
                        postId: { type: 'string' },
                        author: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            username: { type: 'string' },
                            avatar: { type: 'string', nullable: true },
                          },
                        },
                        post: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
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
    commentController.getUserComments,
  );
}
