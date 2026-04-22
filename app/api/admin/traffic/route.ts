import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Visitor from '@/models/Visitor';

/**
 * GET /api/admin/traffic
 *
 * Returns the data the traffic dashboard needs in one shot:
 *
 *   - liveVisitors      : sessions with lastSeen within the past 2 minutes
 *   - last24h           : { sessions, pageViews, avgSessionMs }
 *   - byCountry         : aggregated session counts by country
 *   - byCity            : aggregated session counts by city
 *   - byDevice          : sessions grouped by device family
 *   - byPage            : top 10 pages by views in last 24h
 *   - locations         : { lat, lng, sessions, city, country } for the map
 *   - liveList          : up to 50 active sessions with last page + duration
 *
 * Optional query params:
 *   country   – filter aggregations to a single country
 *   range     – '24h' (default) | '7d' | '30d'
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const url = new URL(req.url);
  const range = (url.searchParams.get('range') || '24h') as '24h' | '7d' | '30d';
  const country = url.searchParams.get('country') || undefined;

  const ms = range === '30d' ? 30 * 24 * 3600e3 : range === '7d' ? 7 * 24 * 3600e3 : 24 * 3600e3;
  const since = new Date(Date.now() - ms);
  const liveSince = new Date(Date.now() - 2 * 60 * 1000);

  const baseMatch: any = { sessionStart: { $gte: since } };
  if (country) baseMatch.country = country;

  const [
    liveVisitors,
    sessions24h,
    pvAgg,
    avgDurAgg,
    byCountry,
    byCity,
    byDevice,
    byPage,
    locations,
    liveList,
  ] = await Promise.all([
    Visitor.countDocuments({ lastSeen: { $gte: liveSince } }),
    Visitor.countDocuments(baseMatch),
    Visitor.aggregate([
      { $match: baseMatch },
      { $project: { count: { $size: { $ifNull: ['$pageViews', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]),
    Visitor.aggregate([
      { $match: baseMatch },
      { $group: { _id: null, avg: { $avg: '$totalDurationMs' } } },
    ]),
    Visitor.aggregate([
      { $match: { ...baseMatch, country: { $ne: null } } },
      { $group: { _id: { country: '$country', code: '$countryCode' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]),
    Visitor.aggregate([
      { $match: { ...baseMatch, city: { $ne: null } } },
      { $group: { _id: { city: '$city', country: '$country' }, count: { $sum: 1 }, lat: { $first: '$lat' }, lng: { $first: '$lng' } } },
      { $sort: { count: -1 } },
      { $limit: 100 },
    ]),
    Visitor.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Visitor.aggregate([
      { $match: baseMatch },
      { $unwind: '$pageViews' },
      { $group: { _id: '$pageViews.path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]),
    // For map: bucket by lat/lng to a coarse grid then collect city detail.
    Visitor.aggregate([
      { $match: { ...baseMatch, lat: { $ne: null }, lng: { $ne: null } } },
      {
        $group: {
          _id: { lat: '$lat', lng: '$lng', city: '$city', country: '$country' },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, lat: '$_id.lat', lng: '$_id.lng', city: '$_id.city', country: '$_id.country', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 500 },
    ]),
    Visitor.find({ lastSeen: { $gte: liveSince } })
      .sort({ lastSeen: -1 })
      .limit(50)
      .lean()
      .then((rows) =>
        rows.map((v: any) => {
          const last = v.pageViews?.[v.pageViews.length - 1];
          return {
            sessionId: v.sessionId,
            ip: v.ip,
            country: v.country,
            city: v.city,
            device: v.device,
            browser: v.browser,
            os: v.os,
            currentPath: last?.path || v.landingPath,
            lastSeen: v.lastSeen,
            sessionStart: v.sessionStart,
            totalDurationMs: v.totalDurationMs,
            pageViewsCount: v.pageViews?.length || 0,
          };
        })
      ),
  ]);

  return NextResponse.json({
    range,
    liveVisitors,
    stats: {
      sessions: sessions24h,
      pageViews: pvAgg[0]?.total || 0,
      avgSessionMs: Math.round(avgDurAgg[0]?.avg || 0),
    },
    byCountry: byCountry.map((c: any) => ({ country: c._id.country, code: c._id.code, count: c.count })),
    byCity: byCity.map((c: any) => ({ city: c._id.city, country: c._id.country, count: c.count, lat: c.lat, lng: c.lng })),
    byDevice: byDevice.map((d: any) => ({ device: d._id || 'unknown', count: d.count })),
    byPage: byPage.map((p: any) => ({ path: p._id, views: p.views })),
    locations,
    liveList,
  });
}
