# Qbot Python API 后端服务

## 🚀 快速启动

### 1. 安装依赖

```bash
pip install -r qbot/api/requirements.txt
```

### 2. 启动服务

```bash
python qbot/api/run.py
```

### 3. 访问API文档

打开浏览器访问：**http://localhost:8000/docs**

## 📡 API端点

- **回测**: `/api/v1/backtest`
- **交易**: `/api/v1/trade`
- **策略**: `/api/v1/strategies`
- **数据**: `/api/v1/data`

## 📚 详细文档

查看 [docs/](docs/) 目录获取完整文档。

## 🔧 常见问题

### 端口被占用
```bash
# 修改端口（编辑 qbot/api/run.py）
uvicorn.run(..., port=8001)
```

### 依赖缺失
```bash
pip install fastapi uvicorn backtrader pandas tushare
```

更多问题请查看 [docs/api/FAQ.md](docs/api/FAQ.md)

