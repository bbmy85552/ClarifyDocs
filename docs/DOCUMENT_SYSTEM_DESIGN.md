# 文档管理系统设计方案

## 功能概述

实现用户在前端输入 MDX 文本并保存到平台的功能。

## 核心功能

### 1. 文档编辑器
- MDX 编辑器（带语法高亮和自动补全）
- 实时预览
- 元数据编辑（标题、描述、slug、分类、标签）
- 自动保存草稿
- 发布/草稿切换

### 2. 文档管理
- 创建新文档
- 编辑现有文档
- 删除文档
- 文档列表（分页、搜索、筛选）

### 3. 权限控制
- 登录验证
- 作者只能编辑自己的文档
- 管理员可以编辑所有文档

## 技术架构

### 前端
- **编辑器**: CodeMirror 6 或 Monaco Editor
- **预览**: MDX 编译 + 实时渲染
- **状态管理**: React Hooks + Context API

### 后端
- **API**: Next.js Route Handlers
- **数据库**: PostgreSQL (已有 documents 表)
- **文件系统**: fs/promises (同步 MDX 文件)

### API 路由

```typescript
POST   /api/documents           # 创建文档
GET    /api/documents           # 获取文档列表（支持分页、搜索）
GET    /api/documents/[id]      # 获取单个文档
PUT    /api/documents/[id]      # 更新文档
DELETE /api/documents/[id]      # 删除文档
PATCH  /api/documents/[id]/status  # 更新状态
POST   /api/documents/[id]/sync    # 同步到文件系统
```

## 数据库操作

### 创建文档
```sql
INSERT INTO documents (slug, title, description, content, author_id, status, category, tags)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *
```

### 更新文档
```sql
UPDATE documents
SET title = $1, description = $2, content = $3, slug = $4,
    category = $5, tags = $6, updated_at = CURRENT_TIMESTAMP
WHERE id = $7
RETURNING *
```

### 文件系统同步
```typescript
// 保存 MDX 文件到 content/docs/[slug].mdx
const fs = require('fs/promises');
await fs.writeFile(`content/docs/${slug}.mdx`, content);
```

## 页面路由

```
/docs/new              # 创建新文档
/docs/[id]/edit        # 编辑文档
/docs/manage           # 文档管理列表
```

## 编辑器特性

### 基础功能
- Markdown 语法高亮
- 实时预览
- 自动保存（每 30 秒）
- 快捷键支持（Ctrl+S 保存）

### 高级功能
- 代码块语法高亮
- 图片上传
- 嵌入组件
- Frontmatter 编辑器

## 安全考虑

1. **XSS 防护**: MDX 内容需要sanitize
2. **SQL 注入**: 使用参数化查询
3. **权限验证**: 每个API都要验证用户身份
4. **Slug 冲突**: 自动生成唯一 slug
5. **内容长度限制**: 防止过大文件

## 性能优化

1. **分页加载**: 文档列表使用分页
2. **缓存**: Redis 缓存热门文档
3. **CDN**: 图片资源使用 CDN
4. **懒加载**: 编辑器按需加载

## 实现优先级

### Phase 1: MVP (最小可行产品)
- ✅ 基础编辑器（纯文本）
- ✅ 创建/保存文档
- ✅ 简单的元数据表单
- ✅ 权限验证

### Phase 2: 增强功能
- ⏳ MDX 实时预览
- ⏳ 文档列表页面
- ⏳ 编辑/删除功能
- ⏳ 自动保存

### Phase 3: 高级功能
- ⏳ 文件系统同步
- ⏳ 版本历史
- ⏳ 协作编辑
- ⏳ 图片上传

## 数据流

```
用户输入 MDX
    ↓
前端验证
    ↓
POST /api/documents
    ↓
后端验证权限
    ↓
保存到数据库
    ↓
（可选）同步到文件系统
    ↓
返回文档 ID
    ↓
前端更新状态
```

## 文件结构

```
app/
├── api/
│   └── documents/
│       ├── route.ts              # 列表、创建
│       └── [id]/
│           ├── route.ts          # 获取、更新、删除
│           ├── status/route.ts   # 更新状态
│           └── sync/route.ts     # 同步到文件系统
├── docs/
│   ├── new/
│   │   └── page.tsx              # 创建文档页面
│   ├── [id]/
│   │   └── edit/
│   │       └── page.tsx          # 编辑文档页面
│   └── manage/
│       └── page.tsx              # 文档管理列表
components/
├── editor/
│   ├── mdx-editor.tsx            # MDX 编辑器组件
│   ├── metadata-form.tsx         # 元数据表单
│   └── preview-pane.tsx          # 预览面板
lib/
├── auth.ts                       # 权限验证工具
└── document-utils.ts             # 文档工具函数
```
