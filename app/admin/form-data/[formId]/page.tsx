'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Eye,
    Trash2,
    X,
    AlertTriangle,
    Download,
    Search,
    Calendar,
} from 'lucide-react';

interface Submission {
    _id: string;
    formId: string;
    name: string;
    city: string;
    contactNumber: string;
    email: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    primaryGoal: string;
    medicalConditions: string;
    triedMethods: string;
    dailyRoutine: string;
    preferredCallTime: string;
    page?: string;
    source?: string;
    createdAt: string;
}

const FIELD_LABELS: { key: keyof Submission; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'city', label: 'City' },
    { key: 'contactNumber', label: 'Contact Number' },
    { key: 'email', label: 'Email' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'height', label: 'Height' },
    { key: 'weight', label: 'Weight' },
    { key: 'primaryGoal', label: 'Primary Goal' },
    { key: 'medicalConditions', label: 'Medical Conditions' },
    { key: 'triedMethods', label: 'Tried Methods Before' },
    { key: 'dailyRoutine', label: 'Daily Routine' },
    { key: 'preferredCallTime', label: 'Preferred Call Time' },
];

function fmtDateTime(d: string) {
    return new Date(d).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function toInputDate(d: Date) {
    const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tz.toISOString().slice(0, 10);
}

export default function FormSubmissionsPage() {
    const params = useParams();
    const formId = String(params?.formId || '');

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState<Submission | null>(null);
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    function setDatePreset(preset: 'today' | 'yesterday' | 'all') {
        if (preset === 'all') {
            setDateFrom('');
            setDateTo('');
            return;
        }
        const now = new Date();
        if (preset === 'today') {
            const d = toInputDate(now);
            setDateFrom(d);
            setDateTo(d);
        } else if (preset === 'yesterday') {
            const y = new Date(now);
            y.setDate(y.getDate() - 1);
            const d = toInputDate(y);
            setDateFrom(d);
            setDateTo(d);
        }
    }

    const fetchSubmissions = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/form-submissions?formId=${encodeURIComponent(formId)}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.submissions)) {
                setSubmissions(data.submissions);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        } finally {
            setLoading(false);
        }
    }, [formId]);

    useEffect(() => {
        if (formId) fetchSubmissions();
    }, [formId, fetchSubmissions]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const fromMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
        const toMs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;
        return submissions.filter((s) => {
            if (q) {
                const match =
                    s.name.toLowerCase().includes(q) ||
                    s.email.toLowerCase().includes(q) ||
                    s.contactNumber.toLowerCase().includes(q) ||
                    s.city.toLowerCase().includes(q);
                if (!match) return false;
            }
            if (fromMs !== null || toMs !== null) {
                const ts = new Date(s.createdAt).getTime();
                if (fromMs !== null && ts < fromMs) return false;
                if (toMs !== null && ts > toMs) return false;
            }
            return true;
        });
    }, [submissions, search, dateFrom, dateTo]);

    async function deleteSubmission(id: string) {
        if (!confirm('Delete this submission?')) return;
        try {
            const res = await fetch(`/api/form-submissions?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setSubmissions((prev) => prev.filter((s) => s._id !== id));
                if (active?._id === id) setActive(null);
            } else {
                alert(data.error || 'Failed to delete');
            }
        } catch {
            alert('Error deleting submission');
        }
    }

    function exportCsv() {
        if (submissions.length === 0) return;
        const headers = ['Submitted At', ...FIELD_LABELS.map((f) => f.label)];
        const rows = submissions.map((s) => [
            fmtDateTime(s.createdAt),
            ...FIELD_LABELS.map((f) => String(s[f.key] ?? '')),
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `form-${formId}-submissions.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/form-data"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Form {formId}</h1>
                        <p className="text-sm text-gray-500">{submissions.length} total submissions</p>
                    </div>
                </div>
                {submissions.length > 0 && (
                    <button
                        onClick={exportCsv}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                )}
            </div>

            {/* Search */}
            {submissions.length > 0 && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 sm:max-w-sm">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, phone, city…"
                        className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    />
                </div>
            )}

            {/* Date filters */}
            {submissions.length > 0 && (
                <div className="mb-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                        {(
                            [
                                { key: 'today', label: 'Today' },
                                { key: 'yesterday', label: 'Yesterday' },
                                { key: 'all', label: 'All Time' },
                            ] as const
                        ).map((p) => {
                            const isAllActive = p.key === 'all' && !dateFrom && !dateTo;
                            return (
                                <button
                                    key={p.key}
                                    onClick={() => setDatePreset(p.key)}
                                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${isAllActive
                                            ? 'border-orange-300 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom range */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-xs font-medium text-gray-500">Custom range:</span>
                        <input
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-orange-500"
                        />
                        <span className="text-gray-400">→</span>
                        <input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-orange-500"
                        />
                        {(dateFrom || dateTo) && (
                            <button
                                onClick={() => {
                                    setDateFrom('');
                                    setDateTo('');
                                }}
                                className="text-xs text-red-500 underline hover:text-red-700"
                            >
                                Clear dates
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
                    <p className="mt-3 text-sm text-gray-400">Loading submissions…</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">#</th>
                                <th className="px-4 py-3 text-left font-semibold">Name</th>
                                <th className="px-4 py-3 text-left font-semibold">Contact</th>
                                <th className="hidden px-4 py-3 text-left font-semibold lg:table-cell">Email</th>
                                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">City</th>
                                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">Goal</th>
                                <th className="px-4 py-3 text-left font-semibold">Submitted</th>
                                <th className="px-4 py-3 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-gray-400">
                                        <AlertTriangle className="mx-auto mb-2 h-8 w-8 opacity-40" />
                                        No submissions found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((s, idx) => (
                                    <tr
                                        key={s._id}
                                        className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.contactNumber}</td>
                                        <td className="hidden max-w-[200px] truncate px-4 py-3 text-gray-500 lg:table-cell">
                                            {s.email}
                                        </td>
                                        <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{s.city}</td>
                                        <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{s.primaryGoal}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                                            {fmtDateTime(s.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setActive(s)}
                                                    className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteSubmission(s._id)}
                                                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail modal */}
            {active && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setActive(null)}
                >
                    <div
                        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{active.name}</h2>
                                <p className="text-xs text-gray-400">{fmtDateTime(active.createdAt)}</p>
                            </div>
                            <button
                                onClick={() => setActive(null)}
                                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100 px-6 py-2">
                            {FIELD_LABELS.map((f) => (
                                <div key={f.key} className="flex items-start justify-between gap-4 py-3">
                                    <span className="text-sm font-medium text-gray-500">{f.label}</span>
                                    <span className="text-right text-sm text-gray-900">
                                        {String(active[f.key] || '—')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
                            <button
                                onClick={() => deleteSubmission(active._id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
