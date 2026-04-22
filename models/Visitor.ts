import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Visitor / page-view session record.
 *
 * One document represents a single browser session (sessionId stored
 * client-side in sessionStorage). The `pageViews` array grows as the
 * visitor moves between pages on the site, and `lastSeen` is updated
 * by a low-frequency heartbeat so the live-visitors view can compute
 * "currently active" sessions (lastSeen within the past 2 minutes).
 *
 * IPs are stored at session granularity – we deliberately do NOT log
 * an IP per page view to keep storage bounded.
 */

export interface IPageView {
  path: string;
  title?: string;
  referrer?: string;
  enteredAt: Date;
  durationMs?: number;
}

export interface IVisitor extends Document {
  sessionId: string;
  ip?: string;
  userAgent?: string;
  device?: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';
  browser?: string;
  os?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  lat?: number;
  lng?: number;
  isp?: string;
  language?: string;
  referrer?: string;
  landingPath?: string;
  pageViews: IPageView[];
  totalDurationMs: number;
  sessionStart: Date;
  lastSeen: Date;
}

const PageViewSchema = new Schema<IPageView>(
  {
    path: { type: String, required: true },
    title: String,
    referrer: String,
    enteredAt: { type: Date, default: Date.now },
    durationMs: { type: Number, default: 0 },
  },
  { _id: false }
);

const VisitorSchema = new Schema<IVisitor>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    ip: { type: String, index: true },
    userAgent: String,
    device: { type: String, enum: ['mobile', 'tablet', 'desktop', 'bot', 'unknown'], default: 'unknown' },
    browser: String,
    os: String,
    country: { type: String, index: true },
    countryCode: String,
    region: String,
    city: { type: String, index: true },
    lat: Number,
    lng: Number,
    isp: String,
    language: String,
    referrer: String,
    landingPath: String,
    pageViews: { type: [PageViewSchema], default: [] },
    totalDurationMs: { type: Number, default: 0 },
    sessionStart: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

// Auto-purge sessions older than 90 days to keep collection bounded.
VisitorSchema.index({ sessionStart: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Visitor: Model<IVisitor> =
  (mongoose.models.Visitor as Model<IVisitor>) ||
  mongoose.model<IVisitor>('Visitor', VisitorSchema);

export default Visitor;
