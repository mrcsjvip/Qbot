# API架构说明

## 服务运行机制

### 1. 服务启动流程

```
启动脚本 (run.py)
    ↓
设置Python路径 (sys.path)
    ↓
导入FastAPI应用 (main.py)
    ↓
注册路由 (routers)
    ↓
启动Uvicorn服务器
    ↓
监听 http://0.0.0.0:8000
```

### 2. 请求处理流程

```
HTTP请求
    ↓
FastAPI路由匹配 (routers/*.py)
    ↓
调用服务层 (services/*.py)
    ↓
封装现有Python代码 (qbot/engine/*, qbot/strategies/*)
    ↓
返回JSON响应
```

## 架构层次

### 层次1: API路由层 (routers/)

**职责**: 定义HTTP端点，处理请求/响应

**位置**: `qbot/api/routers/`

**示例**: `backtest.py`, `trade.py`, `strategy.py`, `data.py`

```python
# qbot/api/routers/backtest.py
@router.post("/backtest")
async def create_backtest_task(request: BacktestRequest):
    # 调用服务层
    result = backtest_service.create_backtest(request)
    return result
```

### 层次2: 服务层 (services/)

**职责**: 封装业务逻辑，调用现有Python代码

**位置**: `qbot/api/services/`

**示例**: `backtest_service.py`, `trade_service.py`, `strategy_service.py`

```python
# qbot/api/services/backtest_service.py
class BacktestService:
    def create_backtest(self, request):
        # 调用现有的Backtrader代码
        cerebro = bt.Cerebro()
        strategy_class = get_strategy_class(request.strategy)
        cerebro.addstrategy(strategy_class)
        # ... 执行回测
        return result
```

### 层次3: 现有Python代码

**职责**: 实际的业务逻辑实现

**位置**: `qbot/engine/`, `qbot/strategies/`, `qbot/data/`

**示例**: 
- `qbot/engine/trade/trade_engine.py` - 交易引擎
- `qbot/strategies/*.py` - 策略实现
- `backtrader` - 回测框架

## 调用链示例

### 示例1: 创建回测任务

```
1. HTTP请求
   POST /api/v1/backtest
   Body: {"code": "600000", "start_date": "20200101", ...}

2. 路由层 (routers/backtest.py)
   @router.post("/backtest")
   async def create_backtest_task(request: BacktestRequest):
       ↓
3. 服务层 (services/backtest_service.py)
   backtest_service.create_backtest(request)
       ↓
4. 策略映射 (services/strategy_mapper.py)
   get_strategy_class("单因子-简单移动均线")
       ↓
5. 导入策略类 (qbot/strategies/bigger_than_ema_bt.py)
   from qbot.strategies.bigger_than_ema_bt import BiggerThanEmaStrategy
       ↓
6. 调用Backtrader (backtrader库)
   cerebro = bt.Cerebro()
   cerebro.addstrategy(BiggerThanEmaStrategy)
   cerebro.run()
       ↓
7. 返回结果
   {"task_id": "xxx", "status": "running"}
```

### 示例2: 启动交易引擎

```
1. HTTP请求
   POST /api/v1/trade/start
   Body: {"trade_type": "sim", "platform": "掘金", ...}

2. 路由层 (routers/trade.py)
   @router.post("/start")
   async def start_trade(request: TradeStartRequest):
       ↓
3. 服务层 (services/trade_service.py)
   trade_service.start_trade(request, user_id)
       ↓
4. 封装交易选项
   trade_opts = {
       "class": "虚拟盘",
       "platform": "掘金",
       ...
   }
       ↓
5. 调用现有交易引擎 (qbot/engine/trade/trade_engine.py)
   trade_engine = TradeEngine(trade_opts, syslog_obj)
   trade_engine.login()
   trade_engine.start_trade()
       ↓
6. 返回结果
   {"engine_id": "xxx", "status": "running"}
```

## 代码复用原则

### 1. 服务层只做封装

**不修改**现有业务逻辑代码，只做调用封装：

```python
# ✅ 正确：封装调用
class BacktestService:
    def create_backtest(self, request):
        # 调用现有的Backtrader代码
        cerebro = bt.Cerebro()
        # ... 使用现有代码
        return result

# ❌ 错误：重写业务逻辑
class BacktestService:
    def create_backtest(self, request):
        # 不要重写回测逻辑
        # 应该调用现有的回测代码
```

### 2. 保持接口一致性

API参数和返回值格式统一：

```python
# 统一的请求格式
class BacktestRequest(BaseModel):
    code: str
    start_date: str
    strategy: str
    ...

# 统一的响应格式
class BacktestResponse(BaseModel):
    task_id: str
    status: str
    ...
```

### 3. 错误处理

统一处理异常，返回友好的错误信息：

```python
try:
    result = backtest_service.create_backtest(request)
    return result
except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    raise HTTPException(status_code=500, detail="Internal server error")
```

## 目录结构

```
qbot/api/
├── main.py                 # FastAPI应用入口，注册所有路由
├── run.py                  # 启动脚本
│
├── routers/                # API路由层
│   ├── backtest.py        # 回测API路由
│   ├── trade.py           # 交易API路由
│   ├── strategy.py        # 策略API路由
│   └── data.py            # 数据API路由
│
├── services/               # 服务层（封装现有代码）
│   ├── backtest_service.py    # 封装Backtrader回测
│   ├── trade_service.py       # 封装TradeEngine交易
│   ├── strategy_service.py    # 封装策略管理
│   ├── data_service.py        # 封装数据查询
│   └── strategy_mapper.py     # 策略名称映射
│
└── schemas/                # 数据模型（Pydantic）
    ├── backtest.py
    ├── trade.py
    ├── strategy.py
    └── data.py
```

## 现有代码调用

### Backtrader回测

```python
# services/backtest_service.py
import backtrader as bt
from qbot.api.services.strategy_mapper import get_strategy_class

# 调用Backtrader
cerebro = bt.Cerebro()
strategy_class = get_strategy_class(request.strategy)
cerebro.addstrategy(strategy_class)
cerebro.run()
```

### TradeEngine交易

```python
# services/trade_service.py
from qbot.engine.trade.trade_engine import TradeEngine

# 调用现有交易引擎
trade_engine = TradeEngine(trade_opts, syslog_obj)
trade_engine.login()
trade_engine.start_trade()
```

### Tushare数据

```python
# services/data_service.py
import tushare as ts

# 调用Tushare获取数据
df = ts.get_k_data(code, start=start_date, end=end_date)
```

## 异步处理

### 回测任务（长时间运行）

```python
# 使用线程池异步执行
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

def create_backtest(self, request):
    task_id = str(uuid.uuid4())
    # 提交到线程池异步执行
    executor.submit(self._run_backtest_sync, request, task_id)
    return {"task_id": task_id, "status": "pending"}
```

### WebSocket实时推送

```python
# routers/trade.py
@router.websocket("/engines/{engine_id}/stream")
async def trade_stream(websocket: WebSocket, engine_id: str):
    while True:
        # 获取实时数据并推送
        account = trade_service.get_account_info(engine_id)
        await websocket.send_json({"type": "account", "data": account.dict()})
        await asyncio.sleep(5)
```

## 总结

1. **API层** (routers/) - 定义HTTP端点
2. **服务层** (services/) - 封装现有Python代码
3. **现有代码** (qbot/engine/, qbot/strategies/) - 实际业务逻辑

**关键点**：
- 服务层只做封装，不重写业务逻辑
- 保持现有代码不变
- 通过API层暴露功能给前端
- 异步处理长时间运行的任务

