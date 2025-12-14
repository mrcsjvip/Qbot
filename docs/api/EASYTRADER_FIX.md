# easytrader导入问题修复说明

## 问题描述

启动API服务时出现警告：
```
WARNING - trade_service.py:19 <module>: 无法导入TradeEngine: No module named 'easytrader'，交易功能可能受限
```

## 问题原因

项目中有一个本地版本的easytrader模块，位于 `qbot/engine/trade/easytrader` 目录。但是当导入 `TradeEngine` 时，Python无法找到easytrader模块，因为 `qbot/engine/trade` 目录不在 `sys.path` 中。

## 解决方案

### 1. 修复 `trade_service.py`

在导入 `TradeEngine` 之前，将easytrader的路径添加到 `sys.path`：

```python
import sys
from pathlib import Path

# 确保easytrader模块路径在sys.path中
_project_root = Path(__file__).parent.parent.parent.parent
_easytrader_path = _project_root / "qbot" / "engine" / "trade"
if str(_easytrader_path) not in sys.path:
    sys.path.insert(0, str(_easytrader_path))

# 然后导入TradeEngine
try:
    from qbot.engine.trade.trade_engine import TradeEngine
    TRADE_ENGINE_AVAILABLE = True
except ImportError as e:
    logger.warning(f"无法导入TradeEngine: {e}，交易功能可能受限")
    TradeEngine = None
    TRADE_ENGINE_AVAILABLE = False
```

### 2. 修复 `run.py`

在启动脚本中也添加easytrader路径：

```python
# 添加easytrader模块路径（本地版本）
easytrader_path = project_root / "qbot" / "engine" / "trade"
if str(easytrader_path) not in sys.path:
    sys.path.insert(0, str(easytrader_path))
```

## 验证修复

运行以下命令验证修复是否成功：

```bash
python -c "
import sys
sys.path.insert(0, '.')
sys.path.insert(0, 'qbot/engine/trade')

from qbot.api.services.trade_service import TRADE_ENGINE_AVAILABLE
print(f'TradeEngine可用: {TRADE_ENGINE_AVAILABLE}')
"
```

如果输出 `TradeEngine可用: True`，说明修复成功。

## 文件修改

- ✅ `qbot/api/services/trade_service.py` - 添加easytrader路径到sys.path
- ✅ `qbot/api/run.py` - 在启动脚本中添加easytrader路径

## 注意事项

1. **路径顺序很重要**：easytrader路径应该在项目根目录之前添加到sys.path，确保优先使用本地版本。

2. **easytrader位置**：easytrader模块位于 `qbot/engine/trade/easytrader`，这是一个完整的Python包，包含：
   - `easytrader/__init__.py`
   - `easytrader/api.py`
   - `easytrader/clienttrader.py`
   - 等等

3. **其他依赖**：easytrader可能还需要其他依赖，如：
   - `urllib3`
   - `requests`
   - 等等

   这些依赖应该在项目的 `requirements.txt` 中已经包含。

## 测试

启动API服务，应该不再出现警告：

```bash
python qbot/api/run.py
```

应该看到：
```
INFO - trade_service.py:27 <module>: TradeEngine导入成功
```

而不是：
```
WARNING - trade_service.py:19 <module>: 无法导入TradeEngine: No module named 'easytrader'，交易功能可能受限
```

## 相关文件

- `qbot/engine/trade/easytrader/` - easytrader本地版本
- `qbot/engine/trade/trade_engine.py` - TradeEngine主类
- `qbot/engine/trade/trade_real.py` - 实盘交易引擎
- `qbot/engine/trade/trade_sim.py` - 模拟交易引擎

