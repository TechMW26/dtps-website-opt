import { resolveCheckoutProducts } from '@/lib/checkout-catalog';
import { NextRequest, NextResponse } from 'next/server';
import { validateCouponForProducts } from '@/lib/coupons';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await validateCouponForProducts(body.code || '', await resolveCheckoutProducts(body.products));

    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        valid: false,
        message: error.message || 'Failed to validate coupon.',
        code: '',
        subtotal: 0,
        eligibleSubtotal: 0,
        discount: 0,
        total: 0,
      },
      { status: 500 }
    );
  }
}
