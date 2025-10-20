'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import { signIn } from '@/lib/api';
import { clearToken, getStoredToken, storeToken } from '@/lib/auth';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      router.replace('/');
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await signIn({ email: email.trim(), password });
      clearToken();
      storeToken(response.token);
      router.replace('/');
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to complete sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || !email.trim() || password.length === 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white/90 p-8 shadow-xl shadow-sky-200/40 backdrop-blur">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Simply Signed Logo"
              width={120}
              height={60}
              priority
              className="h-auto w-auto"
            />
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin Console</h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition focus:border-[#00baff] focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition focus:border-[#00baff] focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00baff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0099cc] focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            <LogIn className="h-5 w-5" />
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
