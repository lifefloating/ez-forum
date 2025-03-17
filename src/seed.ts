import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const prisma = new PrismaClient();

// 密码加密函数
function hashPassword(password: string) {
  // 生成随机盐值
  const salt = crypto.randomBytes(16).toString('hex');
  // 使用 PBKDF2 算法进行密码哈希
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  // 将盐值和哈希后的密码一起存储
  const passwordWithSalt = salt + ':' + hashedPassword;
  return passwordWithSalt;
}

async function main() {
  // 从环境变量获取管理员信息
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  // 从环境变量获取第二个管理员信息
  const secondAdminUsername = process.env.SECOND_ADMIN_USERNAME;
  const secondAdminEmail = process.env.SECOND_ADMIN_EMAIL;
  const secondAdminPassword = process.env.SECOND_ADMIN_PASSWORD;

  // 检查是否已存在管理员账户
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    // 创建管理员账户
    const hashedPassword = hashPassword(adminPassword);

    await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        bio: '系统管理员',
      },
    });

    console.log('管理员账户创建成功！');
  } else {
    console.log('管理员账户已存在，跳过创建');
  }

  // 只有当环境变量中设置了第二个管理员信息时才创建
  if (secondAdminUsername && secondAdminEmail && secondAdminPassword) {
    // 检查是否已存在第二个管理员账户
    const existingSecondAdmin = await prisma.user.findUnique({
      where: { username: secondAdminUsername },
    });

    if (!existingSecondAdmin) {
      // 创建第二个管理员账户
      const hashedPassword = hashPassword(secondAdminPassword);

      await prisma.user.create({
        data: {
          username: secondAdminUsername,
          email: secondAdminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
          bio: '系统管理员',
        },
      });

      console.log('第二个管理员账户创建成功！');
    } else {
      console.log('第二个管理员账户已存在，跳过创建');
    }
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
