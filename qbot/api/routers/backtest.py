"""
回测相关路由
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from qbot.api.schemas.backtest import BacktestCreateRequest, BacktestResponse, BacktestResult
from qbot.api.services.backtest_service import BacktestService

router = APIRouter()
backtest_service = BacktestService()


@router.post("", response_model=BacktestResponse, summary="创建回测任务")
async def create_backtest(request: BacktestCreateRequest):
    """
    创建回测任务
    
    - **code**: 股票代码，如 600000.SH
    - **start_date**: 开始日期，格式 YYYYMMDD
    - **end_date**: 结束日期，格式 YYYYMMDD
    - **strategy**: 策略名称
    - **initial_cash**: 初始资金（默认100000）
    - **commission**: 手续费率（默认0.001）
    """
    try:
        result = backtest_service.create_backtest_task(request)
        return BacktestResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建回测任务失败: {str(e)}")


@router.get("/{task_id}", response_model=BacktestResult, summary="获取回测结果")
async def get_backtest_result(task_id: str):
    """
    获取回测结果
    
    - **task_id**: 回测任务ID
    """
    result = backtest_service.get_backtest_result(task_id)
    if result is None:
        raise HTTPException(status_code=404, detail="回测任务不存在")
    return BacktestResult(**result)


@router.get("", summary="获取回测列表")
async def list_backtests(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    status: Optional[str] = Query(None, description="状态筛选: pending/running/completed/failed")
):
    """
    获取回测任务列表
    
    - **page**: 页码（从1开始）
    - **page_size**: 每页数量（1-100）
    - **status**: 状态筛选（可选）
    """
    return backtest_service.list_backtests(page, page_size, status)

