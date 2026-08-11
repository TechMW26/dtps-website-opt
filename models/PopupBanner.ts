import mongoose, { Document, Schema } from 'mongoose';
import type { PopupFrequency, PopupImageFit } from '@/lib/popup-settings';

export interface IPopupBanner extends Document {
  title: string;
  subtitle: string;
  image: string;
  mobileImage: string;
  pages: string[];
  isActive: boolean;
  displayDelayMs: number;
  displayFrequency: PopupFrequency;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  startAt: Date | null;
  endAt: Date | null;
  priority: number;
  showPhoneField: boolean;
  phonePlaceholder: string;
  ctaText: string;
  redirectUrl: string;
  openInNewTab: boolean;
  successMessage: string;
  successDelayMs: number;
  dismissOnOverlay: boolean;
  showCloseButton: boolean;
  desktopMaxWidth: number;
  imageFit: PopupImageFit;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
  overlayOpacity: number;
  createdAt: Date;
  updatedAt: Date;
}

const PopupBannerSchema = new Schema<IPopupBanner>(
  {
    title: { type: String, default: 'Unlock this special offer', maxlength: 120 },
    subtitle: { type: String, default: 'Enter your mobile number and our team will help you get started.', maxlength: 300 },
    image: { type: String, required: true, maxlength: 1000 },
    mobileImage: { type: String, default: '', maxlength: 1000 },
    pages: { type: [String], default: ['home'] },
    isActive: { type: Boolean, default: true },
    displayDelayMs: { type: Number, min: 0, max: 30000, default: 400 },
    displayFrequency: { type: String, enum: ['every_load', 'session', 'daily'], default: 'every_load' },
    showOnDesktop: { type: Boolean, default: true },
    showOnMobile: { type: Boolean, default: true },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    priority: { type: Number, min: 0, max: 100, default: 0 },
    showPhoneField: { type: Boolean, default: true },
    phonePlaceholder: { type: String, default: '10-digit mobile number', maxlength: 100 },
    ctaText: { type: String, default: 'Claim Offer', maxlength: 80 },
    redirectUrl: { type: String, default: '', maxlength: 1000 },
    openInNewTab: { type: Boolean, default: false },
    successMessage: { type: String, default: "Thank you! We'll contact you shortly.", maxlength: 240 },
    successDelayMs: { type: Number, min: 0, max: 10000, default: 900 },
    dismissOnOverlay: { type: Boolean, default: true },
    showCloseButton: { type: Boolean, default: true },
    desktopMaxWidth: { type: Number, min: 560, max: 1100, default: 860 },
    imageFit: { type: String, enum: ['contain', 'cover'], default: 'contain' },
    accentColor: { type: String, default: '#ff850b' },
    surfaceColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#172033' },
    overlayOpacity: { type: Number, min: 20, max: 95, default: 72 },
  },
  { timestamps: true }
);

export default mongoose.models.PopupBanner || mongoose.model<IPopupBanner>('PopupBanner', PopupBannerSchema);
