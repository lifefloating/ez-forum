import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/errorHandler';
import { ERROR_TYPES, RESOURCE_ERROR_CODES } from '../types/errors';

const prisma = new PrismaClient();

export const authService = {
  /**
   * 创建新用户
   */
  async createUser(username: string, email: string, password: string) {
    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new ApiError({
        statusCode: 409,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_ALREADY_EXISTS,
        message: 'Username already in use',
        param: 'username',
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ApiError({
        statusCode: 409,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_ALREADY_EXISTS,
        message: 'Email already in use',
        param: 'email',
      });
    }

    // 加密密码
    // 生成随机盐值
    const salt = crypto.randomBytes(16).toString('hex');
    // 使用 PBKDF2 算法进行密码哈希
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    // 将盐值和哈希后的密码一起存储
    const passwordWithSalt = `${salt}:${hashedPassword}`;

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordWithSalt,
      },
    });

    return user;
  },

  /**
   * 通过邮箱查找用户
   */
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  /**
   * 通过ID查找用户
   */
  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },
};
