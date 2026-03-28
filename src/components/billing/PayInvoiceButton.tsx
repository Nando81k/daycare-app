'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface PayInvoiceButtonProps {
  invoiceId: string;
  providerState?: 'connected' | 'disconnected';
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  className?: string;
}

export function PayInvoiceButton({
  invoiceId,
  providerState = 'disconnected',
  label = 'Continue to Secure Checkout',
  size = 'lg',
  fullWidth = true,
  className,
}: PayInvoiceButtonProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function checkout() {
    if (providerState !== 'connected') {
      setError('Stripe is not connected yet. Checkout is currently unavailable.');
      return;
    }

    setError('');
    startTransition(async () => {
      const response = await fetch(`/api/v3/parent/billing/invoices/${invoiceId}/checkout-session`, {
        method: 'POST',
      });

      if (response.status === 401) {
        router.push(`/login?callbackUrl=/dashboard/billing/pay/${invoiceId}`);
        return;
      }

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to start checkout');
        return;
      }

      if (!payload?.url) {
        setError('Stripe checkout URL missing from response');
        return;
      }

      window.location.href = payload.url;
    });
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={checkout}
        isLoading={isPending}
        loadingText="Opening checkout"
        fullWidth={fullWidth}
        size={size}
        disabled={providerState !== 'connected'}
        className={className ?? (size === 'lg' ? 'py-3' : undefined)}
      >
        {label}
      </Button>
      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
