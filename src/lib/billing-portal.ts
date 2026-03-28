import { getStripeServer } from '@/lib/stripe';

export type PortalReadinessCode =
  | 'READY'
  | 'STRIPE_NOT_CONFIGURED'
  | 'STRIPE_AUTH_FAILED'
  | 'PORTAL_CONFIG_MISSING'
  | 'UNAVAILABLE';

export interface PortalReadiness {
  enabled: boolean;
  code: PortalReadinessCode;
  message: string;
  checkedAt: string;
}

function ready(message: string): PortalReadiness {
  return { enabled: true, code: 'READY', message, checkedAt: new Date().toISOString() };
}

function notReady(code: PortalReadinessCode, message: string): PortalReadiness {
  return { enabled: false, code, message, checkedAt: new Date().toISOString() };
}

export async function getPortalReadiness(): Promise<PortalReadiness> {
  const stripe = getStripeServer();
  if (!stripe) {
    return notReady('STRIPE_NOT_CONFIGURED', 'Billing portal is not configured yet.');
  }

  try {
    await stripe.accounts.retrieve();
  } catch (error) {
    console.error('Stripe auth readiness error', error);
    return notReady('STRIPE_AUTH_FAILED', 'Billing service authentication failed.');
  }

  try {
    const configId = process.env.STRIPE_BILLING_PORTAL_CONFIG_ID;
    if (configId) {
      await stripe.billingPortal.configurations.retrieve(configId);
      return ready('Billing portal is available.');
    }

    const configs = await stripe.billingPortal.configurations.list({ limit: 1 });
    if (!configs.data.length) {
      return notReady('PORTAL_CONFIG_MISSING', 'Billing portal configuration is missing.');
    }

    return ready('Billing portal is available.');
  } catch (error) {
    console.error('Stripe portal readiness error', error);
    return notReady('UNAVAILABLE', 'Billing portal is temporarily unavailable.');
  }
}

export function resolveSafeReturnUrl(input: string | undefined | null, requestOrigin: string) {
  const fallback = `${requestOrigin}/dashboard/billing`;
  if (!input) return fallback;

  if (input.startsWith('/dashboard')) {
    return `${requestOrigin}${input}`;
  }

  try {
    const parsed = new URL(input);
    if (parsed.origin === requestOrigin && parsed.pathname.startsWith('/dashboard')) {
      return parsed.toString();
    }
  } catch {
    return fallback;
  }

  return fallback;
}
