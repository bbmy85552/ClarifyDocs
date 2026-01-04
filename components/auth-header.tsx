'use client';

import { useAuth } from '@/lib/auth-context';
import { UserMenu } from '@/components/user-menu';
import Link from 'next/link';

export function AuthHeader() {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <UserMenu />
      ) : (
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          登录
        </Link>
      )}
    </div>
  );
}
