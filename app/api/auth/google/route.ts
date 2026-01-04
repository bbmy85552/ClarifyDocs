import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { error: '缺少凭证' },
        { status: 400 }
      );
    }

    // 验证 Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json(
        { error: '无效的凭证' },
        { status: 401 }
      );
    }

    // 从 payload 中提取用户信息
    const {
      sub: googleId,
      email,
      name: username,
      picture: avatar,
    } = payload;

    // 连接数据库，查询或创建用户
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // 查询用户是否已存在
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    let user;

    if (result.rows.length > 0) {
      // 用户已存在，更新信息
      const updateResult = await pool.query(
        `UPDATE users
         SET username = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [username || result.rows[0].username, result.rows[0].id]
      );
      user = updateResult.rows[0];
    } else {
      // 创建新用户
      const insertResult = await pool.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          username || email.split('@')[0],
          email,
          'google_oauth', // 标记为 Google 登录用户
          'author', // 默认角色
        ]
      );
      user = insertResult.rows[0];
    }

    await pool.end();

    // 返回用户信息（不包含敏感信息）
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar,
      },
    });

  } catch (error) {
    console.error('Google 登录错误:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
