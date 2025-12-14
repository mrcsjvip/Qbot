# 服务运行机制详解

## 1. 服务如何启动

### 启动脚本 (run.py)

```python
# qbot/api/run.py
import sys
from pathlib import Path

# 1. 设置Python路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "qbot" / "engine" / "trade"))

# 2. 启动Uvicorn服务器
uvicorn.run("qbot.api.main:app", host="0.0.0.0", port=8000, reload=True)
```

**执行流程**：
1. 设置Python路径，确保能找到qbot模块
2. 导入FastAPI应用 (`qbot.api.main:app`)
3. Uvicorn启动HTTP服务器
4. 监听 `http://0.0.0.0:8000`

### FastAPI应用初始化 (main.py)

```python
# qbot/api/main.py
from fastapi import FastAPI
from qbot.api.routers import backtest, trade, strategy, data

app = FastAPI()

# 注册路由
app.include_router(backtest.router, prefix="/api/v1/backtest")
app.include_router(trade.router, prefix="/api/v1/trade")
app.include_router(strategy.router, prefix="/api/v1/strategies")
app.include_router(data.router, prefix="/api/v1/data")
```

**执行流程**：
1. 创建FastAPI应用实例
2. 导入各个路由模块
3. 注册路由到应用
4. 配置CORS中间件

## 2. API如何调用Python服务

### 示例：回测API调用链

```
步骤1: HTTP请求到达
POST /api/v1/backtest
Body: {"code": "600000", "strategy": "单因子-简单移动均线"}

步骤2: FastAPI路由匹配
qbot/api/routers/backtest.py
@router.post("/backtest")
async def create_backtest_task(request: BacktestRequest):
    # 调用服务层
    result = backtest_service.create_backtest(request)
    return result

步骤3: 服务层处理
qbot/api/services/backtest_service.py
class BacktestService:
    def create_backtest(self, request):
        # 获取策略类（调用strategy_mapper）
        strategy_class = get_strategy_class(request.strategy)
        
        # 调用Backtrader（现有Python代码）
        cerebro = bt.Cerebro()
        cerebro.addstrategy(strategy_class)
        cerebro.run()
        
        return result

步骤4: 调用现有Python代码
qbot/strategies/bigger_than_ema_bt.py
class BiggerThanEmaStrategy(bt.Strategy):
    def next(self):
        # 策略逻辑
        if self.data.close > self.ema:
            self.buy()

步骤5: 返回结果
{"task_id": "xxx", "status": "running"}
```

### 关键代码示例

#### 路由层 (routers/backtest.py)

```python
from fastapi import APIRouter
from qbot.api.services.backtest_service import BacktestService

router = APIRouter()
backtest_service = BacktestService()

@router.post("/backtest")
async def create_backtest_task(request: BacktestRequest):
    # 直接调用服务层
    result = backtest_service.create_backtest(request)
    return result
```

#### 服务层 (services/backtest_service.py)

```python
import backtrader as bt
from qbot.api.services.strategy_mapper import get_strategy_class

class BacktestService:
    def create_backtest(self, request):
        # 1. 获取策略类（从现有策略文件导入）
        strategy_class = get_strategy_class(request.strategy)
        
        # 2. 调用Backtrader（现有Python库）
        cerebro = bt.Cerebro()
        cerebro.addstrategy(strategy_class)
        
        # 3. 获取数据（调用tushare）
        df = ts.get_k_data(request.code, ...)
        data = bt.feeds.PandasData(dataname=df)
        cerebro.adddata(data)
        
        # 4. 执行回测
        cerebro.run()
        
        return result
```

#### 策略映射 (services/strategy_mapper.py)

```python
STRATEGY_MODULE_MAP = {
    "单因子-简单移动均线": ("qbot.strategies.bigger_than_ema_bt", "BiggerThanEmaStrategy"),
    ...
}

def get_strategy_class(strategy_name):
    module_path, class_name = STRATEGY_MODULE_MAP[strategy_name]
    module = importlib.import_module(module_path)
    return getattr(module, class_name)
```

## 3. 服务层如何封装现有代码

### 原则：只封装，不修改

服务层的作用是：
1. **转换格式**：将API请求转换为现有代码需要的格式
2. **调用封装**：调用现有的Python代码
3. **结果转换**：将现有代码的结果转换为API响应格式

### 示例：交易服务封装

```python
# services/trade_service.py
from qbot.engine.trade.trade_engine import TradeEngine

class TradeService:
    def start_trade(self, request, user_id):
        # 1. 转换格式：API请求 -> 交易引擎需要的格式
        trade_opts = {
            "class": "虚拟盘" if request.trade_type == "sim" else "实盘",
            "platform": request.platform,
            "trade_code": request.trade_code,
            "strategy": request.strategy,
        }
        
        # 2. 调用现有代码：TradeEngine
        trade_engine = TradeEngine(trade_opts, syslog_obj)
        trade_engine.login()
        trade_engine.start_trade()
        
        # 3. 转换结果：返回API格式
        return {"engine_id": engine_id, "status": "running"}
```

### 示例：数据服务封装

```python
# services/data_service.py
import tushare as ts

class DataService:
    def get_kline_data(self, code, start_date, end_date):
        # 1. 转换日期格式：YYYYMMDD -> YYYY-MM-DD
        start = f"{start_date[:4]}-{start_date[4:6]}-{start_date[6:8]}"
        end = f"{end_date[:4]}-{end_date[4:6]}-{end_date[6:8]}"
        
        # 2. 调用现有代码：tushare
        df = ts.get_k_data(code, start=start, end=end)
        
        # 3. 转换结果：DataFrame -> API格式
        return [KLineDataPoint(date=row['date'], ...) for _, row in df.iterrows()]
```

## 4. 异步处理机制

### 长时间运行的任务

回测任务可能需要几分钟甚至更长时间，不能阻塞API响应：

```python
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

class BacktestService:
    def create_backtest(self, request):
        task_id = str(uuid.uuid4())
        
        # 立即返回，任务在后台执行
        executor.submit(self._run_backtest_sync, request, task_id)
        
        return {"task_id": task_id, "status": "pending"}
    
    def _run_backtest_sync(self, request, task_id):
        # 实际执行回测（在后台线程）
        cerebro = bt.Cerebro()
        # ... 执行回测
```

### WebSocket实时推送

```python
@router.websocket("/engines/{engine_id}/stream")
async def trade_stream(websocket: WebSocket, engine_id: str):
    await websocket.accept()
    
    while True:
        # 获取实时数据
        account = trade_service.get_account_info(engine_id)
        
        # 推送给客户端
        await websocket.send_json({
            "type": "account",
            "data": account.dict()
        })
        
        await asyncio.sleep(5)  # 每5秒推送一次
```

## 总结

1. **启动**：`run.py` -> 设置路径 -> 导入应用 -> 启动Uvicorn
2. **路由**：HTTP请求 -> FastAPI路由匹配 -> 调用服务层
3. **服务**：服务层封装现有Python代码 -> 调用业务逻辑
4. **响应**：业务逻辑结果 -> 转换为API格式 -> 返回JSON

**关键点**：
- API层只做路由和格式转换
- 服务层只做封装，不重写业务逻辑
- 现有Python代码保持不变
- 异步处理长时间运行的任务
