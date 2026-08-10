import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMarqueeItem {
  text: string;
  icon: string;
  link: string;
  openInNewTab: boolean;
  enabled: boolean;
}

export interface IMarqueeSettings extends Document {
  key: 'global';
  isActive: boolean;
  items: IMarqueeItem[];
  animationMode: 'scroll' | 'static';
  direction: 'left' | 'right';
  speed: number;
  pauseOnHover: boolean;
  sticky: boolean;
  dismissible: boolean;
  edgeFade: boolean;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  pages: string[];
  startAt?: Date | null;
  endAt?: Date | null;
  backgroundColor: string;
  backgroundColorEnd: string;
  useGradient: boolean;
  textColor: string;
  heightDesktop: number;
  heightMobile: number;
  fontSizeDesktop: number;
  fontSizeMobile: number;
  fontWeight: number;
  iconSize: number;
  uppercase: boolean;
  ariaLabel: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarqueeItemSchema = new Schema<IMarqueeItem>(
  {
    text: { type: String, required: true, maxlength: 240 },
    icon: { type: String, default: '', trim: true, maxlength: 500 },
    link: { type: String, default: '', trim: true, maxlength: 500 },
    openInNewTab: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
  },
  { _id: true }
);

const MarqueeSettingsSchema = new Schema<IMarqueeSettings>(
  {
    key: { type: String, enum: ['global'], default: 'global', unique: true },
    isActive: { type: Boolean, default: false },
    items: { type: [MarqueeItemSchema], default: [] },
    animationMode: { type: String, enum: ['scroll', 'static'], default: 'scroll' },
    direction: { type: String, enum: ['left', 'right'], default: 'left' },
    speed: { type: Number, min: 5, max: 180, default: 24 },
    pauseOnHover: { type: Boolean, default: true },
    sticky: { type: Boolean, default: false },
    dismissible: { type: Boolean, default: false },
    edgeFade: { type: Boolean, default: true },
    showOnDesktop: { type: Boolean, default: true },
    showOnMobile: { type: Boolean, default: true },
    pages: { type: [String], default: ['*'] },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    backgroundColor: { type: String, default: '#005b57' },
    backgroundColorEnd: { type: String, default: '#00877f' },
    useGradient: { type: Boolean, default: true },
    textColor: { type: String, default: '#ffffff' },
    heightDesktop: { type: Number, min: 28, max: 96, default: 40 },
    heightMobile: { type: Number, min: 28, max: 96, default: 36 },
    fontSizeDesktop: { type: Number, min: 10, max: 30, default: 14 },
    fontSizeMobile: { type: Number, min: 10, max: 30, default: 12 },
    fontWeight: { type: Number, enum: [400, 500, 600, 700, 800], default: 600 },
    iconSize: { type: Number, min: 10, max: 40, default: 18 },
    uppercase: { type: Boolean, default: false },
    ariaLabel: { type: String, default: 'Current offers', maxlength: 100 },
  },
  { timestamps: true }
);

const MarqueeSettings: Model<IMarqueeSettings> =
  mongoose.models.MarqueeSettings ||
  mongoose.model<IMarqueeSettings>('MarqueeSettings', MarqueeSettingsSchema);

export default MarqueeSettings;
