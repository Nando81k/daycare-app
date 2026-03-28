'use client';

import { useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface PhotoValue {
  photoStorageKey: string | null;
  photoMimeType: 'image/jpeg' | 'image/png' | 'image/webp' | null;
  photoSizeBytes: number | null;
  previewUrl: string | null;
}

export function ChildPhotoUploader(props: {
  value: PhotoValue;
  disabled?: boolean;
  onChange: (next: PhotoValue) => void;
}) {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or less.');
      return;
    }

    setUploading(true);

    const signResponse = await fetch('/api/v3/parent/family/uploads/child-photo-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      }),
    });
    const signPayload = await signResponse.json().catch(() => null);

    if (!signResponse.ok) {
      setError(signPayload?.error?.message || 'Unable to prepare photo upload.');
      setUploading(false);
      return;
    }

    const uploadResponse = await fetch(signPayload.uploadUrl as string, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      setError('Photo upload failed. Please try again.');
      setUploading(false);
      return;
    }

    props.onChange({
      photoStorageKey: signPayload.storageKey,
      photoMimeType: file.type as PhotoValue['photoMimeType'],
      photoSizeBytes: file.size,
      previewUrl: URL.createObjectURL(file),
    });

    setUploading(false);
  }

  function clearPhoto() {
    setError('');
    props.onChange({
      photoStorageKey: null,
      photoMimeType: null,
      photoSizeBytes: null,
      previewUrl: null,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink-700">Child photo</p>
        {props.value.photoStorageKey ? (
          <Button type="button" size="sm" variant="ghost" onClick={clearPhoto} disabled={props.disabled || uploading} leftIcon={<Trash2 className="h-4 w-4" />}>
            Remove
          </Button>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-center gap-2 rounded-field border border-dashed border-white/65 bg-white/75 px-3 py-2 text-sm text-ink-700 hover:border-sky-300">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin text-sky-700" /> : <ImagePlus className="h-4 w-4 text-sky-700" />}
        {uploading ? 'Uploading photo...' : props.value.photoStorageKey ? 'Replace photo' : 'Upload photo'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileSelected}
          disabled={props.disabled || uploading}
        />
      </label>

      {props.value.previewUrl ? (
        <div className="overflow-hidden rounded-field border border-white/65 bg-white/90 p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.value.previewUrl} alt="Child preview" className="h-20 w-20 rounded-field object-cover" />
        </div>
      ) : props.value.photoStorageKey ? (
        <p className="text-xs text-emerald-700">Photo uploaded and ready to submit.</p>
      ) : null}

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
