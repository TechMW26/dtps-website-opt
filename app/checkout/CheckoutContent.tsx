'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import PhoneInput from '@/components/ui/PhoneInput';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateRequired,
  DEFAULT_COUNTRY_CODE,
  getCountry,
} from '@/lib/validation';
import { trackEvent, readCheckoutCartParams, gaEvent, toGaEcomParams, fireCapi } from '@/lib/pixel';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface AppliedCoupon {
  code: string;
  name: string;
  scope: 'all' | 'specific';
  applicableProductIds: string[];
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
}

type CheckoutResolutionStatus = 'cancelled' | 'failed';

const TERMS_AND_CONDITIONS = `Terms & Conditions

These terms and conditions ("Terms") govern your use of the dietitian website "dtpoonamsagar.com" operated by Dietitian Poonam Sagar ("we," "us," or "our"). By accessing or using the Website, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use the Website.

Use of the Website

The information presented on the Website is meant for informative purposes exclusively and should not be considered a replacement for expert medical guidance, diagnosis, or treatment. Prior to making any alterations to your diet, it is advisable to consult a certified medical practitioner.

You must be at least 18 years old to use the Website and its services. If you are under 18, you may only use the Website under the supervision of a parent or legal guardian.

You agree not to use the Website for any unlawful or prohibited purpose, including, but not limited to, transmitting any harmful, threatening, abusive, defamatory, obscene, or otherwise objectionable content.

Intellectual Property

All content and materials on the Website, including text, images, graphics, videos, and trademarks, are the property of Dietitian Poonam Sagar or its licensors and are protected by applicable intellectual property laws.

You may not reproduce, distribute, modify, create derivative works of, publicly display, or perform any of the content on the Website without our prior written consent.

Changes to Terms and Website

We reserve the right to modify, suspend, or discontinue the Website or any part thereof, at any time without notice.

We may revise these Terms at any time by updating this page. Your continued use of the Website after any changes to the Terms will signify your acceptance of those changes.

Governing Law

These Terms shall be governed by and construed in accordance with the laws of Bhopal Jurisdiction, without regard to its conflict of law principles.

By using the dtpoonamsagar.com you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.

Our refund and cancellation policy can be found here

Disclaimer: Achieve lasting weight management through personalized plans. Consult a professional for tailored guidance. We empower wellness, not diagnose conditions. Privacy guaranteed. See more: dtpoonamsagar.com.`;

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    phone: '',
    email: '',
    countryIso: DEFAULT_COUNTRY_CODE,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<'firstName' | 'lastName' | 'city' | 'phone' | 'email', string>>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCouponField, setShowCouponField] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const activeOrderRef = useRef<{ orderId: string; razorpayOrderId: string } | null>(null);
  const resolvedStatusRef = useRef<'success' | CheckoutResolutionStatus | null>(null);

  useEffect(() => {
    // Get products from URL params or session storage
    const productData = sessionStorage.getItem('checkoutProducts');
    if (productData) {
      const items = JSON.parse(productData);
      setProducts(items);
      const subtotalAmount = items.reduce((sum: number, item: Product) => sum + (item.price * item.quantity), 0);
      setSubtotal(subtotalAmount);
      setTotal(subtotalAmount);
    }
  }, []);

  useEffect(() => {
    const handlePageHide = () => {
      const activeOrder = activeOrderRef.current;
      if (!activeOrder || resolvedStatusRef.current === 'success') {
        return;
      }

      const status = resolvedStatusRef.current === 'failed' ? 'failed' : 'cancelled';
      const payload = JSON.stringify({
        action: 'resolve',
        orderId: activeOrder.orderId,
        status,
        razorpayOrderId: activeOrder.razorpayOrderId,
        paymentMethod: 'razorpay',
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/orders', new Blob([payload], { type: 'application/json' }));
        return;
      }

      void fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        keepalive: true,
      });
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, []);

  const resolutionPriority = {
    cancelled: 1,
    failed: 2,
    success: 3,
  } as const;

  const resolveOrder = async (
    status: CheckoutResolutionStatus,
    extra: {
      razorpayPaymentId?: string;
      responseData?: unknown;
    } = {}
  ) => {
    const activeOrder = activeOrderRef.current;
    if (!activeOrder) {
      return;
    }

    const currentStatus = resolvedStatusRef.current;
    const currentPriority = currentStatus ? resolutionPriority[currentStatus] : 0;
    if (currentStatus === 'success' || currentPriority >= resolutionPriority[status]) {
      return;
    }

    resolvedStatusRef.current = status;

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'resolve',
          orderId: activeOrder.orderId,
          status,
          razorpayOrderId: activeOrder.razorpayOrderId,
          paymentMethod: 'razorpay',
          ...extra,
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error(`Failed to mark order as ${status}:`, error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateCheckoutForm = (): boolean => {
    const e: typeof formErrors = {};
    const fn = validateName(formData.firstName, 'First name'); if (fn) e.firstName = fn;
    const ln = validateName(formData.lastName, 'Last name'); if (ln) e.lastName = ln;
    const ct = validateRequired(formData.city, 'City'); if (ct) e.city = ct;
    const em = validateEmail(formData.email); if (em) e.email = em;
    const ph = validatePhone(formData.phone, formData.countryIso); if (!ph.ok) e.phone = ph.error;
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      setCouponMessage('');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    setCouponMessage('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          products,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.valid) {
        setAppliedCoupon(null);
        setDiscount(0);
        setTotal(subtotal);
        setCouponError(data.message || 'Unable to apply coupon.');
        return;
      }

      setAppliedCoupon(data.coupon);
      setDiscount(data.discount);
      setTotal(data.total);
      setCouponCode(data.code);
      setCouponMessage(data.message || 'Coupon applied successfully.');
    } catch (error) {
      setAppliedCoupon(null);
      setDiscount(0);
      setTotal(subtotal);
      setCouponError('Unable to validate coupon right now.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setTotal(subtotal);
    setCouponMessage('Coupon removed.');
    setCouponError('');
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    if (!validateCheckoutForm()) {
      return;
    }

    if (!agreeTerms) {
      alert('Please agree to the Terms and Conditions');
      return;
    }

    const country = getCountry(formData.countryIso);
    const e164Phone = `${country.dialCode}${String(formData.phone).replace(/\D/g, '')}`;

    setLoading(true);
    setOrderStatus('processing');
    activeOrderRef.current = null;
    resolvedStatusRef.current = null;

    try {
      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          customerPhone: e164Phone,
          address: formData.city,
          city: formData.city,
          products: products,
          couponCode: appliedCoupon?.code || couponCode.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        activeOrderRef.current = {
          orderId: data.order.orderId,
          razorpayOrderId: data.razorpayOrderId,
        };

        // Get phone number from webhook/API response (not from form)
        const phoneFromAPI = data.order.customerPhone;
        
        // Open Razorpay directly with user details
        const options = {
          key: data.razorpayKey,
          amount: data.razorpayAmount,
          currency: 'INR',
          name: 'Dietitian Poonam Sagar',
          description: 'Subscription Plan Purchase',
          order_id: data.razorpayOrderId,
          handler: async function (razorpayResponse: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  action: 'verify',
                  razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                  razorpayOrderId: razorpayResponse.razorpay_order_id,
                  orderId: data.order.orderId,
                }),
              });

              const verifyData = await verifyResponse.json();
              if (verifyData.success) {
                resolvedStatusRef.current = 'success';
                activeOrderRef.current = null;
                setOrderStatus('success');
                // Redirect to success page
                setTimeout(() => {
                  window.location.href = `/checkout/success?orderId=${data.order.orderId}`;
                }, 1500);
              } else {
                await resolveOrder('failed', {
                  razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                  responseData: verifyData,
                });
                setOrderStatus('failed');
                setLoading(false);
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              await resolveOrder('failed', {
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                responseData: {
                  message: 'Payment verification error',
                },
              });
              setOrderStatus('failed');
              setLoading(false);
            }
            
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: phoneFromAPI, // Using phone from API webhook
          },
          notes: {
            customer_name: `${formData.firstName} ${formData.lastName}`,
            customer_email: formData.email,
            customer_phone: phoneFromAPI, // Using phone from API webhook
            customer_city: formData.city,
          },
          theme: {
            color: '#ff850b',
          },
          readonly: {
            contact: true,
            email: true,
          },
          modal: {
            ondismiss: function () {
              if (!resolvedStatusRef.current) {
                void resolveOrder('cancelled');
                setOrderStatus('idle');
              } else if (resolvedStatusRef.current === 'failed') {
                setOrderStatus('failed');
              }
              setLoading(false);
            },
          },
        };

        const razorpayWindow = new window.Razorpay(options);
        if (typeof razorpayWindow.on === 'function') {
          razorpayWindow.on('payment.failed', async function (response: any) {
            await resolveOrder('failed', {
              razorpayPaymentId: response?.error?.metadata?.payment_id,
              responseData: response,
            });
            setOrderStatus('failed');
            setLoading(false);
          });
        }
        // Meta Pixel: AddPaymentInfo — user is now entering payment details.
        // eventID = api_<orderId> so the server-side CAPI mirror dedupes.
        const cartParams = readCheckoutCartParams();
        const apiEventId = `api_${data.order.orderId}`;
        const apiCustomData = { ...cartParams, order_id: data.order.orderId };
        trackEvent('AddPaymentInfo', apiCustomData, { eventID: apiEventId });
        // Server-side mirror with PII for stronger match quality.
        fireCapi('AddPaymentInfo', apiEventId, apiCustomData, {
          email: formData.email || null,
          phone: formData.phone
            ? `${getCountry(formData.countryIso)?.dialCode ?? ''}${formData.phone}`
            : null,
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          city: formData.city || null,
          country: formData.countryIso ? formData.countryIso.toLowerCase() : null,
          externalId: data.order.orderId,
        });
        // Mirror to GA4.
        gaEvent('add_payment_info', {
          ...toGaEcomParams(cartParams),
          payment_type: 'razorpay',
          transaction_id: data.order.orderId,
        });
        razorpayWindow.open();
      } else {
        setOrderStatus('failed');
        alert('Failed to create order');
        setLoading(false);
        activeOrderRef.current = null;
        resolvedStatusRef.current = null;
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderStatus('failed');
      alert('Error placing order');
      setLoading(false);
      activeOrderRef.current = null;
      resolvedStatusRef.current = null;
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Billing and Shipping Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className={`w-full px-4 py-2 border ${formErrors.firstName ? 'border-red-400' : 'border-orange-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                />
                {formErrors.firstName && <p className="mt-1 text-xs text-red-500">{formErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className={`w-full px-4 py-2 border ${formErrors.lastName ? 'border-red-400' : 'border-orange-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                />
                {formErrors.lastName && <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Town / City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter your city"
                className={`w-full px-4 py-2 border ${formErrors.city ? 'border-red-400' : 'border-orange-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              {formErrors.city && <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <PhoneInput
                countryCode={formData.countryIso}
                number={formData.phone}
                onCountryChange={(c) => {
                  setFormData(prev => ({ ...prev, countryIso: c }));
                  if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: undefined }));
                }}
                onNumberChange={(n) => {
                  setFormData(prev => ({ ...prev, phone: n }));
                  if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: undefined }));
                }}
                error={formErrors.phone}
                placeholder="Phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className={`w-full px-4 py-2 border ${formErrors.email ? 'border-red-400' : 'border-orange-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              {products.map((product, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-700">
                    {product.name} x {product.quantity}
                  </span>
                  <span className="font-semibold text-gray-900">₹{(product.price * product.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between mb-2 text-green-700">
                    <span>
                      Coupon ({appliedCoupon?.code})
                    </span>
                    <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-gray-900">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <button
                  className="text-orange-600 hover:text-orange-700 font-medium"
                  type="button"
                  onClick={() => setShowCouponField((current) => !current)}
                >
                  Have a coupon? Click here to enter your coupon code
                </button>
              </div>

              {showCouponField && (
                <div className="border border-orange-200 bg-white rounded-lg p-4 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Coupon Code
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter your coupon code"
                      className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-5 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50"
                    >
                      {couponLoading ? 'Applying...' : 'Apply Coupon'}
                    </button>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {couponMessage && <p className="text-sm text-green-600">{couponMessage}</p>}
                  {couponError && <p className="text-sm text-red-600">{couponError}</p>}
                  {appliedCoupon?.scope === 'specific' && appliedCoupon.applicableProductIds.length > 0 && (
                    <p className="text-xs text-gray-500">
                      This coupon applies to: {appliedCoupon.applicableProductIds.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Payment Method</h3>
              <div className="border-2 border-orange-500 rounded-lg p-4 flex items-center gap-2 bg-orange-50">
                <input type="radio" id="razorpay" name="payment" checked readOnly />
                <label htmlFor="razorpay" className="font-semibold text-orange-600">
                  UPI/Credit Card/Debit Card/NetBanking
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Pay securely by Credit or Debit card or Internet Banking through Razorpay.
              </p>
            </div>

            {/* Terms Agreement */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-orange-600"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the website{' '}
                  <button
                    onClick={() => setShowTermsModal(true)}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    terms and conditions
                  </button>
                </span>
              </label>
            </div>

            {/* Privacy Notice */}
            <p className="text-xs text-gray-600">
              Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{' '}
              <a href="#" className="text-orange-600 hover:text-orange-700">
                privacy policy
              </a>
              .
            </p>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </Button>

            {/* Order Status Messages */}
            {orderStatus === 'success' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="text-green-700 font-semibold">✓ Payment Successful!</p>
                <p className="text-green-600 text-sm">Redirecting to order confirmation...</p>
              </div>
            )}

            {orderStatus === 'failed' && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700 font-semibold">✗ Payment Failed</p>
                <p className="text-red-600 text-sm">Please try again or cancel your order</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Terms and Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                {TERMS_AND_CONDITIONS}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4">
              <Button
                onClick={() => setShowTermsModal(false)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Load Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          // Script loaded successfully
        }}
      />
    </>
  );
}
