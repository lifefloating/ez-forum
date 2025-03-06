import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export const userService = {
  /**
   * 通过ID查找用户
   */
  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * 更新用户信息
   */
  async updateUser(
    id: string,
    data: {
      username?: string;
      bio?: string;
      avatar?: string;
    },
  ) {
    // 如果更新用户名，检查是否已存在
    if (data.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ApiError(409, '用户名已被使用');
      }
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  },
};
