import { FastifyRequest } from 'fastify';
import { Role } from '@prisma/client';

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
}

export interface UpdateUserRequest {
  username?: string;
  bio?: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TypedRequest<T> extends FastifyRequest {
  body: T;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
