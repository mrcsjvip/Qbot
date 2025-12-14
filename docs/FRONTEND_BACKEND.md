# 前后端启动指南

## 📁 项目结构

```
Qbot/
├── frontend/          # 前端项目（React + TypeScript + Vite）
├── backend/           # Node.js后端（可选）
└── qbot/api/          # Python后端（FastAPI）
```

## 🚀 启动步骤

### 方式1：只启动Python后端 + 前端（推荐）

#### 1. 启动Python后端

```bash
# 在项目根目录
python qbot/api/run.py
```

后端运行在：**http://localhost:8000**

#### 2. 启动前端

```bash
# 新开一个终端
cd frontend
npm install  # 首次运行
npm run dev
```

前端运行在：**http://localhost:5173**

#### 3. 访问页面

打开浏览器：**http://localhost:5173**

---

### 方式2：启动Node.js后端 + 前端

#### 1. 启动Node.js后端

```bash
cd backend
npm install  # 首次运行
npm run start:dev
```

后端运行在：**http://localhost:3000**

#### 2. 启动前端

```bash
# 新开一个终端
cd frontend
npm install  # 首次运行
npm run dev
```

前端运行在：**http://localhost:5173**

---

## ⚙️ API配置

### 前端API地址配置

前端默认连接Python后端：`http://localhost:8000/api/v1`

配置文件：`frontend/src/services/api.ts`

```typescript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';
```

### 切换到Node.js后端

编辑 `frontend/src/services/api.ts`：

```typescript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
```

或创建 `.env` 文件：

```env
VITE_API_BASE=http://localhost:3000/api
```

---

## 📋 快速启动命令

### Python后端 + 前端

```bash
# 终端1：启动Python后端
python qbot/api/run.py

# 终端2：启动前端
cd frontend && npm run dev
```

### Node.js后端 + 前端

```bash
# 终端1：启动Node.js后端
cd backend && npm run start:dev

# 终端2：启动前端
cd frontend && npm run dev
```

---

## 🔍 验证服务

### 检查后端

```bash
# Python后端
curl http://localhost:8000/health

# Node.js后端
curl http://localhost:3000/api/health
```

### 检查前端

打开浏览器访问：**http://localhost:5173**

---

## 📚 相关文档

- [前端启动指南](../START_FRONTEND.md)
- [后端启动指南](../START_BACKEND.md)
- [前端文档](frontend/README.md)
- [API文档](api/README.md)

