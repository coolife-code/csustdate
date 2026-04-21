# 部署指南（EdgeOne Pages + 云服务器）

本文针对当前项目推荐部署方式：

- 前端：腾讯云 EdgeOne Pages
- 后端：2核2G 云服务器（Node.js + PM2 + Nginx）

## 1. 部署前准备

### 1.1 域名规划

- 前端：`https://www.your-domain.com`
- 后端：`https://api.your-domain.com`

### 1.2 后端环境变量

参考 `backend/.env.example`，生产环境至少要配置：

- `NODE_ENV=production`
- `PORT=3000`
- `DB_PATH=./datedrop.sqlite` 或绝对路径
- `JWT_SECRET=...`（强随机）
- `FRONTEND_URL=https://www.your-domain.com`
- `CORS_ALLOWED_ORIGINS=https://www.your-domain.com`
- `MATCH_AUTO_UNLOCK_HOURS=5`
- `SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS`

邮件队列建议（2核2G）：

- `EMAIL_JOB_MAX_CONCURRENCY=2`
- `EMAIL_JOB_PER_SECOND_LIMIT=1`
- `EMAIL_JOB_BATCH_SIZE=10`

## 2. 前端部署（EdgeOne Pages）

在 EdgeOne Pages 中连接 GitHub 仓库，配置：

- 项目目录：`frontend`
- 构建命令：`npm ci && npm run build`
- 输出目录：`dist`
- Node 版本：18

设置前端环境变量：

- `VITE_API_BASE_URL=https://api.your-domain.com/api`

然后绑定前端域名并开启 HTTPS。

如果使用 Vue history 路由，需在 EdgeOne Pages 控制台添加重写规则：

- `/*` -> `/index.html`

### 2.1 当前阶段（后端未上云）建议

当前可以先让前端连接本地后端，同时保留后续一键切云能力（仅限本机开发）：

- 开发环境使用 `frontend/.env.development`（已配置为 `VITE_API_BASE_URL=/api`）
- `vite.config.js` 已将 `/api` 代理到 `http://localhost:3000`
- 本地启动前后端即可联调，无需改业务代码

注意：以上代理只在 `npm run dev` 本地开发服务器生效。  
如果前端已部署到 EdgeOne Pages，`localhost:3000` 指向的是用户自己的设备，不会自动连到你的云服务器；线上必须把 `VITE_API_BASE_URL` 配成可公网访问的后端地址（如 `https://api.your-domain.com/api`）。

后续切到云服务器时，只需改前端环境变量为：

- `VITE_API_BASE_URL=https://api.your-domain.com/api`

不需要修改 `src/api/index.js` 代码。

## 3. 后端部署（云服务器）

### 3.1 启动方式

后端包含定时任务与邮件队列 worker，必须单实例运行：

- PM2 启动建议：`pm2 start src/app.js --name datedrop-api -i 1`

### 3.2 Nginx 反代

将 `api.your-domain.com` 反向代理到 `127.0.0.1:3000`。

示例：

```nginx
server {
  listen 80;
  server_name api.your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

随后用 certbot 配置 HTTPS。

## 4. 上线联调清单

- 打开前端后，请求地址是否为 `https://api.your-domain.com/api/...`
- `GET https://api.your-domain.com/api/health` 返回成功
- 登录、资料保存、问卷、匹配接口可正常调用
- 自动解锁与邮件队列日志正常输出

## 5. 代码已包含的部署适配

当前仓库已支持：

- 前端通过 `VITE_API_BASE_URL` 切换 API 地址（见 `frontend/.env.development` 与 `frontend/.env.production.example`）
- 后端 CORS 白名单（`FRONTEND_URL` + `CORS_ALLOWED_ORIGINS`）
