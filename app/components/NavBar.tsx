'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';

const navigationLinks = [
  { name: 'Home', href: '/' },
  { name: 'Learning', href: '/learning' },
  { name: 'Quick Learning', href: '/quick-learning' },
  { name: 'Other Resources', href: '/resources' },
];

function isPathActive(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  if (href === '/') {
    return pathname === '/';
  }

  return pathname.startsWith(href);
}

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const activeMap = useMemo(
    () =>
      navigationLinks.reduce<Record<string, boolean>>((acc, link) => {
        acc[link.href] = isPathActive(pathname, link.href);
        return acc;
      }, {}),
    [pathname]
  );

  function handleSignOut() {
    clearToken();
    setMobileOpen(false);
    router.replace('/sign-in');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white">
      <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="absolute left-4 sm:left-6 lg:left-8">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setMobileOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="Simply Signed"
              width={200}
              height={60}
              priority
              className="h-16 w-auto"
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-transparent bg-white/80 p-1 shadow-sm shadow-slate-200/60 lg:flex">
          {navigationLinks.map((link) => {
            const active = activeMap[link.href];
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={
                  'group inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors ' +
                  (active
                    ? 'bg-[#00baff] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                }
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute right-4 flex items-center gap-3 sm:right-6 lg:right-8">
          <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white md:flex">
            UA
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="hidden items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 lg:inline-flex"
          >
            Sign out
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <span className="sr-only">Toggle navigation</span>
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={
          'border-t border-slate-200 bg-white/95 px-4 py-3 shadow-sm shadow-slate-200 transition-all duration-200 lg:hidden ' +
          (mobileOpen ? 'block opacity-100' : 'hidden opacity-0')
        }
      >
        <nav className="flex flex-col gap-1">
          {navigationLinks.map((link) => {
            const active = activeMap[link.href];
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={
                  'inline-flex items-center justify-between rounded-lg px-4 py-2 text-base font-medium transition-colors ' +
                  (active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900')
                }
              >
                <span>{link.name}</span>
                {active && (
                  <span
                    className="ml-3 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-sky-700"
                  >
                    Active
                  </span>
                )}
              </Link>
            );
          })}
          <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-900/90 px-4 py-3 text-sm text-slate-100">
            <div>
              <p className="font-semibold">You&apos;re viewing</p>
              <p className="text-slate-300">Simply Signed Admin Console</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
              UA
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
