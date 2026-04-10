# CSUST DateDrop 项目

长沙理工大学学生配对网站

## 项目结构

```
├── frontend/          # 前端项目 (Vue 3 + Vite)
├── admin-frontend/    # 本地管理员面板 (Vue 3 + Vite)
├── backend/           # 后端项目 (Koa + SQLite)
└── docs/              # 项目文档
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173

### 本地管理员面板

```bash
cd admin-frontend
npm install
npm run dev
```

管理员面板运行在 http://localhost:5174

### 后端

```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 文件配置环境变量
npm run dev
```

后端运行在 http://localhost:3000

### 初始化数据库

```bash
cd backend
npm run seed
```

## 技术栈

### 前端
- Vue 3
- Vite
- Tailwind CSS
- Pinia
- Vue Router
- Axios

### 后端
- Node.js
- Koa
- SQLite
- Sequelize
- JWT
- Nodemailer

## 开发进度

- [x] 项目初始化
- [x] 前端基础架构
- [x] 后端基础架构
- [x] 用户认证模块
- [ ] 用户资料模块
- [ ] 问卷系统
- [ ] 匹配算法
- [ ] 邮件系统
- [ ] 定时任务

## 文档

详细文档请查看 `docs/` 目录：
- [API文档](docs/api.md)
- [数据库设计](docs/database.md)
- [前端开发](docs/frontend.md)
- [后端开发](docs/backend.md)
