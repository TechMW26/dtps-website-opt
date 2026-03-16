import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingFeature {
  text: string;
  included: boolean;
}

export interface IPricing extends Document {
  planName: string;
  duration: string;
  durationLabel: string;
  price: number;
  originalPrice: number;
  currency: string;
  badge: string;
  badgeColor: string;
  features: IPricingFeature[];
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  category: 'weight-loss' | 'pcod' | 'new-wedding-plan' | 'therapeutic-diet-plans';
  popular: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema<IPricing>(
  {
    planName: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    durationLabel: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
    },
    currency: {
      type: String,
      default: '₹',
    },
    badge: {
      type: String,
      default: '',
    },
    badgeColor: {
      type: String,
      default: 'orange',
    },
    features: [
      {
        text: { type: String, required: true },
        included: { type: Boolean, default: true },
      },
    ],
    page: {
      type: String,
      enum: ['weight-loss', 'pcod', 'therapeutic', 'wedding'],
      required: [true, 'Page is required'],
    },
    category: {
      type: String,
      enum: ['weight-loss', 'pcod', 'new-wedding-plan', 'therapeutic-diet-plans'],
      required: [true, 'Category is required'],
    },
    popular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Pricing || mongoose.model<IPricing>('Pricing', PricingSchema);
