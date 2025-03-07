import { FastifySchema } from 'fastify';
import {
  ERROR_TYPES,
  AUTHENTICATION_ERROR_CODES,
  PERMISSION_ERROR_CODES,
  RESOURCE_ERROR_CODES,
  REQUEST_ERROR_CODES,
  SERVER_ERROR_CODES,
  RATE_LIMIT_ERROR_CODES,
  API_ERROR_CODES,
} from '../types/errors';

// 创建错误类型的枚举值数组
const errorTypes = Object.values(ERROR_TYPES);

// 创建错误代码的枚举值数组
const errorCodes = [
  ...Object.values(AUTHENTICATION_ERROR_CODES),
  ...Object.values(PERMISSION_ERROR_CODES),
  ...Object.values(RESOURCE_ERROR_CODES),
  ...Object.values(REQUEST_ERROR_CODES),
  ...Object.values(SERVER_ERROR_CODES),
  ...Object.values(RATE_LIMIT_ERROR_CODES),
  ...Object.values(API_ERROR_CODES),
];

// 通用错误响应 schema
export const errorResponseSchema = {
  type: 'object',
  properties: {
    code: { type: 'string', enum: ['error'] },
    message: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: errorTypes },
        errorCode: { type: 'string', enum: errorCodes },
        status: { type: 'integer' },
        param: { type: 'string' },
      },
      required: ['type', 'errorCode', 'status'],
    },
  },
  required: ['code', 'message', 'data'],
};

// 常见HTTP状态码的错误响应 schema
export const errorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  403: errorResponseSchema,
  404: errorResponseSchema,
  409: errorResponseSchema,
  422: errorResponseSchema,
  429: errorResponseSchema,
  500: errorResponseSchema,
};

/**
 * 将错误响应添加到现有 schema 的辅助函数
 *
 * 该函数会在 schema 中添加错误响应的引用，而不是详细的错误响应定义。
 * 这样可以在 OpenAPI 文档中生成一个集中的错误码章节。
 */
export const addErrorResponsesToSchema = (schema: FastifySchema): FastifySchema => {
  // 确保 schema 是一个对象
  const safeSchema = schema || {};

  // 确保 response 是一个对象
  const safeResponse =
    typeof safeSchema.response === 'object' && safeSchema.response !== null
      ? safeSchema.response
      : {};

  // 在 schema 中添加错误响应的引用
  return {
    ...safeSchema,
    response: {
      ...safeResponse,
      // 使用引用而不是定义错误响应
      400: { $ref: '#/components/schemas/ErrorResponse' },
      401: { $ref: '#/components/schemas/ErrorResponse' },
      403: { $ref: '#/components/schemas/ErrorResponse' },
      404: { $ref: '#/components/schemas/ErrorResponse' },
      409: { $ref: '#/components/schemas/ErrorResponse' },
      422: { $ref: '#/components/schemas/ErrorResponse' },
      429: { $ref: '#/components/schemas/ErrorResponse' },
      500: { $ref: '#/components/schemas/ErrorResponse' },
    },
  };
};

/**
 * 注册错误响应 schema 到 OpenAPI 文档
 * 这个函数应该在应用启动时调用，注册错误响应 schema 到 OpenAPI 文档
 */
export const registerErrorResponseSchema = (app: any): void => {
  // 注册错误响应 schema
  app.addSchema({
    $id: 'ErrorResponse',
    ...errorResponseSchema,
    description: '错误响应格式',
  });

  // 添加错误码文档到 OpenAPI 文档
  if (app.swagger) {
    const errorDocsTag = {
      name: '错误处理',
      description: '# API 错误码说明\n\n所有 API 错误响应都遵循统一格式，详见错误响应 schema。',
    };

    // 将错误码文档添加到 OpenAPI 文档的标签中
    if (Array.isArray(app.swagger.tags)) {
      app.swagger.tags.push(errorDocsTag);
    } else {
      app.swagger.tags = [errorDocsTag];
    }
  }
};
