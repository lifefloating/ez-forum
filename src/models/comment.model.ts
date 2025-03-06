import { Comment } from '@prisma/client';
import { UserPublicProfile } from './user.model';

// 创建评论接口
export interface CreateCommentInput {
  content: string;
  postId: string;
}

// 更新评论接口
export interface UpdateCommentInput {
  content: string;
}

// 评论响应接口
export interface CommentResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  postId: string;
  author?: UserPublicProfile;
  post?: {
    id: string;
    title: string;
  };
}

// 评论查询参数接口
export interface CommentQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  postId?: string;
  authorId?: string;
}

// 将Comment模型转换为CommentResponse
export function toCommentResponse(
  comment: Comment & {
    author?: UserPublicProfile;
    post?: {
      id: string;
      title: string;
    };
  },
): CommentResponse {
  return {
    ...comment,
    author: comment.author,
    post: comment.post,
  };
}
