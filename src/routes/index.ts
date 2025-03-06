import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { postRoutes } from './post.routes';
import { commentRoutes } from './comment.routes';
import { userRoutes } from './user.routes';
import { uploadRoutes } from './upload.routes';
import { adminRoutes } from './admin.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  // 注册所有路由
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(postRoutes, { prefix: '/api/posts' });
  fastify.register(commentRoutes, { prefix: '/api/comments' });
  fastify.register(userRoutes, { prefix: '/api/users' });
  fastify.register(uploadRoutes, { prefix: '/api/uploads' });
  fastify.register(adminRoutes, { prefix: '/api/admin' });
}
