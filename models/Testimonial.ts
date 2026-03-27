import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
  featured: boolean;
  page: 'home' | 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    image: {
      type: String,
      default: 'https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-69b7c909bfd19f93f09dc3e1.jpg',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    page: {
      type: String,
      enum: ['home', 'weight-loss', 'pcod', 'therapeutic', 'wedding'],
      default: 'home',
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

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
