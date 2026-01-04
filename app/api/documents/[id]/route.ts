import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { syncDocumentToFileSystem, deleteDocumentFromFileSystem } from '@/lib/document-sync';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/documents/[id] - 获取单个文档
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const query = 'SELECT * FROM documents WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      document: result.rows[0],
    });
  } catch (error) {
    console.error('获取文档失败:', error);
    return NextResponse.json(
      { error: '获取文档失败' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - 更新文档
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      slug,
      title,
      description,
      content,
      status,
      category,
      tags,
    } = body;

    // 检查文档是否存在
    const checkQuery = 'SELECT * FROM documents WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      );
    }

    // 构建更新查询
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (slug !== undefined) {
      updateFields.push(`slug = $${paramIndex++}`);
      values.push(slug);
    }
    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      values.push(content);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (category !== undefined) {
      updateFields.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${paramIndex++}`);
      values.push(JSON.stringify(tags));
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '没有要更新的字段' },
        { status: 400 }
      );
    }

    // 添加 updated_at 和文档 ID
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE documents
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const document = result.rows[0];

    // 不再同步到文件系统（数据库优先架构）
    // 之前：if (document.status === 'published') { await syncDocumentToFileSystem(...) }

    return NextResponse.json({
      document,
      message: document.status === 'published' ? '文档发布成功' : '文档更新成功',
    });
  } catch (error) {
    console.error('更新文档失败:', error);

    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Slug 已存在' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: '更新文档失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - 删除文档
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 检查文档是否存在
    const checkQuery = 'SELECT * FROM documents WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      );
    }

    // 删除文档
    const deleteQuery = 'DELETE FROM documents WHERE id = $1 RETURNING *';
    const result = await pool.query(deleteQuery, [id]);
    const document = result.rows[0];

    // 不再删除文件系统文件（数据库优先架构）
    // 之前：await deleteDocumentFromFileSystem(document.slug);

    return NextResponse.json({
      document,
      message: '文档删除成功',
    });
  } catch (error) {
    console.error('删除文档失败:', error);
    return NextResponse.json(
      { error: '删除文档失败' },
      { status: 500 }
    );
  }
}
