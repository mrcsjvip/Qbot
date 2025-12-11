# 前后端分离与重构设计（Node 20 / TS）

## 总体目标
- 用 React + TypeScript 重建前端（Next.js / Vite 均可）。
- 用 NestJS + TypeScript 重建后端，分层：Controller → Service → Adapter/Integration → Domain → Infra。
- 逐步替换现有 wxPython GUI 与 Python 业务逻辑，接口保持稳定，便于阶段性切换。

## 核心领域模型（草案）
- Strategy: id, name, category (stock/fund/futures/crypto), version, parameters (schema), tags, enabled.
- BacktestTask: id, strategyId, params (code, benchmark, period, frequency, costs, cash, slippage, stake, risk), status, resultUri, createdAt, stats (pnl, sharpe, maxDrawdown, winRate...), logsUri.
- TradeOrder: id, accountId, symbol, side, type, qty, price, status, placedAt, filledQty, avgPrice, ext (algo params, strategyId).
- Account: id, platform, type (real/paper), cash, equity, positions[].
- Position: symbol, qty, avgCost, unrealizedPnl, leverage?, margin?.
- Quote: symbol, last, bid/ask, vol, ts, period (for kline if needed).
- Report: id, title, type (pdf/html), uri (研报/回测报告), tags.
- NotebookSession: id, url, status (running/stopped), createdAt.
- User (stub): id, name, roles (viewer/trader/admin) —— 预留鉴权。

## 后端模块与主要接口（初版）
**Base URL**: `/api`

- Auth (stub)
  - POST `/auth/login` -> token
  - GET `/auth/profile`

- Strategy
  - GET `/strategies` -> 列表
  - POST `/strategies` -> 上传/登记策略元数据（仅记录，不含代码执行）
  - GET `/strategies/:id`

- Backtest
  - POST `/backtests` -> 创建回测任务（返回 taskId）
  - GET `/backtests/:id` -> 任务状态 + 摘要指标
  - GET `/backtests/:id/report` -> 报告/图表数据（HTML/JSON）

- Trade
  - POST `/trades/orders` -> 下单（支持 real/paper）
  - GET `/trades/orders/:id`
  - POST `/trades/orders/:id/cancel`
  - GET `/trades/accounts` -> 账户列表/余额/权益
  - GET `/trades/positions` -> 当前持仓

- Market
  - GET `/market/quotes?symbols=...`
  - GET `/market/klines?symbol=...&period=1d&limit=...`

- Reports / Research
  - GET `/reports` -> 研报列表（本地目录/远程 URL）
  - GET `/reports/:id` -> 下载/预览

- Notebook
  - POST `/notebook/sessions` -> 启动会话
  - GET `/notebook/sessions/:id`
  - POST `/notebook/sessions/:id/stop`

## 前端导航与页面骨架
- Dashboard/概览
- 策略库：列表、创建/上传策略元数据
- 回测：参数表单（标的、周期、基准、成本、策略选择、现金/滑点/仓位），任务列表，结果预览（HTML/IFrame或重绘图表）
- 交易：模拟/实盘切换，账户/持仓/订单列表，下单表单，日志/事件流
- 研报：列表 + 预览
- Notebook：启动/停止按钮 + 内嵌 IFrame

## 日志与可观测性（最低要求）
- 结构化 JSON 日志字段：timestamp, level, traceId, spanId, reqId, user, route, method, status, durationMs, in (body/query/path/head), out (status/size), error (message, stack)。
- NestJS 中间件/拦截器：请求入参、响应耗时；异常过滤器统一输出。
- 预留 OpenTelemetry/ELK 对接（不强依赖）。

## 分层约定
- Controller：参数校验 DTO（class-validator），返回统一响应包装。
- Service：业务编排，不含 IO 细节。
- Adapter/Integration：对接 Python 引擎或未来 TS 重写的计算/交易接口；封装 HTTP/gRPC/子进程调用，隔离第三方差异。
- Domain：核心类型与计算规则（策略参数校验、风控规则、仓位计算等）。
- Infra：配置、日志、缓存/队列（如 BullMQ 预留）、存储（结果路径、对象存储 URI）。

## 渐进替换策略
1) 先提供 TS Mock/占位接口，保证前端联调。
2) 按模块替换 Python：回测编排 → 交易调度 → 因子/策略计算。
3) 若需过渡，Adapter 保持同样 DTO/接口，切换指向 Python 服务或 TS 实现即可。

## 路径约定（建议）
- 后端：`backend/` （Nest 项目）
- 前端：`frontend/` （React/Next/Vite 项目）
- 设计文档：`docs/ts-separation-arch.md`（本文件）\n

