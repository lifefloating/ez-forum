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
    replyToId?: string;
  }) {
    // 构造符合Prisma类型的数据对象
    const commentData: any = {
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

    // 如果有回复用户ID，则设置回复用户关系
    if (data.replyToId) {
      commentData.replyTo = {
        connect: { id: data.replyToId },
      };
    }

    // 使用any类型绕过TypeScript类型检查
    const includeOptions: any = {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    };

    // 如果是回复评论，包含父评论信息
    if (data.parentId) {
      includeOptions.parent = {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      };
    }

    // 如果有回复用户，包含回复用户信息
    if (data.replyToId) {
      includeOptions.replyTo = {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      };
    }

    // 使用事务来创建评论，同时保留帖子的原始更新时间
    return prisma.$transaction(async (tx) => {
      // 1. 获取帖子当前的更新时间
      const post = await tx.post.findUnique({
        where: { id: data.postId },
        select: { updatedAt: true },
      });

      if (!post) {
        throw new Error('Post does not exist');
      }

      // 2. 创建评论
      const comment = await tx.comment.create({
        data: commentData,
        include: includeOptions,
      });

      // 3. 将帖子的更新时间恢复为原来的值
      await tx.post.update({
        where: { id: data.postId },
        data: { updatedAt: post.updatedAt },
      });

      return comment;
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
    // 首先获取评论信息，包括所属的帖子ID
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { postId: true },
    });

    if (!comment) {
      throw new Error('Comment does not exist');
    }

    // 使用事务来更新评论，同时保留帖子的原始更新时间
    return prisma.$transaction(async (tx) => {
      // 1. 获取帖子当前的更新时间
      const post = await tx.post.findUnique({
        where: { id: comment.postId },
        select: { updatedAt: true },
      });

      if (!post) {
        throw new Error('Post does not exist');
      }

      // 2. 更新评论
      const updatedComment = await tx.comment.update({
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

      // 3. 将帖子的更新时间恢复为原来的值
      await tx.post.update({
        where: { id: comment.postId },
        data: { updatedAt: post.updatedAt },
      });

      return updatedComment;
    });
  },

  /**
   * 删除评论
   */
  async deleteComment(id: string) {
    // 首先获取评论信息，包括所属的帖子ID
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { postId: true },
    });

    if (!comment) {
      throw new Error('Comment does not exist');
    }

    // 使用事务来删除评论，同时保留帖子的原始更新时间
    return prisma.$transaction(async (tx) => {
      // 1. 获取帖子当前的更新时间
      const post = await tx.post.findUnique({
        where: { id: comment.postId },
        select: { updatedAt: true },
      });

      if (!post) {
        throw new Error('Post does not exist');
      }

      // 2. 删除评论
      const deletedComment = await tx.comment.delete({
        where: { id },
      });

      // 3. 将帖子的更新时间恢复为原来的值
      await tx.post.update({
        where: { id: comment.postId },
        data: { updatedAt: post.updatedAt },
      });

      return deletedComment;
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
