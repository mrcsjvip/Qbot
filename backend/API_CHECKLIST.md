# 后端 API 实现检查清单

## 前端使用的 API 端点

### ✅ 已实现的 API

1. **认证相关**
   - ✅ POST /api/auth/login - 登录
   - ✅ POST /api/auth/2fa/verify - 2FA验证
   - ✅ POST /api/auth/profile - 获取用户信息

2. **回测相关**
   - ✅ GET /api/backtests - 获取回测列表
   - ✅ POST /api/backtests - 创建回测
   - ✅ GET /api/backtests/:id - 获取单个回测
   - ✅ GET /api/backtests/:id/report - 获取回测报告

3. **策略相关**
   - ✅ GET /api/strategies - 获取策略列表
   - ✅ POST /api/strategies - 创建策略

4. **研报相关**
   - ✅ GET /api/reports - 获取研报列表
   - ✅ POST /api/reports - 创建研报
   - ✅ GET /api/reports/:id - 获取单个研报

5. **交易相关**
   - ✅ GET /api/trades/orders - 获取订单列表
   - ✅ POST /api/trades/orders - 创建订单
   - ✅ GET /api/trades/orders/:id - 获取单个订单
   - ✅ POST /api/trades/orders/:id/cancel - 取消订单
   - ✅ GET /api/trades/accounts - 获取账户列表
   - ✅ GET /api/trades/balance - 获取余额
   - ✅ GET /api/trades/positions - 获取持仓列表
   - ✅ GET /api/trades/entrusts - 获取委托列表
   - ✅ GET /api/trades/deals - 获取成交列表
   - ✅ GET /api/trades/watchlist - 获取盯盘列表
   - ✅ POST /api/trades/watchlist/:code - 添加盯盘
   - ✅ POST /api/trades/watchlist/:code/remove - 移除盯盘

6. **Notebook相关**
   - ✅ GET /api/notebook/sessions/active - 获取活动会话
   - ✅ POST /api/notebook/sessions - 启动会话
   - ✅ GET /api/notebook/sessions/:id - 获取会话
   - ✅ POST /api/notebook/sessions/:id/stop - 停止会话

---

## ✅ 已修复的问题

### 1. ✅ TradeController - entrusts 和 deals 缺少 ownerId 参数
**问题**: `GET /api/trades/entrusts` 和 `GET /api/trades/deals` 没有使用 `@CurrentUser()` 装饰器，无法按用户过滤数据。

**修复**: ✅ 已添加 `@CurrentUser()` 装饰器并传递 ownerId。

### 2. ✅ TradeService - listEntrusts 和 listDeals
**状态**: ✅ Service 层方法已正确接收 ownerId 参数，无需修改。

### 3. ✅ MockBrokerAdapter - getBalanceSync 初始化问题
**问题**: 余额初始化时没有设置 owner_id，导致多用户共享余额。

**修复**: ✅ 已修复余额初始化逻辑，现在按用户隔离余额数据。

---

## 📊 API 实现状态总结

**所有前端需要的 API 端点已完全实现！** ✅

- ✅ 认证 API (3个端点)
- ✅ 回测 API (4个端点)
- ✅ 策略 API (2个端点)
- ✅ 研报 API (3个端点)
- ✅ 交易 API (11个端点)
- ✅ Notebook API (4个端点)

**总计: 27个 API 端点全部实现完成**

