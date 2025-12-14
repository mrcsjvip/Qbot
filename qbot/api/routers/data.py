"""
数据查询相关路由
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from qbot.api.schemas.data import (
    KLineDataRequest, KLineDataResponse,
    StockListRequest, StockListResponse,
    StockInfo
)
from qbot.api.services.data_service import DataService

router = APIRouter()
data_service = DataService()


@router.post("/kline", response_model=KLineDataResponse, summary="获取K线数据")
async def get_kline_data(request: KLineDataRequest):
    """
    获取K线数据
    
    - **code**: 股票代码，如：600000.SH, 000001.SZ
    - **start_date**: 开始日期，格式：YYYYMMDD
    - **end_date**: 结束日期，格式：YYYYMMDD
    - **ktype**: K线类型，可选：D(日K), W(周K), M(月K), 5(5分钟), 15(15分钟), 30(30分钟), 60(60分钟)
    - **autype**: 复权类型，可选：qfq(前复权), hfq(后复权), None(不复权)
    """
    try:
        data = data_service.get_kline_data(
            code=request.code,
            start_date=request.start_date,
            end_date=request.end_date,
            ktype=request.ktype or "D",
            autype=request.autype or "qfq"
        )
        
        return KLineDataResponse(
            code=request.code,
            start_date=request.start_date,
            end_date=request.end_date,
            ktype=request.ktype or "D",
            autype=request.autype or "qfq",
            data=data,
            total=len(data)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/kline", response_model=KLineDataResponse, summary="获取K线数据（GET方式）")
async def get_kline_data_get(
    code: str = Query(..., description="股票代码"),
    start_date: str = Query(..., description="开始日期，格式：YYYYMMDD"),
    end_date: str = Query(..., description="结束日期，格式：YYYYMMDD"),
    ktype: Optional[str] = Query("D", description="K线类型"),
    autype: Optional[str] = Query("qfq", description="复权类型")
):
    """
    获取K线数据（GET方式，便于浏览器直接访问）
    """
    try:
        data = data_service.get_kline_data(
            code=code,
            start_date=start_date,
            end_date=end_date,
            ktype=ktype or "D",
            autype=autype or "qfq"
        )
        
        return KLineDataResponse(
            code=code,
            start_date=start_date,
            end_date=end_date,
            ktype=ktype or "D",
            autype=autype or "qfq",
            data=data,
            total=len(data)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stocks", response_model=StockListResponse, summary="获取股票列表")
async def get_stock_list(request: StockListRequest):
    """
    获取股票列表
    
    - **exchange**: 交易所，可选：SSE(上交所), SZSE(深交所), 空字符串表示全部
    - **list_status**: 上市状态，可选：L(上市), D(退市), P(暂停)
    - **limit**: 返回数量限制（1-5000）
    """
    try:
        stocks = data_service.get_stock_list(
            exchange=request.exchange or "",
            list_status=request.list_status or "L",
            limit=request.limit or 100
        )
        
        return StockListResponse(
            stocks=stocks,
            total=len(stocks)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stocks", response_model=StockListResponse, summary="获取股票列表（GET方式）")
async def get_stock_list_get(
    exchange: Optional[str] = Query("", description="交易所"),
    list_status: Optional[str] = Query("L", description="上市状态"),
    limit: Optional[int] = Query(100, ge=1, le=5000, description="返回数量限制")
):
    """
    获取股票列表（GET方式）
    """
    try:
        stocks = data_service.get_stock_list(
            exchange=exchange or "",
            list_status=list_status or "L",
            limit=limit or 100
        )
        
        return StockListResponse(
            stocks=stocks,
            total=len(stocks)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stocks/{code}", response_model=StockInfo, summary="获取股票信息")
async def get_stock_info(code: str):
    """
    获取单个股票信息
    
    - **code**: 股票代码
    """
    stock_info = data_service.get_stock_info(code)
    if stock_info is None:
        raise HTTPException(status_code=404, detail=f"股票 '{code}' 不存在")
    return stock_info

