#!/bin/bash
# Qbot API服务启动脚本

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# 设置PYTHONPATH
export PYTHONPATH="${PROJECT_ROOT}:${PYTHONPATH}"

echo "=========================================="
echo "启动 Qbot API 服务"
echo "=========================================="
echo "项目根目录: $PROJECT_ROOT"
echo "PYTHONPATH: $PYTHONPATH"
echo "=========================================="

# 检查Python版本
python_version=$(python --version 2>&1)
echo "Python版本: $python_version"

# 检查依赖
echo ""
echo "检查依赖..."
python -c "import fastapi; import uvicorn; import backtrader; import pandas; import tushare; print('✅ 所有依赖已安装')" 2>&1 || {
    echo "❌ 缺少依赖，请运行: pip install -r qbot/api/requirements.txt"
    exit 1
}

# 启动服务
echo ""
echo "启动服务..."
cd "$PROJECT_ROOT"
python qbot/api/run.py

