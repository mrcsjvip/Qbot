"""
数据查询相关数据模型
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import date


class KLineDataPoint(BaseModel):
    """K线数据点"""
    date: str = Field(..., description="日期")
    open: float = Field(..., description="开盘价")
    high: float = Field(..., description="最高价")
    low: float = Field(..., description="最低价")
    close: float = Field(..., description="收盘价")
    volume: float = Field(..., description="成交量")
    amount: Optional[float] = Field(None, description="成交额")


class KLineDataRequest(BaseModel):
    """K线数据查询请求"""
    code: str = Field(..., description="股票代码，如：600000.SH, 000001.SZ")
    start_date: str = Field(..., description="开始日期，格式：YYYYMMDD")
    end_date: str = Field(..., description="结束日期，格式：YYYYMMDD")
    ktype: Optional[str] = Field("D", description="K线类型：D(日K), W(周K), M(月K), 5(5分钟), 15(15分钟), 30(30分钟), 60(60分钟)")
    autype: Optional[str] = Field("qfq", description="复权类型：qfq(前复权), hfq(后复权), None(不复权)")


class KLineDataResponse(BaseModel):
    """K线数据响应"""
    code: str
    start_date: str
    end_date: str
    ktype: str
    autype: str
    data: List[KLineDataPoint]
    total: int


class StockInfo(BaseModel):
    """股票基本信息"""
    code: str = Field(..., description="股票代码")
    name: Optional[str] = Field(None, description="股票名称")
    market: Optional[str] = Field(None, description="市场：SH(上海), SZ(深圳)")
    list_date: Optional[str] = Field(None, description="上市日期")
    industry: Optional[str] = Field(None, description="行业")


class StockListRequest(BaseModel):
    """股票列表查询请求"""
    exchange: Optional[str] = Field("", description="交易所：SSE(上交所), SZSE(深交所), 空字符串表示全部")
    list_status: Optional[str] = Field("L", description="上市状态：L(上市), D(退市), P(暂停)")
    limit: Optional[int] = Field(100, ge=1, le=5000, description="返回数量限制")


class StockListResponse(BaseModel):
    """股票列表响应"""
    stocks: List[StockInfo]
    total: int

