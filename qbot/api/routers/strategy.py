"""
策略相关路由
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from qbot.api.schemas.strategy import StrategyInfo, StrategyDetail, StrategyListResponse
from qbot.api.services.strategy_service import StrategyService

router = APIRouter()
strategy_service = StrategyService()


@router.get("/", response_model=StrategyListResponse, summary="获取策略列表")
async def list_strategies(
    category: Optional[str] = Query(None, description="策略分类，如：单因子、多因子、机器学习等")
):
    """
    获取策略列表
    
    - **category**: 可选，策略分类过滤
    """
    strategies = strategy_service.list_strategies(category)
    return StrategyListResponse(
        strategies=strategies,
        total=len(strategies)
    )


@router.get("/categories", summary="获取策略分类列表")
async def list_categories():
    """
    获取策略分类列表
    """
    categories = strategy_service.list_categories()
    return {"categories": categories}


@router.get("/{strategy_name}", response_model=StrategyDetail, summary="获取策略详情")
async def get_strategy_detail(strategy_name: str):
    """
    获取策略详情
    
    - **strategy_name**: 策略名称
    """
    detail = strategy_service.get_strategy_detail(strategy_name)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"策略 '{strategy_name}' 不存在")
    return detail

