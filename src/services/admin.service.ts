import { PrismaClient, Role, Prisma } from '@prisma/client';
import { PaginationQuery } from '../types';

const prisma = new PrismaClient();

export const adminService = {
  /**
   * 获取所有帖子（管理员）
   */
  async findAllPosts(options: PaginationQuery & { keyword?: string }) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', keyword } = options;
    const skip = (page - 1) * limit;

    const where = keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
      prisma.post.count({ where }),
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
    return prisma.post.findUnique({
      where: { id },
    });
  },

  /**
   * 删除帖子（管理员）
   */
  async deletePost(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  },

  /**
   * 获取所有用户（管理员）
   */
  async findAllUsers(options: PaginationQuery & { keyword?: string }) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', keyword } = options;
    const skip = (page - 1) * limit;

    const where = keyword
      ? {
          OR: [
            { username: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sort]: order,
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * 通过ID查找用户
   */
  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * 更新用户角色（管理员）
   */
  async updateUserRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  },
};
