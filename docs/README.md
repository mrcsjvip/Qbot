# Qbot API 文档

## 快速开始

### 启动后端服务

```bash
# 方式1：使用Python脚本（推荐）
python qbot/api/run.py

# 方式2：使用Shell脚本
bash qbot/api/start.sh

# 方式3：使用uvicorn
uvicorn qbot.api.main:app --host 0.0.0.0 --port 8000 --reload
```

服务启动后访问：
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

### 安装依赖

```bash
pip install -r qbot/api/requirements.txt
```

## API端点

### 回测API
- `POST /api/v1/backtest` - 创建回测任务
- `GET /api/v1/backtest/{task_id}` - 查询回测结果
- `GET /api/v1/backtest` - 获取回测列表

### 交易API
- `POST /api/v1/trade/start` - 启动交易引擎
- `POST /api/v1/trade/stop/{engine_id}` - 停止交易引擎
- `GET /api/v1/trade/engines` - 获取交易引擎列表
- `GET /api/v1/trade/engines/{engine_id}/account` - 获取账户信息
- `GET /api/v1/trade/engines/{engine_id}/positions` - 获取持仓

### 策略API
- `GET /api/v1/strategies` - 获取策略列表
- `GET /api/v1/strategies/categories` - 获取策略分类
- `GET /api/v1/strategies/{strategy_name}` - 获取策略详情

### 数据API
- `POST/GET /api/v1/data/kline` - 获取K线数据
- `POST/GET /api/v1/data/stocks` - 获取股票列表
- `GET /api/v1/data/stocks/{code}` - 获取股票信息

## 详细文档

- [API测试指南](api/TEST.md)
- [交易API测试](api/TEST_TRADE.md)
- [策略和数据API测试](api/TEST_STRATEGY_DATA.md)
- [常见问题](api/FAQ.md)
