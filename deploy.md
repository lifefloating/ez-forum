# 部署文档

## 1. 后端部署 (Docker)

### 1.1 环境要求
- Docker 20.10+
- Docker Compose 2.0+

### 1.2 部署步骤

#### 1.2.1 创建工作目录
```bash
mkdir -p /root/ez-forum
cd /root/ez-forum
```

#### 1.2.2 创建 docker-compose.yml
```yaml
version: '3'

services:
  ez-forum-backend:
    image: your-backend-image  # 替换为您的后端镜像
    container_name: ez-forum-backend
    restart: always
    ports:
      - "3009:3009"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    networks:
      - ez-forum-network

networks:
  ez-forum-network:
    driver: bridge
```

#### 1.2.3 启动服务
```bash
docker compose up -d
```

#### 1.2.4 查看日志
```bash
docker logs -f ez-forum-backend
```

### 1.3 常用维护命令

#### 重启服务
```bash
docker compose restart
```

#### 停止服务
```bash
docker compose down
```

#### 查看服务状态
```bash
docker compose ps
```
#### 更新服务
```bash
docker compose build app
```

## 2. 前端部署 (Nginx)

### 2.1 Nginx 配置

将以下配置添加到 `/etc/nginx/conf.d/ez-web.conf`:

```nginx
server {
    listen 80;
    server_name your-domain-or-ip;  # 替换为您的域名或IP
    
    root /var/www/ez-web;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3009;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

### 2.2 部署前端文件

```bash
# 创建网站目录
sudo mkdir -p /var/www/ez-web

# 复制前端文件
sudo cp -r /path/to/your/frontend/dist/* /var/www/ez-web/

# 设置权限
sudo chown -R www-data:www-data /var/www/ez-web
sudo chmod -R 755 /var/www/ez-web
```

### 2.3 重启 Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 3. 故障排查

### 3.1 检查后端服务
```bash
# 检查容器状态
docker ps | grep ez-forum-backend

# 检查容器日志
docker logs ez-forum-backend

# 检查端口是否正常监听
netstat -tulpn | grep 3009
```

### 3.2 检查前端服务
```bash
# 检查 Nginx 状态
systemctl status nginx

# 检查 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 检查 Nginx 访问日志
tail -f /var/log/nginx/access.log
```

### 3.3 常见问题

1. 502 Bad Gateway
   - 检查后端服务是否正常运行
   - 检查 3009 端口是否正常监听
   - 检查防火墙设置

2. 404 Not Found
   - 检查前端文件是否正确部署到 /var/www/ez-web
   - 检查 Nginx 配置中的 root 路径是否正确

3. 权限问题
   - 检查 /var/www/ez-web 目录的权限
   - 检查 Nginx 进程的运行用户权限