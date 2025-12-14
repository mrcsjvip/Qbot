# API测试指南

## 前置条件

1. 安装依赖：
```bash
pip install fastapi uvicorn pydantic python-multipart backtrader tushare
```

2. 配置tushare token（如果需要）：
```python
import tushare as ts
ts.set_token('your_token')
```

## 启动服务

```bash
python qbot/api/run.py
```

服务启动后访问：http://localhost:8000/docs

## 测试回测API

### 1. 创建回测任务

**请求**:
```bash
curl -X POST "http://localhost:8000/api/v1/backtest" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "600000",
    "start_date": "20200101",
    "end_date": "20231201",
    "strategy": "单因子-简单移动均线(预留G)",
    "initial_cash": 100000,
    "commission": 0.001,
    "benchmark": "000300",
    "params": {}
  }'
```

**响应**:
```json
{
  "task_id": "bt_20231201_123456_abc123",
  "status": "pending",
  "created_at": "2023-12-01T12:34:56"
}
```

### 2. 查询回测结果

**请求**:
```bash
curl "http://localhost:8000/api/v1/backtest/bt_20231201_123456_abc123"
```

**响应（进行中）**:
```json
{
  "task_id": "bt_20231201_123456_abc123",
  "status": "running",
  "created_at": "2023-12-01T12:34:56"
}
```

**响应（完成）**:
```json
{
  "task_id": "bt_20231201_123456_abc123",
  "status": "completed",
  "total_return": 0.25,
  "annual_return": 0.08,
  "sharpe_ratio": 1.5,
  "max_drawdown": 0.15,
  "win_rate": 0.6,
  "total_trades": 50,
  "created_at": "2023-12-01T12:34:56",
  "completed_at": "2023-12-01T12:35:30"
}
```

### 3. 获取回测列表

**请求**:
```bash
curl "http://localhost:8000/api/v1/backtest?page=1&page_size=20"
```

## 使用Swagger UI测试

1. 访问 http://localhost:8000/docs
2. 找到 `/api/v1/backtest` 接口
3. 点击 "Try it out"
4. 填写请求参数
5. 点击 "Execute" 执行

## Python测试脚本

```python
import requests
import time

BASE_URL = "http://localhost:8000/api/v1"

# 创建回测任务
response = requests.post(f"{BASE_URL}/backtest", json={
    "code": "600000",
    "start_date": "20200101",
    "end_date": "20231201",
    "strategy": "单因子-简单移动均线(预留G)",
    "initial_cash": 100000,
    "commission": 0.001
})

task_id = response.json()["task_id"]
print(f"任务ID: {task_id}")

# 轮询查询结果
while True:
    response = requests.get(f"{BASE_URL}/backtest/{task_id}")
    result = response.json()
    print(f"状态: {result['status']}")
    
    if result["status"] == "completed":
        print(f"总收益率: {result.get('total_return', 0):.2%}")
        break
    elif result["status"] == "failed":
        print(f"错误: {result.get('error')}")
        break
    
    time.sleep(2)
```

