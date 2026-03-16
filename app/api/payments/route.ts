import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';

// Mark this route as dynamic since it uses request.url
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const payment = await Payment.findOne({ orderId });
      return NextResponse.json({
        success: true,
        payment,
      });
    }

    // Get all payments (admin)
    const payments = await Payment.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      payments,
      total: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
