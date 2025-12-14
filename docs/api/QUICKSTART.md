# 快速启动指南

## 1. 安装依赖

```bash
pip install -r qbot/api/requirements.txt
```

## 2. 启动服务

```bash
python qbot/api/run.py
```

服务将在 http://localhost:8000 启动

## 3. 访问API文档

打开浏览器访问：http://localhost:8000/docs

## 4. 测试API

### 健康检查
```bash
curl http://localhost:8000/health
```

### 获取策略列表
```bash
curl http://localhost:8000/api/v1/strategies
```

### 获取K线数据
```bash
curl "http://localhost:8000/api/v1/data/kline?code=600000.SH&start_date=20200101&end_date=20231201"
```

## 常见问题

### 端口被占用
```bash
# 查找占用8000端口的进程
lsof -i :8000

# 停止进程
kill -9 <PID>
```

### 依赖缺失
```bash
pip install fastapi uvicorn backtrader pandas tushare
```

### easytrader导入警告
已自动修复，如果仍有问题，检查 `qbot/engine/trade/easytrader` 目录是否存在。

