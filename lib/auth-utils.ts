import { NextRequest } from 'next/server';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

/**
 * 从请求中获取用户信息
 * 目前从 localStorage 读取，生产环境应该使用 JWT session
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    // 从 header 或 cookie 中获取用户信息
    const userHeader = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');

    if (!userHeader || !userEmail) {
      return null;
    }

    // 实际项目中应该验证 JWT token
    return {
      id: parseInt(userHeader),
      email: userEmail,
      username: '', // 需要从数据库查询
      role: 'author',
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

/**
 * 验证用户是否已登录
 */
export function requireAuth(user: AuthUser | null): AuthUser {
  if (!user) {
    throw new Error('未授权：请先登录');
  }
  return user;
}

/**
 * 验证用户权限
 */
export function requireRole(user: AuthUser, allowedRoles: string[]): AuthUser {
  requireAuth(user);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('权限不足');
  }
  return user;
}

/**
 * 生成唯一 slug
 */
export function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // 添加时间戳避免冲突
  return `${baseSlug}-${Date.now()}`;
}

/**
 * 验证 slug 格式
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
