# 启动Python后端服务

## 🚀 快速启动（3步）

### 1️⃣ 安装依赖
```bash
pip install -r qbot/api/requirements.txt
```

### 2️⃣ 启动服务
```bash
python qbot/api/run.py
```

### 3️⃣ 访问API文档
打开浏览器：**http://localhost:8000/docs**

---

## 📋 其他启动方式

### 方式1：Python脚本（推荐）
```bash
python qbot/api/run.py
```

### 方式2：Shell脚本
```bash
bash qbot/api/start.sh
```

### 方式3：uvicorn命令
```bash
uvicorn qbot.api.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ✅ 验证服务

```bash
curl http://localhost:8000/health
```

应该返回：`{"status":"healthy"}`

---

## ❓ 常见问题

**端口被占用？**
```bash
# 修改端口（编辑 qbot/api/run.py）
port=8001
```

**依赖缺失？**
```bash
pip install fastapi uvicorn backtrader pandas tushare
```

**更多问题？** 查看 [FAQ.md](FAQ.md)

