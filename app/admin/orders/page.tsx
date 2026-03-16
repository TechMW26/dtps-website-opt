'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Download, Trash2, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      if (data.success) {
        setOrders(orders.filter((o) => o.orderId !== orderId));
        alert('Order deleted successfully');
      } else {
        alert(data.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const downloadOrder = (order: Order) => {
    const content = `
ORDER CONFIRMATION
==================
Order ID: ${order.orderId}
Date: ${new Date(order.createdAt).toLocaleDateString()}

CUSTOMER DETAILS
================
Name: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}
City: ${order.city}

PRODUCTS
========
${order.products.map((p) => `${p.name} x${p.quantity} - ₹${p.price * p.quantity}`).join('\n')}

AMOUNT
======
Total: ₹${order.total.toLocaleString()}
Payment Status: ${order.paymentStatus}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `Order_${order.orderId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    return order.paymentStatus === filterStatus;
  });

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.paymentStatus === 'completed').length,
    pending: orders.filter((o) => o.paymentStatus === 'pending').length,
    failed: orders.filter((o) => o.paymentStatus === 'failed').length,
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
        <p className="text-gray-600">Manage all customer orders and payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Failed</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-3">
        <Filter className="w-5 h-5 text-gray-600 mt-2" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">All Orders</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Order ID</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Customer</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Email</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Amount</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Status</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Date</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-600">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{order.orderId}</td>
                  <td className="px-6 py-4 text-gray-700">{order.customerName}</td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{order.customerEmail}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">₹{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        order.paymentStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/orders/${order.orderId}`}>
                        <button
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => downloadOrder(order)}
                        className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteOrder(order.orderId)}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">ORDER ID</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">PAYMENT STATUS</p>
                  <p className={`font-semibold ${selectedOrder.paymentStatus === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedOrder.paymentStatus.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">CUSTOMER</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">TOTAL AMOUNT</p>
                  <p className="font-semibold text-orange-600 text-lg">₹{selectedOrder.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">EMAIL</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">PHONE</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.customerPhone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-sm">CITY</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.city}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-gray-600 text-sm mb-3">PRODUCTS</p>
                <div className="space-y-2">
                  {selectedOrder.products.map((product, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">{product.name}</span>
                      <span className="font-semibold text-gray-900">₹{(product.price * product.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={() => downloadOrder(selectedOrder)} className="flex-1 bg-green-600 hover:bg-green-700">
                  Download Order
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
