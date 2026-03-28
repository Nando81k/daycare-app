import { randomUUID } from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface S3Config {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  forcePathStyle: boolean;
}

function getS3Config(): S3Config | null {
  const bucket = process.env.S3_BUCKET?.trim();
  const region = process.env.S3_REGION?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint: endpoint || undefined,
    forcePathStyle,
  };
}

export function isS3Configured() {
  return Boolean(getS3Config());
}

function requireS3Config() {
  const config = getS3Config();
  if (!config) {
    throw new Error('S3 storage is not configured');
  }
  return config;
}

function createS3Client(config: S3Config) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function fileExtension(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : 'jpg';
}

export function createChildPhotoStorageKey(parentId: string, fileName: string) {
  const ext = fileExtension(fileName);
  return `parents/${parentId}/children/${randomUUID()}.${ext}`;
}

export function isChildPhotoStorageKeyForParent(parentId: string, storageKey: string) {
  const key = storageKey.trim();
  if (!key) return false;
  if (key.includes('..')) return false;
  const prefix = `parents/${parentId}/children/`;
  return key.startsWith(prefix) && key.length > prefix.length;
}

export async function createChildPhotoUploadUrl(input: {
  parentId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const config = requireS3Config();
  const client = createS3Client(config);
  const storageKey = createChildPhotoStorageKey(input.parentId, input.fileName);

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: storageKey,
    ContentType: input.mimeType,
    ContentLength: input.sizeBytes,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });

  return {
    uploadUrl,
    storageKey,
    expiresInSeconds: 60 * 5,
  };
}
