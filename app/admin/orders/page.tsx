'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Eye, Download, Trash2, Filter, Calendar, CheckSquare, Square, MinusSquare, AlertTriangle } from 'lucide-react';

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  products: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

/* ── helpers ── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  /* filters */
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  /* bulk select */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  /* ── fetch ── */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      const qs = params.toString();
      const res = await fetch(`/api/orders${qs ? `?${qs}` : ''}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setSelected(new Set());
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* ── filtered list (status is client-side) ── */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => filterStatus === 'all' || o.paymentStatus === filterStatus);
  }, [orders, filterStatus]);

  /* ── stats ── */
  const stats = useMemo(() => ({
    total: orders.length,
    completed: orders.filter((o) => o.paymentStatus === 'completed').length,
    pending: orders.filter((o) => o.paymentStatus === 'pending').length,
    failed: orders.filter((o) => o.paymentStatus === 'failed').length,
  }), [orders]);

  /* ── selection helpers ── */
  const allVisibleIds = useMemo(() => filteredOrders.map((o) => o.orderId), [filteredOrders]);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.has(id));
  const someSelected = allVisibleIds.some((id) => selected.has(id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allVisibleIds));
    }
  }

  /* ── single delete ── */
  async function deleteOrder(orderId: string) {
    if (!confirm('Delete this order?')) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        setSelected((prev) => { const n = new Set(prev); n.delete(orderId); return n; });
      } else {
        alert(data.message || 'Failed to delete order');
      }
    } catch { alert('Error deleting order'); }
  }

  /* ── bulk delete ── */
  async function bulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Permanently delete ${ids.length} order(s)?`)) return;
    setBulkDeleting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulkDelete', orderIds: ids }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => !selected.has(o.orderId)));
        setSelected(new Set());
      } else {
        alert(data.message || 'Bulk delete failed');
      }
    } catch { alert('Error during bulk delete'); }
    finally { setBulkDeleting(false); }
  }

  /* ── download txt ── */
  function downloadOrder(order: Order) {
    const content = `ORDER CONFIRMATION
==================
Order ID: ${order.orderId}
Date: ${fmtDate(order.createdAt)}

CUSTOMER DETAILS
================
Name: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}
City: ${order.city}

PRODUCTS
========
${order.products.map((p: { name: string; price: number; quantity: number }) => `${p.name} x${p.quantity} - ₹${p.price * p.quantity}`).join('\n')}

TOTAL: ₹${order.total.toLocaleString()}
Payment Status: ${order.paymentStatus}
`;
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    a.download = `Order_${order.orderId}.txt`;
    a.click();
  }

  /* ── quick date presets ── */
  function setDatePreset(preset: string) {
    const today = new Date();
    let from = new Date();
    switch (preset) {
      case 'today': from = today; break;
      case '7d': from.setDate(today.getDate() - 7); break;
      case '30d': from.setDate(today.getDate() - 30); break;
      case '90d': from.setDate(today.getDate() - 90); break;
      case 'all': setDateFrom(''); setDateTo(''); return;
    }
    setDateFrom(toInputDate(from));
    setDateTo(toInputDate(today));
  }

  /* ──────────── RENDER ──────────── */
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Orders Management</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage all customer orders and payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs font-medium">Total</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-gray-500 text-xs font-medium">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* ── Filters bar ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 space-y-3">
        {/* Row 1: status + date presets */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <span className="hidden sm:inline text-gray-300 mx-1">|</span>

          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          {['today', '7d', '30d', '90d', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setDatePreset(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                (p === 'all' && !dateFrom && !dateTo)
                  ? 'bg-orange-50 border-orange-300 text-orange-700'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : `Last ${p}`}
            </button>
          ))}
        </div>

        {/* Row 2: custom date range */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Custom range:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500"
          />
          <span className="text-gray-400">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4 text-sm">
          <span className="font-semibold text-orange-800">{selected.size} selected</span>
          <button
            onClick={bulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {bulkDeleting ? 'Deleting…' : 'Delete Selected'}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-gray-600 hover:text-gray-800 underline ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm mt-3">Loading orders…</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="pl-4 pr-2 py-3 w-10">
                  <button onClick={toggleAll} className="text-gray-500 hover:text-gray-800" title="Select all">
                    {allSelected
                      ? <CheckSquare className="w-4 h-4 text-orange-600" />
                      : someSelected
                        ? <MinusSquare className="w-4 h-4 text-orange-400" />
                        : <Square className="w-4 h-4" />
                    }
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold">Order ID</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isChecked = selected.has(order.orderId);
                  return (
                    <tr
                      key={order._id}
                      className={`border-b border-gray-100 dark:border-gray-700 transition-colors ${isChecked ? 'bg-orange-50/60 dark:bg-orange-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                    >
                      <td className="pl-4 pr-2 py-3">
                        <button onClick={() => toggleOne(order.orderId)} className="text-gray-500 hover:text-gray-800">
                          {isChecked
                            ? <CheckSquare className="w-4 h-4 text-orange-600" />
                            : <Square className="w-4 h-4" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300 max-w-[120px] truncate" title={order.orderId}>
                        {order.orderId.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{order.customerName}</td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-[180px] hidden lg:table-cell">{order.customerEmail}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">₹{order.total.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            order.paymentStatus === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : order.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/orders/${order.orderId}`}>
                            <button className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button onClick={() => downloadOrder(order)} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-600" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteOrder(order.orderId)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Footer count */}
          {filteredOrders.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 text-right">
              Showing {filteredOrders.length} of {orders.length} order(s)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
