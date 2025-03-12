import { Readable } from 'stream';
import logger from './logger';
import { uploadFileToCOS, deleteFileFromCOS, getCOSSignedUrl } from './cos';
import { uploadFileToOSS, deleteFileFromOSS, getOSSSignedUrl } from './oss';

// 枚举存储类型
export enum StorageType {
  COS = 'cos',
  OSS = 'oss',
}

// 当前默认存储类型
export const DEFAULT_STORAGE = StorageType.OSS;

/**
 * 解析过期时间字符串为秒数
 * @param expiresStr 过期时间字符串，如 "7d"、"24h"、"30m"
 * @returns 过期时间（秒）
 */
export const parseExpires = (expiresStr: string | undefined): number => {
  if (!expiresStr) {
    return 60 * 60 * 24 * 7; // 默认7天
  }

  // 匹配数字和单位
  const match = expiresStr.match(/^(\d+)([dhms])?$/);
  if (!match) {
    logger.warn(`无效的过期时间格式: ${expiresStr}，使用默认值7天`);
    return 60 * 60 * 24 * 7;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2] || 's';

  switch (unit) {
    case 'd': // 天
      return value * 24 * 60 * 60;
    case 'h': // 小时
      return value * 60 * 60;
    case 'm': // 分钟
      return value * 60;
    case 's': // 秒
    default:
      return value;
  }
};

/**
 * 上传文件到存储服务
 * @param fileStream 文件流
 * @param filename 文件名
 * @param mimetype 文件MIME类型
 * @param storageType 存储类型，默认使用OSS
 * @returns 上传后的文件访问URL
 */
export const uploadFile = async (
  fileStream: Readable,
  filename: string,
  mimetype: string,
  storageType: StorageType = DEFAULT_STORAGE,
): Promise<string> => {
  logger.info(`使用${storageType}上传文件: ${filename}`);

  if (storageType === StorageType.COS) {
    return uploadFileToCOS(fileStream, filename, mimetype);
  } else {
    return uploadFileToOSS(fileStream, filename, mimetype);
  }
};

/**
 * 从存储服务删除文件
 * @param fileUrl 文件URL
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  // 根据URL格式判断存储类型
  if (fileUrl.startsWith('oss:')) {
    return deleteFileFromOSS(fileUrl);
  } else {
    // 默认使用COS删除
    return deleteFileFromCOS(fileUrl);
  }
};

/**
 * 获取文件访问URL(处理OSS和COS私有访问权限)
 * @param fileUrl 文件URL
 * @param expires 过期时间字符串，如 "7d"、"24h"、"30m"，默认1小时
 * @returns 可访问的URL
 */
export const getFileUrl = async (fileUrl: string, expires = '1h'): Promise<string> => {
  // 如果是OSS URL，需要处理签名
  if (fileUrl.startsWith('oss:')) {
    return getOSSSignedUrl(fileUrl, expires);
  }

  // 如果是COS URL，也需要处理签名
  if (fileUrl.includes('.cos.') || fileUrl.includes('.myqcloud.com')) {
    return getCOSSignedUrl(fileUrl, expires);
  }

  // 其他URL直接返回
  return fileUrl;
};

/**
 * 将OSS签名URL转换为引用格式
 * @param signedUrl OSS签名URL
 * @returns 引用格式URL (oss:bucket:key)
 */
export const convertToOssReference = (signedUrl: string): string => {
  try {
    // 检查是否已经是引用格式
    if (signedUrl.startsWith('oss:')) {
      return signedUrl;
    }

    // 检查是否是OSS URL
    if (!signedUrl.includes('.oss-') && !signedUrl.includes('.aliyuncs.com')) {
      // 不是OSS URL，直接返回
      return signedUrl;
    }

    // 解析URL
    const url = new URL(signedUrl);

    // 从hostname中提取bucket名称
    // 格式通常是: bucket.oss-region.aliyuncs.com
    const hostname = url.hostname;
    const bucketMatch = hostname.match(/^([^.]+)\.oss-/);
    if (!bucketMatch) {
      logger.warn(`无法从URL中提取bucket: ${signedUrl}`);
      return signedUrl;
    }

    const bucket = bucketMatch[1];

    // 从pathname中提取key (去掉开头的斜杠)
    const key = url.pathname.substring(1);

    // 构建引用格式
    return `oss:${bucket}:${key}`;
  } catch (error) {
    logger.error(`转换OSS URL格式失败: ${(error as Error).message}`, { url: signedUrl });
    return signedUrl;
  }
};
