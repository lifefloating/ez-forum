/**
 * 基于Stripe API风格的错误类型和错误代码定义
 * 参考: https://docs.stripe.com/api/errors
 */

// 错误类型
export const ERROR_TYPES = {
  AUTHENTICATION_ERROR: 'authentication_error', // 身份验证错误
  PERMISSION_ERROR: 'permission_error', // 权限错误
  INVALID_REQUEST_ERROR: 'invalid_request_error', // 无效请求错误
  RESOURCE_ERROR: 'resource_error', // 资源相关错误
  RATE_LIMIT_ERROR: 'rate_limit_error', // 速率限制错误
  API_ERROR: 'api_error', // API错误
  SERVER_ERROR: 'server_error', // 服务器错误
} as const;

export type ErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];

// 身份验证错误代码
export const AUTHENTICATION_ERROR_CODES = {
  INVALID_CREDENTIALS: 'invalid_credentials', // 用户名或密码不正确
  EXPIRED_TOKEN: 'expired_token', // 令牌已过期
  INVALID_TOKEN: 'invalid_token', // 无效的令牌
  MISSING_TOKEN: 'missing_token', // 缺少令牌
} as const;

// 权限错误代码
export const PERMISSION_ERROR_CODES = {
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions', // 权限不足
  FORBIDDEN_ACTION: 'forbidden_action', // 禁止的操作
} as const;

// 资源错误代码
export const RESOURCE_ERROR_CODES = {
  RESOURCE_NOT_FOUND: 'resource_not_found', // 资源不存在
  RESOURCE_ALREADY_EXISTS: 'resource_already_exists', // 资源已存在
  RESOURCE_DELETED: 'resource_deleted', // 资源已删除
  RESOURCE_CONFLICT: 'resource_conflict', // 资源冲突
} as const;

// 请求错误代码
export const REQUEST_ERROR_CODES = {
  INVALID_PARAMETERS: 'invalid_parameters', // 无效的请求参数
  MISSING_REQUIRED_FIELD: 'missing_required_field', // 缺少必需字段
  INVALID_FORMAT: 'invalid_format', // 格式无效
  VALUE_TOO_LONG: 'value_too_long', // 值过长
  VALUE_TOO_SHORT: 'value_too_short', // 值过短
  INVALID_FILE_TYPE: 'invalid_file_type', // 无效的文件类型
  FILE_TOO_LARGE: 'file_too_large', // 文件过大
  OPERATION_NOT_ALLOWED: 'operation_not_allowed', // 操作不允许
} as const;

// 服务器错误代码
export const SERVER_ERROR_CODES = {
  INTERNAL_SERVER_ERROR: 'internal_server_error', // 内部服务器错误
  SERVICE_UNAVAILABLE: 'service_unavailable', // 服务不可用
  DATABASE_ERROR: 'database_error', // 数据库错误
  TIMEOUT: 'timeout', // 请求超时
} as const;

// 速率限制错误代码
export const RATE_LIMIT_ERROR_CODES = {
  TOO_MANY_REQUESTS: 'too_many_requests', // 请求过多
} as const;

// API错误代码
export const API_ERROR_CODES = {
  UNSUPPORTED_API_VERSION: 'unsupported_api_version', // 不支持的API版本
  UNSUPPORTED_OPERATION: 'unsupported_operation', // 不支持的操作
} as const;

// 所有错误代码的联合类型
export type ErrorCode =
  | (typeof AUTHENTICATION_ERROR_CODES)[keyof typeof AUTHENTICATION_ERROR_CODES]
  | (typeof PERMISSION_ERROR_CODES)[keyof typeof PERMISSION_ERROR_CODES]
  | (typeof RESOURCE_ERROR_CODES)[keyof typeof RESOURCE_ERROR_CODES]
  | (typeof REQUEST_ERROR_CODES)[keyof typeof REQUEST_ERROR_CODES]
  | (typeof SERVER_ERROR_CODES)[keyof typeof SERVER_ERROR_CODES]
  | (typeof RATE_LIMIT_ERROR_CODES)[keyof typeof RATE_LIMIT_ERROR_CODES]
  | (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// 错误响应接口
export interface ErrorResponse {
  error: {
    type: ErrorType;
    code: ErrorCode;
    message: string;
    param?: string;
    status: number;
  };
}
