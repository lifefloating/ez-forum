import OSS from 'ali-oss';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';
import { ApiError } from '../middlewares/errorHandler';
import { ERROR_TYPES, SERVER_ERROR_CODES } from '../types/errors';
import { parseExpires } from './storage';

// 初始化OSS客户端
const client = new OSS({
  region: process.env.OSS_REGION as string,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID as string,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET as string,
  bucket: process.env.OSS_BUCKET as string,
  secure: true, // 使用HTTPS
});

/**
 * 上传文件到阿里云OSS
 * @param fileStream 文件流
 * @param filename 文件名
 * @param mimetype 文件MIME类型
 * @returns 上传后的文件临时访问URL
 */
export const uploadFileToOSS = async (
  fileStream: Readable,
  filename: string,
  mimetype: string,
): Promise<string> => {
  try {
    // 生成唯一文件名 (使用UUID)
    const key = `${uuidv4()}-${filename}`;

    // 上传文件到OSS
    const result = await client.putStream(key, fileStream, {
      contentType: mimetype,
    } as any);

    if (!result) {
      throw new Error('OSS上传结果异常');
    }

    logger.info(`文件上传到OSS成功: ${key}`);

    // 返回文件访问的永久URL结构 (在访问时会动态生成签名URL)
    // 格式: oss:$bucket:$key
    // 这种URL格式稍后会在应用层处理转换为真正的签名URL
    const permanentUrlRef = `oss:${(client as any).options?.bucket || process.env.OSS_BUCKET}:${key}`;
    return permanentUrlRef;
  } catch (error) {
    logger.error(`OSS上传异常: ${(error as Error).message}`);
    throw new ApiError({
      statusCode: 500,
      type: ERROR_TYPES.SERVER_ERROR,
      code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: '文件上传处理失败',
    });
  }
};

/**
 * 从OSS删除文件
 * @param fileUrl 文件URL (格式: oss:bucket:key)
 */
export const deleteFileFromOSS = async (fileUrl: string): Promise<void> => {
  try {
    // 检查URL格式是否为OSS格式
    if (!fileUrl.startsWith('oss:')) {
      throw new Error('无效的OSS文件URL格式');
    }

    // 从URL中提取key
    const parts = fileUrl.split(':');
    if (parts.length !== 3) {
      throw new Error('无效的OSS文件URL格式');
    }

    const key = parts[2];

    // 删除文件
    await client.delete(key);
    logger.info(`OSS文件删除成功: ${key}`);
  } catch (error) {
    logger.error(`OSS删除异常: ${(error as Error).message}`);
    throw new ApiError({
      statusCode: 500,
      type: ERROR_TYPES.SERVER_ERROR,
      code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: '文件删除处理失败',
    });
  }
};

/**
 * 获取OSS文件签名访问URL
 * @param fileUrl OSS文件引用URL (格式: oss:bucket:key)
 * @param expiresStr 过期时间字符串，如 "7d"、"24h"、"30m"
 * @returns 签名后的访问URL
 */
export const getOSSSignedUrl = async (fileUrl: string, expiresStr = '1h'): Promise<string> => {
  try {
    // 检查URL格式是否为OSS格式
    if (!fileUrl.startsWith('oss:')) {
      // 如果不是OSS格式的URL，直接返回原URL（可能是COS的URL）
      return fileUrl;
    }

    // 从URL中提取key
    const parts = fileUrl.split(':');
    if (parts.length !== 3) {
      throw new Error('无效的OSS文件URL格式');
    }

    const key = parts[2];

    // 生成带签名的临时访问URL
    const expires = parseExpires(expiresStr);
    const signedUrl = await client.signatureUrl(key, {
      expires,
    });

    return signedUrl;
  } catch (error) {
    logger.error(`获取OSS签名URL异常: ${(error as Error).message}`);
    throw new ApiError({
      statusCode: 500,
      type: ERROR_TYPES.SERVER_ERROR,
      code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: '获取文件访问链接失败',
    });
  }
};
