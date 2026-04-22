import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import SecurityLog from '@/models/SecurityLog';

/**
 * GET /api/admin/security
 *   Returns recent security events + aggregate counters that power the
 *   Admin → Security dashboard. Auth-gated by NextAuth + middleware.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [events, totals, failed24h, failed7d, criticalOpen, byType, lastLogins] =
    await Promise.all([
      SecurityLog.find().sort({ createdAt: -1 }).limit(100).lean(),
      SecurityLog.countDocuments({}),
      SecurityLog.countDocuments({ type: 'login_failed', createdAt: { $gte: since24h } }),
      SecurityLog.countDocuments({ type: 'login_failed', createdAt: { $gte: since7d } }),
      SecurityLog.countDocuments({ severity: 'critical', createdAt: { $gte: since7d } }),
      SecurityLog.aggregate([
        { $match: { createdAt: { $gte: since7d } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      SecurityLog.find({ type: 'login_success' })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  return NextResponse.json({
    events,
    stats: {
      totals,
      failed24h,
      failed7d,
      criticalOpen,
      byType,
      lastLogins,
    },
  });
}
