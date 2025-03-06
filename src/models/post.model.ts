import { Post } from '@prisma/client';
import { UserPublicProfile } from './user.model';

// 创建帖子接口
export interface CreatePostInput {
  title: string;
  content: string;
  images?: string[];
}

// 更新帖子接口
export interface UpdatePostInput {
  title?: string;
  content?: string;
  images?: string[];
}

// 帖子响应接口
export interface PostResponse {
  id: string;
  title: string;
  content: string;
  images: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: UserPublicProfile;
  commentCount?: number;
  likeCount?: number;
  isLiked?: boolean;
}

// 帖子查询参数接口
export interface PostQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  keyword?: string;
  authorId?: string;
}

// 将Post模型转换为PostResponse
export function toPostResponse(
  post: Post & {
    author?: UserPublicProfile;
    _count?: {
      comments: number;
      likes: number;
    };
    isLiked?: boolean;
  },
): PostResponse {
  return {
    ...post,
    commentCount: post._count?.comments || 0,
    likeCount: post._count?.likes || 0,
    isLiked: post.isLiked || false,
  };
}
