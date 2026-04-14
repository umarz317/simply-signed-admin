'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken, getStoredUser, storeUser, type StoredAdminUser } from '@/lib/auth';
import { getCurrentUserProfile } from '@/lib/api';

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

function getUserInitials(user: StoredAdminUser | null) {
  const firstName = user?.firstName?.trim();
  const lastName = user?.lastName?.trim();

  if (firstName || lastName) {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'A';
  }

  const email = user?.email?.trim();
  if (email) {
    const localPart = email.split('@')[0] ?? '';
    const segments = localPart
      .split(/[^a-zA-Z0-9]+/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.length >= 2) {
      return `${segments[0][0]}${segments[1][0]}`.toUpperCase();
    }

    if (localPart.length >= 2) {
      return localPart.slice(0, 2).toUpperCase();
    }

    if (localPart.length === 1) {
      return localPart.toUpperCase();
    }
  }

  return 'A';
}

function getUserFullName(user: StoredAdminUser | null) {
  const fullName = [user?.firstName?.trim(), user?.lastName?.trim()]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || 'Admin User';
}

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<StoredAdminUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const activeMap = useMemo(
    () =>
      navigationLinks.reduce<Record<string, boolean>>((acc, link) => {
        acc[link.href] = isPathActive(pathname, link.href);
        return acc;
      }, {}),
    [pathname]
  );

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser?.email && (storedUser.firstName || storedUser.lastName)) {
      return;
    }

    let cancelled = false;

    async function hydrateUser() {
      try {
        const profile = await getCurrentUserProfile();
        if (cancelled) {
          return;
        }

        const nextUser = {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
        };

        setUser(nextUser);
        storeUser(nextUser);
      } catch {
        // Keep the local fallback state if profile loading fails.
      }
    }

    void hydrateUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const userInitials = useMemo(() => getUserInitials(user), [user]);
  const userFullName = useMemo(() => getUserFullName(user), [user]);
  const userEmail = user?.email?.trim() || 'No email available';

  function handleSignOut() {
    clearToken();
    setMobileOpen(false);
    setProfileOpen(false);
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
          <div className="relative hidden md:block" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              {userInitials}
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{userFullName}</p>
                    <p className="truncate text-xs text-slate-500">{userEmail}</p>
                  </div>
                </div>
              </div>
            )}
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
              <p className="font-semibold">{userFullName}</p>
              <p className="text-slate-300">{userEmail}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
              {userInitials}
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
