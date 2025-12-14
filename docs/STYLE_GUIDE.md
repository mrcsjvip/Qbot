# 前端样式指南 - Python GUI风格

## 🎨 设计原则

前端样式已调整为匹配Python GUI的风格，采用专业的金融软件设计风格。

## 🎨 配色方案

### 主色调（Python GUI绿色）

```css
--qbot-primary: #4CBB17;        /* RGB(76, 187, 23) - 主绿色 */
--qbot-primary-dark: #3A9512;   /* 深绿色 */
--qbot-primary-light: #6FD639;  /* 浅绿色 */
```

### 背景色

```css
--qbot-bg: #f5f5f5;            /* 页面背景 */
--qbot-panel-bg: #ffffff;      /* 面板背景 */
--qbot-border: #d0d0d0;        /* 边框颜色 */
```

### 文字颜色

```css
--qbot-text: #333333;          /* 主文字 */
--qbot-text-muted: #666666;    /* 次要文字 */
```

## 📐 设计特点

### 1. 按钮样式

**主要按钮（绿色）**：
```css
button.primary {
  background-color: #4CBB17;
  color: #ffffff;
  border: 1px solid #3A9512;
  border-radius: 4px;
  font-weight: 600;
}
```

**次要按钮**：
```css
button.ghost {
  background: #ffffff;
  border: 1px solid #d0d0d0;
  color: #333333;
}
```

### 2. 导航栏

- 激活状态：绿色背景，白色文字
- 悬停状态：浅绿色边框
- 圆角：4px（较小，更专业）

### 3. 面板/卡片

- 白色背景
- 灰色边框（#d0d0d0）
- 圆角：8px
- 轻微阴影

### 4. 输入框

- 白色背景
- 灰色边框
- 聚焦时：绿色边框 + 绿色阴影
- 圆角：4px

## 🔤 字体

- **中文字体**: "Microsoft YaHei", "SimHei", "PingFang SC"
- **英文字体**: "Helvetica Neue", Arial, sans-serif
- **等宽字体**: 'Courier New', monospace（用于日志）

## 📏 间距规范

- **页面内边距**: 24px 20px 48px
- **面板内边距**: 20px
- **卡片内边距**: 16px
- **元素间距**: 12px - 20px

## 🎯 关键元素样式

### 导航栏激活状态
```css
.nav li.active {
  background: #4CBB17;
  color: #ffffff;
  font-weight: 600;
}
```

### 输入框聚焦
```css
input:focus {
  border-color: #4CBB17;
  box-shadow: 0 0 0 3px rgba(76, 187, 23, 0.2);
}
```

### 卡片悬停
```css
.card:hover {
  border-color: #6FD639;
  box-shadow: 0 4px 8px rgba(76, 187, 23, 0.15);
}
```

## 📱 响应式设计

- **桌面端**: 最大宽度1400px，居中显示
- **平板端**: 自适应布局
- **移动端**: 单列布局，减小间距

## 🔄 与Python GUI的对应关系

| Python GUI元素 | Web前端对应 |
|---------------|------------|
| 绿色按钮 (RGB(76,187,23)) | `.primary` 按钮 |
| wx.Panel | `.panel` 或 `.card` |
| wx.StaticText | 普通文本或标签 |
| wx.TextCtrl | `input` 元素 |
| wx.ComboBox | `select` 元素 |
| wx.Notebook | `.nav` 导航栏 |

## 📝 使用示例

### 主要操作按钮
```tsx
<button className="primary">开始回测</button>
```

### 次要操作按钮
```tsx
<button className="ghost">取消</button>
```

### 卡片容器
```tsx
<div className="panel">
  <h2>标题</h2>
  <p>内容</p>
</div>
```

### 输入框
```tsx
<input type="text" placeholder="请输入..." />
```

## 🎨 颜色使用指南

- **主要操作**: 使用 `var(--qbot-primary)` 绿色
- **成功状态**: 使用 `var(--qbot-primary)` 绿色
- **警告/错误**: 保持红色（#f44336）
- **信息提示**: 使用浅绿色背景 `rgba(76, 187, 23, 0.15)`

## 📚 相关文件

- `frontend/src/index.css` - 全局样式和CSS变量
- `frontend/src/App.css` - 通用组件样式
- `frontend/src/pages/*/**.css` - 各页面特定样式

