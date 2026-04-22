'use client';

/**
 * Admin → Traffic
 *
 * Live visitors, session geography, device split, top pages and a
 * zoomable world heat map. Auto-refreshes every 15s.
 */

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Globe2,
  Users,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Bot,
  RefreshCcw,
  MapPin,
  Eye,
  Clock,
} from 'lucide-react';
import {
  AdminPage,
  AdminCard,
  AdminCardHeader,
  AdminButton,
  AdminBadge,
  AdminSelect,
  StatCard,
  EmptyState,
  LoadingState,
  useAdminTheme,
} from '@/components/admin/ui';

const TrafficWorldMap = dynamic(() => import('@/components/admin/TrafficWorldMap'), {
  ssr: false,
  loading: () => <LoadingState label="Loading map…" />,
});

interface TrafficResponse {
  range: '24h' | '7d' | '30d';
  liveVisitors: number;
  stats: { sessions: number; pageViews: number; avgSessionMs: number };
  byCountry: { country: string; code: string; count: number }[];
  byCity: { city: string; country: string; count: number; lat?: number; lng?: number }[];
  byDevice: { device: string; count: number }[];
  byPage: { path: string; views: number }[];
  locations: { lat: number; lng: number; city?: string; country?: string; count: number }[];
  liveList: {
    sessionId: string;
    ip?: string;
    country?: string;
    city?: string;
    device?: string;
    browser?: string;
    os?: string;
    currentPath?: string;
    lastSeen: string;
    sessionStart: string;
    totalDurationMs: number;
    pageViewsCount: number;
  }[];
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="w-4 h-4" />,
  desktop: <Monitor className="w-4 h-4" />,
  tablet: <Tablet className="w-4 h-4" />,
  bot: <Bot className="w-4 h-4" />,
  unknown: <Globe2 className="w-4 h-4" />,
};

function formatDuration(ms: number): string {
  if (!ms || ms < 1000) return '0s';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return `${m}m ${rem}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

export default function TrafficPage() {
  const t = useAdminTheme();
  const [data, setData] = useState<TrafficResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/traffic?range=${range}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch { /* swallow */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [range]);

  const totalDeviceShare = useMemo(
    () => (data?.byDevice || []).reduce((a, b) => a + b.count, 0) || 1,
    [data]
  );

  return (
    <AdminPage
      title="Traffic & Live Visitors"
      description="Real-time view of who is on the site, where they are coming from, and what they are reading."
      actions={
        <>
          <AdminSelect
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="w-32"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7d</option>
            <option value="30d">Last 30d</option>
          </AdminSelect>
          <AdminButton
            variant="primary"
            onClick={load}
            loading={loading}
            icon={<RefreshCcw className="w-4 h-4" />}
          >
            Refresh
          </AdminButton>
        </>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Live visitors"
          value={data?.liveVisitors ?? '—'}
          hint="Active in last 2 minutes"
          icon={<Activity className="w-5 h-5" />}
          accent="emerald"
        />
        <StatCard
          label="Sessions"
          value={data?.stats.sessions ?? '—'}
          hint={`Within ${range}`}
          icon={<Users className="w-5 h-5" />}
          accent="blue"
        />
        <StatCard
          label="Page views"
          value={data?.stats.pageViews ?? '—'}
          hint={`Within ${range}`}
          icon={<Eye className="w-5 h-5" />}
          accent="amber"
        />
        <StatCard
          label="Avg session"
          value={formatDuration(data?.stats.avgSessionMs ?? 0)}
          hint="Time on site"
          icon={<Clock className="w-5 h-5" />}
          accent="slate"
        />
      </div>

      {/* World map */}
      <TrafficWorldMap locations={data?.locations || []} />

      {/* Top countries / cities / devices / pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard padded={false}>
          <AdminCardHeader title="Top countries" description={`Sessions in last ${range}`} />
          {(data?.byCountry || []).length === 0 ? (
            <EmptyState icon={<Globe2 className="w-8 h-8" />} title="No location data yet" description="Geo lookups appear once visitors arrive." />
          ) : (
            <ul className={`divide-y ${t.divide}`}>
              {data!.byCountry.slice(0, 10).map((c, i) => {
                const pct = (c.count / data!.byCountry[0].count) * 100;
                return (
                  <li key={i} className="px-5 py-3 flex items-center gap-3">
                    <span className={`text-xs w-6 ${t.textMuted}`}>#{i + 1}</span>
                    <span className={`flex-1 text-sm ${t.text}`}>{c.country || 'Unknown'}</span>
                    <div className="w-32 h-1.5 rounded bg-slate-700/40 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-sm font-semibold ${t.text} w-12 text-right`}>{c.count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>

        <AdminCard padded={false}>
          <AdminCardHeader title="Top cities" description={`Sessions in last ${range}`} />
          {(data?.byCity || []).length === 0 ? (
            <EmptyState icon={<MapPin className="w-8 h-8" />} title="No city data yet" />
          ) : (
            <ul className={`divide-y ${t.divide}`}>
              {data!.byCity.slice(0, 10).map((c, i) => (
                <li key={i} className="px-5 py-3 flex items-center gap-3">
                  <span className={`text-xs w-6 ${t.textMuted}`}>#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${t.text}`}>{c.city || 'Unknown'}</p>
                    <p className={`text-xs ${t.textMuted}`}>
                      {c.country}
                      {c.lat && c.lng && ` · ${c.lat.toFixed(2)}, ${c.lng.toFixed(2)}`}
                    </p>
                  </div>
                  <AdminBadge tone="info">{c.count}</AdminBadge>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard padded={false}>
          <AdminCardHeader title="Devices" description={`Share of sessions in last ${range}`} />
          <div className="p-5 space-y-3">
            {(data?.byDevice || []).map((d) => {
              const pct = (d.count / totalDeviceShare) * 100;
              return (
                <div key={d.device} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.surfaceMuted} ${t.text}`}>
                    {DEVICE_ICONS[d.device] || DEVICE_ICONS.unknown}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`${t.text} capitalize`}>{d.device}</span>
                      <span className={t.textMuted}>{d.count} · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 w-full h-1.5 rounded bg-slate-700/30 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {(data?.byDevice || []).length === 0 && (
              <p className={`text-sm text-center py-6 ${t.textMuted}`}>No device data yet.</p>
            )}
          </div>
        </AdminCard>

        <AdminCard padded={false}>
          <AdminCardHeader title="Top pages" description={`Most viewed pages in last ${range}`} />
          {(data?.byPage || []).length === 0 ? (
            <EmptyState icon={<Eye className="w-8 h-8" />} title="No page views yet" />
          ) : (
            <ul className={`divide-y ${t.divide}`}>
              {data!.byPage.map((p, i) => (
                <li key={i} className="px-5 py-3 flex items-center gap-3">
                  <span className={`text-xs w-6 ${t.textMuted}`}>#{i + 1}</span>
                  <span className={`flex-1 text-sm truncate font-mono ${t.text}`}>{p.path}</span>
                  <AdminBadge tone="success">{p.views}</AdminBadge>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      {/* Live visitors table */}
      <AdminCard padded={false}>
        <AdminCardHeader
          title="Live sessions"
          description="Visitors active in the last 2 minutes."
          actions={<AdminBadge tone="success">{data?.liveVisitors ?? 0} active</AdminBadge>}
        />
        <div className="overflow-x-auto">
          {!data ? (
            <LoadingState label="Loading sessions…" />
          ) : data.liveList.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No one is on the site right now"
              description="Live visitors will appear here in real time."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={t.textMuted}>
                  <th className="text-left p-3 font-medium text-xs uppercase">Location</th>
                  <th className="text-left p-3 font-medium text-xs uppercase">IP</th>
                  <th className="text-left p-3 font-medium text-xs uppercase">Device</th>
                  <th className="text-left p-3 font-medium text-xs uppercase">Browser / OS</th>
                  <th className="text-left p-3 font-medium text-xs uppercase">Current page</th>
                  <th className="text-left p-3 font-medium text-xs uppercase">Time on site</th>
                  <th className="text-left p-3 font-medium text-xs uppercase">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {data.liveList.map((v) => (
                  <tr key={v.sessionId} className={`${t.rowHover} border-t ${t.border}`}>
                    <td className={`p-3 ${t.text}`}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{v.city || 'Unknown'}</span>
                        <span className={t.textMuted}>{v.country || ''}</span>
                      </div>
                    </td>
                    <td className={`p-3 font-mono text-xs ${t.textMuted}`}>{v.ip || '—'}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5">
                        {DEVICE_ICONS[v.device || 'unknown']}
                        <span className={`capitalize ${t.text}`}>{v.device}</span>
                      </span>
                    </td>
                    <td className={`p-3 ${t.textSubtle} text-xs`}>
                      {v.browser} <span className={t.textMuted}>· {v.os}</span>
                    </td>
                    <td className={`p-3 font-mono text-xs ${t.text}`}>
                      {v.currentPath}
                      <div className={`text-[10px] ${t.textMuted} mt-0.5`}>
                        {v.pageViewsCount} page{v.pageViewsCount === 1 ? '' : 's'} viewed
                      </div>
                    </td>
                    <td className={`p-3 text-xs ${t.text}`}>{formatDuration(v.totalDurationMs)}</td>
                    <td className={`p-3 text-xs ${t.textMuted}`}>{timeAgo(v.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AdminCard>
    </AdminPage>
  );
}
