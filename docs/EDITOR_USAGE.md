# 文档编辑功能使用指南

## ✅ 已实现功能

### 1. 文档创建
- 访问 `/docs/new` 创建新文档
- 支持 MDX 格式
- 元数据编辑（标题、slug、描述、分类、标签）
- 草稿/发布状态切换

### 2. 文档编辑
- 访问 `/docs/[id]/edit` 编辑文档
- 实时更新
- 保存/发布/删除功能

### 3. 权限控制
- 只有登录用户可以创建/编辑文档
- 作者只能编辑自己的文档
- 管理员可以编辑所有文档

### 4. API 接口
完整的 CRUD API：
- `POST /api/documents` - 创建文档
- `GET /api/documents` - 获取文档列表
- `GET /api/documents/[id]` - 获取单个文档
- `PUT /api/documents/[id]` - 更新文档
- `DELETE /api/documents/[id]` - 删除文档

## 🚀 使用方法

### 创建文档

1. 登录后，点击首页的"创建新文档"按钮
2. 填写文档信息：
   - **标题**（必填）：文档标题
   - **Slug**（可选）：URL 路径，自动生成
   - **描述**（可选）：文档摘要
   - **分类**：选择文档分类
   - **标签**：添加相关标签
   - **状态**：草稿/已发布/归档

3. 在编辑器中编写 MDX 内容

4. 点击"保存草稿"或"发布"

### 编辑文档

1. 从文档列表或直接访问 `/docs/[id]/edit`
2. 修改内容
3. 点击"保存"或"发布"

### MDX 语法支持

```markdown
# 标题
## 子标题

**粗体**
*斜体*
`代码`

```javascript
代码块
```

- 列表项
- 另一项

[链接](https://example.com)

![图片](https://example.com/image.jpg)
```

## 📊 元数据说明

### 标题
- 必填
- 用于文档列表和页面标题

### Slug
- 可选，自动生成
- URL 路径：`/docs/{slug}`
- 只能包含小写字母、数字和连字符

### 描述
- 可选
- SEO 描述和摘要

### 分类选项
- `general` - 通用
- `tutorial` - 教程
- `guide` - 指南
- `reference` - 参考
- `api` - API 文档
- `blog` - 博客

### 标签
- 多个标签用逗号分隔
- 用于文档分类和搜索

### 状态
- `draft` - 草稿（不公开）
- `published` - 已发布（公开可见）
- `archived` - 归档（不可编辑）

## 🎨 界面说明

### 编辑器功能
- 左侧：元数据表单
- 右侧：MDX 编辑器
- 顶部：操作按钮（保存、发布、删除）

### 操作按钮
- **取消/返回**：返回上一页
- **保存草稿**：保存但不发布
- **发布**：保存并发布文档
- **删除**：删除文档（需二次确认）

## 📝 数据存储

### 数据库
- 主存储在 PostgreSQL 数据库
- 表：`documents`
- 字段：id, slug, title, description, content, author_id, status, category, tags, created_at, updated_at

### 文件系统（待实现）
- 可选：同步到 MDX 文件
- 路径：`content/docs/{slug}.mdx`
- 用于 Fumadocs 读取

## 🔒 安全性

1. **身份验证**
   - 所有操作需要登录
   - 基于 localStorage 的会话管理

2. **权限控制**
   - 作者只能编辑自己的文档
   - 管理员可以编辑所有文档

3. **数据验证**
   - 标题必填
   - 内容必填
   - Slug 唯一性检查

## ⚠️ 已知限制

### 当前版本（v1.0）
1. 无实时预览功能
2. 无版本历史
3. 无自动保存
4. 无图片上传
5. 无协作编辑
6. 简单的权限验证（基于 localStorage）

### 后续改进
1. 添加 MDX 实时预览
2. 实现自动保存（每 30 秒）
3. 添加版本历史
4. 图片上传功能
5. 更完善的权限系统（JWT）
6. 文件系统同步

## 🐛 故障排除

### 保存失败
- 检查网络连接
- 确认已登录
- 查看浏览器控制台错误

### Slug 冲突
- 手动修改 slug
- 或者让系统自动生成

### 无法编辑
- 确认是文档作者
- 或使用管理员账号

## 📚 API 示例

### 创建文档（cURL）

```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "我的文档",
    "content": "# Hello\n\n这是我的文档",
    "description": "文档描述",
    "author_id": 1,
    "category": "tutorial",
    "tags": ["react", "nextjs"],
    "status": "draft"
  }'
```

### 获取文档列表

```bash
curl http://localhost:3000/api/documents?page=1&limit=10&status=published
```

### 更新文档

```bash
curl -X PUT http://localhost:3000/api/documents/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新的标题",
    "content": "更新的内容"
  }'
```

### 删除文档

```bash
curl -X DELETE http://localhost:3000/api/documents/1
```

## 🎯 下一步

1. 测试创建文档功能
2. 尝试编辑已有文档
3. 查看 API 文档了解更多功能
4. 提供反馈和改进建议
