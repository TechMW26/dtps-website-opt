'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTheme } from '@/app/providers/ThemeProvider';

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  total: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders?orderId=${params.id}`);
        const data = await response.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadInvoice = () => {
    if (!order) return;
    const invoiceContent = `
INVOICE
===============================
Order ID: ${order.orderId}
Date: ${new Date(order.createdAt).toLocaleDateString()}

CUSTOMER DETAILS
===============================
Name: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}
City: ${order.city}
Address: ${order.address || 'N/A'}

ORDER ITEMS
===============================
${order.products.map((p) => `${p.name} x${p.quantity} = ₹${p.price * p.quantity}`).join('\n')}

SUMMARY
===============================
Subtotal: ₹${order.subtotal}
Total: ₹${order.total}
Payment Status: ${order.paymentStatus}
Razorpay Order ID: ${order.razorpayOrderId}
Razorpay Payment ID: ${order.razorpayPaymentId || 'N/A'}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceContent));
    element.setAttribute('download', `invoice-${order.orderId}.txt`);
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

  if (!order) {
    return (
      <div className={`p-8 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <Link href="/admin/orders">
          <Button className="mb-4 bg-slate-600 hover:bg-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </Link>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold">Order not found</p>
        </div>
      </div>
    );
  }

  const statusColor = {
    completed: 'text-green-600 bg-green-50',
    pending: 'text-yellow-600 bg-yellow-50',
    failed: 'text-red-600 bg-red-50',
    cancelled: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/orders">
          <Button className="mb-4 bg-slate-600 hover:bg-slate-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </Link>
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Order Details
        </h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header Card */}
          <div className={`rounded-lg p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {order.orderId}
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${statusColor[order.paymentStatus]}`}>
                {order.paymentStatus === 'completed' && <CheckCircle className="w-4 h-4" />}
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-t border-slate-700 pt-4">
                <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Razorpay Order ID
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className={`text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    {order.razorpayOrderId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(order.razorpayOrderId)}
                    className={`p-1 rounded hover:bg-slate-700 transition-colors ${theme === 'dark' ? '' : 'hover:bg-slate-100'}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {order.razorpayPaymentId && (
                <div className="border-t border-slate-700 pt-4">
                  <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Razorpay Payment ID
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className={`text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {order.razorpayPaymentId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(order.razorpayPaymentId!)}
                      className={`p-1 rounded hover:bg-slate-700 transition-colors ${theme === 'dark' ? '' : 'hover:bg-slate-100'}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
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
                  {order.customerName}
                </p>
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Email
                </p>
                <p className={`mt-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                  {order.customerEmail}
                </p>
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Phone
                </p>
                <p className={`mt-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                  {order.customerPhone}
                </p>
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  City
                </p>
                <p className={`mt-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                  {order.city}
                </p>
              </div>
              {order.address && (
                <div className="col-span-2">
                  <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Address
                  </p>
                  <p className={`mt-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                    {order.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className={`rounded-lg p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Order Items
            </h3>
            <div className="space-y-3">
              {order.products.map((product, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex-1">
                    <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                      {product.name}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Qty: {product.quantity}
                    </p>
                  </div>
                  <p className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                    ₹{(product.price * product.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className={`rounded-lg p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} sticky top-8`}>
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Order Summary
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  Subtotal
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                  ₹{order.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className={`border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} pt-3`}>
                <div className="flex justify-between">
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Total
                  </span>
                  <span className="font-bold text-emerald-500 text-lg">
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Download Invoice Button */}
            <Button
              onClick={downloadInvoice}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>

          {/* Status Timeline */}
          <div className={`rounded-lg p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'completed' || order.paymentStatus === 'pending' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                <span className={order.paymentStatus === 'completed' || order.paymentStatus === 'pending' ? 'text-emerald-600' : 'text-gray-600'}>
                  Order Created
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'completed' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                <span className={order.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-gray-600'}>
                  Payment {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
