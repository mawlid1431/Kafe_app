import { useState } from 'react';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { AdminFormField } from '@/admin/components/AdminFormField';
import { AdminImageField } from '@/admin/components/AdminImageField';
import { AdminModal } from '@/admin/components/AdminModal';
import { PageHeader } from '@/admin/components/PageHeader';
import { useApiMutation, useApiQuery } from '@/lib/useApiQuery';
import type { Promo } from '@/lib/apiTypes';
import { cn } from '@/lib/utils';

type FormState = {
  title: string;
  subtitle: string;
  code: string;
  imageUrl: string;
  imagePublicId: string;
  active: boolean;
};

const emptyForm = (): FormState => ({
  title: '',
  subtitle: '',
  code: '',
  imageUrl: '',
  imagePublicId: '',
  active: true,
});

export function AdminPromosPage() {
  const adminToken = useAdminToken();
  const promos = useApiQuery<Promo[]>(adminToken ? '/admin/promos' : null);
  const mutate = useApiMutation();

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');

  function openEdit(promo: Promo) {
    setForm({
      title: promo.title,
      subtitle: promo.subtitle,
      code: promo.code,
      imageUrl: promo.imageUrl ?? '',
      imagePublicId: promo.imagePublicId ?? '',
      active: promo.active,
    });
    setEditingId(promo.id);
    setError('');
    setModal('edit');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promos"
        description="Home banners and checkout promo codes for the mobile app."
        action={
          <button type="button" className="admin-btn" onClick={() => { setForm(emptyForm()); setError(''); setModal('add'); }}>
            <Plus className="h-4 w-4" />
            Add promo
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {promos?.map((promo, i) => (
          <div key={promo.id} className={cn('admin-card group overflow-hidden p-0 animate-page', `stagger-${(i % 3) + 1}`)}>
            {promo.imageUrl ? (
              <div className="relative overflow-hidden">
                <img src={promo.imageUrl} alt="" className="h-36 w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-3 left-3 admin-badge bg-white/90 font-mono text-primary shadow-sm">
                  <Tag className="h-3 w-3" />
                  {promo.code}
                </span>
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-2 p-5">
              <div>
                <p className="font-semibold text-coffee-dark">{promo.title}</p>
                <p className="mt-1 text-sm text-muted">{promo.subtitle}</p>
                {!promo.imageUrl && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary-soft px-2 py-1 font-mono text-xs font-semibold text-primary">
                    <Tag className="h-3 w-3" />
                    {promo.code}
                  </p>
                )}
                <p className="mt-2">
                  <span className={cn('admin-badge', promo.active ? 'bg-primary/10 text-primary' : 'bg-cream text-muted')}>
                    {promo.active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" className="admin-btn-ghost h-9 w-9 p-0" onClick={() => openEdit(promo)}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="admin-btn-ghost h-9 w-9 p-0 !text-error"
                  onClick={async () => {
                    if (!adminToken || !confirm('Delete promo?')) return;
                    await mutate(`/admin/promos/${promo.id}`, { method: 'DELETE' });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        open={Boolean(modal && adminToken)}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add promo' : 'Edit promo'}
        description="Shown on home carousel and checkout in the app."
        size="md"
        footer={
          <>
            <button type="submit" form="promo-form" className="admin-btn flex-1">Save promo</button>
            <button type="button" className="admin-btn-ghost flex-1" onClick={() => setModal(null)}>Cancel</button>
          </>
        }
      >
        <form
          id="promo-form"
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!adminToken) return;
            const payload = {
              title: form.title,
              subtitle: form.subtitle,
              code: form.code,
              imageUrl: form.imageUrl || undefined,
              imagePublicId: form.imagePublicId || undefined,
              active: form.active,
            };
            try {
              if (modal === 'add') {
                await mutate('/admin/promos', { method: 'POST', body: payload });
              } else if (editingId) {
                await mutate(`/admin/promos/${editingId}`, { method: 'PATCH', body: payload });
              }
              setModal(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not save the promo.');
            }
          }}
        >
          <AdminFormField label="Title">
            <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </AdminFormField>
          <AdminFormField label="Subtitle">
            <input className="admin-input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} required />
          </AdminFormField>
          <AdminFormField label="Promo code">
            <input className="admin-input font-mono uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </AdminFormField>
          <AdminImageField
            label="Banner image"
            folder="promos"
            value={{ imageUrl: form.imageUrl, imagePublicId: form.imagePublicId }}
            onChange={(next) => setForm({ ...form, ...next })}
          />
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-outline-variant/40 bg-cream/40 px-4 py-3 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span className="font-medium text-coffee-dark">Active in app</span>
          </label>
          {error ? <p className="text-sm text-error">{error}</p> : null}
        </form>
      </AdminModal>
    </div>
  );
}
