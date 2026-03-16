import mongoose, { Schema, Document } from 'mongoose';

export interface IPlanBanner extends Document {
  planId?: string; // Reference to the pricing plan
  planName?: string; // Name of the plan for display
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  title: string;
  image: string;
  mobileImage?: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const PlanBannerSchema = new Schema<IPlanBanner>(
  {
    planId: {
      type: String,
      default: null,
    },
    planName: {
      type: String,
      default: null,
    },
    page: {
      type: String,
      enum: ['weight-loss', 'pcod', 'therapeutic', 'wedding'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    mobileImage: {
      type: String,
      default: null,
    },
    link: {
      type: String,
      default: null,
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

// Create unique sparse index on planId to ensure only one banner per plan (null values are ignored)
PlanBannerSchema.index({ planId: 1 }, { unique: true, sparse: true });

export default mongoose.models.PlanBanner || mongoose.model<IPlanBanner>('PlanBanner', PlanBannerSchema);
