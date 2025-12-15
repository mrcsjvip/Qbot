"""
回测服务层 - 封装现有的回测引擎
"""
import uuid
import threading
from datetime import datetime
from typing import Dict, Any, Optional
import os
from pathlib import Path
import backtrader as bt
import pandas as pd
import tushare as ts

from qbot.common.logging.logger import LOGGER as logger
from qbot.api.schemas.backtest import BacktestCreateRequest, BacktestResult, TradeRecord
from qbot.api.services.strategy_mapper import get_strategy_class


class BacktestService:
    """回测服务"""

    def __init__(self):
        self.tasks: Dict[str, Dict[str, Any]] = {}  # 任务存储（实际应使用数据库）

    def create_backtest_task(self,
                             request: BacktestCreateRequest) -> Dict[str, Any]:
        """
        创建回测任务

        复用现有的回测逻辑，这里需要根据实际的回测引擎实现来调用
        """
        task_id = f"bt_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"

        # 准备回测参数（复用现有代码的参数格式）
        backtest_params = {
            "code": request.code,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "strategy": request.strategy,
            "initial_cash": request.initial_cash,
            "commission": request.commission,
            "benchmark": request.benchmark,
            "period": request.period,
            "authority": request.authority,
            "params": request.params or {}
        }

        # 存储任务信息
        self.tasks[task_id] = {
            "task_id": task_id,
            "status": "pending",
            "params": backtest_params,
            "created_at": datetime.now(),
            "result": None,
            "error": None
        }

        # 异步执行回测（使用线程，实际应使用任务队列如Celery）
        thread = threading.Thread(target=self._run_backtest,
                                  args=(task_id, backtest_params))
        thread.daemon = True
        thread.start()

        return {
            "task_id": task_id,
            "status": "pending",
            "created_at": self.tasks[task_id]["created_at"]
        }

    def _run_backtest(self, task_id: str, params: Dict[str, Any]):
        """
        执行回测（复用现有回测引擎 - Backtrader）
        """
        try:
            self.tasks[task_id]["status"] = "running"
            logger.info(f"开始执行回测任务: {task_id}, 参数: {params}")

            # 获取策略类
            strategy_class = get_strategy_class(params["strategy"])
            if strategy_class is None:
                raise ValueError(f"策略 '{params['strategy']}' 不存在或未实现")

            # 获取数据 (tushare pro)
            code = params["code"]
            start_date = params["start_date"]
            end_date = params["end_date"]

            # 读取 tushare token（优先环境变量，若缺失尝试从 config/tushare.env 加载）
            token = os.getenv("TUSHARE_TOKEN")
            if not token:
                env_file = Path(
                    __file__).resolve().parents[3] / "config" / "tushare.env"
                if env_file.exists():
                    for line in env_file.read_text().splitlines():
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        if k.strip() == "TUSHARE_TOKEN" and v.strip():
                            token = v.strip()
                            os.environ["TUSHARE_TOKEN"] = token
                            break
            if not token:
                raise ValueError("缺少 TUSHARE_TOKEN 环境变量，无法调用 tushare pro")
            pro = ts.pro_api(token)

            df = pro.query(
                "daily",
                ts_code=code,
                start_date=start_date.replace("-", ""),
                end_date=end_date.replace("-", ""),
            )
            if df is None or df.empty:
                raise ValueError(f"无法获取股票 {code} 的数据")

            df["trade_date"] = pd.to_datetime(df["trade_date"])
            df = df.sort_values("trade_date").set_index("trade_date")
            df.rename(columns={"vol": "volume"}, inplace=True)
            df["openinterest"] = 0
            df = df[["open", "high", "low", "close", "volume", "openinterest"]]

            # 创建Cerebro引擎（复用Backtrader）
            cerebro = bt.Cerebro()

            # 添加数据
            start_dt = pd.to_datetime(start_date)
            end_dt = pd.to_datetime(end_date)
            data = bt.feeds.PandasData(dataname=df,
                                       fromdate=start_dt,
                                       todate=end_dt)
            cerebro.adddata(data)

            # 添加策略（支持策略参数）
            strategy_params = params.get("params", {})
            cerebro.addstrategy(strategy_class, **strategy_params)

            # 设置初始资金
            cerebro.broker.setcash(params["initial_cash"])

            # 设置手续费
            cerebro.broker.setcommission(commission=params["commission"])

            # 添加性能分析器
            cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')
            cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
            cerebro.addanalyzer(bt.analyzers.Returns, _name='returns')
            cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name='trades')

            # 运行回测
            initial_value = cerebro.broker.getvalue()
            logger.info(f"初始资金: {initial_value}")

            strategies = cerebro.run()
            strategy_result = strategies[0]

            # 获取最终资金
            final_value = cerebro.broker.getvalue()
            total_return = (final_value - initial_value) / initial_value

            # 获取分析结果
            sharpe_analysis = strategy_result.analyzers.sharpe.get_analysis()
            drawdown_analysis = strategy_result.analyzers.drawdown.get_analysis(
            )
            returns_analysis = strategy_result.analyzers.returns.get_analysis()
            trades_analysis = strategy_result.analyzers.trades.get_analysis()

            # 计算年化收益率
            days = (end_dt - start_dt).days
            years = days / 365.0
            annual_return = (1 + total_return)**(1 /
                                                 years) - 1 if years > 0 else 0

            # 计算胜率
            total_trades = trades_analysis.get("total",
                                               {}).get("total",
                                                       {}).get("total", 0)
            won_trades = trades_analysis.get("won",
                                             {}).get("total",
                                                     {}).get("total", 0)
            win_rate = won_trades / total_trades if total_trades > 0 else 0

            # 构建结果
            result = {
                "total_return":
                total_return,
                "annual_return":
                annual_return,
                "sharpe_ratio":
                sharpe_analysis.get("sharperatio", 0),
                "max_drawdown":
                abs(drawdown_analysis.get("max", {}).get("drawdown", 0)) / 100,
                "win_rate":
                win_rate,
                "total_trades":
                total_trades,
                "trades": [],  # TODO: 提取交易记录
                "equity_curve": [],  # TODO: 提取资金曲线
                "initial_value":
                initial_value,
                "final_value":
                final_value
            }

            # 格式化结果
            formatted_result = self._format_result(result)

            self.tasks[task_id]["status"] = "completed"
            self.tasks[task_id]["result"] = formatted_result
            self.tasks[task_id]["completed_at"] = datetime.now()

            logger.info(f"回测任务完成: {task_id}, 总收益率: {total_return:.2%}")

        except Exception as e:
            logger.error(f"回测任务 {task_id} 执行失败: {e}", exc_info=True)
            self.tasks[task_id]["status"] = "failed"
            self.tasks[task_id]["error"] = str(e)

    def _mock_backtest_result(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        模拟回测结果（临时方法，实际应从回测引擎获取）
        """
        return {
            "total_return": 0.25,
            "annual_return": 0.08,
            "sharpe_ratio": 1.5,
            "max_drawdown": -0.15,
            "win_rate": 0.6,
            "total_trades": 50,
            "trades": [],
            "equity_curve": []
        }

    def _format_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        格式化回测结果
        """
        return {
            "total_return": result.get("total_return", 0),
            "annual_return": result.get("annual_return", 0),
            "sharpe_ratio": result.get("sharpe_ratio", 0),
            "max_drawdown": result.get("max_drawdown", 0),
            "win_rate": result.get("win_rate", 0),
            "total_trades": result.get("total_trades", 0),
            "trades": result.get("trades", []),
            "equity_curve": result.get("equity_curve", [])
        }

    def get_backtest_result(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        获取回测结果
        """
        if task_id not in self.tasks:
            return None

        task = self.tasks[task_id]

        if task["status"] == "completed" and task["result"]:
            return {
                "task_id": task_id,
                "status": task["status"],
                **task["result"], "created_at": task["created_at"],
                "completed_at": task.get("completed_at")
            }
        elif task["status"] == "failed":
            return {
                "task_id": task_id,
                "status": task["status"],
                "error": task.get("error"),
                "created_at": task["created_at"]
            }
        else:
            return {
                "task_id": task_id,
                "status": task["status"],
                "created_at": task["created_at"]
            }

    def list_backtests(self,
                       page: int = 1,
                       page_size: int = 20,
                       status: Optional[str] = None):
        """
        获取回测列表
        """
        tasks = list(self.tasks.values())

        if status:
            tasks = [t for t in tasks if t["status"] == status]

        # 按创建时间倒序
        tasks.sort(key=lambda x: x["created_at"], reverse=True)

        # 分页
        start = (page - 1) * page_size
        end = start + page_size

        return {
            "total":
            len(tasks),
            "page":
            page,
            "page_size":
            page_size,
            "tasks": [{
                "task_id": t["task_id"],
                "status": t["status"],
                "code": t["params"].get("code"),
                "strategy": t["params"].get("strategy"),
                "created_at": t["created_at"],
                "completed_at": t.get("completed_at")
            } for t in tasks[start:end]]
        }
