# 前端样式更新总结

## 📋 web文件夹 vs frontend文件夹

### web文件夹
- **位置**: `web/`
- **类型**: 旧的静态网站（UmiJS）
- **用途**: 基金投资策略分析页面（通过WebPanel嵌入Python GUI）
- **状态**: 遗留代码，保留作为参考

### frontend文件夹
- **位置**: `frontend/`
- **类型**: 新的React前端应用
- **用途**: 完整的量化交易平台前端（前后端分离架构）
- **状态**: 正在使用，主要前端

**详细说明**: 查看 [docs/WEB_VS_FRONTEND.md](WEB_VS_FRONTEND.md)

---

## 🎨 样式更新 - Python GUI风格

### 主要变化

#### 1. 配色方案
- **主色调**: 蓝色 → **绿色 (#4CBB17)** - 匹配Python GUI按钮颜色
- **背景色**: 浅灰色 (#f5f5f5) - 更专业的金融软件风格
- **边框色**: 灰色 (#d0d0d0) - 更清晰的边界

#### 2. 字体
- **中文字体**: "Microsoft YaHei", "SimHei", "PingFang SC"
- **英文字体**: "Helvetica Neue", Arial, sans-serif
- 匹配Python GUI的字体风格

#### 3. 按钮样式
- **主要按钮**: 绿色背景 (#4CBB17)，白色文字，深绿色边框
- **次要按钮**: 白色背景，灰色边框
- 与Python GUI的按钮风格一致

#### 4. 导航栏
- **激活状态**: 绿色背景，白色文字
- **悬停状态**: 浅绿色边框高亮
- 更清晰的视觉反馈

#### 5. 面板/卡片
- 白色背景
- 灰色边框
- 轻微阴影
- 专业的金融软件外观

### 更新的文件

1. ✅ `frontend/src/index.css` - 全局样式和CSS变量
2. ✅ `frontend/src/App.css` - 通用组件样式
3. ✅ `frontend/src/pages/Login/LoginPage.css` - 登录页
4. ✅ `frontend/src/pages/Backtest/BacktestPage.css` - 回测页
5. ✅ `frontend/src/pages/Trade/TradePage.css` - 交易页
6. ✅ `frontend/src/pages/Strategies/StrategiesPage.css` - 策略页
7. ✅ `frontend/src/pages/Reports/ReportsPage.css` - 研报页
8. ✅ `frontend/src/pages/Notebook/NotebookPage.css` - Notebook页

### CSS变量

新增的CSS变量（在 `index.css` 中）：

```css
:root {
  --qbot-primary: #4CBB17;        /* Python GUI绿色 */
  --qbot-primary-dark: #3A9512;
  --qbot-primary-light: #6FD639;
  --qbot-bg: #f5f5f5;
  --qbot-panel-bg: #ffffff;
  --qbot-border: #d0d0d0;
  --qbot-text: #333333;
  --qbot-text-muted: #666666;
}
```

### 视觉效果

- ✅ 更专业的金融软件外观
- ✅ 与Python GUI风格一致
- ✅ 清晰的视觉层次
- ✅ 统一的配色方案
- ✅ 更好的用户体验

---

## 🚀 查看效果

### 启动前端

```bash
cd frontend
npm run dev
```

访问：**http://localhost:5173**

### 对比

- **之前**: 蓝色主题，现代化但不够专业
- **现在**: 绿色主题，专业金融软件风格，与Python GUI一致

---

## 📚 相关文档

- [样式指南](STYLE_GUIDE.md) - 详细的样式规范
- [web vs frontend](WEB_VS_FRONTEND.md) - 两个文件夹的区别说明

