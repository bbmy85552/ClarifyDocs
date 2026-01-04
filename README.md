# ClarifyDocs

一个现代化的智能文档管理平台，基于 Next.js 和 Fumadocs 构建。用户可以创建、编辑、组织和发布文档，支持AI智能总结和归类功能，界面简洁直观。

## 功能特性

- **用户认证**：集成 Google OAuth 实现安全登录
- **文档管理**：使用富文本编辑器创建、编辑和删除文档
- **AI 智能总结**（即将推出）：上传您的想法，AI 自动提炼总结要点
- **智能归类**（即将推出）：AI 自动识别内容并进行智能分类
- **数据库存储**：基于 PostgreSQL 的文档存储，支持 UUID
- **分类组织**：通过自定义分类组织文档
- **状态控制**：支持草稿和已发布状态
- **搜索功能**：跨所有文档的全文搜索
- **响应式设计**：适配所有设备的精美 UI
- **MDX 支持**：使用 MDX 格式编写丰富的文档内容

## 技术栈

- **框架**：[Next.js 15](https://nextjs.org/)（App Router）
- **文档系统**：[Fumadocs](https://fumadocs.dev/)
- **数据库**：[PostgreSQL](https://www.postgresql.org/)
- **认证**：Google OAuth
- **样式**：[Tailwind CSS](https://tailwindcss.com/)
- **语言**：[TypeScript](https://www.typescriptlang.org/)
- **包管理器**：pnpm

## 快速开始

### 前置要求

- 已安装 Node.js 18 或更高版本
- 运行中的 PostgreSQL 数据库
- Google OAuth 凭据（在[Google Cloud Console](https://console.cloud.google.com/apis/credentials)获取）

### 安装步骤

1. 克隆仓库：
```bash
git clone <your-repo-url>
cd fuma_doc-main
```

2. 安装依赖：
```bash
pnpm install
```

3. 配置环境变量：
```bash
cp .env.example .env
```

编辑 `.env` 文件并添加你的配置：
```env
DATABASE_URL=postgresql://username:password@host:port/database_name
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

4. 设置数据库：
```bash
# 连接到 PostgreSQL 并运行数据库架构
psql -U your_username -d your_database -f database/schema_uuid.sql
```

5. 启动开发服务器：
```bash
pnpm dev
```

6. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
├── app/                      # Next.js 应用目录
│   ├── (home)/              # 首页和文档列表
│   ├── database-docs/       # 文档 CRUD 页面
│   │   ├── new/            # 创建新文档
│   │   └── [id]/           # 查看/编辑文档
│   │       └── edit/       # 编辑页面
│   └── login/              # 登录页面
├── components/              # 可复用组件
├── lib/                     # 工具函数
│   ├── auth-context.tsx    # 认证上下文
│   ├── auth-utils.ts       # 认证工具
│   └── database-source.ts  # 数据库集成
├── database/               # 数据库架构和迁移
│   ├── schema_uuid.sql     # 数据库架构
│   └── migrate_to_uuid.sql # 迁移脚本
└── public/                 # 静态资源
```

## 使用方法

### 创建文档

1. 使用 Google 账号登录
2. 点击"新建文档"按钮
3. 填写标题、描述、分类和内容
4. 保存为草稿或直接发布

### 管理文档

- **查看**：点击任意文档卡片查看内容
- **编辑**：在文档页面点击编辑按钮
- **删除**：在编辑模式中使用删除选项
- **搜索**：使用搜索栏查找文档

### 文档状态

- **草稿**：私密状态，仅自己可见
- **已发布**：公开访问（功能待实现）

## API 路由

- `GET /api/documents` - 获取所有文档列表
- `GET /api/documents/[id]` - 获取单个文档
- `POST /api/documents` - 创建新文档
- `PUT /api/documents/[id]` - 更新文档
- `DELETE /api/documents/[id]` - 删除文档
- `GET /api/search` - 搜索文档

## 数据库架构

文档存储在 PostgreSQL 中，包含以下字段：
- `id` (UUID) - 唯一标识符
- `slug` (TEXT) - URL 友好的标识符
- `title` (TEXT) - 文档标题
- `description` (TEXT) - 简短描述
- `content` (TEXT) - MDX 内容
- `category` (TEXT) - 文档分类
- `status` (TEXT) - 草稿或已发布
- `created_at` (TIMESTAMP) - 创建时间
- `updated_at` (TIMESTAMP) - 最后更新时间

## 部署

本项目可以部署到 Vercel、Railway 或任何 Node.js 托管平台。

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 添加环境变量
4. 部署

### 生产环境变量

```env
DATABASE_URL=your_production_database_url
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_production_client_id
```

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

本项目采用开源协议，基于 [MIT License](LICENSE)。

## 了解更多

- [Next.js 文档](https://nextjs.org/docs)
- [Fumadocs 文档](https://fumadocs.dev)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
