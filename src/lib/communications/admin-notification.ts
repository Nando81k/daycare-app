import { Resend } from 'resend';
import { BRAND } from '@/lib/branding';

export interface AdminNotificationEmailInput {
  to: string;
  subject: string;
  message: string;
  recipientFirstName?: string | null;
}

export interface AdminNotificationEmailResult {
  attempted: boolean;
  sent: boolean;
  reason?: string;
  error?: string;
}

export async function sendAdminNotificationEmail(
  input: AdminNotificationEmailInput,
): Promise<AdminNotificationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    return {
      attempted: false,
      sent: false,
      reason: 'EMAIL_NOT_CONFIGURED',
    };
  }

  const greetingName = input.recipientFirstName?.trim() || 'Parent';
  const text = [
    `Hi ${greetingName},`,
    '',
    input.message,
    '',
    `${BRAND.name}`,
  ].join('\n');

  try {
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from: fromEmail,
      to: input.to,
      subject: input.subject,
      text,
    });

    if (response.error) {
      return {
        attempted: true,
        sent: false,
        error: response.error.message,
      };
    }

    return {
      attempted: true,
      sent: true,
    };
  } catch (error) {
    return {
      attempted: true,
      sent: false,
      error: error instanceof Error ? error.message : 'Unknown email delivery error',
    };
  }
}
