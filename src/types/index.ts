import { FastifyRequest } from 'fastify';
import { Role } from '@prisma/client';
import { ErrorResponse } from './errors';

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: Role;
}

export interface AuthPayload {
  id: string;
  username: string;
  email: string;
  role: Role;
}

// 扩展FastifyRequest类型，添加用户信息
declare module 'fastify' {
  interface FastifyRequest {
    user: AuthPayload;
  }
}

// 扩展JWT模块，定义自定义payload类型
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthPayload;
    user: AuthPayload;
  }
}

// 定义请求类型的辅助类型
export type RequestParams = Record<string, any>;
export type RequestQuery = Record<string, any>;
export type RequestBody = Record<string, any>;

// 定义TypedRequest类型，用于控制器函数的类型提示
export interface TypedRequest<T = any> extends FastifyRequest {
  params: T extends { Params: infer P } ? P : RequestParams;
  query: T extends { Querystring: infer Q } ? Q : RequestQuery;
  body: T extends { Body: infer B } ? B : RequestBody;
}

// 定义各种API请求和响应的类型
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  images?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  images?: string[];
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string; // 父评论ID，用于回复评论
}

export interface UpdateUserRequest {
  username?: string;
  bio?: string;
  avatar?: string;
}

// 旧的API响应接口，保留以兼容现有代码
export interface LegacyApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 新的API成功响应接口，基于Stripe API风格
export interface SuccessResponse<T = any> {
  code: 'success';
  message: string;
  data: T;
}

// API响应类型，可能是成功响应或错误响应
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Comment 相关接口
export interface CommentAuthor {
  id: string;
  username: string;
  avatar: string | null;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  postId: string;
  parentId: string | null;
  author?: CommentAuthor;
  replies?: Comment[];
  parent?: Comment;
}
