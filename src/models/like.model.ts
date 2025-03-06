import { Like } from '@prisma/client';
import { UserPublicProfile } from './user.model';

// 创建点赞接口
export interface CreateLikeInput {
  postId: string;
}

// 点赞响应接口
export interface LikeResponse {
  id: string;
  createdAt: Date;
  userId: string;
  postId: string;
  user?: UserPublicProfile;
}

// 将Like模型转换为LikeResponse
export function toLikeResponse(
  like: Like & {
    user?: UserPublicProfile;
  },
): LikeResponse {
  return {
    ...like,
    user: like.user,
  };
}
