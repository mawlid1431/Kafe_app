import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { MapPin, Pencil } from 'lucide-react';
import { api } from '@convex/_generated/api';
import type { Doc, Id } from '@convex/_generated/dataModel';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { AdminFormField } from '@/admin/components/AdminFormField';
import { AdminModal } from '@/admin/components/AdminModal';
import { PageHeader } from '@/admin/components/PageHeader';
import { cn } from '@/lib/utils';

export function AdminBranchesPage() {
  const adminToken = useAdminToken();
  const branches = useQuery(api.branches.listAll, adminToken ? { adminToken } : 'skip');
  const updateBranch = useMutation(api.branches.update);

  const [editing, setEditing] = useState<Doc<'branches'> | null>(null);
  const [form, setForm] = useState({ label: '', address: '', hours: '', active: true });

  function openEdit(branch: Doc<'branches'>) {
    setEditing(branch);
    setForm({
      label: branch.label,
      address: branch.address,
      hours: branch.hours,
      active: branch.active,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description="Store locations shown in the mobile app — Alor Setar, Penang & Kuala Lumpur."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {branches?.map((branch, i) => (
          <div
            key={branch._id}
            className={cn('admin-card group overflow-hidden p-0 animate-page', `stagger-${(i % 4) + 1}`)}
          >
            {branch.imageUrl ? (
              <div className="relative overflow-hidden">
                <img
                  src={branch.imageUrl}
                  alt=""
                  className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition group-hover:opacity-100" />
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-3 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-coffee-dark">{branch.label}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{branch.address}</p>
                <p className="mt-2 text-xs text-muted">{branch.hours}</p>
                <p className="mt-3 text-xs">
                  <span className={cn('admin-badge', branch.active ? 'bg-primary/10 text-primary' : 'bg-cream text-muted')}>
                    {branch.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="ml-2 text-muted">{branch.slug}</span>
                </p>
              </div>
              <button type="button" className="admin-btn-ghost h-10 w-10 shrink-0 p-0 opacity-80 transition group-hover:opacity-100" onClick={() => openEdit(branch)}>
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        open={Boolean(editing && adminToken)}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.label}` : 'Edit branch'}
        description="Changes appear in the mobile app branch picker."
        size="md"
        footer={
          <>
            <button type="submit" form="branch-edit-form" className="admin-btn flex-1">Save changes</button>
            <button type="button" className="admin-btn-ghost flex-1" onClick={() => setEditing(null)}>Cancel</button>
          </>
        }
      >
        <form
          id="branch-edit-form"
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!adminToken || !editing) return;
            await updateBranch({
              adminToken,
              branchId: editing._id as Id<'branches'>,
              label: form.label,
              address: form.address,
              hours: form.hours,
              active: form.active,
            });
            setEditing(null);
          }}
        >
          <AdminFormField label="Branch name">
            <input className="admin-input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
          </AdminFormField>
          <AdminFormField label="Address">
            <textarea className="admin-input min-h-24" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </AdminFormField>
          <AdminFormField label="Opening hours">
            <input className="admin-input" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required />
          </AdminFormField>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-outline-variant/40 bg-cream/40 px-4 py-3 text-sm transition hover:border-primary/30">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span className="font-medium text-coffee-dark">Visible in app</span>
          </label>
        </form>
      </AdminModal>
    </div>
  );
}
