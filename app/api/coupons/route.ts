import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { normalizeCouponCode, normalizeProductId } from '@/lib/coupons';

function parseOptionalNumber(value: unknown) {
  if (value === '' || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeCouponPayload(body: any) {
  const code = normalizeCouponCode(body.code || '');
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const scope = body.scope === 'specific' ? 'specific' : 'all';
  const discountType = body.discountType === 'percentage' ? 'percentage' : 'flat';
  const discountValue = Number(body.discountValue);
  const minOrderAmount = parseOptionalNumber(body.minOrderAmount) ?? 0;
  const maxDiscountAmount = parseOptionalNumber(body.maxDiscountAmount);
  const usageLimit = parseOptionalNumber(body.usageLimit);
  const startsAt = body.startsAt ? new Date(body.startsAt) : null;
  const endsAt = body.endsAt ? new Date(body.endsAt) : null;
  const applicableProductIds = Array.isArray(body.applicableProductIds)
    ? body.applicableProductIds.map((value: unknown) => normalizeProductId(String(value || ''))).filter(Boolean)
    : [];

  if (!code) throw new Error('Coupon code is required.');
  if (!name) throw new Error('Coupon name is required.');
  if (!Number.isFinite(discountValue) || discountValue <= 0) throw new Error('Discount value must be greater than 0.');
  if (discountType === 'percentage' && discountValue > 100) throw new Error('Percentage discount cannot exceed 100.');
  if (scope === 'specific' && applicableProductIds.length === 0) throw new Error('At least one product ID is required for a product-specific coupon.');
  if (startsAt && Number.isNaN(startsAt.getTime())) throw new Error('Invalid start date.');
  if (endsAt && Number.isNaN(endsAt.getTime())) throw new Error('Invalid end date.');
  if (startsAt && endsAt && startsAt > endsAt) throw new Error('End date must be after start date.');

  return {
    code,
    name,
    description,
    scope,
    applicableProductIds: scope === 'specific' ? applicableProductIds : [],
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    startsAt,
    endsAt,
    isActive: body.isActive !== false,
  };
}

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    await dbConnect();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    await dbConnect();
    const payload = sanitizeCouponPayload(await request.json());
    const coupon = await Coupon.create(payload);
    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    await dbConnect();
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required.' }, { status: 400 });
    }

    const payload = sanitizeCouponPayload(body);
    const coupon = await Coupon.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required.' }, { status: 400 });
    }

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete coupon' }, { status: 500 });
  }
}