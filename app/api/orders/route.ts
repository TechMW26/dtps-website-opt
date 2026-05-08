import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Coupon from '@/models/Coupon';
import Razorpay from 'razorpay';
import { buildIndiaCreatedAtRange } from '@/lib/admin-date-range';
import { calculateSubtotal, validateCouponForProducts } from '@/lib/coupons';
import { sendPostPaymentNotifications } from '@/lib/notifications';
import { sendCapiEvent, deriveFbcFromUrl, getClientIp } from '@/lib/meta-capi';

// Initialize Razorpay instance safely
let razorpay: Razorpay | null = null;

type OrderResolutionStatus = 'cancelled' | 'failed';

function getRazorpayInstance() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }
  return razorpay;
}

async function parseRequestBody(req: NextRequest) {
  const rawBody = await req.text();
  return rawBody ? JSON.parse(rawBody) : {};
}

async function upsertPaymentRecord({
  orderId,
  razorpayPaymentId,
  razorpayOrderId,
  amount,
  currency,
  status,
  paymentMethod,
  customerName,
  customerEmail,
  customerPhone,
  responseData,
}: {
  orderId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  amount: number;
  currency?: string;
  status: 'completed' | 'failed';
  paymentMethod?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  responseData?: unknown;
}) {
  if (!razorpayPaymentId || !razorpayOrderId) {
    return;
  }

  await Payment.findOneAndUpdate(
    { razorpayPaymentId },
    {
      orderId,
      razorpayPaymentId,
      razorpayOrderId,
      amount,
      currency: currency || 'INR',
      status,
      paymentMethod: paymentMethod || 'razorpay',
      customerName,
      customerEmail,
      customerPhone,
      responseData,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}

async function normalizePendingOrders(orderId?: string) {
  const filter = orderId
    ? { orderId, paymentStatus: 'pending' }
    : { paymentStatus: 'pending' };

  await Order.updateMany(filter, { paymentStatus: 'cancelled' });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { action, ...data } = await parseRequestBody(req);

    if (action === 'create') {
      const products = Array.isArray(data.products) ? data.products : [];
      if (products.length === 0) {
        return NextResponse.json(
          { success: false, message: 'At least one product is required.' },
          { status: 400 }
        );
      }

      const subtotal = calculateSubtotal(products);
      let discount = 0;
      let total = subtotal;
      let appliedCoupon: any = null;

      if (data.couponCode) {
        const couponResult = await validateCouponForProducts(data.couponCode, products);
        if (!couponResult.valid) {
          return NextResponse.json(
            { success: false, message: couponResult.message, coupon: couponResult },
            { status: 400 }
          );
        }

        discount = couponResult.discount;
        total = couponResult.total;
        appliedCoupon = couponResult.coupon
          ? {
            ...couponResult.coupon,
            discountAmount: couponResult.discount,
          }
          : null;
      }

      // Create order
      const orderId = uuidv4();

      const razorpayOrder = await getRazorpayInstance().orders.create({
        amount: Math.round(total * 100), // Amount in paise
        currency: 'INR',
        receipt: orderId,
        notes: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          couponCode: appliedCoupon?.code || '',
        },
      });

      const order = new Order({
        orderId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        address: data.address,
        city: data.city,
        products,
        subtotal,
        discount,
        total,
        coupon: appliedCoupon,
        paymentStatus: 'pending',
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpayOrder.id,
      });

      await order.save();

      return NextResponse.json({
        success: true,
        order: order,
        razorpayOrderId: razorpayOrder.id,
        razorpayAmount: razorpayOrder.amount,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
      });
    } else if (action === 'verify') {
      // Verify payment
      const { razorpayPaymentId, razorpayOrderId, orderId } = data;

      const existingOrder = await Order.findOne({ orderId });
      if (!existingOrder) {
        return NextResponse.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        );
      }

      if (existingOrder.paymentStatus === 'completed') {
        return NextResponse.json({
          success: true,
          message: 'Payment already verified',
          order: orderId,
        });
      }

      // Get payment details from Razorpay
      const payment = await getRazorpayInstance().payments.fetch(razorpayPaymentId);

      if (payment.status === 'captured') {
        // Update order
        await Order.findOneAndUpdate(
          { orderId },
          {
            paymentStatus: 'completed',
            razorpayPaymentId,
            razorpayOrderId,
          }
        );

        if (existingOrder.coupon?.code) {
          await Coupon.updateOne(
            { code: existingOrder.coupon.code },
            { $inc: { usedCount: 1 } }
          );
        }

        await upsertPaymentRecord({
          orderId,
          razorpayPaymentId,
          razorpayOrderId,
          amount: Number(payment.amount) / 100,
          currency: payment.currency,
          status: 'completed',
          paymentMethod: payment.method,
          customerName: payment.notes?.customerName || existingOrder.customerName,
          customerEmail: payment.notes?.customerEmail || existingOrder.customerEmail,
          customerPhone: payment.notes?.customerPhone || existingOrder.customerPhone,
          responseData: payment,
        });

        // Notifications are best-effort: payment success should not fail if email/WhatsApp delivery fails.
        const refreshedOrder = await Order.findOne({ orderId }).lean();
        if (refreshedOrder) {
          void sendPostPaymentNotifications({
            orderId: refreshedOrder.orderId,
            customerName: refreshedOrder.customerName,
            customerEmail: refreshedOrder.customerEmail,
            customerPhone: refreshedOrder.customerPhone,
            total: refreshedOrder.total,
            createdAt: refreshedOrder.createdAt,
            products: (refreshedOrder.products || []).map((product: any) => ({
              name: product.name,
              quantity: Number(product.quantity || 1),
              price: Number(product.price || 0),
            })),
          }).catch((notificationError) => {
            console.error('Post-payment notification error:', notificationError);
          });
        }

        // Meta Conversions API: server-side Purchase. Uses orderId as event_id
        // so it dedupes against the browser-side Purchase fired on
        // /checkout/success. This server fire is the resilient path — it works
        // even if the user closes the browser before the success page loads.
        if (refreshedOrder) {
          const products = (refreshedOrder.products || []) as Array<{
            id?: string;
            name?: string;
            price?: number;
            quantity?: number;
          }>;
          const contents = products.map((p) => ({
            id: String(p.id ?? p.name ?? 'item'),
            quantity: Number(p.quantity ?? 1),
            item_price: Number(p.price ?? 0),
          }));
          const referer = req.headers.get('referer');
          void sendCapiEvent({
            eventName: 'Purchase',
            eventId: refreshedOrder.orderId,
            eventSourceUrl: referer || undefined,
            actionSource: 'website',
            userData: {
              email: refreshedOrder.customerEmail || null,
              phone: refreshedOrder.customerPhone || null,
              firstName: (refreshedOrder.customerName || '').split(' ')[0] || null,
              lastName: (refreshedOrder.customerName || '').split(' ').slice(1).join(' ') || null,
              externalId: refreshedOrder.orderId,
              clientIpAddress: getClientIp(req.headers),
              clientUserAgent: req.headers.get('user-agent'),
              fbp: req.cookies.get('_fbp')?.value || null,
              fbc: deriveFbcFromUrl(referer, req.cookies.get('_fbc')?.value || null),
            },
            customData: {
              value: Number(refreshedOrder.total ?? 0),
              currency: 'INR',
              content_type: 'product',
              content_ids: contents.map((c) => c.id),
              contents,
              content_name: products.map((p) => p.name).filter(Boolean).join(', '),
              num_items: contents.reduce((s, c) => s + c.quantity, 0),
              order_id: refreshedOrder.orderId,
            },
          }).catch((capiError) => {
            console.error('CAPI Purchase send error:', capiError);
          });
        }

        return NextResponse.json({
          success: true,
          message: 'Payment verified successfully',
          order: orderId,
        });
      } else {
        await Order.findOneAndUpdate(
          { orderId },
          {
            paymentStatus: 'failed',
            razorpayPaymentId,
            razorpayOrderId,
          }
        );

        await upsertPaymentRecord({
          orderId,
          razorpayPaymentId,
          razorpayOrderId,
          amount: Number(payment.amount || existingOrder.total * 100) / 100,
          currency: payment.currency || 'INR',
          status: 'failed',
          paymentMethod: payment.method,
          customerName: payment.notes?.customerName || existingOrder.customerName,
          customerEmail: payment.notes?.customerEmail || existingOrder.customerEmail,
          customerPhone: payment.notes?.customerPhone || existingOrder.customerPhone,
          responseData: payment,
        });

        return NextResponse.json(
          { success: false, message: 'Payment verification failed' },
          { status: 400 }
        );
      }
    } else if (action === 'resolve') {
      const {
        orderId,
        status,
        razorpayPaymentId,
        razorpayOrderId,
        paymentMethod,
        responseData,
      } = data;

      if (!orderId || !['cancelled', 'failed'].includes(status)) {
        return NextResponse.json(
          { success: false, message: 'orderId and a valid status are required' },
          { status: 400 }
        );
      }

      const existingOrder = await Order.findOne({ orderId });
      if (!existingOrder) {
        return NextResponse.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        );
      }

      if (existingOrder.paymentStatus === 'completed') {
        return NextResponse.json({
          success: true,
          message: 'Order already completed',
          order: existingOrder,
        });
      }

      const nextStatus = status as OrderResolutionStatus;
      if (
        existingOrder.paymentStatus === nextStatus ||
        (existingOrder.paymentStatus === 'failed' && nextStatus === 'cancelled')
      ) {
        return NextResponse.json({
          success: true,
          message: `Order already marked as ${existingOrder.paymentStatus}`,
          order: existingOrder,
        });
      }

      const updatedOrder = await Order.findOneAndUpdate(
        { orderId },
        {
          paymentStatus: nextStatus,
          ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
          ...(razorpayOrderId ? { razorpayOrderId } : {}),
        },
        { new: true }
      );

      if (nextStatus === 'failed') {
        await upsertPaymentRecord({
          orderId,
          razorpayPaymentId,
          razorpayOrderId: razorpayOrderId || existingOrder.razorpayOrderId,
          amount: existingOrder.total,
          currency: 'INR',
          status: 'failed',
          paymentMethod,
          customerName: existingOrder.customerName,
          customerEmail: existingOrder.customerEmail,
          customerPhone: existingOrder.customerPhone,
          responseData,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Order marked as ${nextStatus}`,
        order: updatedOrder,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      await normalizePendingOrders(orderId);
      const order = await Order.findOne({ orderId }).lean();
      return NextResponse.json({ success: true, order });
    }

    await normalizePendingOrders();

    // Build date filter if provided
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const filter: Record<string, unknown> = {};
    const createdAtRange = buildIndiaCreatedAtRange(from, to);
    if (createdAtRange) {
      filter.createdAt = createdAtRange;
    }

    // lean() skips Mongoose hydration → much faster
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .select('orderId customerName customerEmail customerPhone city subtotal discount total paymentStatus createdAt products coupon')
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Bulk operations
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { action, orderIds } = await req.json();

    if (action === 'bulkDelete') {
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json(
          { success: false, message: 'orderIds array is required' },
          { status: 400 }
        );
      }

      await Order.deleteMany({ orderId: { $in: orderIds } });
      await Payment.deleteMany({ orderId: { $in: orderIds } });

      return NextResponse.json({
        success: true,
        message: `Deleted ${orderIds.length} order(s)`,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Delete order and associated payment
    await Order.deleteOne({ orderId });
    await Payment.deleteOne({ orderId });

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
