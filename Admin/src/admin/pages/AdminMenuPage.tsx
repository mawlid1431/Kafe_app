import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '@convex/_generated/api';
import type { Doc, Id } from '@convex/_generated/dataModel';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { AdminFormField } from '@/admin/components/AdminFormField';
import { AdminModal } from '@/admin/components/AdminModal';
import { PageHeader } from '@/admin/components/PageHeader';
import { cn, formatPrice } from '@/lib/utils';

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  badge: string;
  active: boolean;
};

const emptyForm = (): FormState => ({
  name: '',
  description: '',
  price: '',
  category: 'Coffee',
  imageUrl: '',
  badge: '',
  active: true,
});

export function AdminMenuPage() {
  const adminToken = useAdminToken();
  const categories = useQuery(api.menuAdmin.categories, adminToken ? { adminToken } : 'skip');
  const [category, setCategory] = useState('All');
  const items = useQuery(
    api.menuAdmin.listAll,
    adminToken ? { adminToken, category: category === 'All' ? undefined : category } : 'skip',
  );
  const createItem = useMutation(api.menuAdmin.create);
  const updateItem = useMutation(api.menuAdmin.update);
  const removeItem = useMutation(api.menuAdmin.remove);

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<Id<'menuItems'> | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const categoryOptions = useMemo(() => categories ?? ['All'], [categories]);

  function openAdd() {
    setForm(emptyForm());
    setEditingId(null);
    setModal('add');
  }

  function openEdit(item: Doc<'menuItems'>) {
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      imageUrl: item.imageUrl,
      badge: item.badge ?? '',
      active: item.active,
    });
    setEditingId(item._id);
    setModal('edit');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu"
        description="Drinks, food & categories synced to the Kafe Eman mobile app menu."
        action={
          <button type="button" className="admin-btn" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add item
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn('admin-tab', category === cat && 'admin-tab-active')}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <img src={item.imageUrl} alt="" className="h-11 w-11 rounded-xl object-cover shadow-sm ring-1 ring-outline-variant/30" />
                    <div>
                      <p className="font-medium text-coffee-dark">{item.name}</p>
                      {item.badge ? <span className="admin-badge mt-1 bg-primary/10 text-primary">{item.badge}</span> : null}
                    </div>
                  </div>
                </td>
                <td className="text-muted">{item.category}</td>
                <td className="font-medium">{formatPrice(item.price)}</td>
                <td>
                  <span className={cn('admin-badge', item.active ? 'bg-primary/10 text-primary' : 'bg-cream text-muted')}>
                    {item.active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button type="button" className="admin-btn-ghost h-9 w-9 p-0" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="admin-btn-ghost h-9 w-9 p-0 !text-error hover:!border-red-200 hover:!bg-red-50"
                      onClick={async () => {
                        if (!adminToken || !confirm('Delete this menu item?')) return;
                        await removeItem({ adminToken, menuItemId: item._id });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal
        open={Boolean(modal && adminToken)}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add menu item' : 'Edit menu item'}
        description="This product will appear in the mobile app menu."
        size="lg"
        footer={
          <>
            <button type="submit" form="menu-item-form" className="admin-btn flex-1">Save item</button>
            <button type="button" className="admin-btn-ghost flex-1" onClick={() => setModal(null)}>Cancel</button>
          </>
        }
      >
        <form
          id="menu-item-form"
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!adminToken) return;
            const price = Number.parseFloat(form.price);
            if (Number.isNaN(price)) return;
            const payload = {
              adminToken,
              name: form.name,
              description: form.description,
              price,
              category: form.category,
              imageUrl: form.imageUrl,
              badge: form.badge || undefined,
              active: form.active,
            };
            if (modal === 'add') await createItem(payload);
            else if (editingId) await updateItem({ ...payload, menuItemId: editingId });
            setModal(null);
          }}
        >
          <AdminFormField label="Name">
            <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </AdminFormField>
          <AdminFormField label="Description">
            <textarea className="admin-input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </AdminFormField>
          <div className="grid grid-cols-2 gap-4">
            <AdminFormField label="Price (RM)">
              <input className="admin-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </AdminFormField>
            <AdminFormField label="Category">
              <input className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            </AdminFormField>
          </div>
          <AdminFormField label="Image URL">
            <input className="admin-input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required />
          </AdminFormField>
          <AdminFormField label="Badge (optional)">
            <input className="admin-input" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Bestseller" />
          </AdminFormField>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-outline-variant/40 bg-cream/40 px-4 py-3 text-sm transition hover:border-primary/30">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span className="font-medium text-coffee-dark">Show in mobile app</span>
          </label>
        </form>
      </AdminModal>
    </div>
  );
}
