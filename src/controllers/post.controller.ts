import { FastifyReply, FastifyRequest } from 'fastify';
import { CreatePostRequest, PaginationQuery, UpdatePostRequest } from '../types';
import { ApiError, formatSuccessResponse } from '../middlewares/errorHandler';
import { postService } from '../services/post.service';
import {
  ERROR_TYPES,
  RESOURCE_ERROR_CODES,
  PERMISSION_ERROR_CODES,
  REQUEST_ERROR_CODES,
} from '../types/errors';

export const postController = {
  /**
   * 获取帖子列表
   */
  async getPosts(request: FastifyRequest, reply: FastifyReply) {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      filter,
    } = request.query as PaginationQuery;
    const userId = request.user?.id;

    // 根据过滤类型调用不同的服务方法
    let result;
    if (filter === 'my' && userId) {
      // 我发布的帖子
      result = await postService.findUserPosts(
        userId,
        {
          page: Number(page),
          limit: Number(limit),
          sort,
          order,
        },
        userId,
      );
    } else if (filter === 'liked' && userId) {
      // 我点赞的帖子
      result = await postService.findUserLikedPosts(
        userId,
        {
          page: Number(page),
          limit: Number(limit),
          sort,
          order,
        },
        userId,
      );
    } else {
      // 默认或最新发布
      result = await postService.findPosts(
        {
          page: Number(page),
          limit: Number(limit),
          sort,
          order,
          filter,
        },
        userId,
      );
    }

    return reply.send(formatSuccessResponse(result));
  },

  /**
   * 获取单个帖子详情
   */
  async getPostById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.id;

    const post = await postService.findPostById(id, userId);

    if (!post) {
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'Post does not exist',
      });
    }

    // 增加帖子浏览量
    await postService.incrementViews(id);

    return reply.send(formatSuccessResponse(post));
  },

  /**
   * 创建新帖子
   */
  async createPost(request: FastifyRequest, reply: FastifyReply) {
    const { title, content, images } = request.body as CreatePostRequest;
    const userId = request.user.id;

    if (!title || !content) {
      throw new ApiError({
        statusCode: 400,
        type: ERROR_TYPES.INVALID_REQUEST_ERROR,
        code: REQUEST_ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Title and content cannot be empty',
      });
    }

    const post = await postService.createPost({
      title,
      content,
      images: images || [],
      authorId: userId,
    });

    return reply.status(201).send(formatSuccessResponse(post, 'Post created successfully'));
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
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'Post does not exist',
      });
    }

    // 检查是否是帖子作者或管理员
    if (existingPost.authorId !== userId && request.user.role !== 'ADMIN') {
      throw new ApiError({
        statusCode: 403,
        type: ERROR_TYPES.PERMISSION_ERROR,
        code: PERMISSION_ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        message: 'You can only update your own posts',
      });
    }

    // 更新帖子
    const updatedPost = await postService.updatePost(id, {
      title,
      content,
      images,
    });

    return reply.send(formatSuccessResponse(updatedPost, 'Post updated successfully'));
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
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'Post does not exist',
      });
    }

    // 检查是否是帖子作者或管理员
    if (existingPost.authorId !== userId && request.user.role !== 'ADMIN') {
      throw new ApiError({
        statusCode: 403,
        type: ERROR_TYPES.PERMISSION_ERROR,
        code: PERMISSION_ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        message: 'You can only delete your own posts',
      });
    }

    // 删除帖子
    await postService.deletePost(id);

    return reply.send(formatSuccessResponse(null, 'Post deleted successfully'));
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
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'Post does not exist',
      });
    }

    // 添加点赞
    await postService.likePost(id, userId);

    return reply.send(formatSuccessResponse(null, 'Like added successfully'));
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
      throw new ApiError({
        statusCode: 404,
        type: ERROR_TYPES.RESOURCE_ERROR,
        code: RESOURCE_ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'Post does not exist',
      });
    }

    // 移除点赞
    await postService.unlikePost(id, userId);

    return reply.send(formatSuccessResponse(null, 'Like removed successfully'));
  },

  /**
   * 获取用户的帖子列表
   */
  async getUserPosts(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as { userId: string };
    const { page = 1, limit = 10 } = request.query as PaginationQuery;
    const currentUserId = request.user?.id;

    const result = await postService.findUserPosts(
      userId,
      {
        page: Number(page),
        limit: Number(limit),
      },
      currentUserId,
    );

    return reply.send(formatSuccessResponse(result));
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

    const result = await postService.findUserLikedPosts(
      userId,
      {
        page: Number(page),
        limit: Number(limit),
        sort,
        order,
      },
      userId,
    );

    return reply.send(formatSuccessResponse(result));
  },
};
