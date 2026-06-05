'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ChevronRight, AlertTriangle, FileText } from 'lucide-react';

interface FormInfo {
    formId: string;
    count: number;
    lastSubmittedAt: string | null;
}

function fmtDate(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function FormDataPage() {
    const [forms, setForms] = useState<FormInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/form-submissions?distinct=forms');
                const data = await res.json();
                if (data.success && Array.isArray(data.forms)) {
                    setForms(data.forms);
                }
            } catch (err) {
                console.error('Error fetching forms:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Form Data</h1>
                <p className="text-gray-500 text-sm">Lead forms and their submissions</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm mt-3">Loading forms…</p>
                </div>
            ) : forms.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl py-16 text-center text-gray-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No form submissions yet
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {forms.map((form) => (
                        <Link key={form.formId} href={`/admin/form-data/${form.formId}`}>
                            <div className="group bg-white border border-gray-200 rounded-xl p-5 transition-all hover:border-orange-300 hover:shadow-md cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                            <ClipboardList className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Form
                                            </p>
                                            <p className="text-xl font-bold text-gray-900">{form.formId}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-orange-500" />
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                        {form.count} {form.count === 1 ? 'submission' : 'submissions'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Last: {fmtDate(form.lastSubmittedAt)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
