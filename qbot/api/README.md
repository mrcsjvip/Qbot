# Qbot API 模块

## 快速开始

### 1. 安装依赖

```bash
pip install -r qbot/api/requirements.txt
```

或者手动安装：

```bash
pip install fastapi uvicorn pydantic python-multipart
```

### 2. 启动服务

```bash
# 方式1：使用run.py
python qbot/api/run.py

# 方式2：使用uvicorn直接启动
uvicorn qbot.api.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 访问API文档

启动服务后，访问以下地址：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **健康检查**: http://localhost:8000/health

## API接口

### 回测相关

- `POST /api/v1/backtest` - 创建回测任务
- `GET /api/v1/backtest/{task_id}` - 获取回测结果
- `GET /api/v1/backtest` - 获取回测列表

### 示例请求

```bash
# 创建回测任务
curl -X POST "http://localhost:8000/api/v1/backtest" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "600000",
    "start_date": "20200101",
    "end_date": "20231201",
    "strategy": "单因子-简单移动均线(预留G)",
    "initial_cash": 100000,
    "commission": 0.001
  }'

# 查询回测结果
curl "http://localhost:8000/api/v1/backtest/bt_20231201_123456_abc123"
```

## 目录结构

```
qbot/api/
├── __init__.py
├── main.py              # FastAPI应用入口
├── run.py               # 启动脚本
├── requirements.txt     # 依赖列表
│
├── routers/             # 路由模块
│   ├── __init__.py
│   └── backtest.py      # 回测相关API
│
├── schemas/             # 数据模型（Pydantic）
│   ├── __init__.py
│   └── backtest.py
│
└── services/            # 服务层（封装现有逻辑）
    ├── __init__.py
    ├── backtest_service.py
    └── strategy_mapper.py
```

## 开发指南

### 添加新的API接口

1. 在 `schemas/` 中定义数据模型
2. 在 `services/` 中实现服务逻辑（封装现有代码）
3. 在 `routers/` 中定义路由
4. 在 `main.py` 中注册路由

### 代码复用原则

- **服务层只做封装**：不修改现有业务逻辑代码
- **保持接口一致性**：API参数和返回值格式统一
- **错误处理**：统一处理异常，返回友好的错误信息
- **日志记录**：复用现有的日志系统

## 注意事项

1. **策略映射**：需要在 `strategy_mapper.py` 中添加策略名称到策略类的映射
2. **数据获取**：确保tushare或其他数据源已配置
3. **异步任务**：长时间运行的回测任务建议使用Celery等任务队列
4. **数据存储**：任务状态应存储在数据库中，而不是内存

## 下一步

参考 `前后端分离实施检查清单.md` 继续实施其他功能模块。
