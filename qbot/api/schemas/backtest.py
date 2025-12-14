"""
回测相关数据模型
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class BacktestCreateRequest(BaseModel):
    """创建回测任务请求"""
    code: str = Field(..., description="股票代码，如：600000.SH")
    start_date: str = Field(..., description="开始日期，格式：YYYYMMDD")
    end_date: str = Field(..., description="结束日期，格式：YYYYMMDD")
    strategy: str = Field(..., description="策略名称")
    initial_cash: float = Field(100000, description="初始资金")
    commission: float = Field(0.001, description="手续费率")
    benchmark: Optional[str] = Field(None, description="基准指数，如：000300.SH")
    period: str = Field("日线", description="股票周期：30分钟/60分钟/日线/周线")
    authority: str = Field("不复权", description="股票复权：前复权/后复权/不复权")
    params: Optional[Dict[str, Any]] = Field(default_factory=dict, description="策略参数")


class BacktestResponse(BaseModel):
    """回测任务响应"""
    task_id: str
    status: str  # pending, running, completed, failed
    created_at: datetime


class TradeRecord(BaseModel):
    """交易记录"""
    date: str
    code: str
    side: str  # buy, sell
    quantity: int
    price: float
    value: float


class BacktestResult(BaseModel):
    """回测结果"""
    task_id: str
    status: str
    total_return: Optional[float] = None
    annual_return: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None
    win_rate: Optional[float] = None
    total_trades: Optional[int] = None
    trades: Optional[List[TradeRecord]] = None
    equity_curve: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None

