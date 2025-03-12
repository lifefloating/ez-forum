import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import logger from '../utils/logger';
import {
  ErrorType,
  ErrorCode,
  ERROR_TYPES,
  AUTHENTICATION_ERROR_CODES,
  PERMISSION_ERROR_CODES,
  RESOURCE_ERROR_CODES,
  REQUEST_ERROR_CODES,
  SERVER_ERROR_CODES,
  RATE_LIMIT_ERROR_CODES,
} from '../types/errors';

// 扩展的API错误类
export class ApiError extends Error {
  statusCode: number;
  type: ErrorType;
  code: ErrorCode;
  param?: string;

  constructor(options: {
    statusCode: number;
    type: ErrorType;
    code: ErrorCode;
    message: string;
    param?: string;
  }) {
    super(options.message);
    this.statusCode = options.statusCode;
    this.type = options.type;
    this.code = options.code;
    this.param = options.param;
    this.name = 'ApiError';
  }
}

// 成功响应格式化函数
export const formatSuccessResponse = (data: any, message: string = 'Operation successful') => {
  return {
    code: 'success',
    message,
    data,
  };
};

// 错误响应格式化函数
export const formatErrorResponse = (
  errorType: ErrorType,
  errorCode: ErrorCode,
  message: string,
  statusCode: number,
  param?: string,
) => {
  return {
    code: 'error',
    message,
    data: {
      type: errorType,
      errorCode: errorCode,
      status: statusCode,
      param,
    },
  };
};

// 错误处理中间件
export const errorHandler = (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  // 处理自定义API错误
  if (error instanceof ApiError) {
    return reply
      .status(error.statusCode)
      .send(
        formatErrorResponse(error.type, error.code, error.message, error.statusCode, error.param),
      );
  }

  logger.error(error);

  // 处理常见的Prisma错误
  if (error.code === 'P2002') {
    return reply
      .status(409)
      .send(
        formatErrorResponse(
          ERROR_TYPES.RESOURCE_ERROR,
          RESOURCE_ERROR_CODES.RESOURCE_ALREADY_EXISTS,
          'Data already exists, please check unique fields',
          409,
        ),
      );
  }

  if (error.code === 'P2025') {
    return reply
      .status(404)
      .send(
        formatErrorResponse(
          ERROR_TYPES.RESOURCE_ERROR,
          RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
          'Requested resource does not exist',
          404,
        ),
      );
  }

  // JWT验证错误
  if (error.name === 'UnauthorizedError' || error.statusCode === 401) {
    return reply
      .status(401)
      .send(
        formatErrorResponse(
          ERROR_TYPES.AUTHENTICATION_ERROR,
          AUTHENTICATION_ERROR_CODES.INVALID_TOKEN,
          'Unauthorized access, please login',
          401,
        ),
      );
  }

  // 默认服务器错误
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message || 'Unknown error';

  // 根据状态码确定错误类型
  let errorType: ErrorType = ERROR_TYPES.SERVER_ERROR;
  let errorCode: ErrorCode = SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR;

  if (statusCode === 400) {
    errorType = ERROR_TYPES.INVALID_REQUEST_ERROR;
    errorCode = REQUEST_ERROR_CODES.INVALID_PARAMETERS;
  } else if (statusCode === 401) {
    errorType = ERROR_TYPES.AUTHENTICATION_ERROR;
    errorCode = AUTHENTICATION_ERROR_CODES.INVALID_TOKEN;
  } else if (statusCode === 403) {
    errorType = ERROR_TYPES.PERMISSION_ERROR;
    errorCode = PERMISSION_ERROR_CODES.INSUFFICIENT_PERMISSIONS;
  } else if (statusCode === 404) {
    errorType = ERROR_TYPES.RESOURCE_ERROR;
    errorCode = RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND;
  } else if (statusCode === 409) {
    errorType = ERROR_TYPES.RESOURCE_ERROR;
    errorCode = RESOURCE_ERROR_CODES.RESOURCE_CONFLICT;
  } else if (statusCode === 429) {
    errorType = ERROR_TYPES.RATE_LIMIT_ERROR;
    errorCode = RATE_LIMIT_ERROR_CODES.TOO_MANY_REQUESTS;
  }

  return reply
    .status(statusCode)
    .send(formatErrorResponse(errorType, errorCode, message, statusCode));
};
