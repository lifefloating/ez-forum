import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/errorHandler';
import { PaginationQuery } from '../types';

const prisma = new PrismaClient();

export const postService = {
  /**
   * 获取帖子列表
   */
  async findPosts(options: PaginationQuery) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = options;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.post.count(),
    ]);

    // 格式化返回数据
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      images: post.images,
      views: post.views,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
    }));

    return {
      items: formattedPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * 通过ID查找帖子
   */
  async findPostById(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return null;
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      images: post.images,
      views: post.views,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      author: post.author,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
    };
  },

  /**
   * 创建帖子
   */
  async createPost(data: { title: string; content: string; images: string[]; authorId: string }) {
    return prisma.post.create({
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
   * 更新帖子
   */
  async updatePost(
    id: string,
    data: {
      title?: string;
      content?: string;
      images?: string[];
    },
  ) {
    return prisma.post.update({
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
   * 删除帖子
   */
  async deletePost(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  },

  /**
   * 增加帖子浏览量
   */
  async incrementViews(id: string) {
    return prisma.post.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  },

  /**
   * 点赞帖子
   */
  async likePost(postId: string, userId: string) {
    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      throw new ApiError(400, '已经点赞过该帖子');
    }

    return prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
  },

  /**
   * 取消点赞帖子
   */
  async unlikePost(postId: string, userId: string) {
    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!existingLike) {
      throw new ApiError(400, '尚未点赞该帖子');
    }

    return prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  },

  /**
   * 获取用户的帖子列表
   */
  async findUserPosts(userId: string, options: PaginationQuery) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = options;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.post.count({
        where: {
          authorId: userId,
        },
      }),
    ]);

    // 格式化返回数据
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      images: post.images,
      views: post.views,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
    }));

    return {
      items: formattedPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * 获取用户点赞的帖子列表
   */
  async findUserLikedPosts(userId: string, options: PaginationQuery) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = options;
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: {
          userId,
        },
        skip,
        take: limit,
        orderBy: {
          [sort]: order,
        },
        include: {
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  likes: true,
                },
              },
            },
          },
        },
      }),
      prisma.like.count({
        where: {
          userId,
        },
      }),
    ]);

    // 格式化返回数据
    const formattedPosts = likes.map((like) => ({
      id: like.post.id,
      title: like.post.title,
      content: like.post.content,
      images: like.post.images,
      views: like.post.views,
      createdAt: like.post.createdAt,
      updatedAt: like.post.updatedAt,
      author: like.post.author,
      commentCount: like.post._count.comments,
      likeCount: like.post._count.likes,
    }));

    return {
      items: formattedPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};
