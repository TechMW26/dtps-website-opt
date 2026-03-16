import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'pending';
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  responseData: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'pending'],
      default: 'pending',
    },
    paymentMethod: String,
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    responseData: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
