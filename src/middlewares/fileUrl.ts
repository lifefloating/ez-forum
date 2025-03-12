import { FastifyReply, FastifyRequest } from 'fastify';
import { getFileUrl } from '../utils/storage';
import logger from '../utils/logger';

/**
 * 文件URL处理中间件
 * 用于将API响应中的OSS格式URL转换为签名URL
 *
 * 该中间件会处理JSON响应中的以下字段:
 * - url: 单个URL字段
 * - avatar: 头像URL字段
 * - image: 图片URL字段
 * - images: 图片URL数组字段
 */
export const fileUrlMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
  payload: string | Buffer,
): Promise<string | Buffer> => {
  try {
    // 如果响应不是JSON格式，直接返回
    if (!reply.getHeader('content-type')?.toString().includes('application/json')) {
      return payload;
    }

    // 如果payload为空，直接返回
    if (!payload) {
      return payload;
    }

    // 解析JSON数据
    try {
      const jsonData = JSON.parse(payload.toString());
      const processedData = await processObject(jsonData);
      return JSON.stringify(processedData);
    } catch (error) {
      logger.error(`处理文件URL失败: ${(error as Error).message}`);
      return payload;
    }
  } catch (error) {
    logger.error(`文件URL中间件异常: ${(error as Error).message}`);
    return payload;
  }

  /**
   * 递归处理对象中的URL
   */
  async function processObject(obj: any): Promise<any> {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    // 处理数组
    if (Array.isArray(obj)) {
      return Promise.all(obj.map((item) => processObject(item)));
    }

    // 处理对象
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      // 如果是图片URL数组，处理每个URL
      if (key === 'images' && Array.isArray(value)) {
        result[key] = await Promise.all(value.map(async (url) => getFileUrl(url)));
      }
      // 如果是单个URL字段
      else if (
        (key === 'url' || key === 'avatar' || key === 'image') &&
        typeof value === 'string' &&
        (value.startsWith('oss:') || value.startsWith('http'))
      ) {
        result[key] = await getFileUrl(value);
      }
      // 递归处理嵌套对象
      else if (typeof value === 'object' && value !== null) {
        result[key] = await processObject(value);
      }
      // 其他值直接保留
      else {
        result[key] = value;
      }
    }

    return result;
  }
};
