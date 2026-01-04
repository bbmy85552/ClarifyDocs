-- ============================================
-- Fuma Doc 数据库表结构设计 (UUID版本)
-- PostgreSQL 16
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 表1: users (用户表)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'author' CHECK (role IN ('admin', 'author', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户表注释
COMMENT ON TABLE users IS '用户表 - 存储用户账号和认证信息';
COMMENT ON COLUMN users.id IS '用户ID - UUID主键';
COMMENT ON COLUMN users.username IS '用户名 - 唯一';
COMMENT ON COLUMN users.email IS '邮箱 - 唯一';
COMMENT ON COLUMN users.password_hash IS '密码哈希 - bcrypt加密';
COMMENT ON COLUMN users.role IS '角色 - admin/author/viewer';
COMMENT ON COLUMN users.is_active IS '是否激活';
COMMENT ON COLUMN users.created_at IS '创建时间';
COMMENT ON COLUMN users.updated_at IS '更新时间';

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- 表2: documents (文档表)
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category VARCHAR(100) DEFAULT 'general',
  tags JSONB DEFAULT '[]'::jsonb,
  meta JSONB DEFAULT '{}'::jsonb,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE
);

-- 文档表注释
COMMENT ON TABLE documents IS '文档表 - 存储MDX文档内容和元数据';
COMMENT ON COLUMN documents.id IS '文档ID - UUID主键';
COMMENT ON COLUMN documents.slug IS 'URL路径 - 唯一，如 telegram-bot-guide';
COMMENT ON COLUMN documents.title IS '文档标题';
COMMENT ON COLUMN documents.description IS '文档描述/摘要';
COMMENT ON COLUMN documents.content IS 'MDX内容';
COMMENT ON COLUMN documents.author_id IS '作者ID - 外键关联users表(UUID)';
COMMENT ON COLUMN documents.status IS '状态 - draft/published/archived';
COMMENT ON COLUMN documents.category IS '分类';
COMMENT ON COLUMN documents.tags IS '标签数组 - JSONB格式';
COMMENT ON COLUMN documents.meta IS '额外元数据 - JSONB格式';
COMMENT ON COLUMN documents.view_count IS '浏览次数';
COMMENT ON COLUMN documents.created_at IS '创建时间';
COMMENT ON COLUMN documents.updated_at IS '更新时间';
COMMENT ON COLUMN documents.published_at IS '发布时间';

-- 文档表索引
CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
CREATE INDEX IF NOT EXISTS idx_documents_author ON documents(author_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_published_at ON documents(published_at DESC);

-- ============================================
-- 触发器函数
-- ============================================

-- 自动更新 updated_at 字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

COMMENT ON FUNCTION update_updated_at_column() IS '自动更新updated_at时间戳';

-- 发布时自动设置 published_at 的函数
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    NEW.published_at = CURRENT_TIMESTAMP;
  ELSIF NEW.status != 'published' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

COMMENT ON FUNCTION set_published_at() IS '文档发布时自动设置published_at时间戳';

-- ============================================
-- 触发器绑定
-- ============================================

-- 用户表 updated_at 自动更新触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 文档表 updated_at 自动更新触发器
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 文档表 published_at 自动设置触发器
DROP TRIGGER IF EXISTS set_document_published_at ON documents;
CREATE TRIGGER set_document_published_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- ============================================
-- 示例数据（可选）
-- ============================================

-- 插入测试用户（密码为: password123，实际应用中应使用bcrypt加密）
-- 注意：这里使用的是示例哈希，生产环境需要使用真实的bcrypt哈希
INSERT INTO users (id, username, email, password_hash, role) VALUES
('01234567-89ab-cdef-0123-456789abcdef', 'admin', 'admin@example.com', '$2b$10$example.hash.here.replace.in.production', 'admin'),
('76543210-89ab-cdef-0123-456789abcdef', 'author1', 'author1@example.com', '$2b$10$example.hash.here.replace.in.production', 'author')
ON CONFLICT (email) DO NOTHING;

-- 插入示例文档
INSERT INTO documents (id, slug, title, description, content, author_id, status, category, tags)
VALUES (
  'ffffffff-89ab-cdef-0123-456789abcdef',
  'telegram-bot-guide',
  'Telegram Bot 开发指南',
  '详细介绍如何创建和配置 Telegram 机器人',
  '---
title: Telegram Bot 开发指南
description: 详细介绍如何创建和配置 Telegram 机器人
---

## 简介
Telegram Bot 是一个强大的自动化工具...

## 第一步：创建 Bot
1. 在 Telegram 中搜索 @BotFather
2. 发送 /newbot 命令
3. 按提示设置机器人名称
',
  '01234567-89ab-cdef-0123-456789abcdef',
  'published',
  'tutorial',
  '["telegram", "bot", "api", "guide"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 实用查询示例
-- ============================================

-- 查询所有已发布的文档
-- SELECT id, slug, title, description, author_id, created_at, published_at
-- FROM documents
-- WHERE status = 'published'
-- ORDER BY published_at DESC;

-- 查询某个用户的所有文档
-- SELECT * FROM documents WHERE author_id = '01234567-89ab-cdef-0123-456789abcdef';

-- 按标签搜索文档
-- SELECT * FROM documents
-- WHERE tags @> '["telegram"]'::jsonb
--   AND status = 'published'
-- ORDER BY created_at DESC;

-- 按分类查询文档
-- SELECT * FROM documents
-- WHERE category = 'tutorial'
--   AND status = 'published'
-- ORDER BY created_at DESC;

-- 统计各状态文档数量
-- SELECT status, COUNT(*) as count
-- FROM documents
-- GROUP BY status;

-- 查询最受欢迎的文档（按浏览量）
-- SELECT id, title, slug, view_count
-- FROM documents
-- WHERE status = 'published'
-- ORDER BY view_count DESC
-- LIMIT 10;

-- ============================================
-- 结束
-- ============================================
