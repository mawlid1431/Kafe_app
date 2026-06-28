import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Plus, Shield } from 'lucide-react';
import { api } from '@convex/_generated/api';
import { useAdminToken } from '@/admin/AdminAuthContext';
import { AdminFormField } from '@/admin/components/AdminFormField';
import { AdminModal } from '@/admin/components/AdminModal';
import { PageHeader } from '@/admin/components/PageHeader';
import { cn } from '@/lib/utils';

export function AdminStaffPage() {
  const adminToken = useAdminToken();
  const staff = useQuery(api.admins.listStaff, adminToken ? { adminToken } : 'skip');
  const me = useQuery(api.admins.me, adminToken ? { adminToken } : 'skip');
  const createStaff = useMutation(api.admins.createStaff);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    displayName: '',
    email: '',
    role: 'staff' as 'staff' | 'superadmin',
  });
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = me?.isSuperAdmin ?? false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description="Team members who can access this admin panel."
        action={
          isSuperAdmin ? (
            <button type="button" className="admin-btn" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add staff
            </button>
          ) : undefined
        }
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {staff?.map((member) => (
              <tr key={member._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                      {member.displayName[0]?.toUpperCase() ?? 'A'}
                    </div>
                    <div>
                      <p className="font-medium text-coffee-dark">{member.displayName}</p>
                      <p className="text-xs text-muted">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="font-mono text-sm text-muted">@{member.username}</td>
                <td>
                  <span className={cn('admin-badge capitalize', member.role === 'superadmin' ? 'bg-primary/15 text-primary-dark' : 'bg-cream text-coffee-title')}>
                    <Shield className="mr-1 inline h-3 w-3" />
                    {member.role}
                  </span>
                </td>
                <td>
                  <span className={cn('admin-badge', member.active ? 'bg-primary/10 text-primary' : 'bg-cream text-muted')}>
                    {member.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal
        open={showForm && isSuperAdmin && Boolean(adminToken)}
        onClose={() => setShowForm(false)}
        title="Add staff member"
        description="They can sign in at the admin login page."
        size="md"
        footer={
          <>
            <button type="submit" form="staff-form" className="admin-btn flex-1">Create account</button>
            <button type="button" className="admin-btn-ghost flex-1" onClick={() => setShowForm(false)}>Cancel</button>
          </>
        }
      >
        <form
          id="staff-form"
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!adminToken) return;
            setError(null);
            try {
              await createStaff({ adminToken, ...form });
              setShowForm(false);
              setForm({ username: '', password: '', displayName: '', email: '', role: 'staff' });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to create staff.');
            }
          }}
        >
          <AdminFormField label="Display name">
            <input className="admin-input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
          </AdminFormField>
          <AdminFormField label="Email">
            <input className="admin-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
          </AdminFormField>
          <AdminFormField label="Username">
            <input className="admin-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </AdminFormField>
          <AdminFormField label="Password">
            <input className="admin-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required />
          </AdminFormField>
          <AdminFormField label="Role">
            <select className="admin-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'staff' | 'superadmin' })}>
              <option value="staff">Staff</option>
              <option value="superadmin">Super admin</option>
            </select>
          </AdminFormField>
          {error && <p className="animate-fade-in text-sm text-error">{error}</p>}
        </form>
      </AdminModal>
    </div>
  );
}
