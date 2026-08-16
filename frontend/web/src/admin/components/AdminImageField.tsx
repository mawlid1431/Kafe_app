import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { uploadImage } from '@/lib/apiClient';
import { AdminFormField } from '@/admin/components/AdminFormField';

export type ImageValue = {
  imageUrl: string;
  imagePublicId: string;
};

/**
 * Replaces the old "Image URL" text input.
 *
 * The file goes React → NestJS → Cloudinary; only the returned secure URL and
 * public id are held in form state and later persisted by Prisma. Pasting a URL
 * is still allowed so existing Unsplash links keep working.
 */
export function AdminImageField({
  label = 'Image',
  folder,
  value,
  onChange,
  required,
}: {
  label?: string;
  folder: 'menu' | 'promos' | 'branches';
  value: ImageValue;
  onChange: (next: ImageValue) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const uploaded = await uploadImage(file, folder);
      onChange({ imageUrl: uploaded.imageUrl, imagePublicId: uploaded.publicId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <AdminFormField label={label}>
      <div className="space-y-3">
        {value.imageUrl ? (
          <div className="relative overflow-hidden rounded-xl border border-outline-variant/40">
            <img src={value.imageUrl} alt="" className="h-40 w-full object-cover" />
            <button
              type="button"
              className="admin-btn-ghost absolute right-2 top-2 h-9 w-9 bg-surface/90 p-0 !text-error"
              onClick={() => onChange({ imageUrl: '', imagePublicId: '' })}
              aria-label="Remove image"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="admin-btn-ghost"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? 'Uploading…' : value.imageUrl ? 'Replace image' : 'Upload image'}
          </button>
          <span className="text-xs text-muted">PNG or JPG, up to 5 MB — stored in Cloudinary</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        <input
          className="admin-input"
          value={value.imageUrl}
          placeholder="…or paste an image URL"
          onChange={(e) => onChange({ imageUrl: e.target.value, imagePublicId: '' })}
          required={required}
        />

        {error ? <p className="text-sm text-error">{error}</p> : null}
      </div>
    </AdminFormField>
  );
}
