import mongoose, { Schema, Document } from 'mongoose';

export interface IPageHero extends Document {
  page: string; // e.g., 'weight-loss', 'pcod', etc.
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PageHeroSchema = new Schema<IPageHero>(
  {
    page: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      default: 'Buy Plan',
    },
    buttonLink: {
      type: String,
      default: '/appointment',
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PageHero ||
  mongoose.model<IPageHero>('PageHero', PageHeroSchema);
