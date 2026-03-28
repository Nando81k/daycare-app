import type { EnrollmentStatus } from '@prisma/client';
import { Resend } from 'resend';
import { BRAND } from '@/lib/branding';

type NotificationChannelResult = {
  attempted: boolean;
  sent: boolean;
  reason?: string;
  error?: string;
};

export type EnrollmentDecisionNotificationInput = {
  status: EnrollmentStatus;
  parentFirstName: string;
  parentEmail: string;
  parentPhone?: string | null;
  childFirstName: string;
  childLastName: string;
  startDate?: Date | null;
  holdExpiresAt?: Date | null;
  dashboardUrl: string;
};

export type EnrollmentDecisionNotificationResult = {
  subject: string;
  emailMessage: string;
  smsMessage: string;
  email: NotificationChannelResult;
  sms: NotificationChannelResult;
};

function formatDateTime(value?: Date | null) {
  if (!value) return null;
  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function normalizeUsPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('+')) return trimmed;

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

function buildDecisionContent(input: EnrollmentDecisionNotificationInput) {
  const childName = `${input.childFirstName} ${input.childLastName}`.trim();
  const parentName = input.parentFirstName || 'Parent';
  const formattedStartDate = formatDateTime(input.startDate);
  const formattedHoldExpires = formatDateTime(input.holdExpiresAt);

  if (input.status === 'APPROVED') {
    const subject = `${BRAND.name}: Enrollment approved for ${childName}`;
    const body = [
      `Hi ${parentName},`,
      '',
      `Great news. ${childName}'s enrollment request has been approved.`,
      formattedStartDate ? `Requested start date: ${formattedStartDate}` : null,
      formattedHoldExpires ? `Secure the seat by: ${formattedHoldExpires}` : null,
      '',
      `To secure the seat, complete payment in your parent dashboard: ${input.dashboardUrl}`,
      '',
      `${BRAND.name} Admissions`,
    ]
      .filter(Boolean)
      .join('\n');

    const sms = formattedHoldExpires
      ? `${BRAND.shortName}: ${childName} is approved. Secure the seat by ${formattedHoldExpires} in your portal: ${input.dashboardUrl}`
      : `${BRAND.shortName}: ${childName} is approved. Secure the seat in your portal: ${input.dashboardUrl}`;

    return { subject, body, sms };
  }

  const statusText = input.status === 'WAITLISTED' ? 'waitlisted' : input.status === 'REQUEST_INFO' ? 'needs additional information' : 'not approved';
  const subject = `${BRAND.name}: Enrollment update for ${childName}`;
  const body = [
    `Hi ${parentName},`,
    '',
    `${childName}'s enrollment status has been updated: ${statusText.toUpperCase()}.`,
    '',
    `Please review the details in your parent dashboard: ${input.dashboardUrl}`,
    '',
    `${BRAND.name} Admissions`,
  ]
    .filter(Boolean)
    .join('\n');

  const sms = `${BRAND.shortName}: Enrollment update for ${childName}: ${statusText}. Details in your portal: ${input.dashboardUrl}`;
  return { subject, body, sms };
}

async function sendDecisionEmail(to: string, subject: string, text: string): Promise<NotificationChannelResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    return {
      attempted: false,
      sent: false,
      reason: 'EMAIL_NOT_CONFIGURED',
    };
  }

  try {
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
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

async function sendDecisionSms(to: string | null | undefined, body: string): Promise<NotificationChannelResult> {
  if (!to) {
    return {
      attempted: false,
      sent: false,
      reason: 'PHONE_NOT_AVAILABLE',
    };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_FROM_PHONE;
  if (!accountSid || !authToken || !fromPhone) {
    return {
      attempted: false,
      sent: false,
      reason: 'SMS_NOT_CONFIGURED',
    };
  }

  const normalized = normalizeUsPhone(to);
  if (!normalized) {
    return {
      attempted: false,
      sent: false,
      reason: 'PHONE_INVALID_FORMAT',
    };
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: normalized,
        From: fromPhone,
        Body: body,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return {
        attempted: true,
        sent: false,
        error: `Twilio send failed (${response.status}): ${detail.slice(0, 180)}`,
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
      error: error instanceof Error ? error.message : 'Unknown SMS delivery error',
    };
  }
}

export async function sendEnrollmentDecisionNotifications(
  input: EnrollmentDecisionNotificationInput,
): Promise<EnrollmentDecisionNotificationResult> {
  const content = buildDecisionContent(input);

  const [email, sms] = await Promise.all([
    sendDecisionEmail(input.parentEmail, content.subject, content.body),
    sendDecisionSms(input.parentPhone, content.sms),
  ]);

  return {
    subject: content.subject,
    emailMessage: content.body,
    smsMessage: content.sms,
    email,
    sms,
  };
}
