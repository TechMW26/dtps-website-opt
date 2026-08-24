'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  Globe2,
  Laptop,
  MapPin,
  MonitorSmartphone,
  Phone,
  RefreshCw,
  Search,
  UserRoundSearch,
  X,
} from 'lucide-react';
import { AdminButton, AdminCard, EmptyState, LoadingState, StatCard } from '@/components/admin/ui';

type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed';

interface PageView {
  path: string;
  title?: string;
  referrer?: string;
  enteredAt: string;
  durationMs?: number;
}

interface PopupLead {
  _id: string;
  phoneNumber: string;
  countryCode?: string;
  countryIso?: string;
  e164?: string;
  popupId?: string;
  popupTitle: string;
  page?: string;
  pageUrl?: string;
  sessionId?: string;
  referrer?: string;
  language?: string;
  timezone?: string;
  device?: string;
  browser?: string;
  os?: string;
  ip?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  leadStatus: LeadStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  location: {
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    lat?: number;
    lng?: number;
    isp?: string;
  };
  session: null | {
    startedAt: string;
    lastSeen: string;
    landingPath?: string;
    totalDurationMs?: number;
    pageViews?: PageView[];
  };
}

interface PopupLeadResponse {
  leads: PopupLead[];
  stats: { total: number; today: number; last7Days: number; converted: number };
  pagination: { page: number; limit: number; total: number; pages: number };
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  converted: 'Converted',
  closed: 'Closed',
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'border-blue-200 bg-blue-50 text-blue-700',
  contacted: 'border-amber-200 bg-amber-50 text-amber-700',
  converted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  closed: 'border-slate-200 bg-slate-100 text-slate-600',
};

function formatDate(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatDuration(ms = 0) {
  if (ms < 1000) return '0 sec';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return `${Math.floor(ms / 1000)} sec`;
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

function phone(lead: PopupLead) {
  return lead.e164 || `${lead.countryCode || ''}${lead.phoneNumber}`;
}

function locationLabel(lead: PopupLead) {
  return [lead.location?.city, lead.location?.region, lead.location?.country].filter(Boolean).join(', ') || 'Location unavailable';
}

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function PopupLeadsPage() {
  const [leads, setLeads] = useState<PopupLead[]>([]);
  const [stats, setStats] = useState<PopupLeadResponse['stats']>({ total: 0, today: 0, last7Days: 0, converted: 0 });
  const [pagination, setPagination] = useState<PopupLeadResponse['pagination']>({ page: 1, limit: 25, total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [device, setDevice] = useState('');
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<PopupLead | null>(null);
  const [draftStatus, setDraftStatus] = useState<LeadStatus>('new');
  const [draftNote, setDraftNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (search.trim()) params.set('search', search.trim());
    if (status) params.set('status', status);
    if (device) params.set('device', device);
    if (range) params.set('range', range);
    return params.toString();
  }, [device, page, range, search, status]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/popup-leads?${queryString}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load popup leads');
      setLeads(data.leads || []);
      setStats(data.stats || { total: 0, today: 0, last7Days: 0, converted: 0 });
      setPagination(data.pagination || { page: 1, limit: 25, total: 0, pages: 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load popup leads');
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadLeads(), 250);
    return () => window.clearTimeout(timer);
  }, [loadLeads]);

  useEffect(() => setPage(1), [search, status, device, range]);

  function openLead(lead: PopupLead) {
    setSelected(lead);
    setDraftStatus(lead.leadStatus || 'new');
    setDraftNote(lead.adminNote || '');
  }

  async function saveLead() {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/popup-leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected._id, status: draftStatus, adminNote: draftNote }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to update lead');
      setLeads((current) => current.map((lead) => lead._id === selected._id ? { ...lead, leadStatus: draftStatus, adminNote: draftNote } : lead));
      setSelected((current) => current ? { ...current, leadStatus: draftStatus, adminNote: draftNote } : null);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update lead');
    } finally {
      setSaving(false);
    }
  }

  async function exportCsv() {
    setExporting(true);
    setError('');
    try {
      const params = new URLSearchParams(queryString);
      params.set('export', '1');
      const response = await fetch(`/api/admin/popup-leads?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to export popup leads');
      const rows: PopupLead[] = data.leads || [];
      const headers = ['Phone', 'Status', 'Submitted at', 'Popup', 'Page', 'Session ID', 'Device', 'Browser', 'OS', 'City', 'Region', 'Country', 'IP', 'Referrer', 'UTM source', 'UTM medium', 'UTM campaign', 'Timezone', 'Screen', 'Viewport', 'Admin note'];
      const csv = [headers, ...rows.map((lead) => [
        phone(lead), lead.leadStatus, formatDate(lead.createdAt), lead.popupTitle, lead.pageUrl || lead.page,
        lead.sessionId, lead.device, lead.browser, lead.os, lead.location?.city, lead.location?.region,
        lead.location?.country, lead.ip, lead.referrer, lead.utmSource, lead.utmMedium, lead.utmCampaign,
        lead.timezone, `${lead.screenWidth || ''}x${lead.screenHeight || ''}`, `${lead.viewportWidth || ''}x${lead.viewportHeight || ''}`, lead.adminNote,
      ])].map((row) => row.map(csvCell).join(',')).join('\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `popup-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to export popup leads');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6 pb-12">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Popup Leads</h1>
            <p className="mt-1 text-sm text-slate-600">Every visitor who submits a number through a popup, with campaign, session, device and approximate location context.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminButton variant="secondary" onClick={() => void loadLeads()} loading={loading} icon={<RefreshCw className="h-4 w-4" />}>Refresh</AdminButton>
            <AdminButton onClick={() => void exportCsv()} loading={exporting} icon={<Download className="h-4 w-4" />}>Export CSV</AdminButton>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total popup leads" value={stats.total} hint="All recorded submissions" icon={<UserRoundSearch className="h-5 w-5" />} accent="blue" />
          <StatCard label="Today" value={stats.today} hint="Since midnight" icon={<CalendarDays className="h-5 w-5" />} accent="amber" />
          <StatCard label="Last 7 days" value={stats.last7Days} hint="Recent popup interest" icon={<Clock3 className="h-5 w-5" />} accent="slate" />
          <StatCard label="Converted" value={stats.converted} hint={stats.total ? `${Math.round((stats.converted / stats.total) * 100)}% conversion` : 'No conversions yet'} icon={<BadgeCheck className="h-5 w-5" />} accent="emerald" />
        </div>

        <AdminCard className="!p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_170px_160px_160px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search phone, popup, page, session or campaign…" className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
            </label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by lead status" className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"><option value="">All statuses</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <select value={device} onChange={(event) => setDevice(event.target.value)} aria-label="Filter by device" className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"><option value="">All devices</option><option value="mobile">Mobile</option><option value="desktop">Desktop</option><option value="tablet">Tablet</option><option value="bot">Bot</option><option value="unknown">Unknown</option></select>
            <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Filter by date range" className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"><option value="">All time</option><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option></select>
          </div>
        </AdminCard>

        {loading ? <LoadingState label="Loading popup leads…" /> : leads.length === 0 ? (
          <EmptyState icon={<UserRoundSearch className="h-9 w-9" />} title="No popup leads found" description="New Claim Offer submissions will appear here automatically." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Popup and page</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Device</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Details</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-5 py-4"><a href={`tel:${phone(lead)}`} className="font-semibold text-slate-900 hover:text-emerald-700">{phone(lead)}</a><p className="mt-1 text-xs text-slate-400">{lead.countryIso || '—'}</p></td>
                      <td className="max-w-[260px] px-5 py-4"><p className="truncate font-medium text-slate-800">{lead.popupTitle}</p><p className="mt-1 truncate text-xs text-slate-500">{lead.pageUrl || lead.page || 'Unknown page'}</p></td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{formatDate(lead.createdAt)}</td>
                      <td className="px-5 py-4"><div className="flex items-center gap-2 text-slate-700"><MonitorSmartphone className="h-4 w-4 text-slate-400" /><span className="capitalize">{lead.device || 'unknown'}</span></div><p className="mt-1 text-xs text-slate-400">{lead.browser || '—'} · {lead.os || '—'}</p></td>
                      <td className="max-w-[230px] px-5 py-4"><div className="flex items-start gap-2 text-slate-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><span className="line-clamp-2">{locationLabel(lead)}</span></div></td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[lead.leadStatus]}`}>{STATUS_LABELS[lead.leadStatus]}</span></td>
                      <td className="px-5 py-4 text-right"><button type="button" onClick={() => openLead(lead)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"><Eye className="h-4 w-4" /> View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row">
              <p className="text-xs text-slate-500">Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
              <div className="flex items-center gap-2"><button type="button" disabled={pagination.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="px-2 text-xs font-medium text-slate-600">Page {pagination.page} of {pagination.pages}</span><button type="button" disabled={pagination.page >= pagination.pages} onClick={() => setPage((current) => current + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm md:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setSelected(null); }}>
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:px-7"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Popup lead</p><h2 className="mt-1 text-xl font-bold text-slate-950">{phone(selected)}</h2><p className="mt-1 text-xs text-slate-500">Submitted {formatDate(selected.createdAt)}</p></div><button type="button" onClick={() => !saving && setSelected(null)} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100" aria-label="Close lead details"><X className="h-5 w-5" /></button></div>
            <div className="grid gap-5 bg-slate-50 p-4 md:grid-cols-2 md:p-7">
              <DetailCard title="Contact and campaign" icon={<Phone className="h-4 w-4" />} rows={[['Phone', phone(selected)], ['Country code', `${selected.countryIso || '—'} ${selected.countryCode || ''}`], ['Popup', selected.popupTitle], ['Popup ID', selected.popupId || 'Legacy popup lead'], ['Source page', selected.pageUrl || selected.page || '—'], ['Captured at', formatDate(selected.createdAt)]]} />
              <DetailCard title="Device context" icon={<Laptop className="h-4 w-4" />} rows={[['Device', selected.device || 'Unknown'], ['Browser', selected.browser || 'Unknown'], ['Operating system', selected.os || 'Unknown'], ['Screen', selected.screenWidth ? `${selected.screenWidth} × ${selected.screenHeight}` : '—'], ['Viewport', selected.viewportWidth ? `${selected.viewportWidth} × ${selected.viewportHeight}` : '—'], ['Language / timezone', [selected.language, selected.timezone].filter(Boolean).join(' · ') || '—']]} />
              <DetailCard title="Approximate location" icon={<MapPin className="h-4 w-4" />} rows={[['Location', locationLabel(selected)], ['Country code', selected.location?.countryCode || '—'], ['Coordinates', selected.location?.lat !== undefined ? `${selected.location.lat}, ${selected.location.lng}` : '—'], ['Internet provider', selected.location?.isp || '—'], ['IP address', selected.ip || '—']]} />
              <DetailCard title="Acquisition" icon={<Globe2 className="h-4 w-4" />} rows={[['Referrer', selected.referrer || 'Direct / unavailable'], ['UTM source', selected.utmSource || '—'], ['UTM medium', selected.utmMedium || '—'], ['UTM campaign', selected.utmCampaign || '—'], ['UTM term', selected.utmTerm || '—'], ['UTM content', selected.utmContent || '—']]} />
              <DetailCard title="Session" icon={<Clock3 className="h-4 w-4" />} rows={[['Session ID', selected.sessionId || 'Not captured on legacy lead'], ['Started', selected.session ? formatDate(selected.session.startedAt) : '—'], ['Last active', selected.session ? formatDate(selected.session.lastSeen) : '—'], ['Duration', selected.session ? formatDuration(selected.session.totalDurationMs) : '—'], ['Landing page', selected.session?.landingPath || '—'], ['Page views', String(selected.session?.pageViews?.length || 0)]]} />
              <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Lead management</div><label className="text-xs font-semibold text-slate-600">Status<select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value as LeadStatus)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800">{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="mt-4 block text-xs font-semibold text-slate-600">Internal note<textarea value={draftNote} onChange={(event) => setDraftNote(event.target.value)} rows={5} maxLength={2000} placeholder="Add call outcome or follow-up notes…" className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" /></label><AdminButton onClick={() => void saveLead()} loading={saving} className="mt-4 w-full">Save status and note</AdminButton></div>
              {selected.session?.pageViews && selected.session.pageViews.length > 0 && <div className="rounded-xl border border-slate-200 bg-white p-5 md:col-span-2"><h3 className="mb-4 text-sm font-bold text-slate-900">Session journey</h3><div className="space-y-3">{selected.session.pageViews.map((view, index) => <div key={`${view.path}-${index}`} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">{index + 1}</span><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{view.path}</p><p className="text-xs text-slate-500">{formatDate(view.enteredAt)} · {formatDuration(view.durationMs)}</p></div></div>)}</div></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({ title, icon, rows }: { title: string; icon: React.ReactNode; rows: Array<[string, string]> }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">{icon}{title}</div><dl className="space-y-3">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="break-words text-xs font-medium text-slate-800">{value}</dd></div>)}</dl></div>;
}
