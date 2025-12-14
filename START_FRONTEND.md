# 启动前端开发服务器

## 🚀 快速启动（3步）

### 1️⃣ 进入前端目录
```bash
cd frontend
```

### 2️⃣ 安装依赖（首次运行）
```bash
npm install
```

### 3️⃣ 启动开发服务器
```bash
npm run dev
```

### 4️⃣ 访问页面
打开浏览器：**http://localhost:5173**

---

## 📋 完整命令

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖（如果还没安装）
npm install

# 3. 启动开发服务器
npm run dev

# 4. 浏览器访问
# http://localhost:5173
```

---

## 🔧 其他命令

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

---

## ⚙️ 配置说明

### API地址配置

前端默认连接的后端API：
- **Node.js后端**: `http://localhost:3000/api`
- **Python后端**: `http://localhost:8000/api/v1`

配置位置：`frontend/src/services/api.ts`

### 修改API地址

编辑 `frontend/src/services/api.ts`：

```typescript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';
```

或创建 `.env` 文件：

```env
VITE_API_BASE=http://localhost:8000/api/v1
```

---

## 📁 前端位置

前端项目位于：**`frontend/`** 目录

---

## ❓ 常见问题

**端口5173被占用？**
- Vite会自动尝试下一个可用端口
- 或修改 `vite.config.ts` 中的端口配置

**依赖安装失败？**
```bash
# 清除缓存重试
rm -rf node_modules package-lock.json
npm install
```

**页面无法访问后端？**
- 确保后端服务已启动（`python qbot/api/run.py`）
- 检查API地址配置是否正确
- 检查CORS配置

**更多问题？**
查看 [docs/frontend/README.md](docs/frontend/README.md)

