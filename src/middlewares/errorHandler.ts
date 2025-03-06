import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import logger from '../utils/logger';

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const errorHandler = (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message,
    });
  }

  logger.error(error);

  // 处理常见的Prisma错误
  if (error.code === 'P2002') {
    return reply.status(409).send({
      success: false,
      error: '数据已存在，请检查唯一字段',
    });
  }

  if (error.code === 'P2025') {
    return reply.status(404).send({
      success: false,
      error: '请求的资源不存在',
    });
  }

  // JWT验证错误
  if (error.name === 'UnauthorizedError' || error.statusCode === 401) {
    return reply.status(401).send({
      success: false,
      error: '未授权访问，请登录',
    });
  }

  // 默认服务器错误
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? '服务器内部错误' : error.message || '未知错误';

  return reply.status(statusCode).send({
    success: false,
    error: message,
  });
};
