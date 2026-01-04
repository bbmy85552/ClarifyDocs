import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { syncDocumentToFileSystem } from '@/lib/document-sync';

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/documents - 获取文档列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const authorId = searchParams.get('author_id');

    const offset = (page - 1) * limit;

    // 构建 WHERE 条件
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    if (authorId) {
      conditions.push(`author_id = $${paramIndex++}`);
      params.push(authorId);
    }

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`);
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    // 查询文档列表
    const query = `
      SELECT
        id, slug, title, description, author_id, status,
        category, tags, view_count, created_at, updated_at, published_at
      FROM documents
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM documents
      ${whereClause}
    `;
    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      documents: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取文档列表失败:', error);
    return NextResponse.json(
      { error: '获取文档列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/documents - 创建新文档
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      title,
      description,
      content,
      author_id,
      status = 'draft',
      category = 'general',
      tags = [],
    } = body;

    // 验证必填字段
    if (!title || !content || !author_id) {
      return NextResponse.json(
        { error: '缺少必填字段：title, content, author_id' },
        { status: 400 }
      );
    }

    // 如果没有提供 slug，自动生成
    const finalSlug = slug || `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    // 插入文档
    const query = `
      INSERT INTO documents (slug, title, description, content, author_id, status, category, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      finalSlug,
      title,
      description || '',
      content,
      author_id,
      status,
      category,
      JSON.stringify(tags),
    ];

    const result = await pool.query(query, values);
    const document = result.rows[0];

    // 不再同步到文件系统（数据库优先架构）
    // 之前：if (status === 'published') { await syncDocumentToFileSystem(...) }

    return NextResponse.json({
      document,
      message: status === 'published' ? '文档发布成功' : '草稿保存成功',
    }, { status: 201 });
  } catch (error) {
    console.error('创建文档失败:', error);

    // 检查是否是 slug 冲突
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Slug 已存在，请使用其他 slug' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: '创建文档失败' },
      { status: 500 }
    );
  }
}
