import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  phoneNumber: string;          // National-significant digits (e.g. "9893027688")
  countryCode?: string;         // Dial code with leading + (e.g. "+91")
  countryIso?: string;          // ISO-2 (e.g. "IN")
  e164?: string;                // Full E.164 (e.g. "+919893027688")
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  service?: string;
  preferredDate?: Date;
  message?: string;
  source?: string;              // 'appointment' | 'contact' | 'popup' | ...
  page?: string;
  popupId?: string;
  popupTitle?: string;
  sessionId?: string;
  pageUrl?: string;
  referrer?: string;
  language?: string;
  timezone?: string;
  device?: string;
  browser?: string;
  os?: string;
  ip?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  leadStatus?: 'new' | 'contacted' | 'converted' | 'closed';
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[0-9]{7,15}$/.test(v),
        message: 'Phone number must contain 7-15 digits',
      },
    },
    countryCode: { type: String, trim: true, default: '+91' },
    countryIso: { type: String, trim: true, default: 'IN' },
    e164: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    service: { type: String, trim: true },
    preferredDate: { type: Date },
    message: { type: String, trim: true },
    source: { type: String, trim: true, default: 'unknown' },
    page: { type: String, default: 'unknown' },
    popupId: { type: String, trim: true, index: true },
    popupTitle: { type: String, trim: true, maxlength: 120 },
    sessionId: { type: String, trim: true, index: true },
    pageUrl: { type: String, trim: true, maxlength: 1200 },
    referrer: { type: String, trim: true, maxlength: 1200 },
    language: { type: String, trim: true, maxlength: 40 },
    timezone: { type: String, trim: true, maxlength: 100 },
    device: { type: String, trim: true, maxlength: 30 },
    browser: { type: String, trim: true, maxlength: 60 },
    os: { type: String, trim: true, maxlength: 60 },
    ip: { type: String, trim: true, maxlength: 100 },
    screenWidth: { type: Number, min: 0, max: 20000 },
    screenHeight: { type: Number, min: 0, max: 20000 },
    viewportWidth: { type: Number, min: 0, max: 20000 },
    viewportHeight: { type: Number, min: 0, max: 20000 },
    utmSource: { type: String, trim: true, maxlength: 200 },
    utmMedium: { type: String, trim: true, maxlength: 200 },
    utmCampaign: { type: String, trim: true, maxlength: 200 },
    utmTerm: { type: String, trim: true, maxlength: 200 },
    utmContent: { type: String, trim: true, maxlength: 200 },
    leadStatus: { type: String, enum: ['new', 'contacted', 'converted', 'closed'], default: 'new', index: true },
    adminNote: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
