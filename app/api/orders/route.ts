import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Coupon from '@/models/Coupon';
import Razorpay from 'razorpay';
import { calculateSubtotal, validateCouponForProducts } from '@/lib/coupons';

// Initialize Razorpay instance safely
let razorpay: Razorpay | null = null;

function getRazorpayInstance() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }
  return razorpay;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { action, ...data } = await req.json();

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

        // Create payment record
        const paymentRecord = new Payment({
          orderId,
          razorpayPaymentId,
          razorpayOrderId,
          amount: (payment.amount as number) / 100, // Convert from paise
          currency: payment.currency,
          status: 'completed',
          paymentMethod: payment.method,
          customerName: payment.notes?.customerName,
          customerEmail: payment.notes?.customerEmail,
          responseData: payment,
        });

        await paymentRecord.save();

        return NextResponse.json({
          success: true,
          message: 'Payment verified successfully',
          order: orderId,
        });
      } else {
        // Update order status
        await Order.findOneAndUpdate(
          { orderId },
          { paymentStatus: 'failed' }
        );

        return NextResponse.json(
          { success: false, message: 'Payment verification failed' },
          { status: 400 }
        );
      }
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
      const order = await Order.findOne({ orderId }).lean();
      return NextResponse.json({ success: true, order });
    }

    // Build date filter if provided
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const filter: Record<string, unknown> = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, unknown>).$gte = new Date(from + 'T00:00:00.000Z');
      if (to)   (filter.createdAt as Record<string, unknown>).$lte = new Date(to + 'T23:59:59.999Z');
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
