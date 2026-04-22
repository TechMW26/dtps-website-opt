import mongoose, { Schema, Document } from 'mongoose';

export type CouponScope = 'all' | 'specific';
export type CouponDiscountType = 'percentage' | 'flat';

export interface ICoupon extends Document {
  code: string;
  name: string;
  description?: string;
  scope: CouponScope;
  applicableProductIds: string[];
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    scope: {
      type: String,
      enum: ['all', 'specific'],
      default: 'all',
    },
    applicableProductIds: {
      type: [String],
      default: [],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount amount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [0, 'Usage limit cannot be negative'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },
    startsAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);