import COS from 'cos-nodejs-sdk-v5';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';
import { ApiError } from '../middlewares/errorHandler';
import { ERROR_TYPES, SERVER_ERROR_CODES } from '../types/errors';
import { parseExpires } from './storage';

// 初始化COS客户端
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

const bucket = process.env.COS_BUCKET as string;
const region = process.env.COS_REGION as string;

/**
 * 上传文件到腾讯云COS
 * @param fileStream 文件流
 * @param filename 文件名
 * @param mimetype 文件MIME类型
 * @returns 上传后的文件访问URL
 */
export const uploadFileToCOS = async (
  fileStream: Readable,
  filename: string,
  mimetype: string,
): Promise<string> => {
  try {
    // 生成唯一文件名 (使用UUID)
    const key = `${uuidv4()}-${filename}`;

    return new Promise((resolve, reject) => {
      cos.putObject(
        {
          Bucket: bucket,
          Region: region,
          Key: key,
          Body: fileStream,
          ContentType: mimetype,
        },
        (err) => {
          if (err) {
            logger.error(`COS upload failed: ${err.message}`);
            return reject(
              new ApiError({
                statusCode: 500,
                type: ERROR_TYPES.SERVER_ERROR,
                code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'File upload failed',
              }),
            );
          }

          // 返回文件访问URL
          const fileUrl = `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
          logger.info(`文件上传成功: ${fileUrl}`);
          resolve(fileUrl);
        },
      );
    });
  } catch (error) {
    logger.error(`COS上传异常: ${(error as Error).message}`);
    throw new ApiError({
      statusCode: 500,
      type: ERROR_TYPES.SERVER_ERROR,
      code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: '文件上传处理失败',
    });
  }
};

/**
 * 从URL中删除COS上的文件
 * @param fileUrl 文件URL
 */
export const deleteFileFromCOS = async (fileUrl: string): Promise<void> => {
  try {
    // 从URL中提取文件key
    const urlObj = new URL(fileUrl);
    const key = urlObj.pathname.substring(1); // 去掉开头的斜杠

    return new Promise((resolve, reject) => {
      cos.deleteObject(
        {
          Bucket: bucket,
          Region: region,
          Key: key,
        },
        (err) => {
          if (err) {
            logger.error(`COS delete failed: ${err.message}`);
            return reject(
              new ApiError({
                statusCode: 500,
                type: ERROR_TYPES.SERVER_ERROR,
                code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'File deletion failed',
              }),
            );
          }

          logger.info(`文件删除成功: ${key}`);
          resolve();
        },
      );
    });
  } catch (error) {
    logger.error(`COS删除异常: ${(error as Error).message}`);
    throw new ApiError({
      statusCode: 500,
      type: ERROR_TYPES.SERVER_ERROR,
      code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: '文件删除处理失败',
    });
  }
};

/**
 * 获取COS文件签名访问URL
 * @param fileUrl COS文件URL
 * @param expiresStr 过期时间字符串，如 "7d"、"24h"、"30m"，默认1小时
 * @returns 签名后的访问URL
 */
export const getCOSSignedUrl = async (fileUrl: string, expiresStr = '1h'): Promise<string> => {
  try {
    // 从URL中提取文件key
    const urlObj = new URL(fileUrl);
    const key = urlObj.pathname.substring(1); // 去掉开头的斜杠

    // 解析过期时间
    const expires = parseExpires(expiresStr);

    return new Promise((resolve, reject) => {
      cos.getObjectUrl(
        {
          Bucket: bucket,
          Region: region,
          Key: key,
          Sign: true,
          Expires: expires,
        },
        (err, data) => {
          if (err) {
            logger.error(`获取COS签名URL失败: ${err.message}`);
            return reject(
              new ApiError({
                statusCode: 500,
                type: ERROR_TYPES.SERVER_ERROR,
                code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: '获取文件访问链接失败',
              }),
            );
          }

          if (data.Url) {
            resolve(data.Url);
          } else {
            logger.error('获取COS签名URL失败: 返回数据中没有URL');
            reject(
              new ApiError({
                statusCode: 500,
                type: ERROR_TYPES.SERVER_ERROR,
                code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: '获取文件访问链接失败',
              }),
            );
          }
        },
      );
    });
  } catch (error) {
    logger.error(`获取COS签名URL异常: ${(error as Error).message}`);
    throw new ApiError({
      statusCode: 500,
      type: ERROR_TYPES.SERVER_ERROR,
      code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: '获取文件访问链接失败',
    });
  }
};
