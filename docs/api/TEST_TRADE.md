# 交易功能API测试指南

## 概述

交易功能API提供了启动、停止交易引擎，查询账户信息、持仓、系统日志等功能。

## API端点

### 1. 启动交易

```bash
POST /api/v1/trade/start
Content-Type: application/json

{
  "trade_type": "sim",  # sim(模拟) 或 real(实盘)
  "platform": "掘金",   # 交易平台
  "trade_code": "399006.SZ",  # 交易标的代码
  "strategy": "单因子-相对强弱指数RSI",  # 策略名称
  "trade_opts": {}  # 可选：其他交易选项
}
```

**响应示例**:
```json
{
  "engine_id": "default_user_399006.SZ_abc12345",
  "status": "running"
}
```

### 2. 停止交易

```bash
POST /api/v1/trade/stop/{engine_id}
```

**响应示例**:
```json
{
  "status": "stopped",
  "engine_id": "default_user_399006.SZ_abc12345"
}
```

### 3. 获取交易引擎列表

```bash
GET /api/v1/trade/engines?user_id=default_user
```

**响应示例**:
```json
[
  {
    "engine_id": "default_user_399006.SZ_abc12345",
    "status": "running",
    "trade_type": "sim",
    "platform": "掘金",
    "trade_code": "399006.SZ",
    "strategy": "单因子-相对强弱指数RSI",
    "created_at": "2024-12-14T10:00:00",
    "last_update": "2024-12-14T10:05:00"
  }
]
```

### 4. 获取交易引擎状态

```bash
GET /api/v1/trade/engines/{engine_id}/status
```

### 5. 获取账户信息

```bash
GET /api/v1/trade/engines/{engine_id}/account
```

**响应示例**:
```json
{
  "cash": 100000.0,
  "market_value": 50000.0,
  "total_assets": 150000.0,
  "available_cash": 100000.0
}
```

### 6. 获取持仓

```bash
GET /api/v1/trade/engines/{engine_id}/positions
```

**响应示例**:
```json
[
  {
    "code": "399006.SZ",
    "name": "创业板指",
    "quantity": 1000,
    "cost": 10.5,
    "current_price": 11.2,
    "profit": 700.0,
    "profit_rate": 0.0667
  }
]
```

### 7. 获取系统日志

```bash
GET /api/v1/trade/engines/{engine_id}/logs?limit=100
```

**响应示例**:
```json
{
  "logs": [
    "TradeEngine start init ...",
    "SimTradeEngine start init ...",
    "登录成功"
  ],
  "count": 3
}
```

### 8. WebSocket实时数据流

```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/trade/engines/{engine_id}/stream');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到数据:', data);
  // data.type: "account" 或 "positions"
  // data.data: 对应的数据对象
};
```

## 测试步骤

### 1. 启动交易引擎

```bash
curl -X POST http://localhost:8000/api/v1/trade/start \
  -H "Content-Type: application/json" \
  -d '{
    "trade_type": "sim",
    "platform": "掘金",
    "trade_code": "399006.SZ",
    "strategy": "单因子-相对强弱指数RSI"
  }'
```

### 2. 查询引擎状态

```bash
# 获取引擎ID（从步骤1的响应中）
ENGINE_ID="default_user_399006.SZ_abc12345"

# 查询状态
curl http://localhost:8000/api/v1/trade/engines/$ENGINE_ID/status

# 查询账户信息
curl http://localhost:8000/api/v1/trade/engines/$ENGINE_ID/account

# 查询持仓
curl http://localhost:8000/api/v1/trade/engines/$ENGINE_ID/positions

# 查询日志
curl http://localhost:8000/api/v1/trade/engines/$ENGINE_ID/logs?limit=50
```

### 3. 停止交易引擎

```bash
curl -X POST http://localhost:8000/api/v1/trade/stop/$ENGINE_ID
```

## 注意事项

1. **依赖要求**: 交易功能需要安装`easytrader`模块。如果项目中有本地版本的easytrader，确保Python路径正确。

2. **模拟交易**: 使用`trade_type: "sim"`进行模拟交易，不会产生实际资金变动。

3. **实盘交易**: 使用`trade_type: "real"`进行实盘交易，需要配置真实的交易账户信息。

4. **平台支持**: 目前支持的平台包括：
   - 掘金
   - 华泰证券
   - 通达信
   - 银河证券
   - 同花顺
   - 雪球

5. **错误处理**: 如果交易引擎启动失败，API会返回500错误，错误信息会包含具体原因。

6. **WebSocket**: WebSocket连接用于实时推送交易数据，每5秒推送一次账户和持仓信息。

## 常见问题

### Q: 启动交易时提示"交易引擎模块未安装"

A: 需要确保easytrader模块可以导入。如果项目中有本地版本的easytrader，确保Python路径包含`qbot/engine/trade`目录。

### Q: 如何配置交易账户？

A: 交易账户配置在`qbot/engine/config`目录下的配置文件中，包括：
- `STOCK_SIM_ACCOUNT` - 股票模拟账户
- `STOCK_REAL_ACCOUNT` - 股票实盘账户
- `FUNDS_SIM_ACCOUNT` - 基金模拟账户
- `FUTURES_SIM_ACCOUNT` - 期货模拟账户

### Q: WebSocket连接断开怎么办？

A: WebSocket连接断开可能是由于网络问题或服务重启。客户端应该实现重连机制。

