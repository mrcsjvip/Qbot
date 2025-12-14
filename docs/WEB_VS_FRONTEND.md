# web文件夹 vs frontend文件夹

## 📁 web文件夹

**位置**: `web/`

**内容**: 
- 旧的静态网站/基金相关页面
- 包含fund相关的HTML、CSS、JS文件
- 使用umi框架构建的基金投资策略分析页面
- 静态资源文件

**用途**: 
- 早期版本的基金投资策略分析页面
- 独立运行的静态网站
- 与Python GUI中的"基金投资策略分析"标签页关联（通过WebPanel嵌入）

**技术栈**: 
- UmiJS框架
- 静态HTML/CSS/JS

## 📁 frontend文件夹

**位置**: `frontend/`

**内容**:
- 新的React前端应用
- 完整的量化交易平台前端界面
- 包含所有功能页面（回测、交易、策略、研报等）

**用途**:
- 前后端分离架构中的前端部分
- 与Python API后端（`qbot/api/`）配合使用
- 现代化的Web应用

**技术栈**:
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4
- React Router 7.10.1

## 🔄 关系说明

### Python GUI中的使用

在Python GUI (`qbot/gui/mainframe.py`) 中：

```python
# web文件夹的内容通过WebPanel嵌入到GUI中
web3 = WebPanel(self.tabs)
self.tabs.AddPage(web3, "基金投资策略分析", True)
web3.show_url("https://ufund-me.github.io/funds-web/#/")
```

### 当前架构

```
Python GUI (wxPython)
    ├── 嵌入 web/ 中的基金页面（旧）
    └── 其他功能面板

前端分离架构
    ├── frontend/ (React前端) ← 新的主要前端
    └── qbot/api/ (Python API后端)
```

## 📊 对比总结

| 特性 | web/ | frontend/ |
|------|------|-----------|
| **类型** | 静态网站 | React应用 |
| **用途** | 基金投资策略分析（旧） | 完整量化平台前端（新） |
| **技术** | UmiJS | React + TypeScript + Vite |
| **状态** | 遗留代码 | 正在开发/使用 |
| **关联** | Python GUI嵌入 | Python API后端 |

## 💡 建议

- **web/** 文件夹：保留作为历史参考，或用于Python GUI中的嵌入页面
- **frontend/** 文件夹：这是新的主要前端，应该使用这个进行开发
