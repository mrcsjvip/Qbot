# 前端项目说明

## 📁 前端位置

前端项目位于：**`frontend/`** 目录

## 🚀 启动前端开发服务器

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问前端页面

启动后，打开浏览器访问：
- **开发服务器**: http://localhost:5173 (Vite默认端口)

## 📋 可用命令

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 🔧 技术栈

- **React** 19.2.0
- **TypeScript** 5.9.3
- **Vite** 7.2.4
- **React Router** 7.10.1
- **ECharts** 6.0.0 (图表库)

## 📁 目录结构

```
frontend/
├── src/
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx            # 入口文件
│   ├── components/         # 通用组件
│   │   └── Layout/        # 布局组件
│   ├── pages/             # 页面组件
│   │   ├── Overview/      # 概览页
│   │   ├── Backtest/      # 回测页
│   │   ├── Trade/         # 交易页
│   │   ├── Strategies/    # 策略页
│   │   ├── Reports/       # 研报页
│   │   ├── Notebook/      # Notebook页
│   │   └── Login/         # 登录页
│   ├── services/          # API服务
│   ├── contexts/          # React Context
│   ├── hooks/             # 自定义Hooks
│   └── types/             # TypeScript类型
├── public/                # 静态资源
├── dist/                  # 构建输出
├── package.json           # 依赖配置
└── vite.config.ts         # Vite配置
```

## 🔗 API配置

前端默认连接的后端API地址：
- 开发环境：`http://localhost:3000/api` (Node.js后端)
- Python API：`http://localhost:8000/api/v1` (FastAPI后端)

配置位置：`frontend/src/services/api.ts`

## 📝 页面功能

### 已实现页面

- ✅ **登录页** (`/login`) - 用户登录和2FA验证
- ✅ **概览页** (`/`) - 显示KPI卡片（回测、订单、策略等）
- ✅ **回测页** (`/backtest`) - 回测参数配置和结果展示
- ✅ **交易页** (`/trade`) - 交易引擎管理和实时数据
- ✅ **策略页** (`/strategies`) - 策略列表和管理
- ✅ **研报页** (`/reports`) - 研报列表和查看
- ✅ **Notebook页** (`/notebook`) - Jupyter Notebook集成

## 🛠️ 开发说明

### 环境变量

创建 `.env` 文件（可选）：

```env
VITE_API_BASE=http://localhost:8000/api/v1
```

### 代理配置

如果需要代理到后端，可以在 `vite.config.ts` 中配置：

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

## 📚 相关文档

- [前端实施计划](../frontend/IMPLEMENTATION_PLAN.md)
- [前端实施状态](../frontend/IMPLEMENTATION_STATUS.md)
- [前端实施完成](../frontend/IMPLEMENTATION_COMPLETE.md)

