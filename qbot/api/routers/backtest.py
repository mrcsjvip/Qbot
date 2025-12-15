"""
回测相关路由
"""
from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, Any, Dict

from qbot.api.schemas.backtest import BacktestCreateRequest, BacktestResponse, BacktestResult
from qbot.api.services.backtest_service import BacktestService

router = APIRouter()
backtest_service = BacktestService()


@router.post("", response_model=BacktestResponse, summary="创建回测任务")
async def create_backtest(payload: Dict[str, Any] = Body(...)):
    """
    创建回测任务（兼容前端字段）

    前端字段映射：
    - code -> code
    - startDate/start_date -> start_date (YYYYMMDD)
    - endDate/end_date -> end_date (YYYYMMDD)
    - strategyId/strategy -> strategy
    - cash/initial_cash -> initial_cash
    - commission -> commission
    - benchmark -> benchmark
    - period/authority/params 可选
    """
    try:
        mapped = BacktestCreateRequest(
            code=payload.get("code") or payload.get("symbol"),
            start_date=payload.get("startDate") or payload.get("start_date"),
            end_date=payload.get("endDate") or payload.get("end_date"),
            strategy=payload.get("strategy") or payload.get("strategyId")
            or payload.get("strategy_id") or "单因子-双均线策略",
            initial_cash=payload.get("cash") or payload.get("initial_cash")
            or 100000,
            commission=payload.get("commission") or 0.001,
            benchmark=payload.get("benchmark"),
            period=payload.get("period") or "日线",
            authority=payload.get("authority") or "不复权",
            params=payload.get("params") or {},
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"参数错误: {e}")

    try:
        result = backtest_service.create_backtest_task(mapped)
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
        status: Optional[str] = Query(
            None, description="状态筛选: pending/running/completed/failed")):
    """
    获取回测任务列表

    - **page**: 页码（从1开始）
    - **page_size**: 每页数量（1-100）
    - **status**: 状态筛选（可选）
    """
    return backtest_service.list_backtests(page, page_size, status)
