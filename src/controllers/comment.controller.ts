import { FastifyReply, FastifyRequest } from 'fastify';
import { commentService } from '../services/comment.service';
import { postService } from '../services/post.service';
import { ApiError, formatSuccessResponse } from '../middlewares/errorHandler';
import { CreateCommentRequest, PaginationQuery } from '../types';
import {
  ERROR_TYPES,
  RESOURCE_ERROR_CODES,
  PERMISSION_ERROR_CODES,
  REQUEST_ERROR_CODES,
} from '../types/errors';

export const commentController = {
  /**
   * 获取评论的回复列表
   */
  async getCommentReplies(request: FastifyRequest, reply: FastifyReply) {
    const { commentId } = request.params as { commentId: string };
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'asc',
    } = request.query as PaginationQuery;

    // 检查评论是否存在
    const comment = await commentService.findCommentById(commentId);
    if (!comment) {
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: '评论不存在',
      });
    }

    const result = await commentService.findCommentReplies(commentId, {
      page: Number(page),
      limit: Number(limit),
      sort,
      order,
    });

    return reply.send(formatSuccessResponse(result));
  },
  /**
   * 获取帖子的评论列表
   */
  async getPostComments(request: FastifyRequest, reply: FastifyReply) {
    const { postId } = request.params as { postId: string };
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
    } = request.query as PaginationQuery;

    // 检查帖子是否存在
    const post = await postService.findPostById(postId);
    if (!post) {
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: '帖子不存在',
      });
    }

    const result = await commentService.findPostComments(postId, {
      page: Number(page),
      limit: Number(limit),
      sort,
      order,
    });

    return reply.send(formatSuccessResponse(result));
  },

  /**
   * 创建评论
   */
  async createComment(request: FastifyRequest, reply: FastifyReply) {
    const { postId } = request.params as { postId: string };
    const { content, parentId } = request.body as CreateCommentRequest;
    const userId = (request as any).user.id;

    if (!content) {
      throw new ApiError({
        statusCode: 400,
        type: ERROR_TYPES.INVALID_REQUEST_ERROR,
        code: REQUEST_ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: '评论内容不能为空',
        param: 'content',
      });
    }

    // 检查帖子是否存在
    const post = await postService.findPostById(postId);
    if (!post) {
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: '帖子不存在',
      });
    }

    // 如果是回复评论，检查父评论是否存在
    if (parentId) {
      const parentComment = await commentService.findCommentById(parentId);
      if (!parentComment) {
        throw new ApiError({
          statusCode: 404,
          type: ERROR_TYPES.RESOURCE_ERROR,
          code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
          message: '要回复的评论不存在',
          param: 'parentId',
        });
      }

      // 确保父评论属于同一个帖子
      if (parentComment.postId !== postId) {
        throw new ApiError({
          statusCode: 400,
          type: ERROR_TYPES.INVALID_REQUEST_ERROR,
          code: REQUEST_ERROR_CODES.INVALID_PARAMETERS,
          message: '评论回复必须属于同一帖子',
          param: 'parentId',
        });
      }
    }

    const comment = await commentService.createComment({
      content,
      postId,
      authorId: userId,
      parentId,
    });

    return reply.status(201).send(formatSuccessResponse(comment, '评论创建成功'));
  },

  /**
   * 更新评论
   */
  async updateComment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { content } = request.body as CreateCommentRequest;
    const userId = (request as any).user.id;

    if (!content) {
      throw new ApiError({
        statusCode: 400,
        type: ERROR_TYPES.INVALID_REQUEST_ERROR,
        code: REQUEST_ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: '评论内容不能为空',
        param: 'content',
      });
    }

    // 检查评论是否存在
    const existingComment = await commentService.findCommentById(id);

    if (!existingComment) {
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: '评论不存在',
      });
    }

    // 检查是否是评论作者或管理员
    if (existingComment.authorId !== userId && (request as any).user.role !== 'ADMIN') {
      throw new ApiError({
        statusCode: 403,
        type: ERROR_TYPES.PERMISSION_ERROR,
        code: PERMISSION_ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        message: '无权限修改此评论',
      });
    }

    // 更新评论
    const updatedComment = await commentService.updateComment(id, { content });

    return reply.send(formatSuccessResponse(updatedComment, '评论更新成功'));
  },

  /**
   * 删除评论
   */
  async deleteComment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = (request as any).user.id;

    // 检查评论是否存在
    const existingComment = await commentService.findCommentById(id);

    if (!existingComment) {
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: '评论不存在',
      });
    }

    // 检查是否有回复评论
    if (existingComment.replies && existingComment.replies.length > 0) {
      throw new ApiError({
        statusCode: 400,
        type: ERROR_TYPES.INVALID_REQUEST_ERROR,
        code: REQUEST_ERROR_CODES.OPERATION_NOT_ALLOWED,
        message: '该评论有回复，无法删除',
      });
    }

    // 检查是否是评论作者、帖子作者或管理员
    const post = await postService.findPostById(existingComment.postId);

    if (
      existingComment.authorId !== userId &&
      post?.authorId !== userId &&
      (request as any).user.role !== 'ADMIN'
    ) {
      throw new ApiError({
        statusCode: 403,
        type: ERROR_TYPES.PERMISSION_ERROR,
        code: PERMISSION_ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        message: '无权限删除此评论',
      });
    }

    // 删除评论
    await commentService.deleteComment(id);

    return reply.send(formatSuccessResponse(null, '评论删除成功'));
  },

  /**
   * 获取用户的评论列表
   */
  async getUserComments(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user.id;
    const { page = 1, limit = 10 } = request.query as PaginationQuery;

    const result = await commentService.findUserComments(userId, {
      page: Number(page),
      limit: Number(limit),
    });

    return reply.send(formatSuccessResponse(result));
  },
};
