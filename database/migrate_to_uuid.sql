-- ============================================
-- 从 SERIAL 迁移到 UUID
-- PostgreSQL 16
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 步骤 1: 备份现有数据
-- ============================================

-- 创建备份表（可选）
-- CREATE TABLE users_backup AS SELECT * FROM users;
-- CREATE TABLE documents_backup AS SELECT * FROM documents;

-- ============================================
-- 步骤 2: 添加新的 UUID 列
-- ============================================

-- 为 users 表添加 UUID 列
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE documents ADD COLUMN IF NOT EXISTS new_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE documents ADD COLUMN IF NOT EXISTS new_author_id UUID;

-- ============================================
-- 步骤 3: 迁移外键关系
-- ============================================

-- 为每个文档生成新的 author_id UUID
UPDATE documents d
SET new_author_id = u.new_id
FROM users u
WHERE d.author_id = u.id;

-- ============================================
-- 步骤 4: 更新所有外键引用
-- ============================================

-- 更新 documents 表的 author_id（如果其他表引用了 documents，也需要更新）

-- ============================================
-- 步骤 5: 删除旧的主键、外键和约束
-- ============================================

-- 删除 documents 表的外键约束
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_author_id_fkey;

-- 删除主键约束
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_pkey;

-- ============================================
-- 步骤 6: 重命名列并设置新的主键
-- ============================================

-- users 表
ALTER TABLE users DROP COLUMN IF EXISTS id;
ALTER TABLE users RENAME COLUMN new_id TO id;
ALTER TABLE users ADD PRIMARY KEY (id);

-- documents 表
ALTER TABLE documents DROP COLUMN IF EXISTS id;
ALTER TABLE documents RENAME COLUMN new_id TO id;
ALTER TABLE documents ADD PRIMARY KEY (id);

-- ============================================
-- 步骤 7: 更新外键
-- ============================================

ALTER TABLE documents DROP COLUMN IF EXISTS author_id;
ALTER TABLE documents RENAME COLUMN new_author_id TO author_id;
ALTER TABLE documents ADD CONSTRAINT documents_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- 步骤 8: 重建索引
-- ============================================

-- 删除旧索引
DROP INDEX IF EXISTS idx_documents_author;
DROP INDEX IF EXISTS idx_documents_slug;
DROP INDEX IF EXISTS idx_documents_status;
DROP INDEX IF EXISTS idx_documents_category;
DROP INDEX IF EXISTS idx_documents_tags;
DROP INDEX IF EXISTS idx_documents_created_at;
DROP INDEX IF EXISTS idx_documents_published_at;

-- 创建新索引（使用 UUID）
CREATE INDEX idx_documents_slug ON documents(slug);
CREATE INDEX idx_documents_author ON documents(author_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_published_at ON documents(published_at DESC);

-- ============================================
-- 完成
-- ============================================

-- 验证迁移
SELECT 'Users count:' as info, COUNT(*) FROM users
UNION ALL
SELECT 'Documents count:', COUNT(*) FROM documents
UNION ALL
SELECT 'Documents with author:', COUNT(*) FROM documents WHERE author_id IS NOT NULL;

-- 如果一切正常，可以删除备份表
-- DROP TABLE IF EXISTS users_backup;
-- DROP TABLE IF EXISTS documents_backup;
