import mongoose, { Schema, Document } from 'mongoose';

export interface ITransformation extends Document {
  clientName: string;
  beforeImage: string;
  afterImage: string;
  weightLost: string;
  daysToAchieve: string;
  testimonial: string;
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
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
      required: [true, 'Client name is required'],
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
      required: [true, 'Weight lost is required'],
    },
    daysToAchieve: {
      type: String,
      required: [true, 'Days to achieve is required'],
    },
    testimonial: {
      type: String,
      default: '',
    },
    page: {
      type: String,
      enum: ['weight-loss', 'pcod', 'therapeutic', 'wedding'],
      required: [true, 'Page is required'],
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
