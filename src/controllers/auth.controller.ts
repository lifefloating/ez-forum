import { FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import { LoginRequest, RegisterRequest } from '../types';
import { ApiError, formatSuccessResponse } from '../middlewares/errorHandler';
import { authService } from '../services/auth.service';
import {
  ERROR_TYPES,
  AUTHENTICATION_ERROR_CODES,
  REQUEST_ERROR_CODES,
  RESOURCE_ERROR_CODES,
} from '../types/errors';

export const authController = {
  /**
   * 用户注册
   */
  async register(
    request: FastifyRequest<{
      Body: RegisterRequest;
    }>,
    reply: FastifyReply,
  ) {
    const { username, email, password } = request.body;

    // 验证用户输入
    if (!username || !email || !password) {
      throw new ApiError({
        statusCode: 400,
        type: ERROR_TYPES.INVALID_REQUEST_ERROR,
        code: REQUEST_ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: '用户名、邮箱和密码不能为空',
      });
    }

    // 密码长度验证
    if (password.length < 6) {
      throw new ApiError({
        statusCode: 400,
        type: ERROR_TYPES.INVALID_REQUEST_ERROR,
        code: REQUEST_ERROR_CODES.VALUE_TOO_SHORT,
        message: '密码长度不能少于6个字符',
        param: 'password',
      });
    }

    // 创建用户
    const user = await authService.createUser(username, email, password);

    // 生成JWT令牌
    const token = await reply.jwtSign({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return reply.status(201).send(
      formatSuccessResponse(
        {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          token,
        },
        '用户注册成功',
      ),
    );
  },

  /**
   * 用户登录
   */
  async login(
    request: FastifyRequest<{
      Body: LoginRequest;
    }>,
    reply: FastifyReply,
  ) {
    const { email, password } = request.body;

    // 验证用户输入
    if (!email || !password) {
      throw new ApiError({
        statusCode: 400,
        type: ERROR_TYPES.INVALID_REQUEST_ERROR,
        code: REQUEST_ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: '邮箱和密码不能为空',
      });
    }

    // 查找用户
    const user = await authService.findUserByEmail(email);
    if (!user) {
      throw new ApiError({
        statusCode: 401,
        type: ERROR_TYPES.AUTHENTICATION_ERROR,
        code: AUTHENTICATION_ERROR_CODES.INVALID_CREDENTIALS,
        message: '邮箱或密码不正确',
      });
    }

    // 验证密码
    // 从存储的密码中分离出盐值和哈希密码
    const [salt, storedHash] = user.password.split(':');
    // 使用相同的盐值和算法对输入的密码进行哈希
    const inputHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    // 比较哈希值
    if (inputHash !== storedHash) {
      throw new ApiError({
        statusCode: 401,
        type: ERROR_TYPES.AUTHENTICATION_ERROR,
        code: AUTHENTICATION_ERROR_CODES.INVALID_CREDENTIALS,
        message: '邮箱或密码不正确',
      });
    }

    // 生成JWT令牌
    const token = await reply.jwtSign({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return reply.send(
      formatSuccessResponse(
        {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          token,
        },
        '登录成功',
      ),
    );
  },

  /**
   * 获取当前登录用户信息
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const user = await authService.findUserById(userId);

    if (!user) {
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: '用户不存在',
      });
    }

    return reply.send(
      formatSuccessResponse({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      }),
    );
  },

  /**
   * 退出登录
   */
  async logout(_request: FastifyRequest, reply: FastifyReply) {
    // 由于使用JWT，服务端不需要做特殊处理，客户端只需要删除token即可
    return reply.send(formatSuccessResponse(null, '退出登录成功'));
  },
};
