import COS from 'cos-nodejs-sdk-v5';
import { Readable } from 'stream';
import logger from './logger';
import { ApiError } from '../middlewares/errorHandler';

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
    // 生成唯一文件名 (时间戳-原文件名)
    const key = `uploads/${Date.now()}-${filename}`;

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
            logger.error(`COS上传失败: ${err.message}`);
            return reject(new ApiError(500, '文件上传失败'));
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
    throw new ApiError(500, '文件上传处理失败');
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
            logger.error(`COS删除失败: ${err.message}`);
            return reject(new ApiError(500, '文件删除失败'));
          }

          logger.info(`文件删除成功: ${key}`);
          resolve();
        },
      );
    });
  } catch (error) {
    logger.error(`COS删除异常: ${(error as Error).message}`);
    throw new ApiError(500, '文件删除处理失败');
  }
};
