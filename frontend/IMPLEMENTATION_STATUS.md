# Frontend 实现状态

## ✅ 已完成的工作

### Phase 1: 页面结构重构 (已完成)

1. **项目结构**
   - ✅ 创建了标准的 React 项目目录结构
   - ✅ 分离了组件、页面、hooks、services、types

2. **路由系统**
   - ✅ 安装并配置 React Router v6
   - ✅ 实现了基础路由结构
   - ✅ 路由与导航标签页同步

3. **布局组件**
   - ✅ 创建了 Layout 组件（统一布局）
   - ✅ 创建了 Header 组件（头部）
   - ✅ 创建了 Navigation 组件（导航栏）

4. **认证系统**
   - ✅ 创建了 useAuth Hook
   - ✅ 实现了登录页面组件
   - ✅ 实现了认证状态管理

5. **页面组件**
   - ✅ 创建了 OverviewPage（概览页）
   - ✅ 创建了 BacktestPage（回测页 - 占位符）
   - ✅ 创建了 TradePage（交易页 - 占位符）
   - ✅ 创建了 StrategiesPage（策略库页 - 占位符）
   - ✅ 创建了 ReportsPage（研报页 - 占位符）
   - ✅ 创建了 NotebookPage（Notebook页 - 占位符）

6. **服务层**
   - ✅ 创建了 API 服务模块（api.ts）
   - ✅ 实现了统一的 fetch 封装

7. **类型定义**
   - ✅ 创建了 TypeScript 类型定义文件

---

## 📋 下一步计划

### Phase 2: 回测页面完善 ⭐⭐⭐⭐⭐

**优先级：最高**

需要实现的功能：

1. **行情参数配置面板**
   - [ ] 开始/结束日期选择器
   - [ ] 交易标的代码输入
   - [ ] 股票周期选择（30分钟/60分钟/日线/周线）
   - [ ] 股票复权选择（前复权/后复权/不复权）
   - [ ] 多子图显示选项
   - [ ] 投资组合分析选项
   - [ ] 加载行情数据按钮

2. **回测参数配置面板**
   - [ ] 回测基准选取下拉框
   - [ ] 初始资金输入
   - [ ] 交易规模输入
   - [ ] 滑点输入
   - [ ] 手续费输入
   - [ ] 印花税输入
   - [ ] 回测策略选择下拉框
   - [ ] 开始回测按钮
   - [ ] 交易日志按钮

3. **回测结果展示**
   - [ ] 集成图表库（ECharts/Recharts）
   - [ ] 显示回测报告
   - [ ] 显示回测指标（PnL、Sharpe、最大回撤等）
   - [ ] 显示交易记录

4. **交易日志查看**
   - [ ] 日志列表展示
   - [ ] 日志筛选功能

---

### Phase 3: 交易页面完善 ⭐⭐⭐⭐⭐

**优先级：最高**

需要实现的功能：

1. **页面分离**
   - [ ] 创建 SimTradePage（模拟交易）
   - [ ] 创建 RealTradePage（实盘交易）
   - [ ] 使用 Tabs 组件切换

2. **左侧面板**
   - [ ] 系统日志组件（多行文本显示）
   - [ ] 组合分析股票池组件（ListBox）
   - [ ] 导航Notebook（账户信息、持仓、委托、成交、盯盘列表）

3. **右侧面板**
   - [ ] 交易参数配置Notebook
   - [ ] 图表展示区域（WebPanel/图表组件）

4. **功能完善**
   - [ ] 完善订单创建表单
   - [ ] 完善持仓列表展示
   - [ ] 完善委托列表展示
   - [ ] 完善成交列表展示
   - [ ] 完善盯盘列表展示

---

### Phase 4: 投研智库页面 ⭐⭐⭐

需要实现的功能：

1. **官方网站嵌入**
   - [ ] 使用 iframe 嵌入 `https://ufund-me.github.io/Qbot`

2. **研报列表和预览**
   - [ ] 研报下拉选择框
   - [ ] PDF 预览功能
   - [ ] 本地 HTTP 服务器集成（可选）

3. **Notebook 功能完善**
   - [ ] Notebook 启动按钮
   - [ ] Notebook URL 显示
   - [ ] Notebook 状态管理

---

### Phase 5: 策略库页面 ⭐⭐⭐

需要实现的功能：

1. **策略列表展示**
   - [ ] 策略卡片列表
   - [ ] 策略筛选功能
   - [ ] 策略搜索功能

2. **策略创建/编辑**
   - [ ] 策略创建表单
   - [ ] 策略编辑表单
   - [ ] 策略上传功能

3. **策略详情**
   - [ ] 策略详情页面
   - [ ] 策略参数展示
   - [ ] 策略回测历史

---

### Phase 6: 研报页面 ⭐⭐

需要实现的功能：

1. **研报列表**
   - [ ] 研报列表展示
   - [ ] 研报筛选功能

2. **研报预览**
   - [ ] PDF 预览功能
   - [ ] 研报详情页面

---

## 📁 当前文件结构

```
frontend/src/
├── App.tsx                    # 主应用入口（已重构）
├── App.css                    # 全局样式
├── main.tsx                   # 入口文件
├── components/               # 通用组件
│   └── Layout/
│       ├── Layout.tsx        # ✅ 布局组件
│       ├── Header.tsx        # ✅ 头部组件
│       ├── Navigation.tsx    # ✅ 导航组件
│       └── *.css
├── pages/                     # 页面组件
│   ├── Overview/
│   │   ├── OverviewPage.tsx  # ✅ 概览页
│   │   └── OverviewPage.css
│   ├── Backtest/
│   │   └── BacktestPage.tsx  # ⏳ 回测页（占位符）
│   ├── Trade/
│   │   └── TradePage.tsx     # ⏳ 交易页（占位符）
│   ├── Strategies/
│   │   └── StrategiesPage.tsx # ⏳ 策略库页（占位符）
│   ├── Reports/
│   │   └── ReportsPage.tsx   # ⏳ 研报页（占位符）
│   ├── Notebook/
│   │   └── NotebookPage.tsx  # ⏳ Notebook页（占位符）
│   └── Login/
│       ├── LoginPage.tsx      # ✅ 登录页
│       └── LoginPage.css
├── hooks/                     # 自定义 Hooks
│   └── useAuth.ts            # ✅ 认证 Hook
├── services/                  # API 服务
│   └── api.ts                # ✅ API 封装
└── types/                     # TypeScript 类型定义
    └── index.ts              # ✅ 类型定义
```

---

## 🛠️ 技术栈

- **React**: ^19.2.0
- **React Router**: v6 (已安装)
- **TypeScript**: ~5.9.3
- **Vite**: ^7.2.4

**待安装的依赖**:
- 图表库：`echarts` + `echarts-for-react` 或 `recharts`
- UI组件库（可选）：`antd` 或 `@mui/material`

---

## 📝 注意事项

1. **路由同步**: 当前使用 React Router，导航标签页与路由已同步
2. **认证状态**: 使用 useAuth Hook 管理认证状态
3. **API调用**: 使用统一的 authedFetch 函数进行 API 调用
4. **样式**: 当前使用自定义 CSS，保持与现有样式一致

---

## 🎯 下一步行动

1. ⏭️ 开始实现 Phase 2: 回测页面完善
2. ⏭️ 安装图表库（ECharts 或 Recharts）
3. ⏭️ 实现回测参数配置表单
4. ⏭️ 实现回测结果可视化展示

