import { User, Role } from '@prisma/client';

// 用户创建接口
export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
}

// 用户登录接口
export interface LoginUserInput {
  email: string;
  password: string;
}

// 用户更新接口
export interface UpdateUserInput {
  username?: string;
  avatar?: string;
  bio?: string;
}

// 用户角色更新接口
export interface UpdateUserRoleInput {
  role: Role;
}

// 用户响应接口 (不包含密码)
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// 用户公开信息接口 (用于公开展示)
export interface UserPublicProfile {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
}

// 用户查询参数接口
export interface UserQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  keyword?: string;
}

// 将User模型转换为UserResponse (排除密码)
export function toUserResponse(user: User): UserResponse {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userResponse } = user;
  return userResponse as UserResponse;
}

// 将User模型转换为UserPublicProfile
export function toUserPublicProfile(user: User): UserPublicProfile {
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}
