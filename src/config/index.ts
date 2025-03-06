// 配置文件
export default {
  // 环境变量
  NODE_ENV: process.env.NODE_ENV || 'development',

  // 日志级别
  LOG_LEVEL: process.env.LOG_LEVEL,

  // 服务器配置
  PORT: parseInt(process.env.PORT || '3009', 10),
  HOST: process.env.HOST || '0.0.0.0',

  // JWT配置
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // 其他配置
  APP_NAME: 'ez-forum',
};
