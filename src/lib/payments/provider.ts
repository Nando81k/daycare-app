import type Stripe from 'stripe';
import { getStripeServer } from '@/lib/stripe';

export type PaymentProviderKind = 'disconnected' | 'stripe';
export type PaymentProviderState = 'disconnected' | 'connected';

export class PaymentProviderUnavailableError extends Error {
  readonly code = 'PAYMENT_PROVIDER_UNAVAILABLE';
  readonly statusCode = 503;
  readonly paymentProviderState: PaymentProviderState = 'disconnected';

  constructor(message = 'Stripe is not connected for payment checkout') {
    super(message);
  }
}

export function isPaymentProviderUnavailableError(
  error: unknown,
): error is PaymentProviderUnavailableError {
  return error instanceof PaymentProviderUnavailableError;
}

export interface InvoiceCheckoutSessionInput {
  customerId?: string;
  origin: string;
  invoice: {
    id: string;
    parentId: string;
    invoiceNumber: string;
    amountDueCents: number;
    childLabel: string;
  };
}

interface BasePaymentGateway {
  kind: PaymentProviderKind;
  state: PaymentProviderState;
  createInvoiceCheckoutSession(input: InvoiceCheckoutSessionInput): Promise<{
    url: string;
    sessionId: string;
    paymentProviderState: PaymentProviderState;
  }>;
  constructWebhookEvent(input: {
    payload: string;
    signature: string;
    webhookSecret: string;
  }): Stripe.Event;
}

export class DisconnectedGateway implements BasePaymentGateway {
  kind = 'disconnected' as const;
  state = 'disconnected' as const;

  async createInvoiceCheckoutSession(): Promise<{
    url: string;
    sessionId: string;
    paymentProviderState: PaymentProviderState;
  }> {
    throw new PaymentProviderUnavailableError();
  }

  constructWebhookEvent(): Stripe.Event {
    throw new PaymentProviderUnavailableError('Stripe webhook is not configured');
  }
}

export class StripeGateway implements BasePaymentGateway {
  kind = 'stripe' as const;
  state = 'connected' as const;
  stripe: Stripe;

  constructor(stripe: Stripe) {
    this.stripe = stripe;
  }

  async createInvoiceCheckoutSession(input: InvoiceCheckoutSessionInput): Promise<{
    url: string;
    sessionId: string;
    paymentProviderState: PaymentProviderState;
  }> {
    if (!input.customerId) {
      throw new Error('Stripe customer id is required for checkout');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer: input.customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: input.invoice.amountDueCents,
            product_data: {
              name: `Invoice ${input.invoice.invoiceNumber}`,
              description: input.invoice.childLabel,
            },
          },
        },
      ],
      payment_intent_data: {
        setup_future_usage: 'off_session',
        metadata: {
          flow: 'invoice_checkout_v3',
          invoiceId: input.invoice.id,
          parentId: input.invoice.parentId,
          invoiceNumber: input.invoice.invoiceNumber,
        },
      },
      metadata: {
        flow: 'invoice_checkout_v3',
        invoiceId: input.invoice.id,
        parentId: input.invoice.parentId,
        invoiceNumber: input.invoice.invoiceNumber,
      },
      success_url: `${input.origin}/dashboard/billing/pay/${input.invoice.id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin}/dashboard/billing/pay/${input.invoice.id}?checkout=cancel`,
    });

    if (!session.url) {
      throw new Error('Stripe checkout URL missing from response');
    }

    return {
      url: session.url,
      sessionId: session.id,
      paymentProviderState: this.state,
    };
  }

  constructWebhookEvent(input: { payload: string; signature: string; webhookSecret: string }): Stripe.Event {
    return this.stripe.webhooks.constructEvent(input.payload, input.signature, input.webhookSecret);
  }
}

export type PaymentGateway = DisconnectedGateway | StripeGateway;

function normalizeProviderName(value: string | undefined) {
  return value?.trim().toLowerCase() || 'disconnected';
}

export function getPaymentGateway(): PaymentGateway {
  const configuredProvider = normalizeProviderName(process.env.PAYMENT_PROVIDER);
  if (configuredProvider === 'stripe') {
    const stripe = getStripeServer();
    if (stripe) {
      return new StripeGateway(stripe);
    }
  }
  return new DisconnectedGateway();
}

export function getPaymentProvider() {
  return getPaymentGateway();
}

export function getPaymentProviderState(): PaymentProviderState {
  return getPaymentGateway().state;
}
