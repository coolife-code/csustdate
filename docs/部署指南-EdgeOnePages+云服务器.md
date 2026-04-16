# 部署指南（前后端同机部署到云服务器）

本文改为“前后端都部署在同一台云服务器”的方案，域名使用：

- `csustdate.com`（`@` 解析到 `180.76.248.142`）

## 1. 部署目标结构

- 前端：`frontend` 打包后由 Nginx 直接托管
- 后端：Node.js + PM2 监听 `127.0.0.1:3000`
- Nginx：同域名下转发 `/api` 到后端，其余路径给前端静态资源

这样线上前端只需要请求 `/api`，无需单独 `api` 子域名。

## 2. 环境变量配置

### 2.1 前端（生产）

在 `frontend/.env.production` 设置：

```env
VITE_API_BASE_URL=/api
```

### 2.2 后端（生产）

参考 `backend/.env.example`，至少要配置：

- `NODE_ENV=production`
- `PORT=3000`
- `DB_PATH=./datedrop.sqlite` 或绝对路径
- `JWT_SECRET=...`（强随机）
- `FRONTEND_URL=https://csustdate.com`
- `CORS_ALLOWED_ORIGINS=https://csustdate.com,https://www.csustdate.com`
- `MATCH_AUTO_UNLOCK_HOURS=5`
- `SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS`

邮件队列建议（2核2G）：

- `EMAIL_JOB_MAX_CONCURRENCY=2`
- `EMAIL_JOB_PER_SECOND_LIMIT=1`
- `EMAIL_JOB_BATCH_SIZE=10`

## 3. 前端部署

在服务器执行：

```bash
cd /path/to/project/frontend
npm ci
npm run build
```

将打包产物 `frontend/dist` 作为 Nginx 站点根目录（或拷贝到 `/var/www/csustdate/dist`）。

## 4. 后端部署

### 4.1 安装并启动

```bash
cd /path/to/project/backend
npm ci --omit=dev
cp .env.example .env
# 按本指南修改 .env 后：
pm2 start src/app.js --name datedrop-api -i 1
pm2 save
pm2 startup
```

说明：后端包含定时任务与邮件队列 worker，必须保持单实例（`-i 1`）。

## 5. Nginx 配置（同域名）

示例（HTTP 版本）：

```nginx
server {
  listen 80;
  server_name csustdate.com www.csustdate.com;

  root /var/www/csustdate/dist;
  index index.html;

  # 前端 history 路由
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 后端 API 反向代理（保留 /api 前缀）
  location /api {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

然后配置 HTTPS（推荐 certbot）：

```bash
sudo certbot --nginx -d csustdate.com -d www.csustdate.com
```

## 6. DNS 与防火墙检查

- DNS：确认 `@` A 记录指向 `180.76.248.142`
- 可选：`www` CNAME 到 `csustdate.com`（或 A 记录同 IP）
- 安全组/防火墙：放行 `80`、`443`（SSH 端口按你的策略）

## 7. 上线联调清单

- `https://csustdate.com` 能正常打开前端
- `https://csustdate.com/api/health` 返回成功
- 登录、资料保存、问卷、匹配接口可调用
- PM2 日志中自动解锁与邮件队列正常输出

## 8. 当前代码状态说明

当前仓库已对同机部署兼容：

- 前端通过 `VITE_API_BASE_URL` 控制 API 前缀
- 前端默认支持 `/api`（同域名代理）模式
- 后端已支持 CORS 白名单（`FRONTEND_URL` + `CORS_ALLOWED_ORIGINS`）
