'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Users, UserPlus, Shield, Pencil, Trash2, Clock } from 'lucide-react';

type UserRole = 'superadmin' | 'admin' | 'manager' | 'editor' | 'support' | 'viewer';

type AdminUser = {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  isPermanent?: boolean;
  createdAt: string;
};

type UserActivity = {
  _id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  email?: string;
  meta?: {
    action?: string;
    targetUserEmail?: string;
    actorEmail?: string;
  };
  createdAt: string;
};

type UsersApiResponse = {
  success: boolean;
  users: AdminUser[];
  activities: UserActivity[];
  permanentAdminEmail: string | null;
  availableRoles: UserRole[];
};

const defaultForm = {
  name: '',
  email: '',
  password: '',
  role: 'admin' as UserRole,
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['superadmin', 'admin', 'manager', 'editor', 'support', 'viewer']);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [editingUserId, setEditingUserId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(defaultForm);

  const myRole = ((session?.user as any)?.role || '') as UserRole | '';
  const canManageUsers = myRole === 'superadmin';

  const selectedUser = useMemo(
    () => users.find((u) => u.email === selectedUserEmail) || users[0],
    [users, selectedUserEmail]
  );

  const selectedUserActivities = useMemo(() => {
    if (!selectedUser) return [];

    return activities
      .filter((entry) => {
        const actor = (entry.email || '').toLowerCase();
        const target = (entry.meta?.targetUserEmail || '').toLowerCase();
        const selected = selectedUser.email.toLowerCase();
        return actor === selected || target === selected;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 25);
  }, [activities, selectedUser]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = (await response.json()) as UsersApiResponse;

      if (!response.ok || !data.success) {
        throw new Error((data as any)?.error || 'Failed to load users');
      }

      setUsers(data.users || []);
      setActivities(data.activities || []);
      setAvailableRoles(data.availableRoles || availableRoles);

      if (data.users?.length > 0) {
        const hasSelection = data.users.some((u) => u.email === selectedUserEmail);
        if (!hasSelection) {
          setSelectedUserEmail(data.users[0].email);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function clearNotices() {
    setError('');
    setMessage('');
  }

  function startEdit(user: AdminUser) {
    clearNotices();
    setEditingUserId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
  }

  function resetForm() {
    setEditingUserId('');
    setForm(defaultForm);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!canManageUsers) return;

    clearNotices();
    setSaving(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create user');
      }

      setMessage('User created successfully.');
      resetForm();
      await fetchUsers();
    } catch (e: any) {
      setError(e?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!canManageUsers || !editingUserId) return;

    clearNotices();
    setSaving(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUserId,
          name: form.name,
          role: form.role,
          password: form.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update user');
      }

      setMessage('User updated successfully.');
      resetForm();
      await fetchUsers();
    } catch (e: any) {
      setError(e?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    if (!canManageUsers) return;
    if (!confirm(`Delete user ${user.email}?`)) return;

    clearNotices();
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users?userId=${user._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete user');
      }

      setMessage('User deleted successfully.');
      await fetchUsers();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete user');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-600 mt-3">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-sm text-gray-500">Manage admins and role-based panel users with full activity history.</p>
        </div>
      </div>

      {!canManageUsers && (
        <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm">
          You are in read-only mode. Only superadmin can create, edit, or delete users.
        </div>
      )}

      {error && <div className="p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">{error}</div>}
      {message && <div className="p-3 rounded-lg border border-green-300 bg-green-50 text-green-700 text-sm">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">All Users</h2>
            <button
              onClick={fetchUsers}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-gray-100 hover:bg-gray-50/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <button
                        onClick={() => setSelectedUserEmail(user.email)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {user.email}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isPermanent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                          <Shield className="w-3 h-3" /> Permanent
                        </span>
                      ) : (
                        <span className="text-gray-500">Regular</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={!canManageUsers || !!user.isPermanent}
                          onClick={() => startEdit(user)}
                          className="p-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                          title="Edit user"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          disabled={!canManageUsers || !!user.isPermanent}
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-40"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              {editingUserId ? 'Edit User' : 'Create User'}
            </h2>

            <form onSubmit={editingUserId ? handleUpdateUser : handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={!canManageUsers || saving}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={!!editingUserId || !canManageUsers || saving}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Password {editingUserId ? '(leave blank to keep current)' : ''}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={!editingUserId}
                  disabled={!canManageUsers || saving}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={!canManageUsers || saving}
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!canManageUsers || saving}
                  className="px-3 py-2 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-40"
                >
                  {saving ? 'Saving...' : editingUserId ? 'Update User' : 'Create User'}
                </button>
                {editingUserId && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={resetForm}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Activity History
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Showing latest actions for: <span className="font-semibold text-gray-700">{selectedUser?.email || 'N/A'}</span>
            </p>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {selectedUserActivities.length === 0 ? (
                <p className="text-sm text-gray-500">No activity found for this user yet.</p>
              ) : (
                selectedUserActivities.map((entry) => (
                  <div key={entry._id} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">{entry.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(entry.createdAt).toLocaleString()} • {entry.type}
                    </p>
                    {(entry.meta?.action || entry.meta?.actorEmail || entry.meta?.targetUserEmail) && (
                      <p className="text-xs text-gray-600 mt-1">
                        {entry.meta?.action ? `Action: ${entry.meta.action}` : ''}
                        {entry.meta?.actorEmail ? ` | Actor: ${entry.meta.actorEmail}` : ''}
                        {entry.meta?.targetUserEmail ? ` | Target: ${entry.meta.targetUserEmail}` : ''}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
