import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  phoneNumber: string;
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
        validator: function(v: string) {
          return /^[0-9]{10}$/.test(v);
        },
        message: 'Phone number must be 10 digits'
      }
    },
    page: {
      type: String,
      default: 'unknown'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
