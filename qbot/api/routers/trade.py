"""
交易相关路由
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Query
from typing import List, Optional

from qbot.api.schemas.trade import (
    TradeStartRequest, AccountInfo, Position, Order,
    TradeEngineStatus
)
from qbot.api.services.trade_service import TradeService
from qbot.common.logging.logger import LOGGER as logger

router = APIRouter()
trade_service = TradeService()


@router.post("/start", summary="启动交易")
async def start_trade(request: TradeStartRequest):
    """
    启动交易引擎
    
    - **trade_type**: sim(模拟交易) 或 real(实盘交易)
    - **platform**: 交易平台（如：掘金、东方财富、同花顺等）
    - **trade_code**: 交易标的代码
    - **strategy**: 策略名称
    """
    try:
        # 实际应从token获取user_id
        user_id = "default_user"
        result = trade_service.start_trade(request, user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"启动交易失败: {str(e)}")


@router.post("/stop/{engine_id}", summary="停止交易")
async def stop_trade(engine_id: str):
    """
    停止交易引擎
    
    - **engine_id**: 交易引擎ID
    """
    success = trade_service.stop_trade(engine_id)
    if not success:
        raise HTTPException(status_code=404, detail="交易引擎不存在或已停止")
    return {"status": "stopped", "engine_id": engine_id}


@router.get("/engines", response_model=List[TradeEngineStatus], summary="获取交易引擎列表")
async def list_engines(user_id: Optional[str] = Query(None, description="用户ID")):
    """
    获取交易引擎列表
    """
    return trade_service.list_engines(user_id)


@router.get("/engines/{engine_id}/status", response_model=TradeEngineStatus, summary="获取交易引擎状态")
async def get_engine_status(engine_id: str):
    """
    获取交易引擎状态
    """
    status = trade_service.get_engine_status(engine_id)
    if status is None:
        raise HTTPException(status_code=404, detail="交易引擎不存在")
    return status


@router.get("/engines/{engine_id}/account", response_model=AccountInfo, summary="获取账户信息")
async def get_account_info(engine_id: str):
    """
    获取账户信息
    
    - **engine_id**: 交易引擎ID
    """
    account = trade_service.get_account_info(engine_id)
    if account is None:
        raise HTTPException(status_code=404, detail="交易引擎不存在或获取账户信息失败")
    return account


@router.get("/engines/{engine_id}/positions", response_model=List[Position], summary="获取持仓")
async def get_positions(engine_id: str) -> List[Position]:
    """
    获取持仓列表
    
    - **engine_id**: 交易引擎ID
    """
    positions = trade_service.get_positions(engine_id)
    return positions


@router.get("/engines/{engine_id}/logs", summary="获取系统日志")
async def get_system_log(engine_id: str, limit: int = Query(100, ge=1, le=1000)):
    """
    获取系统日志
    
    - **engine_id**: 交易引擎ID
    - **limit**: 返回日志条数（1-1000）
    """
    logs = trade_service.get_system_log(engine_id, limit)
    return {"logs": logs, "count": len(logs)}


@router.websocket("/engines/{engine_id}/stream")
async def trade_stream(websocket: WebSocket, engine_id: str):
    """
    WebSocket实时交易数据流
    
    - **engine_id**: 交易引擎ID
    """
    await websocket.accept()
    
    # 检查引擎是否存在
    if trade_service.get_engine_status(engine_id) is None:
        await websocket.close(code=1008, reason="交易引擎不存在")
        return
    
    try:
        while True:
            # 获取实时数据并推送
            # 这里需要根据实际需求实现实时数据推送逻辑
            
            # 示例：推送账户信息
            account = trade_service.get_account_info(engine_id)
            if account:
                await websocket.send_json({
                    "type": "account",
                    "data": account.dict()
                })
            
            # 示例：推送持仓信息
            positions = trade_service.get_positions(engine_id)
            if positions:
                await websocket.send_json({
                    "type": "positions",
                    "data": [pos.dict() for pos in positions]
                })
            
            # 等待一段时间后再次推送（实际应使用事件驱动）
            import asyncio
            await asyncio.sleep(5)  # 每5秒推送一次
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket连接断开: {engine_id}")
    except Exception as e:
        logger.error(f"WebSocket错误: {e}", exc_info=True)
        await websocket.close(code=1011, reason=str(e))

