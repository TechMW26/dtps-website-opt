import mongoose, { Schema, Document } from 'mongoose';

const { v4: uuidv4 } = require('uuid');

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  total: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    products: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'razorpay',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
