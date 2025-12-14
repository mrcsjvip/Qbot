# API调用流程图

## 完整调用流程

```
┌─────────────────────────────────────────────────────────────┐
│                      HTTP请求                               │
│  POST /api/v1/backtest                                      │
│  {"code": "600000", "strategy": "单因子-简单移动均线"}      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               FastAPI路由层 (routers/)                      │
│  qbot/api/routers/backtest.py                              │
│                                                             │
│  @router.post("/backtest")                                 │
│  async def create_backtest_task(request):                   │
│      result = backtest_service.create_backtest(request)    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               服务层 (services/)                            │
│  qbot/api/services/backtest_service.py                     │
│                                                             │
│  class BacktestService:                                     │
│      def create_backtest(self, request):                   │
│          # 1. 获取策略类                                    │
│          strategy_class = get_strategy_class(...)          │
│          # 2. 调用Backtrader                               │
│          cerebro = bt.Cerebro()                            │
│          cerebro.addstrategy(strategy_class)               │
│          cerebro.run()                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           现有Python代码 (qbot/strategies/)                 │
│  qbot/strategies/bigger_than_ema_bt.py                     │
│                                                             │
│  class BiggerThanEmaStrategy(bt.Strategy):                  │
│      def next(self):                                       │
│          # 策略逻辑                                         │
│          if self.data.close > self.ema:                    │
│              self.buy()                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              第三方库 (backtrader)                          │
│  backtrader库执行回测                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   返回JSON响应                              │
│  {"task_id": "xxx", "status": "running"}                   │
└─────────────────────────────────────────────────────────────┘
```

## 交易API调用流程

```
HTTP请求: POST /api/v1/trade/start
    │
    ▼
routers/trade.py
    │
    ▼
services/trade_service.py
    │
    ├─► 封装trade_opts
    │
    ▼
qbot/engine/trade/trade_engine.py
    │
    ├─► TradeEngine.__init__()
    │   ├─► 判断trade_type (sim/real)
    │   └─► 创建SimTradeEngine或RealTradeEngine
    │
    ▼
qbot/engine/trade/trade_sim.py (或trade_real.py)
    │
    ├─► SimTradeEngine.__init__()
    │   ├─► 根据platform选择交易接口
    │   └─► 初始化StockTradeEngine
    │
    ▼
qbot/engine/trade/engine_apis/stocks/stock_engine.py
    │
    └─► 调用easytrader或掘金等平台API
```

## 数据API调用流程

```
HTTP请求: GET /api/v1/data/kline?code=600000.SH&...
    │
    ▼
routers/data.py
    │
    ▼
services/data_service.py
    │
    ├─► get_kline_data()
    │
    ▼
tushare库
    │
    ├─► ts.get_k_data(code, start, end)
    │
    ▼
返回K线数据
```

## 关键点说明

### 1. 路由注册

在 `main.py` 中注册所有路由：

```python
# qbot/api/main.py
from qbot.api.routers import backtest, trade, strategy, data

app.include_router(backtest.router, prefix="/api/v1/backtest")
app.include_router(trade.router, prefix="/api/v1/trade")
app.include_router(strategy.router, prefix="/api/v1/strategies")
app.include_router(data.router, prefix="/api/v1/data")
```

### 2. 服务层封装

服务层不重写业务逻辑，只做调用封装：

```python
# ✅ 正确：调用现有代码
class BacktestService:
    def create_backtest(self, request):
        # 调用Backtrader（现有代码）
        cerebro = bt.Cerebro()
        strategy_class = get_strategy_class(request.strategy)
        cerebro.addstrategy(strategy_class)
        cerebro.run()

# ❌ 错误：重写业务逻辑
class BacktestService:
    def create_backtest(self, request):
        # 不要重写回测逻辑
        pass
```

### 3. 异步处理

长时间运行的任务使用线程池异步执行：

```python
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

def create_backtest(self, request):
    task_id = str(uuid.uuid4())
    # 异步执行，立即返回
    executor.submit(self._run_backtest_sync, request, task_id)
    return {"task_id": task_id, "status": "pending"}
```

### 4. 错误处理

统一处理异常：

```python
try:
    result = service.method(request)
    return result
except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    logger.error(f"Error: {e}", exc_info=True)
    raise HTTPException(status_code=500, detail="Internal server error")
```

