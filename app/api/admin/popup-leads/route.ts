import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import PopupBanner from '@/models/PopupBanner';
import Visitor from '@/models/Visitor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STATUSES = new Set(['new', 'contacted', 'converted', 'closed']);
const RANGES: Record<string, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function requireAdmin() {
  return Boolean((await getServerSession(authOptions))?.user);
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const exporting = searchParams.get('export') === '1';
    const limit = exporting ? 5000 : Math.min(100, Math.max(10, Number(searchParams.get('limit')) || 25));
    const search = clean(searchParams.get('search'), 120);
    const status = clean(searchParams.get('status'), 30);
    const device = clean(searchParams.get('device'), 30);
    const range = clean(searchParams.get('range'), 10);

    const query: Record<string, unknown> = { source: 'popup' };
    if (status && STATUSES.has(status)) {
      query.$and = status === 'new'
        ? [{ $or: [{ leadStatus: 'new' }, { leadStatus: { $exists: false } }] }]
        : [{ leadStatus: status }];
    }
    if (device) query.device = device;
    if (range && RANGES[range]) query.createdAt = { $gte: new Date(Date.now() - RANGES[range]) };
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      query.$or = [
        { phoneNumber: regex },
        { e164: regex },
        { popupTitle: regex },
        { popupId: regex },
        { page: regex },
        { pageUrl: regex },
        { sessionId: regex },
        { ip: regex },
        { utmCampaign: regex },
        { utmSource: regex },
      ];
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [rawLeads, total, totalAll, todayCount, weekCount, convertedCount] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(exporting ? 0 : (page - 1) * limit).limit(limit).lean(),
      Lead.countDocuments(query),
      Lead.countDocuments({ source: 'popup' }),
      Lead.countDocuments({ source: 'popup', createdAt: { $gte: today } }),
      Lead.countDocuments({ source: 'popup', createdAt: { $gte: sevenDaysAgo } }),
      Lead.countDocuments({ source: 'popup', leadStatus: 'converted' }),
    ]);

    const sessionIds = rawLeads.map((lead) => lead.sessionId).filter(Boolean);
    const popupIds = rawLeads
      .map((lead) => lead.popupId)
      .filter((id): id is string => Boolean(id) && mongoose.isValidObjectId(id));

    const [visitors, popups] = await Promise.all([
      sessionIds.length ? Visitor.find({ sessionId: { $in: sessionIds } }).lean() : [],
      popupIds.length ? PopupBanner.find({ _id: { $in: popupIds } }).select({ title: 1 }).lean() : [],
    ]);

    const visitorBySession = new Map(visitors.map((visitor) => [visitor.sessionId, visitor]));
    const popupById = new Map(popups.map((popup) => [String(popup._id), popup.title]));

    const leads = rawLeads.map((lead) => {
      const visitor = lead.sessionId ? visitorBySession.get(lead.sessionId) : undefined;
      return {
        ...lead,
        _id: String(lead._id),
        leadStatus: lead.leadStatus || 'new',
        popupTitle: lead.popupTitle || (lead.popupId ? popupById.get(lead.popupId) : '') || 'Popup offer',
        device: lead.device || visitor?.device || 'unknown',
        browser: lead.browser || visitor?.browser || 'unknown',
        os: lead.os || visitor?.os || 'unknown',
        ip: lead.ip || visitor?.ip || '',
        language: lead.language || visitor?.language || '',
        referrer: lead.referrer || visitor?.referrer || '',
        location: {
          country: visitor?.country || '',
          countryCode: visitor?.countryCode || '',
          region: visitor?.region || '',
          city: visitor?.city || '',
          lat: visitor?.lat,
          lng: visitor?.lng,
          isp: visitor?.isp || '',
        },
        session: visitor ? {
          startedAt: visitor.sessionStart,
          lastSeen: visitor.lastSeen,
          landingPath: visitor.landingPath,
          totalDurationMs: visitor.totalDurationMs,
          pageViews: visitor.pageViews,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      leads,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
      stats: { total: totalAll, today: todayCount, last7Days: weekCount, converted: convertedCount },
    });
  } catch (error) {
    console.error('Popup leads fetch error:', error);
    return NextResponse.json({ error: 'Failed to load popup leads' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const id = clean(body.id, 100);
    const status = clean(body.status, 30);
    const adminNote = clean(body.adminNote, 2000);
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    if (!STATUSES.has(status)) return NextResponse.json({ error: 'Invalid lead status' }, { status: 400 });

    await dbConnect();
    const lead = await Lead.findOneAndUpdate(
      { _id: id, source: 'popup' },
      { $set: { leadStatus: status, adminNote } },
      { new: true, runValidators: true }
    );
    if (!lead) return NextResponse.json({ error: 'Popup lead not found' }, { status: 404 });
    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Popup lead update error:', error);
    return NextResponse.json({ error: 'Failed to update popup lead' }, { status: 500 });
  }
}
