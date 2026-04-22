import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * SecurityLog – append-only audit trail for security-sensitive events.
 *
 * Events are written by:
 *   - NextAuth `signIn` / `signOut` callbacks (login success/failure)
 *   - The global middleware (rate-limit hits, blocked admin probes)
 *   - Sensitive admin API routes (password changes, admin creation, etc.)
 *
 * Records are retained for 30 days via a TTL index on `createdAt`.
 */

export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'rate_limit_block'
  | 'unauthorized_access'
  | 'admin_action'
  | 'password_change'
  | 'suspicious_activity';

export type SecuritySeverity = 'info' | 'warning' | 'critical';

export interface ISecurityLog extends Document {
  type: SecurityEventType;
  severity: SecuritySeverity;
  message: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const SecurityLogSchema = new Schema<ISecurityLog>(
  {
    type: { type: String, required: true, index: true },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
      index: true,
    },
    message: { type: String, required: true },
    email: { type: String, index: true },
    ip: { type: String, index: true },
    userAgent: String,
    path: String,
    meta: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Auto-expire records after 30 days to keep the collection lean.
SecurityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const SecurityLog: Model<ISecurityLog> =
  (mongoose.models.SecurityLog as Model<ISecurityLog>) ||
  mongoose.model<ISecurityLog>('SecurityLog', SecurityLogSchema);

export default SecurityLog;
