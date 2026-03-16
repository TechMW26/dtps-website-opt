'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTheme } from '@/app/providers/ThemeProvider';

interface Payment {
  _id: string;
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

export default function PaymentDetailPage() {
  const params = useParams();
  const { theme } = useTheme();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/payments?id=${params.id}`);
        const data = await response.json();
        if (data.success && data.payments && data.payments.length > 0) {
          const payment = data.payments[0];
          setPayment(payment);
        }
      } catch (error) {
        console.error('Error fetching payment:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPayment();
    }
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReceipt = () => {
    if (!payment) return;
    const receiptContent = `
PAYMENT RECEIPT
===============================
Payment ID: ${payment.razorpayPaymentId}
Order ID: ${payment.orderId}
Date: ${new Date(payment.createdAt).toLocaleDateString()}
Time: ${new Date(payment.createdAt).toLocaleTimeString()}

PAYMENT DETAILS
===============================
Amount: ₹${payment.amount.toLocaleString('en-IN')} ${payment.currency}
Status: ${payment.status.toUpperCase()}
Method: ${payment.paymentMethod || 'Card'}

CUSTOMER DETAILS
===============================
Name: ${payment.customerName}
Email: ${payment.customerEmail}

TRANSACTION DETAILS
===============================
Razorpay Order ID: ${payment.razorpayOrderId}
Razorpay Payment ID: ${payment.razorpayPaymentId}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `receipt-${payment.razorpayPaymentId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className={`p-8 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className={`p-8 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <Link href="/admin/payments">
          <Button className="mb-4 bg-slate-600 hover:bg-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payments
          </Button>
        </Link>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold">Payment not found</p>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    completed: 'text-green-600 bg-green-50',
    pending: 'text-yellow-600 bg-yellow-50',
    failed: 'text-red-600 bg-red-50',
    captured: 'text-green-600 bg-green-50',
  };

  return (
    <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/payments">
          <Button className="mb-4 bg-slate-600 hover:bg-slate-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payments
          </Button>
        </Link>
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Payment Details
        </h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Header Card */}
          <div className={`rounded-lg p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  ₹{payment.amount.toLocaleString('en-IN')}
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {new Date(payment.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${statusColor[payment.status] || statusColor.completed}`}>
                {(payment.status === 'completed' || payment.status === 'captured') && <CheckCircle className="w-4 h-4" />}
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Payment ID
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className={`text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    {payment.razorpayPaymentId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(payment.razorpayPaymentId)}
                    className={`p-1 rounded hover:bg-slate-700 transition-colors ${theme === 'dark' ? '' : 'hover:bg-slate-100'}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Order ID
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className={`text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    {payment.orderId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(payment.orderId)}
                    className={`p-1 rounded hover:bg-slate-700 transition-colors ${theme === 'dark' ? '' : 'hover:bg-slate-100'}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Razorpay Order ID
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className={`text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    {payment.razorpayOrderId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(payment.razorpayOrderId)}
                    className={`p-1 rounded hover:bg-slate-700 transition-colors ${theme === 'dark' ? '' : 'hover:bg-slate-100'}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className={`rounded-lg p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Full Name
                </p>
                <p className={`mt-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                  {payment.customerName}
                </p>
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Email
                </p>
                <p className={`mt-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                  {payment.customerEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className={`rounded-lg p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Payment Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  Payment Method
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                  {payment.paymentMethod || 'Card'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  Currency
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                  {payment.currency}
                </span>
              </div>
              <div className={`border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} pt-3`}>
                <div className="flex justify-between">
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Amount Paid
                  </span>
                  <span className="font-bold text-emerald-500 text-lg">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className={`rounded-lg p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={downloadReceipt}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Link href={`/admin/orders/${payment.orderId}`} className="w-full block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  View Order
                </Button>
              </Link>
            </div>
          </div>

          {/* Status Card */}
          <div className={`rounded-lg p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${payment.status === 'completed' || payment.status === 'captured' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                <span className={payment.status === 'completed' || payment.status === 'captured' ? 'text-emerald-600' : 'text-gray-600'}>
                  Payment {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className={`rounded-lg p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Transaction Date
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
              {new Date(payment.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
