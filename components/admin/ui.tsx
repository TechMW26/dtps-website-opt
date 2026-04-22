'use client';

/**
 * Admin design-system primitives.
 *
 * Every admin page should compose these primitives so spacing,
 * typography, surfaces and interactive states stay perfectly
 * consistent across the panel. Each primitive is theme-aware
 * (light / dark) via `useTheme`.
 */

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/providers/ThemeProvider';
import { ChevronRight, Loader2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Theme helper

function useAdminTheme() {
  let theme: 'dark' | 'light' = 'dark';
  try {
    theme = useTheme().theme;
  } catch { /* no provider */ }
  const isDark = theme === 'dark';
  return {
    isDark,
    pageBg: isDark ? 'bg-slate-900' : 'bg-slate-50',
    surface: isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
    surfaceMuted: isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200',
    border: isDark ? 'border-slate-700' : 'border-slate-200',
    divide: isDark ? 'divide-slate-700' : 'divide-slate-200',
    text: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    textSubtle: isDark ? 'text-slate-300' : 'text-slate-600',
    rowHover: isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50',
    inputBg: isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
  };
}

// ---------------------------------------------------------------------------
// AdminPage – the outer container every admin page should use.

export interface AdminPageProps {
  title: string;
  description?: string;
  /** Optional breadcrumb. Last item is rendered as the active page. */
  breadcrumbs?: { label: string; href?: string }[];
  /** Action buttons rendered at the top right of the page header. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminPage({ title, description, breadcrumbs, actions, children }: AdminPageProps) {
  const t = useAdminTheme();
  return (
    <div className="space-y-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className={`flex items-center text-xs gap-1 ${t.textMuted}`}>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {b.href ? (
                <Link href={b.href} className="hover:underline">{b.label}</Link>
              ) : (
                <span className={t.text}>{b.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3" />}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className={`tracking-tight ${t.text}`}>{title}</h1>
          {description && <p className={t.textMuted}>{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>

      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdminCard – consistent surface

export function AdminCard({
  className = '',
  padded = true,
  children,
}: {
  className?: string;
  padded?: boolean;
  children: React.ReactNode;
}) {
  const t = useAdminTheme();
  return (
    <div className={`rounded-xl border ${t.surface} ${padded ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function AdminCardHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  const t = useAdminTheme();
  return (
    <div className={`px-5 py-4 border-b ${t.border} flex items-start justify-between gap-3`}>
      <div>
        <h2 className={`text-base font-semibold ${t.text}`}>{title}</h2>
        {description && <p className={`text-xs mt-0.5 ${t.textMuted}`}>{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdminButton

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  secondary: 'bg-slate-700/70 hover:bg-slate-700 text-white border border-slate-600',
  ghost: 'bg-transparent hover:bg-slate-700/40 text-slate-300 border border-slate-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};
const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
};

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, className = '', children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        {...rest}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);
AdminButton.displayName = 'AdminButton';

// ---------------------------------------------------------------------------
// AdminBadge

const BADGE_TONES: Record<string, string> = {
  neutral: 'bg-slate-500/15 text-slate-300',
  success: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-red-500/15 text-red-400',
  info: 'bg-blue-500/15 text-blue-400',
};

export function AdminBadge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: keyof typeof BADGE_TONES;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${BADGE_TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// AdminInput / AdminTextarea / AdminSelect

const baseField = 'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors disabled:opacity-50';

export const AdminInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...rest }, ref) => {
    const t = useAdminTheme();
    return <input ref={ref} className={`${baseField} ${t.inputBg} ${className}`} {...rest} />;
  }
);
AdminInput.displayName = 'AdminInput';

export const AdminTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...rest }, ref) => {
    const t = useAdminTheme();
    return <textarea ref={ref} className={`${baseField} ${t.inputBg} ${className}`} {...rest} />;
  }
);
AdminTextarea.displayName = 'AdminTextarea';

export const AdminSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...rest }, ref) => {
    const t = useAdminTheme();
    return (
      <select ref={ref} className={`${baseField} ${t.inputBg} ${className}`} {...rest}>
        {children}
      </select>
    );
  }
);
AdminSelect.displayName = 'AdminSelect';

export function AdminLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const t = useAdminTheme();
  return <label className={`block text-xs font-medium mb-1.5 ${t.textSubtle} ${className}`}>{children}</label>;
}

// ---------------------------------------------------------------------------
// StatCard – KPI tiles

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = 'emerald',
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: 'emerald' | 'amber' | 'red' | 'blue' | 'slate';
}) {
  const t = useAdminTheme();
  const accentMap: Record<string, string> = {
    emerald: 'from-emerald-500/15 to-emerald-700/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/15 to-amber-700/5 text-amber-400 border-amber-500/20',
    red: 'from-red-500/15 to-red-700/5 text-red-400 border-red-500/20',
    blue: 'from-blue-500/15 to-blue-700/5 text-blue-400 border-blue-500/20',
    slate: 'from-slate-500/15 to-slate-700/5 text-slate-300 border-slate-500/20',
  };
  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${accentMap[accent]} ${t.surface}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className={`text-xs ${t.textMuted}`}>{label}</p>
          <p className={`text-2xl font-bold mt-1 ${t.text}`}>{value}</p>
          {hint && <p className={`text-xs mt-1 ${t.textMuted}`}>{hint}</p>}
        </div>
        {icon && <div className="opacity-90 shrink-0">{icon}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState / LoadingState

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const t = useAdminTheme();
  return (
    <div className={`rounded-xl border ${t.surface} p-10 text-center`}>
      {icon && <div className={`mx-auto mb-3 inline-flex items-center justify-center ${t.textMuted}`}>{icon}</div>}
      <h3 className={`text-base font-semibold ${t.text}`}>{title}</h3>
      {description && <p className={`text-sm mt-1 ${t.textMuted}`}>{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const t = useAdminTheme();
  return (
    <div className={`rounded-xl border ${t.surface} p-10 text-center`}>
      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
      <p className={`text-sm ${t.textMuted}`}>{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdminTable – consistent table skin. Children should be standard <thead>/<tbody>.

export function AdminTable({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const t = useAdminTheme();
  return (
    <div className={`rounded-xl border ${t.surface} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className={`admin-table w-full text-sm ${className}`} data-theme={t.isDark ? 'dark' : 'light'}>
          {children}
        </table>
      </div>
    </div>
  );
}

// Re-export theme helper for any page that needs it inline.
export { useAdminTheme };
