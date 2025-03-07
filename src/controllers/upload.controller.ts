import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiError, formatSuccessResponse } from '../middlewares/errorHandler';
import { uploadFileToCOS } from '../utils/cos';
import { ERROR_TYPES, REQUEST_ERROR_CODES, SERVER_ERROR_CODES } from '../types/errors';

export const uploadController = {
  /**
   * 上传文件到腾讯云COS
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
          message: '没有找到上传的文件',
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
          message: '不支持的文件类型',
          param: 'file',
        });
      }

      // 验证文件大小（5MB）
      const maxSize = 5 * 1024 * 1024;
      if (file.file.readableLength > maxSize) {
        throw new ApiError({
          statusCode: 400,
          type: ERROR_TYPES.INVALID_REQUEST_ERROR,
          code: REQUEST_ERROR_CODES.FILE_TOO_LARGE,
          message: '文件大小不能超过5MB',
          param: 'file',
        });
      }

      // 上传文件到腾讯云COS
      const fileUrl = await uploadFileToCOS(file.file, file.filename, file.mimetype);

      return reply.send(
        formatSuccessResponse(
          {
            url: fileUrl,
            filename: file.filename,
            mimetype: file.mimetype,
          },
          '文件上传成功',
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
        message: '文件上传失败',
      });
    }
  },
};
