import mongoose, { Schema, Document } from 'mongoose';

export interface IRecognition extends Document {
  title: string;
  description: string;
  image: string;
  year: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecognitionSchema = new Schema<IRecognition>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image: {
      type: String,
      default: 'https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-69b7c909bfd19f93f09dc3e3.jpg',
    },
    year: {
      type: String,
      default: '',
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

export default mongoose.models.Recognition || mongoose.model<IRecognition>('Recognition', RecognitionSchema);
