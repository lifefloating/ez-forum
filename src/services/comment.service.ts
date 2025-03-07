import { PrismaClient, Prisma } from '@prisma/client';
import { PaginationQuery } from '../types';

const prisma = new PrismaClient();

export const commentService = {
  /**
   * 获取评论的回复列表
   */
  async findCommentReplies(commentId: string, options: PaginationQuery) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'asc' } = options;
    const skip = (page - 1) * limit;

    const whereCondition: Prisma.CommentWhereInput = {
      parent: {
        id: commentId,
      },
    };

    const [replies, total] = await Promise.all([
      prisma.comment.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: {
          [sort]: order,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.comment.count({
        where: whereCondition,
      }),
    ]);

    return {
      items: replies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
  /**
   * 获取帖子的评论列表（只返回顶级评论及其回复）
   */
  async findPostComments(postId: string, options: PaginationQuery) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = options;
    const skip = (page - 1) * limit;

    // 查询顶级评论（没有父评论的评论）
    const topLevelWhere: Prisma.CommentWhereInput = {
      postId,
      parent: null, // 使用关系查询，而不是直接用parentId
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: topLevelWhere,
        skip,
        take: limit,
        orderBy: {
          [sort]: order,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          // 直接包含回复
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      }),
      prisma.comment.count({
        where: topLevelWhere,
      }),
    ]);

    return {
      items: comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * 通过ID查找评论
   */
  async findCommentById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        // 包含评论的回复
        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        // 包含父评论信息
        parent: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * 创建评论
   */
  async createComment(data: {
    content: string;
    postId: string;
    authorId: string;
    parentId?: string;
  }) {
    // 构造符合Prisma类型的数据对象
    const commentData: Prisma.CommentCreateInput = {
      content: data.content,
      post: {
        connect: { id: data.postId },
      },
      author: {
        connect: { id: data.authorId },
      },
    };

    // 如果有父评论ID，则设置父评论关系
    if (data.parentId) {
      commentData.parent = {
        connect: { id: data.parentId },
      };
    }

    return prisma.comment.create({
      data: commentData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        // 如果是回复评论，包含父评论信息
        parent: data.parentId
          ? {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            }
          : undefined,
      },
    });
  },

  /**
   * 更新评论
   */
  async updateComment(
    id: string,
    data: {
      content: string;
    },
  ) {
    return prisma.comment.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  },

  /**
   * 删除评论
   */
  async deleteComment(id: string) {
    return prisma.comment.delete({
      where: { id },
    });
  },

  /**
   * 获取用户的评论列表
   */
  async findUserComments(userId: string, options: PaginationQuery) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = options;
    const skip = (page - 1) * limit;

    // 使用正确的Prisma类型声明查询条件
    const whereCondition: Prisma.CommentWhereInput = {
      authorId: userId,
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: {
          [sort]: order,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
          // 包含父评论信息
          parent: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
          // 包含回复信息
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            take: 3, // 限制回复数量，避免数据量过大
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      }),
      prisma.comment.count({
        where: whereCondition,
      }),
    ]);

    return {
      items: comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};
