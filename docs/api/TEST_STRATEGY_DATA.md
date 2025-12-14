# 策略和数据API测试指南

## 策略API

### 1. 获取策略列表

```bash
GET /api/v1/strategies
```

**查询参数**:
- `category` (可选): 策略分类，如：单因子、多因子、机器学习等

**示例**:
```bash
# 获取所有策略
curl http://localhost:8000/api/v1/strategies

# 获取单因子策略
curl http://localhost:8000/api/v1/strategies?category=单因子
```

**响应示例**:
```json
{
  "strategies": [
    {
      "name": "单因子-简单移动均线(预留G)",
      "description": "基于简单移动均线的单因子策略",
      "category": "单因子",
      "parameters": {},
      "available": true,
      "file_path": "qbot/strategies/bigger_than_ema_bt.py"
    }
  ],
  "total": 4
}
```

### 2. 获取策略分类列表

```bash
GET /api/v1/strategies/categories
```

**响应示例**:
```json
{
  "categories": ["单因子", "多因子", "机器学习", "优化算法", "其他"]
}
```

### 3. 获取策略详情

```bash
GET /api/v1/strategies/{strategy_name}
```

**示例**:
```bash
curl http://localhost:8000/api/v1/strategies/单因子-简单移动均线(预留G)
```

**响应示例**:
```json
{
  "name": "单因子-简单移动均线(预留G)",
  "description": "基于简单移动均线的单因子策略",
  "category": "单因子",
  "parameters": {
    "period": 10
  },
  "available": true,
  "file_path": "qbot/strategies/bigger_than_ema_bt.py",
  "code_example": "class BiggerThanEmaStrategy(bt.Strategy):..."
}
```

## 数据API

### 1. 获取K线数据（POST方式）

```bash
POST /api/v1/data/kline
Content-Type: application/json

{
  "code": "600000.SH",
  "start_date": "20200101",
  "end_date": "20231201",
  "ktype": "D",
  "autype": "qfq"
}
```

**参数说明**:
- `code`: 股票代码，如：600000.SH, 000001.SZ
- `start_date`: 开始日期，格式：YYYYMMDD
- `end_date`: 结束日期，格式：YYYYMMDD
- `ktype`: K线类型，可选：D(日K), W(周K), M(月K), 5(5分钟), 15(15分钟), 30(30分钟), 60(60分钟)
- `autype`: 复权类型，可选：qfq(前复权), hfq(后复权), None(不复权)

**响应示例**:
```json
{
  "code": "600000.SH",
  "start_date": "20200101",
  "end_date": "20231201",
  "ktype": "D",
  "autype": "qfq",
  "data": [
    {
      "date": "2020-01-02",
      "open": 12.5,
      "high": 12.8,
      "low": 12.3,
      "close": 12.6,
      "volume": 1000000,
      "amount": null
    }
  ],
  "total": 100
}
```

### 2. 获取K线数据（GET方式）

```bash
GET /api/v1/data/kline?code=600000.SH&start_date=20200101&end_date=20231201&ktype=D&autype=qfq
```

**示例**:
```bash
curl "http://localhost:8000/api/v1/data/kline?code=600000.SH&start_date=20200101&end_date=20231201&ktype=D&autype=qfq"
```

### 3. 获取股票列表（POST方式）

```bash
POST /api/v1/data/stocks
Content-Type: application/json

{
  "exchange": "",
  "list_status": "L",
  "limit": 100
}
```

**参数说明**:
- `exchange`: 交易所，可选：SSE(上交所), SZSE(深交所), 空字符串表示全部
- `list_status`: 上市状态，可选：L(上市), D(退市), P(暂停)
- `limit`: 返回数量限制（1-5000）

**响应示例**:
```json
{
  "stocks": [
    {
      "code": "600000.SH",
      "name": "浦发银行",
      "market": "SH",
      "list_date": "19991110",
      "industry": "银行"
    }
  ],
  "total": 100
}
```

### 4. 获取股票列表（GET方式）

```bash
GET /api/v1/data/stocks?exchange=&list_status=L&limit=100
```

**示例**:
```bash
curl "http://localhost:8000/api/v1/data/stocks?exchange=&list_status=L&limit=100"
```

### 5. 获取股票信息

```bash
GET /api/v1/data/stocks/{code}
```

**示例**:
```bash
curl http://localhost:8000/api/v1/data/stocks/600000.SH
```

**响应示例**:
```json
{
  "code": "600000.SH",
  "name": "浦发银行",
  "market": "SH",
  "list_date": "19991110",
  "industry": "银行"
}
```

## 测试步骤

### 1. 测试策略API

```bash
# 获取策略列表
curl http://localhost:8000/api/v1/strategies

# 获取策略分类
curl http://localhost:8000/api/v1/strategies/categories

# 获取策略详情
curl http://localhost:8000/api/v1/strategies/单因子-简单移动均线(预留G)
```

### 2. 测试数据API

```bash
# 获取K线数据
curl "http://localhost:8000/api/v1/data/kline?code=600000.SH&start_date=20200101&end_date=20231201&ktype=D&autype=qfq"

# 获取股票列表
curl "http://localhost:8000/api/v1/data/stocks?limit=10"

# 获取股票信息
curl http://localhost:8000/api/v1/data/stocks/600000.SH
```

## 注意事项

### 1. tushare接口限制

- `get_k_data`接口即将停止更新，建议使用Pro版接口
- Pro版接口需要token，需要在`data_service.py`中配置
- 如果没有Pro版token，基础接口仍可使用，但功能受限

### 2. 股票代码格式

- 上海交易所：`600000.SH` 或 `600000`
- 深圳交易所：`000001.SZ` 或 `000001`
- 指数：`000300.SH`（沪深300）

### 3. 日期格式

- API使用格式：`YYYYMMDD`，如：`20200101`
- tushare内部会转换为：`YYYY-MM-DD`

### 4. K线类型

- `D`: 日K线
- `W`: 周K线
- `M`: 月K线
- `5`, `15`, `30`, `60`: 分钟K线

### 5. 复权类型

- `qfq`: 前复权（推荐）
- `hfq`: 后复权
- `None`: 不复权

## 常见问题

### Q: 获取K线数据返回空列表

A: 可能的原因：
1. 日期范围不正确
2. 股票代码格式错误
3. tushare接口限制（需要Pro版token）

### Q: 获取股票列表返回空列表

A: 股票列表功能需要tushare Pro版接口，如果没有token，会返回空列表。可以考虑：
1. 申请tushare Pro版token
2. 使用其他数据源（如akshare）
3. 使用本地股票代码列表

### Q: 策略详情中code_example为空

A: 可能是策略类无法正常导入，检查策略文件是否有语法错误或依赖缺失。

