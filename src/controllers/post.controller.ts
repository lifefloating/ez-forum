import { FastifyReply, FastifyRequest } from 'fastify';
import { CreatePostRequest, PaginationQuery, UpdatePostRequest } from '../types';
import { ApiError } from '../middlewares/errorHandler';
import { postService } from '../services/post.service';

export const postController = {
  /**
   * 获取帖子列表
   */
  async getPosts(request: FastifyRequest<{ Querystring: PaginationQuery }>, reply: FastifyReply) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = request.query;

    const result = await postService.findPosts({
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
   * 获取单个帖子详情
   */
  async getPostById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    const post = await postService.findPostById(id);

    if (!post) {
      throw new ApiError(404, '帖子不存在');
    }

    // 增加帖子浏览量
    await postService.incrementViews(id);

    return reply.send({
      success: true,
      data: post,
    });
  },

  /**
   * 创建新帖子
   */
  async createPost(request: FastifyRequest, reply: FastifyReply) {
    const { title, content, images } = request.body as CreatePostRequest;
    const userId = request.user.id;

    if (!title || !content) {
      throw new ApiError(400, '标题和内容不能为空');
    }

    const post = await postService.createPost({
      title,
      content,
      images: images || [],
      authorId: userId,
    });

    return reply.status(201).send({
      success: true,
      data: post,
    });
  },

  /**
   * 更新帖子
   */
  async updatePost(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { title, content, images } = request.body as UpdatePostRequest;
    const userId = request.user.id;

    // 检查帖子是否存在
    const existingPost = await postService.findPostById(id);

    if (!existingPost) {
      throw new ApiError(404, '帖子不存在');
    }

    // 检查是否是帖子作者或管理员
    if (existingPost.authorId !== userId && request.user.role !== 'ADMIN') {
      throw new ApiError(403, '无权限修改此帖子');
    }

    // 更新帖子
    const updatedPost = await postService.updatePost(id, {
      title,
      content,
      images,
    });

    return reply.send({
      success: true,
      data: updatedPost,
    });
  },

  /**
   * 删除帖子
   */
  async deletePost(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    // 检查帖子是否存在
    const existingPost = await postService.findPostById(id);

    if (!existingPost) {
      throw new ApiError(404, '帖子不存在');
    }

    // 检查是否是帖子作者或管理员
    if (existingPost.authorId !== userId && request.user.role !== 'ADMIN') {
      throw new ApiError(403, '无权限删除此帖子');
    }

    // 删除帖子
    await postService.deletePost(id);

    return reply.send({
      success: true,
      message: '帖子删除成功',
    });
  },

  /**
   * 点赞帖子
   */
  async likePost(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    // 检查帖子是否存在
    const existingPost = await postService.findPostById(id);

    if (!existingPost) {
      throw new ApiError(404, '帖子不存在');
    }

    // 添加点赞
    await postService.likePost(id, userId);

    return reply.send({
      success: true,
      message: '点赞成功',
    });
  },

  /**
   * 取消点赞帖子
   */
  async unlikePost(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    // 检查帖子是否存在
    const existingPost = await postService.findPostById(id);

    if (!existingPost) {
      throw new ApiError(404, '帖子不存在');
    }

    // 移除点赞
    await postService.unlikePost(id, userId);

    return reply.send({
      success: true,
      message: '取消点赞成功',
    });
  },

  /**
   * 获取用户的帖子列表
   */
  async getUserPosts(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as { userId: string };
    const { page = 1, limit = 10 } = request.query as PaginationQuery;

    const result = await postService.findUserPosts(userId, {
      page: Number(page),
      limit: Number(limit),
    });

    return reply.send({
      success: true,
      data: result,
    });
  },

  /**
   * 获取用户点赞的帖子列表
   */
  async getUserLikedPosts(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
    } = request.query as PaginationQuery;

    const result = await postService.findUserLikedPosts(userId, {
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
};
