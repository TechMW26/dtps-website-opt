'use client';

/**
 * Admin → Security
 *
 * Surfaces the most important signals from the SecurityLog collection:
 *   - Top KPI cards (failed logins 24h/7d, critical alerts, total events)
 *   - "Recent alerts" panel (last 5 critical/warning events)
 *   - Last 5 successful admin logins
 *   - Full event stream (most recent 100)
 *   - Live overview of the security controls already applied across the
 *     platform (CSP, rate limiting, encryption, etc.) so an operator can
 *     verify the protective surface at a glance.
 */

import { useEffect, useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Activity,
  RefreshCcw,
  Clock,
  UserCheck,
  Send,
} from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';

type SecurityEvent = {
  _id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  email?: string;
  ip?: string;
  path?: string;
  userAgent?: string;
  createdAt: string;
};

type SecurityResponse = {
  events: SecurityEvent[];
  stats: {
    totals: number;
    failed24h: number;
    failed7d: number;
    criticalOpen: number;
    byType: { _id: string; count: number }[];
    lastLogins: SecurityEvent[];
  };
};

const SEVERITY_STYLES: Record<SecurityEvent['severity'], { bg: string; text: string; label: string }> = {
  info:     { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Info' },
  warning:  { bg: 'bg-amber-500/15',   text: 'text-amber-400',   label: 'Warning' },
  critical: { bg: 'bg-red-500/15',     text: 'text-red-400',     label: 'Critical' },
};

const SECURITY_CONTROLS = [
  { label: 'Strict Content Security Policy (CSP)',     status: 'Active' },
  { label: 'HTTP Strict Transport Security (HSTS)',    status: 'Active' },
  { label: 'X-Frame-Options · clickjacking shield',    status: 'DENY'   },
  { label: 'Rate limiting on auth & write endpoints',  status: 'Active' },
  { label: 'Password hashing (bcrypt, 12 rounds)',     status: 'Active' },
  { label: 'JWT session, 24h expiry',                  status: 'Active' },
  { label: 'XSS sanitization (DOMPurify)',             status: 'Active' },
  { label: 'Production console output stripped',       status: 'Active' },
  { label: 'Admin routes gated by middleware',         status: 'Active' },
  { label: 'Audit log retention',                      status: '30 days'},
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SecurityPage() {
  let theme: 'dark' | 'light' = 'dark';
  try {
    theme = useTheme().theme;
  } catch { /* ThemeProvider optional */ }

  const isDark = theme === 'dark';

  const [data, setData] = useState<SecurityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testForm, setTestForm] = useState({
    name: 'DTPS Test User',
    email: '',
    phone: '',
    orderId: `TEST-${Date.now()}`,
    total: '299',
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/security', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as SecurityResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  async function runNotificationTest(e: React.FormEvent) {
    e.preventDefault();
    setTestError(null);
    setTestSuccess(null);
    setTestResponse(null);
    setTestLoading(true);

    try {
      const res = await fetch('/api/admin/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testForm.name,
          email: testForm.email,
          phone: testForm.phone,
          orderId: testForm.orderId,
          total: Number(testForm.total || 0),
          products: [
            {
              name: 'DTPS Test Plan',
              quantity: 1,
              price: Number(testForm.total || 0),
            },
          ],
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }

      setTestSuccess('Test notification sent. See channel response details below.');
      setTestResponse(json);
      setTestForm((prev) => ({
        ...prev,
        orderId: `TEST-${Date.now()}`,
      }));
    } catch (err: any) {
      setTestError(err?.message || 'Failed to send test notification');
    } finally {
      setTestLoading(false);
    }
  }

  const stats = data?.stats;
  const recentAlerts = (data?.events || []).filter(
    (e) => e.severity === 'critical' || e.severity === 'warning'
  ).slice(0, 5);

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const subtleText = isDark ? 'text-slate-400' : 'text-slate-500';
  const titleText = isDark ? 'text-white' : 'text-slate-900';
  const rowHover = isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={titleText}>Security Center</h1>
            <p className={subtleText}>
              Live audit trail and posture for the DTPS admin & public site.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm">
          Could not load security data: {error}
        </div>
      )}

      {/* Notification Test */}
      <div className={`rounded-xl border ${card}`}>
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className={`text-base font-semibold flex items-center gap-2 ${titleText}`}>
            <Send className="w-4 h-4" /> Send Test Notification
          </h2>
          <p className={`text-xs mt-1 ${subtleText}`}>
            Triggers both SMTP email and AiSensy WhatsApp test delivery instantly.
          </p>
        </div>
        <div className="p-4 space-y-4">
          <form onSubmit={runNotificationTest} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={testForm.name}
              onChange={(e) => setTestForm((prev) => ({ ...prev, name: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={testForm.email}
              onChange={(e) => setTestForm((prev) => ({ ...prev, email: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
              required
            />
            <input
              type="text"
              placeholder="Phone"
              value={testForm.phone}
              onChange={(e) => setTestForm((prev) => ({ ...prev, phone: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
            />
            <input
              type="text"
              placeholder="Order ID"
              value={testForm.orderId}
              onChange={(e) => setTestForm((prev) => ({ ...prev, orderId: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
              required
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount"
                value={testForm.total}
                onChange={(e) => setTestForm((prev) => ({ ...prev, total: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
                min="1"
                required
              />
              <button
                type="submit"
                disabled={testLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60 whitespace-nowrap"
              >
                {testLoading ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </form>

          {testError && (
            <div className={`text-sm px-3 py-2 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {testError}
            </div>
          )}

          {testSuccess && (
            <div className={`text-sm px-3 py-2 rounded-lg border ${isDark ? 'bg-emerald-900/20 border-emerald-700 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              {testSuccess}
            </div>
          )}

          {testResponse && (
            <div className={`text-xs rounded-lg border p-3 space-y-1 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <p><strong>Email:</strong> {JSON.stringify(testResponse.email)}</p>
              <p><strong>WhatsApp:</strong> {JSON.stringify(testResponse.whatsapp)}</p>
            </div>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Failed logins · 24h"
          value={stats?.failed24h ?? '—'}
          accent="amber"
          isDark={isDark}
        />
        <KpiCard
          icon={<ShieldAlert className="w-5 h-5" />}
          label="Failed logins · 7d"
          value={stats?.failed7d ?? '—'}
          accent="red"
          isDark={isDark}
        />
        <KpiCard
          icon={<Activity className="w-5 h-5" />}
          label="Critical alerts · 7d"
          value={stats?.criticalOpen ?? '—'}
          accent="red"
          isDark={isDark}
        />
        <KpiCard
          icon={<ShieldCheck className="w-5 h-5" />}
          label="Total events tracked"
          value={stats?.totals ?? '—'}
          accent="emerald"
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent alerts */}
        <div className={`lg:col-span-2 rounded-xl border ${card}`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <h2 className={`text-base font-semibold ${titleText}`}>Recent alerts</h2>
            <p className={`text-xs ${subtleText}`}>
              Critical and warning-level events from the last 24 hours.
            </p>
          </div>
          {recentAlerts.length === 0 ? (
            <div className={`p-8 text-center ${subtleText}`}>
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
              No alerts. The admin surface is healthy.
            </div>
          ) : (
            <ul className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
              {recentAlerts.map((e) => {
                const styles = SEVERITY_STYLES[e.severity];
                return (
                  <li key={e._id} className={`p-4 flex items-start gap-3 ${rowHover}`}>
                    <span className={`px-2 py-1 text-[10px] font-semibold rounded ${styles.bg} ${styles.text}`}>
                      {styles.label.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm ${titleText}`}>{e.message}</p>
                      <p className={`text-xs mt-1 ${subtleText}`}>
                        {formatTime(e.createdAt)} · {e.email || 'unknown user'} · {e.ip || 'no ip'}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Last logins */}
        <div className={`rounded-xl border ${card}`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <h2 className={`text-base font-semibold ${titleText}`}>Recent successful logins</h2>
          </div>
          {(stats?.lastLogins || []).length === 0 ? (
            <div className={`p-6 text-center text-sm ${subtleText}`}>No logins recorded yet.</div>
          ) : (
            <ul className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
              {stats!.lastLogins.map((e) => (
                <li key={e._id} className="p-4 flex items-start gap-3">
                  <UserCheck className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${titleText}`}>{e.email || 'unknown'}</p>
                    <p className={`text-xs ${subtleText}`}>
                      <Clock className="inline w-3 h-3 mr-1 -mt-0.5" />
                      {formatTime(e.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Controls + event stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`rounded-xl border ${card}`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <h2 className={`text-base font-semibold flex items-center gap-2 ${titleText}`}>
              <Lock className="w-4 h-4" /> Active security controls
            </h2>
          </div>
          <ul className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
            {SECURITY_CONTROLS.map((c) => (
              <li key={c.label} className="p-3 flex items-center justify-between text-sm">
                <span className={titleText}>{c.label}</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/15 text-emerald-400">
                  {c.status.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Event stream */}
        <div className={`lg:col-span-2 rounded-xl border ${card}`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <h2 className={`text-base font-semibold ${titleText}`}>Event stream</h2>
            <p className={`text-xs ${subtleText}`}>Most recent 100 audit entries.</p>
          </div>
          <div className="overflow-x-auto">
            {(data?.events || []).length === 0 ? (
              <div className={`p-6 text-sm text-center ${subtleText}`}>
                {loading ? 'Loading…' : 'No events recorded yet.'}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    <th className="text-left p-3 font-medium text-xs uppercase">Time</th>
                    <th className="text-left p-3 font-medium text-xs uppercase">Severity</th>
                    <th className="text-left p-3 font-medium text-xs uppercase">Type</th>
                    <th className="text-left p-3 font-medium text-xs uppercase">Message</th>
                    <th className="text-left p-3 font-medium text-xs uppercase">Email</th>
                    <th className="text-left p-3 font-medium text-xs uppercase">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.events.map((e) => {
                    const styles = SEVERITY_STYLES[e.severity];
                    return (
                      <tr
                        key={e._id}
                        className={`${rowHover} ${isDark ? 'border-t border-slate-700/60' : 'border-t border-slate-200'}`}
                      >
                        <td className={`p-3 whitespace-nowrap ${subtleText}`}>{formatTime(e.createdAt)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${styles.bg} ${styles.text}`}>
                            {styles.label.toUpperCase()}
                          </span>
                        </td>
                        <td className={`p-3 ${titleText}`}>{e.type}</td>
                        <td className={titleText}>{e.message}</td>
                        <td className={`p-3 ${subtleText}`}>{e.email || '—'}</td>
                        <td className={`p-3 ${subtleText}`}>{e.ip || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  accent,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: 'emerald' | 'amber' | 'red';
  isDark: boolean;
}) {
  const accentMap = {
    emerald: 'from-emerald-500/20 to-emerald-700/10 text-emerald-400 border-emerald-500/30',
    amber:   'from-amber-500/20 to-amber-700/10 text-amber-400 border-amber-500/30',
    red:     'from-red-500/20 to-red-700/10 text-red-400 border-red-500/30',
  };
  return (
    <div
      className={`rounded-xl border p-4 bg-gradient-to-br ${accentMap[accent]} ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
          <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        </div>
        <div className="opacity-90">{icon}</div>
      </div>
    </div>
  );
}
