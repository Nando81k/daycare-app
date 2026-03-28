import { NextResponse } from 'next/server';
import { childPhotoUploadRequestSchema } from '@/lib/validation';
import { createChildPhotoUploadUrl, isS3Configured } from '@/lib/storage/s3';
import { isSameOriginMutationRequest, parseJson, requireApiParent } from '@/lib/route-helpers';

export async function POST(request: Request) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  if (!isSameOriginMutationRequest(request)) {
    return NextResponse.json({ error: { message: 'Forbidden origin' } }, { status: 403 });
  }

  if (!isS3Configured()) {
    return NextResponse.json({ error: { message: 'Child photo uploads are unavailable right now.' } }, { status: 503 });
  }

  const raw = await parseJson<unknown>(request);
  const parsed = childPhotoUploadRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid upload payload' } }, { status: 400 });
  }

  const upload = await createChildPhotoUploadUrl({
    parentId: user.id,
    fileName: parsed.data.fileName,
    mimeType: parsed.data.mimeType,
    sizeBytes: parsed.data.sizeBytes,
  });

  return NextResponse.json({
    uploadUrl: upload.uploadUrl,
    storageKey: upload.storageKey,
    expiresInSeconds: upload.expiresInSeconds,
  });
}
