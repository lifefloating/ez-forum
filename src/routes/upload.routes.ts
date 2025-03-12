import { FastifyInstance } from 'fastify';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth';

export async function uploadRoutes(fastify: FastifyInstance) {
  // 上传文件
  fastify.post(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['uploads'],
        summary: '上传文件',
        security: [{ bearerAuth: [] }],
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              code: { type: 'string', enum: ['success'] },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  referenceUrl: { type: 'string' },
                  filename: { type: 'string' },
                  mimetype: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    uploadController.uploadFile,
  );
}
