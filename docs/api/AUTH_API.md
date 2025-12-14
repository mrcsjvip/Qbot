# 认证 API 文档

## 概述

Python 后端提供了完整的用户认证功能，包括登录、2FA验证和用户信息获取。

## 接口列表

### 1. 用户登录

**接口**: `POST /api/v1/auth/login`

**请求体**:
```json
{
  "email": "demo@qbot.io",
  "password": "demo123"
}
```

**响应**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requires2fa": false
}
```

**说明**:
- 默认测试账号：`demo@qbot.io` / `demo123`
- 如果用户启用了2FA，会返回 `requires2fa: true`，需要调用2FA验证接口

### 2. 2FA验证

**接口**: `POST /api/v1/auth/2fa/verify`

**请求体**:
```json
{
  "email": "demo@qbot.io",
  "code": "123456"
}
```

**响应**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. 获取用户信息

**接口**: `POST /api/v1/auth/profile`

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "id": "user-1",
  "email": "demo@qbot.io",
  "twoFaPassed": true
}
```

## 测试

### 使用 curl 测试登录

```bash
# 登录
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@qbot.io","password":"demo123"}'

# 获取用户信息（替换 <token> 为实际token）
curl -X POST http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer <token>"
```

### 使用 Python 测试

```python
import requests

# 登录
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "demo@qbot.io", "password": "demo123"}
)
token = response.json()["accessToken"]

# 获取用户信息
response = requests.post(
    "http://localhost:8000/api/v1/auth/profile",
    headers={"Authorization": f"Bearer {token}"}
)
print(response.json())
```

## 注意事项

1. **JWT Token**: Token有效期为24小时，过期后需要重新登录
2. **密码存储**: 当前使用内存存储，生产环境应使用数据库
3. **安全性**: 
   - JWT密钥应使用环境变量配置
   - 密码应使用bcrypt加密存储
   - 生产环境应启用HTTPS

## 前端集成

前端已配置为使用Python后端认证接口：

- API地址：`http://localhost:8000/api/v1`
- 登录接口：`POST /api/v1/auth/login`
- 用户信息接口：`POST /api/v1/auth/profile`

前端代码会自动处理token的存储和请求头的添加。

