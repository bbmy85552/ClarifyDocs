import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';
import { AuthHeader } from '@/components/auth-header';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions}
      nav={{
        ...baseOptions.nav,
        children: <AuthHeader />,
      }}
    >
      {children}
    </HomeLayout>
  );
}
