'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { CheckCircle, Home } from 'lucide-react';

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  products: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const response = await fetch(`/api/orders?orderId=${orderId}`);
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

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600 font-semibold mb-4">Order not found</p>
        <Link href="/">
          <Button className="bg-orange-600 hover:bg-orange-700">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Success Message */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 text-lg">Thank you for your order. We've received your payment.</p>
      </div>

      {/* Order Summary Card */}
      <div className="bg-gray-50 rounded-lg p-8 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Order Details */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">ORDER NUMBER</p>
              <p className="text-2xl font-bold text-gray-900">{order.orderId}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">ORDER DATE</p>
              <p className="text-gray-900 font-semibold">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">PAYMENT STATUS</p>
              <p className="text-green-600 font-bold uppercase">{order.paymentStatus}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">CUSTOMER NAME</p>
              <p className="text-gray-900 font-semibold">{order.customerName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">EMAIL</p>
              <p className="text-gray-900 font-semibold">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">PHONE</p>
              <p className="text-gray-900 font-semibold">{order.customerPhone}</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="border-t border-gray-300 pt-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Products Purchased</h3>
          <div className="space-y-3">
            {order.products.map((product, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">
                  {product.name} (x {product.quantity})
                </span>
                <span className="font-semibold text-gray-900">
                  ₹{(product.price * product.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total Amount</span>
            <span className="text-3xl font-bold text-orange-600">₹{order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-gray-900 mb-3">What's Next?</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>A confirmation email has been sent to {order.customerEmail}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>Your subscription will be activated within 24 hours</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>You'll receive access credentials via email</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>Our team will contact you shortly to discuss your plan</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Link href="/">
          <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
            Contact Support
          </Button>
        </Link>
      </div>

      {/* Footer Message */}
      <div className="text-center mt-12 text-gray-600">
        <p className="text-sm">
          If you have any questions, please contact us at{' '}
          <a href="mailto:support@dtpoonamsagar.com" className="text-orange-600 hover:text-orange-700 font-semibold">
            support@dtpoonamsagar.com
          </a>
        </p>
      </div>
    </div>
  );
}
