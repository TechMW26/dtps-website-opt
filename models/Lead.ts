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
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
