"""
策略映射工具 - 将策略名称映射到实际的策略类
"""
from typing import Dict, Type, Optional, Callable
import backtrader as bt
import importlib
import sys

# 策略模块路径映射（延迟导入，避免导入时执行主程序代码）
STRATEGY_MODULE_MAP: Dict[str, tuple] = {
    "单因子-简单移动均线(预留G)":
    ("qbot.strategies.bigger_than_ema_bt", "BiggerThanEmaStrategy"),
    "单因子-布林线均值回归(预留E)": ("qbot.strategies.boll_strategy_bt", "BollStrategy"),
    "单因子-双均线策略": ("qbot.strategies.klines_bt", "KlinesStrategy"),
    "多因子交易": ("qbot.strategies.multi_strategy_bt", "MultiStrategy"),
    # 可以继续添加其他策略映射
    # 兼容前端传入的简写/ID
    "str-rsi": ("qbot.strategies.bigger_than_ema_bt", "BiggerThanEmaStrategy"),
    "str-sma": ("qbot.strategies.klines_bt", "KlinesStrategy"),
}

# 缓存已导入的策略类
_strategy_cache: Dict[str, Optional[Type[bt.Strategy]]] = {}


def get_strategy_class(strategy_name: str) -> Optional[Type[bt.Strategy]]:
    """
    根据策略名称获取策略类（延迟导入）

    Args:
        strategy_name: 策略名称

    Returns:
        策略类，如果不存在返回None
    """
    # 检查缓存
    if strategy_name in _strategy_cache:
        return _strategy_cache[strategy_name]

    # 检查映射中是否存在
    if strategy_name not in STRATEGY_MODULE_MAP:
        _strategy_cache[strategy_name] = None
        return None

    # 延迟导入策略类
    try:
        module_path, class_name = STRATEGY_MODULE_MAP[strategy_name]

        # 使用importlib直接导入类，避免执行模块级别的代码
        # 但注意：如果策略文件在模块级别有执行代码，这仍然会执行
        # 更好的方式是修改策略文件，将执行代码放在if __name__ == '__main__'中

        # 导入模块
        if module_path in sys.modules:
            # 如果已经导入过，直接使用
            module = sys.modules[module_path]
        else:
            # 首次导入
            # 注意：如果策略文件在模块级别有执行代码（如第127行的dataframe = get_data(...)）
            # 这会导致导入时执行，可能会出错
            # 临时解决方案：捕获异常并返回None
            try:
                module = importlib.import_module(module_path)
            except Exception as import_error:
                # 导入时出错，可能是模块级别的代码执行失败
                # 这种情况下我们记录错误但不抛出异常
                print(f"警告: 导入策略模块 {module_path} 时出错: {import_error}")
                _strategy_cache[strategy_name] = None
                return None

        # 获取策略类
        strategy_class = getattr(module, class_name, None)

        if strategy_class and issubclass(strategy_class, bt.Strategy):
            _strategy_cache[strategy_name] = strategy_class
            return strategy_class
        else:
            _strategy_cache[strategy_name] = None
            return None

    except Exception as e:
        # 其他异常
        import traceback
        print(f"警告: 获取策略类 {strategy_name} 失败: {e}")
        # traceback.print_exc()  # 调试时可以取消注释
        _strategy_cache[strategy_name] = None
        return None


def list_available_strategies() -> list:
    """
    获取可用策略列表

    Returns:
        策略名称列表
    """
    available = []
    for name in STRATEGY_MODULE_MAP.keys():
        if get_strategy_class(name) is not None:
            available.append(name)
    return available
