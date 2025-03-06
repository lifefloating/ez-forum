import { FastifyReply, FastifyRequest } from 'fastify';
import { PaginationQuery } from '../types';
import { ApiError } from '../middlewares/errorHandler';
import { adminService } from '../services/admin.service';

export const adminController = {
  /**
   * 获取所有帖子（管理员）
   */
  async getAllPosts(
    request: FastifyRequest<{ Querystring: PaginationQuery & { keyword?: string } }>,
    reply: FastifyReply,
  ) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', keyword } = request.query;

    const result = await adminService.findAllPosts({
      page: Number(page),
      limit: Number(limit),
      sort,
      order,
      keyword,
    });

    return reply.send({
      success: true,
      data: result,
    });
  },

  /**
   * 删除帖子（管理员）
   */
  async deletePost(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    // 检查帖子是否存在
    const post = await adminService.findPostById(id);
    if (!post) {
      throw new ApiError(404, '帖子不存在');
    }

    // 删除帖子
    await adminService.deletePost(id);

    return reply.send({
      success: true,
      message: '帖子删除成功',
    });
  },

  /**
   * 获取所有用户（管理员）
   */
  async getAllUsers(
    request: FastifyRequest<{ Querystring: PaginationQuery & { keyword?: string } }>,
    reply: FastifyReply,
  ) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', keyword } = request.query;

    const result = await adminService.findAllUsers({
      page: Number(page),
      limit: Number(limit),
      sort,
      order,
      keyword,
    });

    return reply.send({
      success: true,
      data: result,
    });
  },

  /**
   * 更新用户角色（管理员）
   */
  async updateUserRole(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { role: 'USER' | 'ADMIN' };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { role } = request.body;

    // 检查用户是否存在
    const user = await adminService.findUserById(id);
    if (!user) {
      throw new ApiError(404, '用户不存在');
    }

    // 更新用户角色
    const updatedUser = await adminService.updateUserRole(id, role);

    return reply.send({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  },
};
