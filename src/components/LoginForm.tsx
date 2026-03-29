'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const response = await signIn('credentials', { email, password, redirect: false });

    if (!response?.ok) {
      setError('Invalid email or password.');
      setIsLoading(false);
      return;
    }

    const me = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!me.ok) {
      router.push('/dashboard');
      return;
    }

    const data = await me.json();
    router.push(data.role === 'ADMIN' ? '/admin' : '/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 shadow-sm">
          <p className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      ) : null}
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button
        type="submit"
        fullWidth
        className="rounded-[7px]"
        isLoading={isLoading}
        loadingText="Signing in"
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        Sign In
      </Button>
    </form>
  );
}
