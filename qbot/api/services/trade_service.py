"""
交易服务层 - 封装现有的交易引擎
"""
import sys
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List

from qbot.common.logging.logger import LOGGER as logger
from qbot.api.schemas.trade import (
    TradeStartRequest, AccountInfo, Position, Order, 
    Entrust, Deal, WatchlistItem, TradeEngineStatus
)

# 确保easytrader模块路径在sys.path中
# easytrader位于 qbot/engine/trade/easytrader 目录
_project_root = Path(__file__).parent.parent.parent.parent
_easytrader_path = _project_root / "qbot" / "engine" / "trade"
if str(_easytrader_path) not in sys.path:
    sys.path.insert(0, str(_easytrader_path))

# 延迟导入TradeEngine，避免依赖问题
try:
    from qbot.engine.trade.trade_engine import TradeEngine
    TRADE_ENGINE_AVAILABLE = True
    logger.info("TradeEngine导入成功")
except ImportError as e:
    logger.warning(f"无法导入TradeEngine: {e}，交易功能可能受限")
    TradeEngine = None
    TRADE_ENGINE_AVAILABLE = False


class MockSysLog:
    """模拟系统日志对象（用于API服务）"""
    def __init__(self):
        self.logs = []
    
    def re_print(self, msg: str):
        """记录日志"""
        self.logs.append(msg)
        logger.info(f"SysLog: {msg}")


class TradeService:
    """交易服务"""
    
    def __init__(self):
        # 存储交易引擎实例 {engine_id: TradeEngine}
        self.trade_engines: Dict[str, Dict[str, Any]] = {}
    
    def start_trade(self, request: TradeStartRequest, user_id: str = "default") -> Dict[str, Any]:
        """
        启动交易（复用现有交易引擎）
        """
        engine_id = f"{user_id}_{request.trade_code}_{uuid.uuid4().hex[:8]}"
        
        # 准备交易选项（复用现有代码的参数格式）
        trade_opts = {
            "class": "虚拟盘" if request.trade_type == "sim" else "实盘",
            "platform": request.platform,
            "trade_type": "股票",  # 默认股票，可根据需要扩展
            "trade_code": request.trade_code,
            "strategy": request.strategy,
            **request.trade_opts
        }
        
        # 创建系统日志对象
        syslog = MockSysLog()
        
        try:
            # 检查TradeEngine是否可用
            if not TRADE_ENGINE_AVAILABLE or TradeEngine is None:
                raise Exception("交易引擎模块未安装，请安装easytrader等依赖")
            
            # 创建交易引擎实例（复用现有代码）
            trade_engine = TradeEngine(
                trade_opts=trade_opts,
                syslog_obj=syslog
            )
            
            # 登录
            trade_engine.login()
            
            # 启动交易
            trade_engine.start_trade()
            
            # 存储引擎实例和元数据
            self.trade_engines[engine_id] = {
                "engine": trade_engine,
                "engine_id": engine_id,
                "status": "running",
                "trade_type": request.trade_type,
                "platform": request.platform,
                "trade_code": request.trade_code,
                "strategy": request.strategy,
                "trade_opts": trade_opts,
                "syslog": syslog,
                "created_at": datetime.now(),
                "last_update": datetime.now()
            }
            
            logger.info(f"交易引擎启动成功: {engine_id}")
            
            return {
                "engine_id": engine_id,
                "status": "running"
            }
            
        except Exception as e:
            logger.error(f"启动交易引擎失败: {e}", exc_info=True)
            raise Exception(f"启动交易失败: {str(e)}")
    
    def stop_trade(self, engine_id: str) -> bool:
        """
        停止交易
        """
        if engine_id not in self.trade_engines:
            return False
        
        try:
            engine_data = self.trade_engines[engine_id]
            trade_engine = engine_data["engine"]
            
            # 关闭交易引擎
            trade_engine.close()
            
            # 更新状态
            engine_data["status"] = "stopped"
            engine_data["last_update"] = datetime.now()
            
            logger.info(f"交易引擎已停止: {engine_id}")
            return True
            
        except Exception as e:
            logger.error(f"停止交易引擎失败: {e}", exc_info=True)
            engine_data["status"] = "error"
            return False
    
    def get_account_info(self, engine_id: str) -> Optional[AccountInfo]:
        """
        获取账户信息（复用现有方法）
        """
        if engine_id not in self.trade_engines:
            return None
        
        try:
            engine_data = self.trade_engines[engine_id]
            trade_engine = engine_data["engine"]
            
            # 调用现有的获取资金方法
            # 注意：get_cash()方法可能不返回数据，需要根据实际实现调整
            cash_info = trade_engine.get_cash()
            
            # 格式化返回（根据实际返回格式调整）
            if isinstance(cash_info, dict):
                return AccountInfo(
                    cash=cash_info.get("cash", 0),
                    market_value=cash_info.get("market_value", 0),
                    total_assets=cash_info.get("total_assets", 0),
                    available_cash=cash_info.get("available_cash")
                )
            else:
                # 如果返回格式不同，使用默认值
                return AccountInfo(
                    cash=100000.0,  # 默认值，实际应从引擎获取
                    market_value=0,
                    total_assets=100000.0
                )
                
        except Exception as e:
            logger.error(f"获取账户信息失败: {e}", exc_info=True)
            return None
    
    def get_positions(self, engine_id: str) -> List[Position]:
        """
        获取持仓（复用现有方法）
        """
        if engine_id not in self.trade_engines:
            return []
        
        try:
            engine_data = self.trade_engines[engine_id]
            trade_engine = engine_data["engine"]
            
            # 调用现有的获取持仓方法
            positions_data = trade_engine.get_positions()
            
            # 格式化返回（根据实际返回格式调整）
            if isinstance(positions_data, list):
                return [
                    Position(
                        code=pos.get("code", ""),
                        name=pos.get("name"),
                        quantity=pos.get("quantity", 0),
                        cost=pos.get("cost"),
                        current_price=pos.get("current_price"),
                        profit=pos.get("profit"),
                        profit_rate=pos.get("profit_rate")
                    )
                    for pos in positions_data
                ]
            else:
                # 如果返回格式不同，返回空列表
                return []
                
        except Exception as e:
            logger.error(f"获取持仓失败: {e}", exc_info=True)
            return []
    
    def get_engine_status(self, engine_id: str) -> Optional[TradeEngineStatus]:
        """
        获取交易引擎状态
        """
        if engine_id not in self.trade_engines:
            return None
        
        engine_data = self.trade_engines[engine_id]
        
        return TradeEngineStatus(
            engine_id=engine_id,
            status=engine_data["status"],
            trade_type=engine_data["trade_type"],
            platform=engine_data["platform"],
            trade_code=engine_data["trade_code"],
            strategy=engine_data["strategy"],
            created_at=engine_data["created_at"],
            last_update=engine_data.get("last_update")
        )
    
    def list_engines(self, user_id: Optional[str] = None) -> List[TradeEngineStatus]:
        """
        获取交易引擎列表
        """
        engines = []
        for engine_id, engine_data in self.trade_engines.items():
            if user_id and not engine_id.startswith(f"{user_id}_"):
                continue
            engines.append(self.get_engine_status(engine_id))
        
        return [e for e in engines if e is not None]
    
    def get_system_log(self, engine_id: str, limit: int = 100) -> List[str]:
        """
        获取系统日志
        """
        if engine_id not in self.trade_engines:
            return []
        
        engine_data = self.trade_engines[engine_id]
        syslog = engine_data.get("syslog")
        
        if syslog and hasattr(syslog, "logs"):
            return syslog.logs[-limit:]
        
        return []

