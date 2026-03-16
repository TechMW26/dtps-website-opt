import mongoose, { Document, Schema } from 'mongoose';

export interface IPopupBanner extends Document {
  title?: string;
  image: string;
  pages: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PopupBannerSchema = new Schema<IPopupBanner>(
  {
    title: {
      type: String,
      default: 'Special Offer'
    },
    image: {
      type: String,
      required: true
    },
    pages: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.PopupBanner || mongoose.model<IPopupBanner>('PopupBanner', PopupBannerSchema);
