'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { GoogleLoginButton } from '@/components/google-login-button';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (user) {
    return null; // 正在重定向
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        {/* 头部 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            欢迎回来
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            使用 Google 账号登录以继续
          </p>
        </div>

        {/* Google 登录按钮 */}
        <div className="mt-8">
          <GoogleLoginButton />
        </div>

        {/* 说明信息 */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  );
}
