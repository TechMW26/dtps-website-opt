'use client';

import { useEffect, useMemo, useState } from 'react';
import { Percent, Pencil, Plus, Trash2, TicketPercent } from 'lucide-react';
import {
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminPage,
  AdminSelect,
  AdminTextarea,
  EmptyState,
  LoadingState,
  StatCard,
} from '@/components/admin/ui';

type Coupon = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  scope: 'all' | 'specific';
  applicableProductIds: string[];
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  createdAt: string;
};

type CouponForm = {
  code: string;
  name: string;
  description: string;
  scope: 'all' | 'specific';
  applicableProductIds: string;
  discountType: 'percentage' | 'flat';
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

const EMPTY_FORM: CouponForm = {
  code: '',
  name: '',
  description: '',
  scope: 'all',
  applicableProductIds: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
};

function formatDateForInput(value?: string | null) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function formatProductIds(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);

  const stats = useMemo(() => {
    const active = coupons.filter((coupon) => coupon.isActive).length;
    const specific = coupons.filter((coupon) => coupon.scope === 'specific').length;
    const totalUses = coupons.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0);
    return { active, specific, totalUses };
  }, [coupons]);

  async function loadCoupons() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/coupons');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load coupons');
      }
      setCoupons(data.coupons || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(coupon: Coupon) {
    setEditingId(coupon._id);
    setNotice('');
    setError('');
    setForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      scope: coupon.scope,
      applicableProductIds: coupon.applicableProductIds.join(', '),
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue ?? ''),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      startsAt: formatDateForInput(coupon.startsAt),
      endsAt: formatDateForInput(coupon.endsAt),
      isActive: coupon.isActive,
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        code: form.code,
        name: form.name,
        description: form.description,
        scope: form.scope,
        applicableProductIds: formatProductIds(form.applicableProductIds),
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrderAmount: form.minOrderAmount,
        maxDiscountAmount: form.maxDiscountAmount,
        usageLimit: form.usageLimit,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        isActive: form.isActive,
      };

      const response = await fetch('/api/coupons', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save coupon');
      }

      setNotice(editingId ? 'Coupon updated successfully.' : 'Coupon created successfully.');
      resetForm();
      await loadCoupons();
    } catch (err: any) {
      setError(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`/api/coupons?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete coupon');
      }
      setNotice('Coupon deleted successfully.');
      if (editingId === id) {
        resetForm();
      }
      await loadCoupons();
    } catch (err: any) {
      setError(err.message || 'Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminPage
      title="Coupons"
      description="Create and manage percentage or flat coupons for all products or specific product IDs."
      actions={
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          New Coupon
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Coupons" value={coupons.length} icon={<TicketPercent className="h-5 w-5" />} accent="blue" />
        <StatCard label="Active Coupons" value={stats.active} icon={<Percent className="h-5 w-5" />} accent="emerald" />
        <StatCard label="Coupon Uses" value={stats.totalUses} hint={`${stats.specific} product-specific`} icon={<TicketPercent className="h-5 w-5" />} accent="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <AdminCard>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Edit Coupon' : 'Create Coupon'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Use product IDs like `weight-loss-1-month`, `therapeutic-3-months`, or keep the scope set to all products.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <AdminLabel>Coupon Code</AdminLabel>
              <AdminInput
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                placeholder="SUMMER25"
                required
              />
            </div>

            <div>
              <AdminLabel>Coupon Name</AdminLabel>
              <AdminInput
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Summer Campaign"
                required
              />
            </div>

            <div>
              <AdminLabel>Description</AdminLabel>
              <AdminTextarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Optional note shown internally in admin."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <AdminLabel>Applies To</AdminLabel>
                <AdminSelect
                  value={form.scope}
                  onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value as CouponForm['scope'] }))}
                >
                  <option value="all">All Products</option>
                  <option value="specific">Specific Products</option>
                </AdminSelect>
              </div>

              <div>
                <AdminLabel>Discount Type</AdminLabel>
                <AdminSelect
                  value={form.discountType}
                  onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value as CouponForm['discountType'] }))}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (Rs)</option>
                </AdminSelect>
              </div>
            </div>

            {form.scope === 'specific' && (
              <div>
                <AdminLabel>Product IDs</AdminLabel>
                <AdminTextarea
                  value={form.applicableProductIds}
                  onChange={(event) => setForm((current) => ({ ...current, applicableProductIds: event.target.value }))}
                  placeholder="weight-loss-1-month, wedding-bridal-detox"
                  rows={3}
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <AdminLabel>Discount Value</AdminLabel>
                <AdminInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))}
                  placeholder={form.discountType === 'percentage' ? '10' : '200'}
                  required
                />
              </div>
              <div>
                <AdminLabel>Minimum Order Amount</AdminLabel>
                <AdminInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={(event) => setForm((current) => ({ ...current, minOrderAmount: event.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <AdminLabel>Maximum Discount Amount</AdminLabel>
                <AdminInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.maxDiscountAmount}
                  onChange={(event) => setForm((current) => ({ ...current, maxDiscountAmount: event.target.value }))}
                  placeholder={form.discountType === 'percentage' ? '500' : 'Leave blank'}
                />
              </div>
              <div>
                <AdminLabel>Usage Limit</AdminLabel>
                <AdminInput
                  type="number"
                  min="0"
                  step="1"
                  value={form.usageLimit}
                  onChange={(event) => setForm((current) => ({ ...current, usageLimit: event.target.value }))}
                  placeholder="Leave blank for unlimited"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <AdminLabel>Start Date</AdminLabel>
                <AdminInput
                  type="date"
                  value={form.startsAt}
                  onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
                />
              </div>
              <div>
                <AdminLabel>End Date</AdminLabel>
                <AdminInput
                  type="date"
                  value={form.endsAt}
                  onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Coupon is active and can be applied at checkout.
            </label>

            {notice && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </form>
        </AdminCard>

        <div className="space-y-4">
          {loading ? (
            <LoadingState label="Loading coupons..." />
          ) : coupons.length === 0 ? (
            <EmptyState
              icon={<TicketPercent className="h-8 w-8" />}
              title="No coupons yet"
              description="Create your first coupon to enable discounting in checkout and Razorpay orders."
            />
          ) : (
            coupons.map((coupon) => (
              <AdminCard key={coupon._id} className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                        {coupon.code}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${coupon.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `Rs ${coupon.discountValue} off`}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {coupon.scope === 'all' ? 'All Products' : 'Product Specific'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{coupon.name}</h3>
                      {coupon.description && <p className="mt-1 text-sm text-slate-600">{coupon.description}</p>}
                    </div>
                    <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <p>Used: <span className="font-medium text-slate-900">{coupon.usedCount}</span>{coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ''}</p>
                      <p>Min order: <span className="font-medium text-slate-900">Rs {coupon.minOrderAmount || 0}</span></p>
                      <p>Max discount: <span className="font-medium text-slate-900">{coupon.maxDiscountAmount != null ? `Rs ${coupon.maxDiscountAmount}` : 'No cap'}</span></p>
                      <p>Created: <span className="font-medium text-slate-900">{new Date(coupon.createdAt).toLocaleDateString('en-IN')}</span></p>
                    </div>
                    {coupon.scope === 'specific' && coupon.applicableProductIds.length > 0 && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                        <span className="font-medium text-slate-900">Product IDs:</span> {coupon.applicableProductIds.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(coupon)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(coupon._id)}
                      disabled={deletingId === coupon._id}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === coupon._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </AdminCard>
            ))
          )}
        </div>
      </div>
    </AdminPage>
  );
}