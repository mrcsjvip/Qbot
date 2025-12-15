"""
Qbot API主入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from qbot.api.routers import backtest, trade, strategy, data, auth, report

app = FastAPI(title="Qbot API", description="Qbot量化交易平台API", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(backtest.router, prefix="/api/v1/backtests", tags=["回测"])
# 交易接口使用复数路径以与前端保持一致
app.include_router(trade.router, prefix="/api/v1/trades", tags=["交易"])
app.include_router(strategy.router, prefix="/api/v1/strategies", tags=["策略"])
app.include_router(report.router, prefix="/api/v1/reports", tags=["研报"])
app.include_router(data.router, prefix="/api/v1/data", tags=["数据"])


@app.get("/")
async def root():
    return {"message": "Qbot API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
