import { FastifyReply, FastifyRequest } from 'fastify';
import { UpdateUserRequest } from '../types';
import { ApiError } from '../middlewares/errorHandler';
import { userService } from '../services/user.service';

export const userController = {
  /**
   * 获取用户信息
   */
  async getUserProfile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    const user = await userService.findUserById(id);

    if (!user) {
      throw new ApiError(404, '用户不存在');
    }

    return reply.send({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  },

  /**
   * 更新用户信息
   */
  async updateUserProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const { username, bio, avatar } = request.body as UpdateUserRequest;

    // 更新用户信息
    const updatedUser = await userService.updateUser(userId, {
      username,
      bio,
      avatar,
    });

    return reply.send({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
      },
    });
  },
};
