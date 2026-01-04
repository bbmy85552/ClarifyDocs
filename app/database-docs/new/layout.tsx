'use client';

import type { ReactNode } from 'react';

export default function NewLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
