'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Eye, Download, BarChart3, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Payment {
  _id: string;
  orderId: string;
  razorpayPaymentId: string;
  amount: number;
  status: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

function normalizePaymentStatus(status: string) {
  return status === 'pending' ? 'failed' : status;
}

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [dateFrom, dateTo]);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      const qs = params.toString();
      const response = await fetch(`/api/payments${qs ? `?${qs}` : ''}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.payments)) {
        setPayments(
          data.payments.map((payment: Payment) => ({
            ...payment,
            status: normalizePaymentStatus(payment.status),
          }))
        );
        setTotalAmount(data.totalAmount || 0);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

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

  const downloadPayment = (payment: Payment) => {
    const content = `
PAYMENT RECEIPT
===============
Payment ID: ${payment.razorpayPaymentId}
Order ID: ${payment.orderId}
Date: ${new Date(payment.createdAt).toLocaleDateString()}

CUSTOMER DETAILS
================
Name: ${payment.customerName}
Email: ${payment.customerEmail}

PAYMENT DETAILS
===============
Amount: ₹${payment.amount.toLocaleString()}
Status: ${normalizePaymentStatus(payment.status).toUpperCase()}
Payment Method: Razorpay
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `Payment_${payment.razorpayPaymentId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const stats = {
    totalPayments: payments.length,
    completedPayments: payments.filter((p) => p.status === 'completed').length,
    failedPayments: payments.filter((p) => p.status === 'failed').length,
    totalAmount: totalAmount,
    successRate: payments.length > 0 ? Math.round((payments.filter((p) => p.status === 'completed').length / payments.length) * 100) : 0,
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments Management</h1>
        <p className="text-gray-600">Track and manage all payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Total Payments</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalPayments}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completedPayments}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Failed</p>
          <p className="text-3xl font-bold text-red-600">{stats.failedPayments}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Success Rate</p>
          <p className="text-3xl font-bold text-purple-600">{stats.successRate}%</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-orange-600">₹{stats.totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Revenue Chart Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Average Payment</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{stats.totalPayments > 0 ? Math.round(stats.totalAmount / stats.totalPayments).toLocaleString() : '0'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Completed Payments Value</p>
            <p className="text-2xl font-bold text-green-600">
              ₹
              {payments
                .filter((p) => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Failed Payments Value</p>
            <p className="text-2xl font-bold text-red-600">
              ₹
              {payments
                .filter((p) => p.status === 'failed')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          {['today', '7d', '30d', '90d', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setDatePreset(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                (p === 'all' && !dateFrom && !dateTo)
                  ? 'bg-orange-50 border-orange-300 text-orange-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : `Last ${p}`}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-500 text-xs font-medium">Custom range:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
          />
          <span className="text-gray-400">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
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

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Payment ID</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Order ID</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Customer</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Amount</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Status</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Date</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-600">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                const status = normalizePaymentStatus(payment.status);

                return (
                <tr key={payment._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900 text-sm">{payment.razorpayPaymentId}</td>
                  <td className="px-6 py-4 text-gray-700 font-semibold">{payment.orderId}</td>
                  <td className="px-6 py-4 text-gray-700">{payment.customerName}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/payments/${payment._id}`}>
                        <button
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => downloadPayment(payment)}
                        className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Payment Details</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">PAYMENT ID</p>
                  <p className="font-semibold text-gray-900 break-all">{selectedPayment.razorpayPaymentId}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ORDER ID</p>
                  <p className="font-semibold text-gray-900">{selectedPayment.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">CUSTOMER NAME</p>
                  <p className="font-semibold text-gray-900">{selectedPayment.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">EMAIL</p>
                  <p className="font-semibold text-gray-900">{selectedPayment.customerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">AMOUNT</p>
                  <p className="font-semibold text-orange-600 text-lg">₹{selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">STATUS</p>
                  <p
                    className={`font-semibold ${selectedPayment.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {selectedPayment.status.toUpperCase()}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-sm">DATE & TIME</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedPayment.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => downloadPayment(selectedPayment)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Download Receipt
                </Button>
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
