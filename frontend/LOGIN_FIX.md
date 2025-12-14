# 登录跳转问题修复

## 问题描述

点击登录后，页面没有跳转到主页面，仍然停留在登录页面。

## 问题原因

`useAuth` hook 在多个组件中被调用时，每次调用都会创建独立的状态实例：
- `App.tsx` 中调用 `useAuth()` 创建了一个状态实例
- `LoginPage.tsx` 中调用 `useAuth()` 创建了另一个状态实例

当在 `LoginPage` 中登录成功后，虽然更新了 `LoginPage` 中的 `profile` 状态，但 `App.tsx` 中的 `profile` 状态并没有更新，导致 `App.tsx` 仍然认为用户未登录，继续显示 `LoginPage`。

## 解决方案

使用 React Context API 来共享认证状态，确保整个应用只有一个认证状态实例。

### 1. 创建 AuthContext

创建了 `frontend/src/contexts/AuthContext.tsx`：
- 使用 `createContext` 创建认证上下文
- 使用 `AuthProvider` 组件提供认证状态
- 导出 `useAuth` hook 供组件使用

### 2. 更新 App.tsx

- 将 `App` 组件拆分为 `App` 和 `AppInner`
- `App` 组件使用 `AuthProvider` 包裹整个应用
- `AppInner` 组件使用 `useAuth` 获取共享的认证状态

### 3. 更新 LoginPage.tsx

- 更新导入路径，从 `contexts/AuthContext` 导入 `useAuth`

## 修复后的工作流程

1. 用户点击登录按钮
2. `LoginPage` 调用 `useAuth().login()`
3. 登录成功后，`AuthContext` 中的 `profile` 状态更新
4. `App.tsx` 中的 `useAuth()` 检测到 `profile` 状态变化
5. `App.tsx` 重新渲染，检测到 `profile` 存在
6. 页面自动跳转到主页面（`BrowserRouter` 和 `AppContent`）

## 文件变更

- ✅ 新增 `frontend/src/contexts/AuthContext.tsx`
- ✅ 修改 `frontend/src/App.tsx`
- ✅ 修改 `frontend/src/pages/Login/LoginPage.tsx`
- ⚠️ `frontend/src/hooks/useAuth.ts` 已废弃（可删除）

## 测试

修复后，登录流程应该正常工作：
1. 输入邮箱和密码
2. 点击登录按钮
3. 登录成功后自动跳转到主页面

如果仍有问题，请检查：
- 后端 API `/api/auth/login` 是否正常返回 `accessToken`
- 浏览器控制台是否有错误信息
- 网络请求是否成功

