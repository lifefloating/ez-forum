import { FastifyRequest } from 'fastify';
import { ApiError } from './errorHandler';
import logger from '../utils/logger';
import { ERROR_TYPES, AUTHENTICATION_ERROR_CODES, PERMISSION_ERROR_CODES } from '../types/errors';

// 验证用户是否已登录
export const authenticate = async (request: FastifyRequest) => {
  try {
    await request.jwtVerify();
  } catch (error) {
    logger.error(error);
    throw new ApiError({
      statusCode: 401,
      type: ERROR_TYPES.AUTHENTICATION_ERROR,
      code: AUTHENTICATION_ERROR_CODES.MISSING_TOKEN,
      message: 'Authentication required',
    });
  }
};

// 验证用户是否为管理员
export const authorizeAdmin = async (request: FastifyRequest) => {
  await authenticate(request);

  // 验证完JWT后，user会被挂载到request上
  const user = request.user as { id: string; role: string };

  if (user.role !== 'ADMIN') {
    throw new ApiError({
      statusCode: 403,
      type: ERROR_TYPES.PERMISSION_ERROR,
      code: PERMISSION_ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      message: 'Admin privileges required',
    });
  }
};
