import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/errorHandler';
import { ERROR_TYPES, RESOURCE_ERROR_CODES } from '../types/errors';

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
        throw new ApiError({
          statusCode: 409,
          type: ERROR_TYPES.RESOURCE_ERROR,
          code: RESOURCE_ERROR_CODES.RESOURCE_ALREADY_EXISTS,
          message: 'Username already in use',
          param: 'username',
        });
      }
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  },
};
