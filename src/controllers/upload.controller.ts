import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiError, formatSuccessResponse } from '../middlewares/errorHandler';
import { uploadFile, convertToOssReference } from '../utils/storage';
import { ERROR_TYPES, REQUEST_ERROR_CODES, SERVER_ERROR_CODES } from '../types/errors';

export const uploadController = {
  /**
   * 上传文件到云存储
   */
  async uploadFile(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 获取上传的文件
      const file = await request.file();

      if (!file) {
        throw new ApiError({
          statusCode: 400,
          type: ERROR_TYPES.INVALID_REQUEST_ERROR,
          code: REQUEST_ERROR_CODES.MISSING_REQUIRED_FIELD,
          message: 'No file uploaded',
        });
      }

      // 验证文件类型
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new ApiError({
          statusCode: 400,
          type: ERROR_TYPES.INVALID_REQUEST_ERROR,
          code: REQUEST_ERROR_CODES.INVALID_FILE_TYPE,
          message: 'Invalid file type, only images are allowed',
        });
      }

      // 验证文件大小（5MB）
      const maxSize = 5 * 1024 * 1024;
      if (file.file.readableLength > maxSize) {
        throw new ApiError({
          statusCode: 400,
          type: ERROR_TYPES.INVALID_REQUEST_ERROR,
          code: REQUEST_ERROR_CODES.FILE_TOO_LARGE,
          message: 'File size exceeds the limit (5MB)',
        });
      }

      // 上传文件到云存储（默认使用阿里云OSS）
      const fileUrl = await uploadFile(file.file, file.filename, file.mimetype);

      // 将签名URL转换为引用格式，用于存储在数据库中
      const referenceUrl = convertToOssReference(fileUrl);

      return reply.send(
        formatSuccessResponse(
          {
            url: fileUrl,
            referenceUrl: referenceUrl,
            filename: file.filename,
            mimetype: file.mimetype,
          },
          'File upload successful',
        ),
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        statusCode: 500,
        type: ERROR_TYPES.SERVER_ERROR,
        code: SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'File upload failed',
      });
    }
  },
};
