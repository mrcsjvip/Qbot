# Implementation Log: TS Front/Back Expansion

## Goal
- Replace front-end mock data with live API calls.
- Flesh out backend endpoints with simple in-memory stores for backtests/trades/strategies/reports/notebook.
- Keep changes Node-20-ready; current host node may warn (v18), but code is forward-compatible.

## Steps Executed
1. Added plan.md to track progress.
2. Expanded backend services with in-memory data + list/create endpoints (backtests, trades, strategies, reports, notebook active).
3. Wired frontend to backend via fetch with graceful fallbacks/loading/error states; kept responsive UI/skin.
4. Added UI forms to create backtests/orders and trigger notebook start; backend now echoes input fields (start/end date, strategyId).
5. Added create forms on front-end for strategy/report/backtest/order, wired to backend.
6. UI polish：新增 Hero actions、导航高亮、KPI 卡片、表单布局与现代化样式。
7. Backend trade扩展：对齐原 Python 能力，补充余额、持仓、委托、成交、盯盘列表的 REST 接口。
8. 引入 MemoryDB 单例，所有 backtests/trades/strategies/reports 读写已接入，便于未来替换 Supabase/DB。
9. 为 TradeService 增加 BrokerAdapter 抽象与 MockBrokerAdapter，便于后续无缝替换真实券商/行情接口。
10. Next: swap in real persistence/queue when ready; add auth/rbac + file upload (strategy/report) if needed.

