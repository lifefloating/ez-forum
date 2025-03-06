import { FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import { LoginRequest, RegisterRequest } from '../types';
import { ApiError } from '../middlewares/errorHandler';
import { authService } from '../services/auth.service';

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
      throw new ApiError(400, '用户名、邮箱和密码不能为空');
    }

    // 密码长度验证
    if (password.length < 6) {
      throw new ApiError(400, '密码长度不能少于6个字符');
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

    return reply.status(201).send({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
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
      throw new ApiError(400, '邮箱和密码不能为空');
    }

    // 查找用户
    const user = await authService.findUserByEmail(email);
    if (!user) {
      throw new ApiError(401, '邮箱或密码不正确');
    }

    // 验证密码
    // 从存储的密码中分离出盐值和哈希密码
    const [salt, storedHash] = user.password.split(':');
    // 使用相同的盐值和算法对输入的密码进行哈希
    const inputHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    // 比较哈希值
    if (inputHash !== storedHash) {
      throw new ApiError(401, '邮箱或密码不正确');
    }

    // 生成JWT令牌
    const token = await reply.jwtSign({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return reply.send({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  },

  /**
   * 获取当前登录用户信息
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const user = await authService.findUserById(userId);

    if (!user) {
      throw new ApiError(404, '用户不存在');
    }

    return reply.send({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  },

  /**
   * 退出登录
   */
  async logout(_request: FastifyRequest, reply: FastifyReply) {
    // 由于使用JWT，服务端不需要做特殊处理，客户端只需要删除token即可
    return reply.send({
      success: true,
      message: '退出登录成功',
    });
  },
};
