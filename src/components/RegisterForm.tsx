'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { getPasswordStrength } from '@/lib/password';

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState<string[]>([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const strengthTone =
    strength.score <= 1
      ? 'text-rose-700'
      : strength.score === 2
        ? 'text-amber-700'
        : strength.score === 3
          ? 'text-primary-700'
          : 'text-emerald-700';

  const strengthFill =
    strength.score <= 1
      ? 'bg-rose-400'
      : strength.score === 2
        ? 'bg-amber-400'
        : strength.score === 3
          ? 'bg-primary-500'
          : 'bg-emerald-500';

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setDetails([]);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!strength.isValid) {
      setError('Password does not meet security requirements.');
      setDetails(strength.rules.filter((rule) => !rule.passed).map((rule) => rule.label));
      return;
    }

    setIsLoading(true);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error?.message || 'Unable to create account');
      setDetails(Array.isArray(payload?.error?.details) ? payload.error.details : []);
      setIsLoading(false);
      return;
    }

    router.push('/login?registered=true');
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error ? (
        <div className="rounded-field border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 shadow-sm">
          <p className="inline-flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>
          {details.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required />
        <Input label="Last name" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required />
      </div>
      <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
      <div className="space-y-3">
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <p className="font-semibold text-ink-700">Password strength</p>
            <p className={`font-semibold ${strengthTone}`}>{strength.label}</p>
          </div>
          <div className="grid grid-cols-4 gap-1.5 rounded-field border border-line bg-white p-1.5">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full ${index < strength.score ? strengthFill : 'bg-ink-200'}`}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-1.5">
          {strength.rules.map((rule) => (
            <p key={rule.key} className={`inline-flex items-center gap-1.5 text-xs ${rule.passed ? 'text-emerald-700' : 'text-ink-600'}`}>
              {rule.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              {rule.label}
            </p>
          ))}
        </div>
      </div>
      <Input
        label="Confirm password"
        type="password"
        value={form.confirmPassword}
        onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
        required
      />
      <Button type="submit" fullWidth isLoading={isLoading} loadingText="Creating account">
        Create Account
      </Button>
    </form>
  );
}
