'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NavBar } from './NavBar';
import { Spinner } from './LoadingIndicators';
import { getStoredToken, clearToken } from '@/lib/auth';

const PUBLIC_ROUTES = ['/sign-in'];

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const isPublicRoute = useMemo(() => PUBLIC_ROUTES.includes(pathname ?? ''), [pathname]);

  useEffect(() => {
    if (isPublicRoute) {
      setChecking(false);
      return;
    }

    const token = getStoredToken();

    if (!token) {
      clearToken();
      router.replace('/sign-in');
      return;
    }

    setChecking(false);
  }, [isPublicRoute, router]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <Spinner className="h-10 w-10 text-[#00baff]" />
        <p className="text-sm font-medium text-gray-600">Verifying admin access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
