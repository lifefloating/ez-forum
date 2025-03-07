import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const PrismaPlugin: FastifyPluginAsync = fp(async (fastify) => {
  // 记录数据库连接字符串（隐藏敏感信息）
  const dbUrl = process.env.DATABASE_URL || '';
  const maskedDbUrl = dbUrl.replace(/\/\/.*?@/, '//***:***@');
  logger.info(`尝试连接到数据库: ${maskedDbUrl}`);

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  try {
    logger.info('正在连接到MongoDB...');
    await prisma.$connect();
    logger.info('MongoDB连接成功！');

    // 测试数据库连接
    try {
      const result = await prisma.$runCommandRaw({ ping: 1 });
      logger.info(`数据库连接测试结果: ${JSON.stringify(result)}`);
    } catch (pingError) {
      logger.error(
        `数据库连接测试失败: ${pingError instanceof Error ? pingError.message : String(pingError)}`,
      );
    }
  } catch (error) {
    logger.error(`MongoDB连接失败: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    logger.info('正在断开MongoDB连接...');
    await instance.prisma.$disconnect();
    logger.info('MongoDB连接已断开');
  });
});
