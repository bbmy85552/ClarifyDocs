'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleLoginButton() {
  const { login } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 加载 Google Identity Services
    const loadGoogleScript = () => {
      if (typeof window === 'undefined' || window.google) return;

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleButton;
      script.onerror = () => {
        setError('加载 Google 登录失败');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    };

    const initializeGoogleButton = () => {
      if (!window.google || !buttonRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          width: 300,
          logo_alignment: 'left',
        });

        setIsLoading(false);
      } catch (err) {
        console.error('初始化 Google 按钮失败:', err);
        setError('初始化登录按钮失败');
        setIsLoading(false);
      }
    };

    loadGoogleScript();
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      setError(null);
      setSuccess(false);

      // 发送 token 到后端验证
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '登录失败');
      }

      // 登录成功，保存用户信息
      login(data.user);
      setSuccess(true);

      // 显示成功消息后跳转
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err) {
      console.error('登录错误:', err);
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isLoading && (
        <div className="flex items-center justify-center w-[300px] h-[40px]">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      )}
      <div ref={buttonRef} className={isLoading ? 'hidden' : ''} />

      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600 dark:text-green-400 text-sm text-center">
          登录成功！正在跳转...
        </div>
      )}
    </div>
  );
}
