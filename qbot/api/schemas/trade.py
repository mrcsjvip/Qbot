"""
交易相关数据模型
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


class TradeStartRequest(BaseModel):
    """启动交易请求"""
    trade_type: str = Field(..., description="交易类型: sim(模拟) 或 real(实盘)")
    platform: str = Field(..., description="交易平台，如：掘金、东方财富、同花顺等")
    trade_code: str = Field(..., description="交易标的代码，如：399006.SZ")
    strategy: str = Field(..., description="策略名称")
    trade_opts: Optional[Dict[str, Any]] = Field(default_factory=dict, description="交易选项")


class AccountInfo(BaseModel):
    """账户信息"""
    cash: float = Field(..., description="可用资金")
    market_value: float = Field(0, description="市值")
    total_assets: float = Field(..., description="总资产")
    available_cash: Optional[float] = Field(None, description="可用现金")


class Position(BaseModel):
    """持仓信息"""
    code: str = Field(..., description="股票代码")
    name: Optional[str] = Field(None, description="股票名称")
    quantity: int = Field(..., description="持仓数量")
    cost: Optional[float] = Field(None, description="成本价")
    current_price: Optional[float] = Field(None, description="当前价格")
    profit: Optional[float] = Field(None, description="盈亏")
    profit_rate: Optional[float] = Field(None, description="盈亏比例")


class Order(BaseModel):
    """订单信息"""
    order_id: str = Field(..., description="订单ID")
    code: str = Field(..., description="股票代码")
    side: str = Field(..., description="买卖方向: buy/sell")
    quantity: int = Field(..., description="数量")
    price: Optional[float] = Field(None, description="价格")
    status: str = Field(..., description="状态: pending/filled/canceled")
    created_at: str = Field(..., description="创建时间")
    filled_at: Optional[str] = Field(None, description="成交时间")


class Entrust(BaseModel):
    """委托信息"""
    entrust_id: str
    code: str
    side: str  # buy, sell
    quantity: int
    price: float
    status: str  # pending, filled, canceled
    created_at: str


class Deal(BaseModel):
    """成交信息"""
    deal_id: str
    code: str
    side: str  # buy, sell
    quantity: int
    price: float
    deal_time: str


class WatchlistItem(BaseModel):
    """盯盘列表项"""
    code: str
    name: Optional[str] = None
    price: Optional[float] = None
    added_at: Optional[str] = None


class TradeEngineStatus(BaseModel):
    """交易引擎状态"""
    engine_id: str
    status: str  # running, stopped, error
    trade_type: str  # sim, real
    platform: str
    trade_code: str
    strategy: str
    created_at: datetime
    last_update: Optional[datetime] = None

