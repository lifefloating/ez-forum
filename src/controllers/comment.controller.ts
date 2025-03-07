import { FastifyReply, FastifyRequest } from 'fastify';
import { commentService } from '../services/comment.service';
import { postService } from '../services/post.service';
import { ApiError } from '../middlewares/errorHandler';
import { CreateCommentRequest, PaginationQuery } from '../types';

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
      throw new ApiError(404, '评论不存在');
    }

    const result = await commentService.findCommentReplies(commentId, {
      page: Number(page),
      limit: Number(limit),
      sort,
      order,
    });

    return reply.send({
      success: true,
      data: result,
    });
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
      throw new ApiError(404, '帖子不存在');
    }

    const result = await commentService.findPostComments(postId, {
      page: Number(page),
      limit: Number(limit),
      sort,
      order,
    });

    return reply.send({
      success: true,
      data: result,
    });
  },

  /**
   * 创建评论
   */
  async createComment(request: FastifyRequest, reply: FastifyReply) {
    const { postId } = request.params as { postId: string };
    const { content, parentId } = request.body as CreateCommentRequest;
    const userId = (request as any).user.id;

    if (!content) {
      throw new ApiError(400, '评论内容不能为空');
    }

    // 检查帖子是否存在
    const post = await postService.findPostById(postId);
    if (!post) {
      throw new ApiError(404, '帖子不存在');
    }

    // 如果是回复评论，检查父评论是否存在
    if (parentId) {
      const parentComment = await commentService.findCommentById(parentId);
      if (!parentComment) {
        throw new ApiError(404, '要回复的评论不存在');
      }

      // 确保父评论属于同一个帖子
      if (parentComment.postId !== postId) {
        throw new ApiError(400, '评论回复必须属于同一帖子');
      }
    }

    const comment = await commentService.createComment({
      content,
      postId,
      authorId: userId,
      parentId,
    });

    return reply.status(201).send({
      success: true,
      data: comment,
    });
  },

  /**
   * 更新评论
   */
  async updateComment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { content } = request.body as CreateCommentRequest;
    const userId = (request as any).user.id;

    if (!content) {
      throw new ApiError(400, '评论内容不能为空');
    }

    // 检查评论是否存在
    const existingComment = await commentService.findCommentById(id);

    if (!existingComment) {
      throw new ApiError(404, '评论不存在');
    }

    // 检查是否是评论作者或管理员
    if (existingComment.authorId !== userId && (request as any).user.role !== 'ADMIN') {
      throw new ApiError(403, '无权限修改此评论');
    }

    // 更新评论
    const updatedComment = await commentService.updateComment(id, { content });

    return reply.send({
      success: true,
      data: updatedComment,
    });
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
      throw new ApiError(404, '评论不存在');
    }

    // 检查是否有回复评论
    if (existingComment.replies && existingComment.replies.length > 0) {
      throw new ApiError(400, '该评论有回复，无法删除');
    }

    // 检查是否是评论作者、帖子作者或管理员
    const post = await postService.findPostById(existingComment.postId);

    if (
      existingComment.authorId !== userId &&
      post?.authorId !== userId &&
      (request as any).user.role !== 'ADMIN'
    ) {
      throw new ApiError(403, '无权限删除此评论');
    }

    // 删除评论
    await commentService.deleteComment(id);

    return reply.send({
      success: true,
      message: '评论删除成功',
    });
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

    return reply.send({
      success: true,
      data: result,
    });
  },
};
