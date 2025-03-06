import { FastifyRequest } from 'fastify';
import { ApiError } from './errorHandler';
import logger from '../utils/logger';

// 验证用户是否已登录
export const authenticate = async (request: FastifyRequest) => {
  try {
    await request.jwtVerify();
  } catch (error) {
    logger.error(error);
    throw new ApiError(401, '请先登录');
  }
};

// 验证用户是否为管理员
export const authorizeAdmin = async (request: FastifyRequest) => {
  await authenticate(request);

  // 验证完JWT后，user会被挂载到request上
  const user = request.user as { id: string; role: string };

  if (user.role !== 'ADMIN') {
    throw new ApiError(403, '无访问权限，需要管理员权限');
  }
};
