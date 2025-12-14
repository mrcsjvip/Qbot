# Frontend 实现计划

基于 Python GUI 的实现方式，逐步完善 frontend 目录下的实现。

## Python GUI 页面结构分析

### 主窗口结构（mainframe.py）
主窗口使用 `wx.Notebook` 实现标签页切换，包含以下页面：

1. **Qbot 投研智库** (ZhikuPanel)
2. **ChatGPT 策略编写** (WebPanel - 外部URL)
3. **AI 选股/选基** (WebPanel - 外部URL)
4. **基金投资策略分析** (WebPanel - 外部URL)
5. **可视化股票/基金回测系统** (PanelBacktest)
6. **在线交易(实盘/虚拟盘)** (TradePanel)

---

## 页面详细分析

### 1. Qbot 投研智库 (ZhikuPanel)

**位置**: `qbot/gui/panels/panel_zhiku.py`

**子页面**:
- **Qbot 官方网站** (QbotHomePanel)
  - 使用 WebPanel 嵌入 `https://ufund-me.github.io/Qbot`
  
- **证券投资研报** (YanbaoPanel)
  - 下拉框选择研报文件
  - WebPanel 显示 PDF 研报
  - 本地 HTTP 服务器提供研报文件访问
  
- **在线代码运行notebook** (NotebookPanel)
  - 启动按钮触发 Jupyter Notebook
  - WebPanel 显示 `http://localhost:8800/tree`

**当前 Frontend 状态**: 
- ✅ 已有 Notebook 基础功能
- ❌ 缺少官方网站嵌入
- ❌ 缺少研报列表和预览

**实现优先级**: ⭐⭐⭐

---

### 2. 可视化股票/基金回测系统 (PanelBacktest)

**位置**: `qbot/gui/panels/panel_backtest.py`

**功能模块**:

#### 2.1 行情参数配置 (ParaStPanel)
- 开始日期/结束日期选择器
- 交易标的代码输入（股票/期货/比特币）
- 股票周期选择（30分钟/60分钟/日线/周线）
- 股票复权选择（前复权/后复权/不复权）
- 多子图显示选项
- 投资组合分析选项
- 加载行情数据按钮

#### 2.2 回测参数配置 (ParaBtPanel)
- 回测基准选取（沪深300/标普500/恒生指数）
- 初始资金输入
- 交易规模输入
- 滑点输入
- 手续费输入
- 印花税输入
- 回测策略选择下拉框
- 开始回测按钮
- 交易日志按钮

#### 2.3 回测结果展示
- WebPanel 显示 `bkt_result.html` 回测结果

**当前 Frontend 状态**:
- ✅ 已有基础回测创建表单（简化版）
- ❌ 缺少详细的参数配置界面
- ❌ 缺少回测结果可视化展示
- ❌ 缺少交易日志查看

**实现优先级**: ⭐⭐⭐⭐⭐

---

### 3. 在线交易 - 模拟交易 (SimTradePanel)

**位置**: `qbot/gui/panels/panel_sim_trade.py`

**布局结构**:
- **左侧面板** (vbox_sizer_a):
  - 系统日志文本框
  - 组合分析股票池列表
  - 导航Notebook（账户信息、持仓、委托、成交、盯盘列表）
  
- **右侧面板** (vbox_sizer_b):
  - 交易参数配置Notebook
  - WebPanel 显示图表

**功能模块**:

#### 3.1 系统日志
- 多行文本显示系统运行日志

#### 3.2 组合分析股票池
- ListBox 显示股票列表
- 双击删除股票

#### 3.3 导航Notebook (_init_nav_notebook)
包含多个标签页：
- 账户信息
- 持仓列表（GridTable）
- 委托列表（GridTable）
- 成交列表（GridTable）
- 盯盘列表（GridTable）

#### 3.4 交易参数配置 (_init_trade_para_notebook)
- 交易平台选择
- 交易类型选择（股票/期货/比特币）
- 交易标的代码输入
- 策略选择
- 交易操作按钮

**当前 Frontend 状态**:
- ✅ 已有基础订单创建功能
- ✅ 已有订单、委托、成交、盯盘列表显示
- ❌ 缺少系统日志显示
- ❌ 缺少组合分析股票池
- ❌ 缺少详细的交易参数配置界面
- ❌ 缺少图表展示区域

**实现优先级**: ⭐⭐⭐⭐⭐

---

### 4. 在线交易 - 实盘交易 (RealTradePanel)

**位置**: `qbot/gui/panels/panel_real_trade.py`

**结构**: 与 SimTradePanel 基本相同，但交易类型为"实盘"

**当前 Frontend 状态**:
- ✅ 已有基础订单创建功能
- ❌ 缺少实盘/模拟交易分离
- ❌ 缺少完整的交易界面布局

**实现优先级**: ⭐⭐⭐⭐

---

## 实现步骤

### Phase 1: 页面结构重构 ⭐⭐⭐⭐⭐
1. 将单页面 App.tsx 拆分为多个页面组件
2. 实现路由系统（使用 React Router）
3. 创建统一的布局组件（Header + Navigation + Content）

### Phase 2: 回测页面完善 ⭐⭐⭐⭐⭐
1. 实现详细的回测参数配置表单
   - 行情参数配置面板
   - 回测参数配置面板
   - 使用 Tabs 组件组织
2. 实现回测结果可视化展示
   - 集成图表库（如 ECharts/Recharts）
   - 显示回测报告
3. 实现交易日志查看功能

### Phase 3: 交易页面完善 ⭐⭐⭐⭐⭐
1. 分离模拟交易和实盘交易页面
2. 实现完整的交易界面布局
   - 左侧：日志 + 股票池 + 导航
   - 右侧：参数配置 + 图表
3. 实现系统日志组件
4. 实现组合分析股票池组件
5. 完善交易参数配置界面
6. 集成图表展示

### Phase 4: 投研智库页面 ⭐⭐⭐
1. 实现官方网站嵌入（iframe）
2. 实现研报列表和预览
   - 研报下拉选择
   - PDF 预览
3. 完善 Notebook 功能

### Phase 5: 策略库页面 ⭐⭐⭐
1. 实现策略列表展示
2. 实现策略创建/编辑表单
3. 实现策略详情查看

### Phase 6: 研报页面 ⭐⭐
1. 实现研报列表
2. 实现研报预览功能

---

## 技术栈建议

- **路由**: React Router v6
- **UI组件库**: 
  - Ant Design / Material-UI / shadcn/ui
  - 或保持当前自定义样式，但需要完善组件库
- **图表库**: 
  - ECharts (echarts-for-react)
  - 或 Recharts
- **状态管理**: 
  - React Context API（当前）
  - 或考虑 Zustand/Redux（如果状态复杂）
- **表单处理**: React Hook Form

---

## 文件结构建议

```
frontend/src/
├── App.tsx                 # 主应用入口
├── App.css                 # 全局样式
├── main.tsx                # 入口文件
├── components/             # 通用组件
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── Layout.tsx
│   ├── Charts/
│   │   └── BacktestChart.tsx
│   └── ...
├── pages/                  # 页面组件
│   ├── Overview/          # 概览页
│   ├── Backtest/          # 回测页
│   │   ├── BacktestPage.tsx
│   │   ├── MarketParams.tsx
│   │   ├── BacktestParams.tsx
│   │   └── BacktestResults.tsx
│   ├── Trade/             # 交易页
│   │   ├── TradePage.tsx
│   │   ├── SimTrade.tsx
│   │   ├── RealTrade.tsx
│   │   ├── SystemLog.tsx
│   │   ├── StockPool.tsx
│   │   └── TradeParams.tsx
│   ├── Strategies/        # 策略库页
│   ├── Reports/           # 研报页
│   └── Notebook/          # Notebook页
├── hooks/                 # 自定义 Hooks
│   ├── useAuth.ts
│   ├── useBacktest.ts
│   └── useTrade.ts
├── services/              # API 服务
│   ├── api.ts
│   └── ...
└── types/                 # TypeScript 类型定义
    └── index.ts
```

---

## 下一步行动

1. ✅ 完成页面结构分析
2. ⏭️ 开始 Phase 1: 页面结构重构
3. ⏭️ 逐步实现各个页面功能

