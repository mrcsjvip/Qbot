"""
策略服务层
"""
from typing import List, Optional, Dict, Any
import inspect
import os

from qbot.common.logging.logger import LOGGER as logger
from qbot.api.schemas.strategy import StrategyInfo, StrategyDetail
from qbot.api.services.strategy_mapper import STRATEGY_MODULE_MAP, get_strategy_class, list_available_strategies


class StrategyService:
    """策略服务"""
    
    def __init__(self):
        # 策略分类映射
        self.strategy_categories = {
            "单因子": ["单因子-简单移动均线(预留G)", "单因子-布林线均值回归(预留E)", "单因子-双均线策略"],
            "多因子": ["多因子交易"],
            "机器学习": ["LSTM时序预测策略", "强化学习策略"],
            "优化算法": ["麻雀优化算法SSA策略"],
        }
    
    def list_strategies(self, category: Optional[str] = None) -> List[StrategyInfo]:
        """
        获取策略列表
        
        Args:
            category: 策略分类，可选
        """
        strategies = []
        
        # 获取所有可用策略
        available_strategies = list_available_strategies()
        
        # 获取所有映射的策略（包括不可用的）
        all_strategy_names = list(STRATEGY_MODULE_MAP.keys())
        
        for strategy_name in all_strategy_names:
            # 如果指定了分类，进行过滤
            if category:
                category_strategies = self.strategy_categories.get(category, [])
                if strategy_name not in category_strategies:
                    continue
            
            # 确定策略分类
            strategy_category = self._get_strategy_category(strategy_name)
            
            # 获取策略文件路径
            file_path = self._get_strategy_file_path(strategy_name)
            
            strategy_info = StrategyInfo(
                name=strategy_name,
                description=self._get_strategy_description(strategy_name),
                category=strategy_category,
                available=strategy_name in available_strategies,
                file_path=file_path
            )
            strategies.append(strategy_info)
        
        return strategies
    
    def get_strategy_detail(self, strategy_name: str) -> Optional[StrategyDetail]:
        """
        获取策略详情
        
        Args:
            strategy_name: 策略名称
        """
        if strategy_name not in STRATEGY_MODULE_MAP:
            return None
        
        # 获取策略类
        strategy_class = get_strategy_class(strategy_name)
        
        if strategy_class is None:
            # 即使策略类不可用，也返回基本信息
            return StrategyDetail(
                name=strategy_name,
                description=self._get_strategy_description(strategy_name),
                category=self._get_strategy_category(strategy_name),
                available=False,
                file_path=self._get_strategy_file_path(strategy_name)
            )
        
        # 获取策略参数
        parameters = self._get_strategy_parameters(strategy_class)
        
        # 获取代码示例
        code_example = self._get_strategy_code_example(strategy_class)
        
        return StrategyDetail(
            name=strategy_name,
            description=self._get_strategy_description(strategy_name),
            category=self._get_strategy_category(strategy_name),
            parameters=parameters,
            available=True,
            file_path=self._get_strategy_file_path(strategy_name),
            code_example=code_example
        )
    
    def _get_strategy_category(self, strategy_name: str) -> Optional[str]:
        """获取策略分类"""
        for category, strategies in self.strategy_categories.items():
            if strategy_name in strategies:
                return category
        return "其他"
    
    def _get_strategy_file_path(self, strategy_name: str) -> Optional[str]:
        """获取策略文件路径"""
        if strategy_name not in STRATEGY_MODULE_MAP:
            return None
        
        module_path, _ = STRATEGY_MODULE_MAP[strategy_name]
        # 将模块路径转换为文件路径
        file_path = module_path.replace(".", "/") + ".py"
        return file_path
    
    def _get_strategy_description(self, strategy_name: str) -> str:
        """获取策略描述"""
        descriptions = {
            "单因子-简单移动均线(预留G)": "基于简单移动均线的单因子策略",
            "单因子-布林线均值回归(预留E)": "基于布林线的均值回归策略",
            "单因子-双均线策略": "双均线交叉策略",
            "多因子交易": "多因子组合交易策略",
            "LSTM时序预测策略": "使用LSTM神经网络进行时序预测的策略",
            "强化学习策略": "基于强化学习的交易策略",
            "麻雀优化算法SSA策略": "使用麻雀优化算法的策略",
        }
        return descriptions.get(strategy_name, f"{strategy_name}策略")
    
    def _get_strategy_parameters(self, strategy_class) -> Dict[str, Any]:
        """获取策略参数"""
        try:
            if hasattr(strategy_class, "params"):
                params = strategy_class.params
                if isinstance(params, tuple):
                    # Backtrader策略参数格式
                    param_dict = {}
                    for param in params:
                        if isinstance(param, tuple) and len(param) >= 2:
                            param_name = param[0]
                            param_default = param[1] if len(param) > 1 else None
                            param_dict[param_name] = param_default
                    return param_dict
            return {}
        except Exception as e:
            logger.warning(f"获取策略参数失败: {e}")
            return {}
    
    def _get_strategy_code_example(self, strategy_class) -> Optional[str]:
        """获取策略代码示例"""
        try:
            source = inspect.getsource(strategy_class)
            # 只返回类定义部分（前500字符）
            return source[:500] + "..." if len(source) > 500 else source
        except Exception as e:
            logger.warning(f"获取策略代码示例失败: {e}")
            return None
    
    def list_categories(self) -> List[str]:
        """获取策略分类列表"""
        return list(self.strategy_categories.keys()) + ["其他"]

