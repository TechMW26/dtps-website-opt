import mongoose, { Schema, Document } from 'mongoose';

export interface ITransformation extends Document {
  clientName?: string;
  beforeImage: string;
  afterImage: string;
  weightLost?: string;
  daysToAchieve?: string;
  testimonial?: string;
  setName?: string;
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  targetPages: Array<'all' | 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding'>;
  featured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TransformationSchema = new Schema<ITransformation>(
  {
    clientName: {
      type: String,
      default: '',
      trim: true,
    },
    beforeImage: {
      type: String,
      default: '',
    },
    afterImage: {
      type: String,
      default: '',
    },
    weightLost: {
      type: String,
      default: '',
    },
    daysToAchieve: {
      type: String,
      default: '',
    },
    testimonial: {
      type: String,
      default: '',
    },
    setName: {
      type: String,
      default: '',
      trim: true,
    },
    page: {
      type: String,
      enum: ['weight-loss', 'pcod', 'therapeutic', 'wedding'],
      required: [true, 'Page is required'],
    },
    targetPages: {
      type: [String],
      enum: ['all', 'weight-loss', 'pcod', 'therapeutic', 'wedding'],
      default: ['weight-loss'],
      index: true,
    },
    featured: {
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

export default mongoose.models.Transformation || mongoose.model<ITransformation>('Transformation', TransformationSchema);
