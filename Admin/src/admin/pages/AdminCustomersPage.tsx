import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Pencil, Users } from 'lucide-react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { AdminFormField } from '@/admin/components/AdminFormField';
import { AdminModal } from '@/admin/components/AdminModal';
import { PageHeader } from '@/admin/components/PageHeader';
import { cn, formatDate } from '@/lib/utils';

export function AdminCustomersPage() {
  const adminToken = useAdminToken();
  const customers = useQuery(api.customersAdmin.listCustomers, adminToken ? { adminToken } : 'skip');
  const updateCustomer = useMutation(api.customersAdmin.updateCustomer);

  const [editingId, setEditingId] = useState<Id<'users'> | null>(null);
  const [points, setPoints] = useState('0');
  const [suspended, setSuspended] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Everyone who signs in on the Kafe Eman mobile app — manage points and access."
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Points</th>
              <th>Joined</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {customers?.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                      {user.name[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-medium text-coffee-dark">{user.name}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="font-semibold text-primary">{user.points}</span>
                  <span className="ml-1 text-xs text-muted">pts</span>
                </td>
                <td className="text-muted">{formatDate(user.createdAt)}</td>
                <td>
                  <span className={cn('admin-badge', user.suspended ? 'bg-red-50 text-error' : 'bg-primary/10 text-primary')}>
                    {user.suspended ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-btn-ghost h-9 w-9 p-0"
                    onClick={() => {
                      setEditingId(user._id);
                      setPoints(String(user.points));
                      setSuspended(user.suspended);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers?.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <Users className="h-10 w-10 text-muted/40" />
            <p className="text-sm text-muted">No users yet — they appear when someone signs in on the app.</p>
          </div>
        )}
      </div>

      <AdminModal
        open={Boolean(editingId && adminToken)}
        onClose={() => setEditingId(null)}
        title="Edit user"
        description="Adjust loyalty points or suspend account access."
        size="sm"
        footer={
          <>
            <button type="submit" form="user-edit-form" className="admin-btn flex-1">Save</button>
            <button type="button" className="admin-btn-ghost flex-1" onClick={() => setEditingId(null)}>Cancel</button>
          </>
        }
      >
        <form
          id="user-edit-form"
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!adminToken || !editingId) return;
            await updateCustomer({
              adminToken,
              userId: editingId,
              points: Number.parseInt(points, 10) || 0,
              suspended,
            });
            setEditingId(null);
          }}
        >
          <AdminFormField label="Loyalty points">
            <input className="admin-input" value={points} onChange={(e) => setPoints(e.target.value)} type="number" min={0} />
          </AdminFormField>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-red-200/60 bg-red-50/50 px-4 py-3 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-error" checked={suspended} onChange={(e) => setSuspended(e.target.checked)} />
            <span className="font-medium text-error">Suspend account</span>
          </label>
        </form>
      </AdminModal>
    </div>
  );
}
