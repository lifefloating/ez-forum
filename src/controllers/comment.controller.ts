import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateCommentRequest, PaginationQuery } from '../types';
import { ApiError } from '../middlewares/errorHandler';
import { commentService } from '../services/comment.service';
import { postService } from '../services/post.service';

export const commentController = {
  /**
   * 获取帖子的评论列表
   */
  async getPostComments(
    request: FastifyRequest<{
      Params: { postId: string };
      Querystring: PaginationQuery;
    }>,
    reply: FastifyReply,
  ) {
    const { postId } = request.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = request.query;

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
    const { content } = request.body as CreateCommentRequest;
    const userId = request.user.id;

    if (!content) {
      throw new ApiError(400, '评论内容不能为空');
    }

    // 检查帖子是否存在
    const post = await postService.findPostById(postId);
    if (!post) {
      throw new ApiError(404, '帖子不存在');
    }

    const comment = await commentService.createComment({
      content,
      postId,
      authorId: userId,
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
    const userId = request.user.id;

    if (!content) {
      throw new ApiError(400, '评论内容不能为空');
    }

    // 检查评论是否存在
    const existingComment = await commentService.findCommentById(id);

    if (!existingComment) {
      throw new ApiError(404, '评论不存在');
    }

    // 检查是否是评论作者或管理员
    if (existingComment.authorId !== userId && request.user.role !== 'ADMIN') {
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
    const userId = request.user.id;

    // 检查评论是否存在
    const existingComment = await commentService.findCommentById(id);

    if (!existingComment) {
      throw new ApiError(404, '评论不存在');
    }

    // 检查是否是评论作者、帖子作者或管理员
    const post = await postService.findPostById(existingComment.postId);

    if (
      existingComment.authorId !== userId &&
      post?.authorId !== userId &&
      request.user.role !== 'ADMIN'
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
    const userId = request.user.id;
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
