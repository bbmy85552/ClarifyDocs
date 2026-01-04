# UUID 迁移指南

本文档说明如何将数据库从整数 ID 迁移到 UUID。

## 前置准备

1. 确保已安装 `uuid` 包：
```bash
npm install uuid
npm install --save-dev @types/uuid
```

## 迁移步骤

### 方案 A：全新数据库（推荐）

如果您的数据库中没有重要数据，建议直接使用新的 UUID schema：

```bash
# 连接到数据库
psql -U your_username -d your_database

# 执行新的 schema
\i database/schema_uuid.sql
```

### 方案 B：迁移现有数据

如果数据库中已有重要数据，使用迁移脚本：

```bash
# 1. 备份数据库
pg_dump -U your_username your_database > backup.sql

# 2. 连接到数据库
psql -U your_username -d your_database

# 3. 执行迁移脚本
\i database/migrate_to_uuid.sql

# 4. 验证迁移结果
```

## 代码更新

所有代码已经更新为使用 UUID：

- ✅ API 路由 (`app/api/documents/*.ts`)
- ✅ 认证上下文 (`lib/auth-context.tsx`)
- ✅ 前端组件 (所有 `app/database-docs/**/*.tsx`)
- ✅ 首页 (`app/(home)/page.tsx`)

### 类型定义

所有 ID 字段现在使用 `string` 类型而不是 `number`：

```typescript
interface User {
  id: string;  // 改为 string
  username: string;
  email: string;
  role: string;
}

interface Document {
  id: string;  // 改为 string
  slug: string;
  title: string;
  // ...
}
```

## 验证

迁移完成后，验证以下几点：

1. **用户表**
```sql
SELECT id, username, email FROM users LIMIT 5;
-- ID 应该是 UUID 格式: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

2. **文档表**
```sql
SELECT id, title, author_id FROM documents LIMIT 5;
-- ID 和 author_id 都应该是 UUID 格式
```

3. **外键关系**
```sql
SELECT COUNT(*) FROM documents WHERE author_id IS NOT NULL;
-- 确认外键关系正确
```

## 常见问题

### Q: 迁移后无法创建新用户/文档？
A: 确保数据库启用了 uuid-ossp 扩展：
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Q: 前端显示错误？
A: 清除浏览器缓存和 Next.js 缓存：
```bash
rm -rf .next
npm run dev
```

### Q: 外键约束错误？
A: 重新运行迁移脚本，确保所有外键都正确更新。

## 回滚

如果需要回滚到整数 ID：

1. 从备份恢复数据库：
```bash
psql -U your_username your_database < backup.sql
```

2. 或者手动回滚（不推荐）

## 注意事项

- UUID 在 PostgreSQL 中存储为 36 字符的字符串
- UUID 查询性能略低于整数，但对于中小规模应用影响可忽略
- UUID 是全局唯一的，更适合分布式系统
- 使用 UUID 可以避免枚举攻击（猜测用户/文档 ID）
