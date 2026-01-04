# Google 登录功能设置指南

## ✅ 已实现的功能

1. **Google Identity Services (GIS) 前端登录**
   - 使用 Google 官方登录按钮
   - 只需要 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 环境变量

2. **用户认证流程**
   - 前端获取 Google token
   - 后端验证 token 并创建/更新用户
   - 用户信息存储在数据库和 localStorage

3. **UI 组件**
   - 登录页面 (`/login`)
   - 用户菜单（显示用户信息、退出登录）
   - 导航栏登录按钮

## 📋 配置步骤

### 1. 创建 Google OAuth 2.0 凭据

1. 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 创建或选择一个项目
3. 点击"创建凭据" → "OAuth 客户端 ID"
4. 应用类型选择"Web 应用"
5. 配置授权重定向 URI：
   ```
   http://localhost:3000
   ```
6. 复制生成的"客户端 ID"

### 2. 配置环境变量

在 `.env` 文件中添加：

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的客户端ID
```

例如：
```env
DATABASE_URL=postgresql://bob:8XmnsGv4jRn1nm3KvD7T@43.156.57.197:55432/docs_demo
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000/login` 测试登录功能。

## 📁 文件结构

```
fuma_doc-main/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── google/
│   │           └── route.ts          # Google token 验证 API
│   ├── login/
│   │   └── page.tsx                  # 登录页面
│   ├── layout.tsx                    # 根布局（包含 AuthProvider）
│   ├── (home)/layout.tsx             # 首页布局
│   └── docs/layout.tsx               # 文档布局
├── components/
│   ├── google-login-button.tsx       # Google 登录按钮组件
│   └── user-menu.tsx                 # 用户菜单组件
├── lib/
│   ├── auth-context.tsx              # 认证状态管理 Context
│   └── source.ts
└── .env                              # 环境变量配置
```

## 🔧 工作原理

### 登录流程

1. **用户点击 Google 登录按钮**
   - 加载 Google Identity Services 脚本
   - 渲染 Google 官方登录按钮

2. **Google 认证**
   - 弹出 Google 登录窗口
   - 用户选择账号并授权
   - Google 返回 ID token

3. **后端验证**
   - 前端将 token 发送到 `/api/auth/google`
   - 后端使用 `google-auth-library` 验证 token
   - 从 token 中提取用户信息（email, name, sub）

4. **数据库操作**
   - 检查用户是否已存在（通过 email）
   - 如果不存在，创建新用户
   - 如果存在，更新用户信息

5. **前端状态管理**
   - 保存用户信息到 `localStorage`
   - 更新 AuthContext 状态
   - 重定向到首页

### 退出登录

1. 清除 localStorage 中的用户信息
2. 清除 AuthContext 状态
3. 重定向到登录页面

## 📊 数据库表结构

### users 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| username | VARCHAR(50) | 用户名 |
| email | VARCHAR(255) | 邮箱（唯一） |
| password_hash | VARCHAR(255) | 密码哈希（Google用户为"google_oauth"） |
| role | VARCHAR(20) | 角色（admin/author/viewer） |
| is_active | BOOLEAN | 是否激活 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 🎯 使用示例

### 在组件中使用认证状态

```tsx
'use client';

import { useAuth } from '@/lib/auth-context';

export function MyComponent() {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (!user) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      <p>欢迎, {user.username}!</p>
      <p>角色: {user.role}</p>
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
```

### 路由保护（示例）

```tsx
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (!user) {
    return null;
  }

  return <div>受保护的内容</div>;
}
```

## 🔐 安全注意事项

1. **环境变量**
   - `.env` 文件不要提交到 Git
   - 使用 `.env.example` 作为模板

2. **Token 验证**
   - 始终在后端验证 Google token
   - 不要只依赖前端验证

3. **HTTPS**
   - 生产环境必须使用 HTTPS
   - Google OAuth 要求 HTTPS（localhost 除外）

4. **用户数据**
   - 不要在 localStorage 存储敏感信息
   - 当前实现只存储基本信息（id, username, email, role）

## 🚀 生产环境部署

1. **更新授权重定向 URI**
   ```
   https://yourdomain.com
   ```

2. **设置环境变量**
   - 在 Vercel/Vercel 项目设置中添加环境变量
   - 或使用其他托管平台的环境变量配置

3. **数据库连接**
   - 确保数据库可从生产环境访问
   - 使用连接池优化性能

## 📝 后续改进建议

1. **添加更多认证方式**
   - Email + 密码登录
   - GitHub OAuth
   - 其他 OAuth 提供商

2. **改进 token 管理**
   - 使用 JWT session
   - 添加 token 刷新机制
   - 实现 remember me 功能

3. **增强安全性**
   - 添加 CSRF 保护
   - 实现 rate limiting
   - 添加 two-factor authentication

4. **用户体验**
   - 添加加载状态指示器
   - 实现邮箱验证
   - 添加密码重置功能（如果支持密码登录）

## 🐛 常见问题

### Q: Google 登录按钮不显示？
A: 检查 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 是否正确配置。

### Q: 登录后立即退出？
A: 检查浏览器控制台错误，可能是数据库连接问题。

### Q: 如何测试不同角色？
A: 直接在数据库中修改 `users` 表的 `role` 字段。

### Q: 支持多语言吗？
A: Google 登录按钮会自动适配浏览器语言。

## 📚 相关文档

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
