# Qbot API 服务启动说明

## 快速启动

### 方式1：使用启动脚本（推荐）

```bash
bash qbot/api/start.sh
```

### 方式2：直接使用Python

```bash
# 确保在项目根目录
cd /path/to/Qbot

# 启动服务
python qbot/api/run.py
```

### 方式3：使用uvicorn

```bash
# 确保在项目根目录
cd /path/to/Qbot

# 启动服务
uvicorn qbot.api.main:app --host 0.0.0.0 --port 8000 --reload
```

## 安装依赖

如果遇到依赖缺失问题，运行：

```bash
pip install -r qbot/api/requirements.txt
```

或者安装完整项目依赖：

```bash
pip install -r requirements.txt
```

## 访问服务

启动成功后，访问以下地址：

- **API根路径**: http://localhost:8000/
- **健康检查**: http://localhost:8000/health
- **Swagger文档**: http://localhost:8000/docs
- **ReDoc文档**: http://localhost:8000/redoc
- **回测API**: http://localhost:8000/api/v1/backtest

## 常见问题

### 1. ModuleNotFoundError: No module named 'qbot'

**解决方案**: 确保在项目根目录运行，或设置PYTHONPATH：

```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python qbot/api/run.py
```

### 2. 策略导入失败

**原因**: 策略文件在模块级别有执行代码，导入时会执行

**解决方案**: 
- 策略导入失败不影响API服务启动
- 实际使用时，回测服务会动态加载策略
- 如需修复，可以将策略文件中的模块级别代码移到`if __name__ == '__main__'`中

### 3. tushare接口警告

**说明**: tushare的`get_k_data`接口即将停止更新，建议使用Pro版接口

**临时解决方案**: 警告不影响功能，可以正常使用

## 测试API

### 使用curl测试

```bash
# 健康检查
curl http://localhost:8000/health

# 获取回测列表
curl http://localhost:8000/api/v1/backtest

# 创建回测任务
curl -X POST http://localhost:8000/api/v1/backtest \
  -H "Content-Type: application/json" \
  -d '{
    "code": "600000",
    "start_date": "20200101",
    "end_date": "20231201",
    "strategy": "单因子-简单移动均线(预留G)",
    "initial_cash": 100000,
    "commission": 0.001
  }'
```

### 使用Swagger UI测试

1. 访问 http://localhost:8000/docs
2. 找到对应的API接口
3. 点击 "Try it out"
4. 填写参数并执行

## 停止服务

按 `Ctrl+C` 停止服务，或使用：

```bash
pkill -f "python qbot/api/run.py"
```

