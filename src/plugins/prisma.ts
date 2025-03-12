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
  logger.info(`Attempting to connect to the database: ${maskedDbUrl}`);

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  try {
    logger.info('Connecting to MongoDB...');

    // 设置连接超时
    const connectPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 5000); // 5秒超时
    });

    // 等待连接或超时
    await Promise.race([connectPromise, timeoutPromise]);

    // 测试数据库连接是否真正可用
    try {
      const result = await prisma.$runCommandRaw({ ping: 1 });
      if (result && result.ok === 1) {
        logger.info('MongoDB connection successful!');
        logger.info(`Database connection test result: ${JSON.stringify(result)}`);
      } else {
        throw new Error(`Database connection test failed: ${JSON.stringify(result)}`);
      }
    } catch (pingError) {
      logger.error(
        `Database connection test failed: ${pingError instanceof Error ? pingError.message : String(pingError)}`,
      );
      // 重新抛出错误，以便插件注册失败
      throw pingError;
    }
  } catch (error) {
    logger.error(
      `MongoDB connection failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    // 确保在连接失败时断开任何可能已建立的连接
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      logger.error(
        `Disconnecting failed: ${disconnectError instanceof Error ? disconnectError.message : String(disconnectError)}`,
      );
    }
    throw error;
  }

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    logger.info('Disconnecting from MongoDB...');
    await instance.prisma.$disconnect();
    logger.info('MongoDB connection disconnected');
  });
});
