# 常见问题

## 启动问题

### Q: ModuleNotFoundError: No module named 'qbot'
**A**: 确保在项目根目录运行，或设置PYTHONPATH：
```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python qbot/api/run.py
```

### Q: 端口8000被占用
**A**: 修改端口或停止占用进程：
```bash
# 修改端口（在run.py中）
uvicorn.run(..., port=8001)

# 或停止占用进程
lsof -i :8000
kill -9 <PID>
```

## 依赖问题

### Q: 缺少easytrader模块
**A**: 项目中有本地版本，已自动处理。如果仍有问题，检查 `qbot/engine/trade/easytrader` 目录。

### Q: tushare接口警告
**A**: `get_k_data`接口即将停止更新，建议使用Pro版接口。基础接口仍可使用。

## API使用问题

### Q: 回测任务一直pending
**A**: 检查策略是否正确加载，查看日志输出。

### Q: 交易引擎启动失败
**A**: 检查交易账户配置（`qbot/engine/config`目录）和平台支持。

### Q: K线数据返回空列表
**A**: 检查日期格式（YYYYMMDD）和股票代码格式（如：600000.SH）。

