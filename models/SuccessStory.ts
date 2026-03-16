import mongoose, { Schema, Document } from 'mongoose';

export interface ISuccessStory extends Document {
  name: string;
  beforeImage: string;
  afterImage: string;
  weightLost: string;
  duration: string;
  testimonial: string;
  videoUrl: string;
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  type: 'transformation' | 'video' | 'story';
  featured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SuccessStorySchema = new Schema<ISuccessStory>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
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
    duration: {
      type: String,
      default: '',
    },
    testimonial: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    page: {
      type: String,
      enum: ['weight-loss', 'pcod', 'therapeutic', 'wedding'],
      required: [true, 'Page is required'],
    },
    type: {
      type: String,
      enum: ['transformation', 'video', 'story'],
      default: 'transformation',
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

export default mongoose.models.SuccessStory || mongoose.model<ISuccessStory>('SuccessStory', SuccessStorySchema);
