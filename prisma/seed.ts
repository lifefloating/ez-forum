/* eslint-disable no-undef */
import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// 密码加密函数
function hashPassword(password) {
  // 生成随机盐值
  const salt = crypto.randomBytes(16).toString('hex');
  // 使用 PBKDF2 算法进行密码哈希
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  // 将盐值和哈希后的密码一起存储
  const passwordWithSalt = salt + ":" + hashedPassword;
  return passwordWithSalt;
}

async function main() {
  // 检查是否已存在管理员账户
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@admin.com' },
  });

  if (!existingAdmin) {
    // 创建管理员账户
    const hashedPassword = hashPassword('admin123456');
    
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: Role.ADMIN,
        bio: '系统管理员',
      },
    });
    
    console.log('管理员账户创建成功！');
  } else {
    console.log('管理员账户已存在，跳过创建');
  }
}

main()
  .catch((e) => {
    console.error('种子脚本执行失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
