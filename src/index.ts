import 'dotenv/config';
import { buildApp } from './app';
import logger from './utils/logger';

const start = async () => {
  try {
    const app = await buildApp();
    const port = parseInt(process.env.PORT || '3009', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    logger.info(`server start success in port: ${port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
