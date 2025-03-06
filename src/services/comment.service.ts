import { PrismaClient } from '@prisma/client';
import { PaginationQuery } from '../types';

const prisma = new PrismaClient();

export const commentService = {
  /**
   * 获取帖子的评论列表
   */
  async findPostComments(postId: string, options: PaginationQuery) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = options;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          postId,
        },
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
        where: {
          postId,
        },
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
      },
    });
  },

  /**
   * 创建评论
   */
  async createComment(data: { content: string; postId: string; authorId: string }) {
    return prisma.comment.create({
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

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          authorId: userId,
        },
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
        },
      }),
      prisma.comment.count({
        where: {
          authorId: userId,
        },
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
