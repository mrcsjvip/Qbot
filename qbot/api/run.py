"""
启动API服务
"""
import sys
import os
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# 添加easytrader模块路径（本地版本）
easytrader_path = project_root / "qbot" / "engine" / "trade"
if str(easytrader_path) not in sys.path:
    sys.path.insert(0, str(easytrader_path))

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "qbot.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 开发模式自动重载
        log_level="info"
    )

