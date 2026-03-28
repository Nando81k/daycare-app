import 'server-only';

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

let cachedKey: Buffer | null = null;

function parseKey(raw: string) {
  const trimmed = raw.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex');
  }

  try {
    const decoded = Buffer.from(trimmed, 'base64');
    if (decoded.length === 32) return decoded;
  } catch {
    // Ignore parse error and throw the standard contract error below.
  }

  throw new Error('FIELD_ENCRYPTION_KEY must be a 32-byte key in base64 or 64-char hex format.');
}

function getKey() {
  if (cachedKey) return cachedKey;
  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('FIELD_ENCRYPTION_KEY is required for sensitive field encryption.');
  }
  cachedKey = parseKey(raw);
  return cachedKey;
}

export function encryptField(plainText: string) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptField(cipherText: string) {
  const payload = Buffer.from(cipherText, 'base64');
  if (payload.length <= IV_BYTES + 16) {
    throw new Error('Invalid encrypted field payload.');
  }

  const iv = payload.subarray(0, IV_BYTES);
  const authTag = payload.subarray(IV_BYTES, IV_BYTES + 16);
  const encrypted = payload.subarray(IV_BYTES + 16);

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function maskSsnLast4(last4: string) {
  return `***-**-${last4}`;
}
