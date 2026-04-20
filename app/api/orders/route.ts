import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Razorpay from 'razorpay';

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
      // Create order
      const orderId = uuidv4();
      
      const razorpayOrder = await getRazorpayInstance().orders.create({
        amount: Math.round(data.total * 100), // Amount in paise
        currency: 'INR',
        receipt: orderId,
        notes: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
        },
      });

      const order = new Order({
        orderId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        address: data.address,
        city: data.city,
        products: data.products,
        subtotal: data.subtotal,
        total: data.total,
        paymentStatus: 'pending',
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpayOrder.id,
      });

      await order.save();

      return NextResponse.json({
        success: true,
        order: order,
        razorpayOrderId: razorpayOrder.id,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
      });
    } else if (action === 'verify') {
      // Verify payment
      const { razorpayPaymentId, razorpayOrderId, orderId } = data;

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
      .select('orderId customerName customerEmail customerPhone city total paymentStatus createdAt products')
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
