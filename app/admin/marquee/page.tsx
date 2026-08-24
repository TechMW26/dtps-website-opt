'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import MarqueeRibbon from '@/components/MarqueeRibbon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DEFAULT_MARQUEE_SETTINGS,
  MARQUEE_PAGE_OPTIONS,
  type MarqueeItem,
  type MarqueeSettings,
} from '@/lib/marquee';

function cloneDefaults(): MarqueeSettings {
  return JSON.parse(JSON.stringify(DEFAULT_MARQUEE_SETTINGS));
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
          checked ? 'border-emerald-700 bg-emerald-600' : 'border-slate-600 bg-slate-500'
        }`}
      >
        <span
          className="absolute left-1 top-1 h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-200 ease-out"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}

function NumberControl({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
        {label}
        <span className="font-normal text-slate-500">{value}{suffix}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-emerald-600"
      />
    </label>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-slate-200 bg-white p-1"
        />
        <Input value={value} onChange={(event) => onChange(event.target.value)} maxLength={7} />
      </div>
    </label>
  );
}

function toDateTimeInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function withClientIds(settings: MarqueeSettings): MarqueeSettings {
  return {
    ...settings,
    startAt: settings.startAt || null,
    endAt: settings.endAt || null,
    items: (settings.items || []).map((item, index) => ({
      ...item,
      clientId: item._id || item.clientId || `offer-${Date.now()}-${index}`,
    })),
  };
}

export default function MarqueeAdminPage() {
  const [settings, setSettings] = useState<MarqueeSettings>(cloneDefaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [customRoute, setCustomRoute] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/marquee', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load settings');
        return data.settings as MarqueeSettings;
      })
      .then((data) => {
        if (!cancelled) setSettings(withClientIds(data));
      })
      .catch((error) => {
        if (!cancelled) setMessage({ type: 'error', text: error.message });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof MarqueeSettings>(key: K, value: MarqueeSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  function updateItem(index: number, patch: Partial<MarqueeItem>) {
    setSettings((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
    setMessage(null);
  }

  function addItem() {
    const clientId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `offer-${Date.now()}`;
    update('items', [
      ...settings.items,
      { clientId, text: '', icon: '✨', link: '', openInNewTab: false, enabled: true },
    ]);
  }

  function removeItem(index: number) {
    update('items', settings.items.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= settings.items.length) return;
    const items = [...settings.items];
    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
    update('items', items);
  }

  function togglePage(page: string) {
    if (page === '*') {
      update('pages', ['*']);
      return;
    }

    const current = settings.pages.filter((route) => route !== '*');
    const pages = current.includes(page)
      ? current.filter((route) => route !== page)
      : [...current, page];
    update('pages', pages.length ? pages : ['*']);
  }

  function addCustomRoute() {
    const route = customRoute.trim();
    if (!route.startsWith('/') || route.startsWith('//')) {
      setMessage({ type: 'error', text: 'Display routes must start with a single /' });
      return;
    }
    const current = settings.pages.filter((page) => page !== '*');
    update('pages', Array.from(new Set([...current, route])));
    setCustomRoute('');
  }

  async function uploadIcon(index: number, file?: File) {
    if (!file) return;
    const itemKey = settings.items[index].clientId || settings.items[index]._id || String(index);
    setUploadingItem(itemKey);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('deviceType', 'marquee-icon');
      const response = await fetch('/api/banner-upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Icon upload failed');
      updateItem(index, { icon: data.optimizedUrl || data.url });
      setMessage({ type: 'success', text: 'Icon uploaded. Save settings to publish the change.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Icon upload failed' });
    } finally {
      setUploadingItem(null);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/marquee', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save settings');
      setSettings(withClientIds(data.settings));
      setMessage({ type: 'success', text: 'Top ribbon settings saved and published.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save settings' });
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    if (!window.confirm('Reset all fields to the recommended defaults? Nothing changes on the website until you save.')) return;
    setSettings(cloneDefaults());
    setMessage({ type: 'success', text: 'Defaults loaded. Click Save Settings to publish them.' });
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const presetValues = MARQUEE_PAGE_OPTIONS.map((option) => option.value);
  const customPages = settings.pages.filter((page) => !presetValues.includes(page as typeof presetValues[number]));

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Top Ribbon</h1>
            <p className="mt-1 text-sm text-slate-600">
              Create offer messages, redirects, scheduling, and an infinite scrolling announcement ribbon.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        </div>

        {message && (
          <div className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <Card className="overflow-hidden border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Live preview</CardTitle>
                <CardDescription className="mt-1">The preview remains visible while the public toggle is off.</CardDescription>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                settings.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {settings.isActive ? 'Live' : 'Off'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <MarqueeRibbon settings={{ ...settings, dismissible: false }} preview />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(330px,1fr)]">
          <div className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Offers and redirect routes</CardTitle>
                <CardDescription>Add up to 25 messages. Their order here is their order in the ribbon.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.items.map((item, index) => {
                  const itemKey = item.clientId || item._id || String(index);
                  return (
                    <div key={itemKey} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">Offer message</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" aria-label="Move offer up" disabled={index === 0} onClick={() => moveItem(index, -1)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button type="button" aria-label="Move offer down" disabled={index === settings.items.length - 1} onClick={() => moveItem(index, 1)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button type="button" aria-label="Delete offer" onClick={() => removeItem(index)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-medium text-slate-700">Offer text *</span>
                          <Input value={item.text} onChange={(event) => updateItem(index, { text: event.target.value })} maxLength={240} placeholder="Example: Get 20% off your first consultation" />
                          <span className="mt-1 block text-xs text-slate-500">Spaces are preserved exactly. No separator or extra gap is added automatically.</span>
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-medium text-slate-700">Icon / emoji / image URL</span>
                          <Input value={item.icon} onChange={(event) => updateItem(index, { icon: event.target.value })} maxLength={500} placeholder="✨" />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-medium text-slate-700">Redirect route or full URL</span>
                          <Input value={item.link} onChange={(event) => updateItem(index, { link: event.target.value })} maxLength={500} placeholder="/weight-loss-plan or https://example.com" />
                          <span className="mt-1 block text-xs text-slate-500">Internal routes, https links, email, and phone links are supported.</span>
                        </label>
                        <div>
                          <span className="mb-1.5 block text-sm font-medium text-slate-700">Upload icon</span>
                          <label className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 hover:bg-slate-100">
                            {uploadingItem === itemKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                            Choose image
                            <input type="file" accept="image/*" className="sr-only" disabled={uploadingItem === itemKey} onChange={(event) => uploadIcon(index, event.target.files?.[0])} />
                          </label>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-5">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" checked={item.enabled} onChange={(event) => updateItem(index, { enabled: event.target.checked })} className="h-4 w-4 accent-emerald-600" />
                          Show this offer
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" checked={item.openInNewTab} onChange={(event) => updateItem(index, { openInNewTab: event.target.checked })} className="h-4 w-4 accent-emerald-600" />
                          Open redirect in a new tab
                        </label>
                      </div>
                    </div>
                  );
                })}

                <button type="button" onClick={addItem} disabled={settings.items.length >= 25} className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50">
                  <Plus className="h-4 w-4" /> Add offer
                </button>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Design</CardTitle>
                <CardDescription>Control the ribbon size, colors, typography, and icons.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <ColorControl label="Background" value={settings.backgroundColor} onChange={(value) => update('backgroundColor', value)} />
                  <ColorControl label="Gradient end" value={settings.backgroundColorEnd} onChange={(value) => update('backgroundColorEnd', value)} />
                  <ColorControl label="Text" value={settings.textColor} onChange={(value) => update('textColor', value)} />
                </div>
                <Toggle checked={settings.useGradient} onChange={(value) => update('useGradient', value)} label="Use gradient background" />
                <div className="grid gap-5 sm:grid-cols-2">
                  <NumberControl label="Desktop height" value={settings.heightDesktop} min={28} max={96} suffix="px" onChange={(value) => update('heightDesktop', value)} />
                  <NumberControl label="Mobile height" value={settings.heightMobile} min={28} max={96} suffix="px" onChange={(value) => update('heightMobile', value)} />
                  <NumberControl label="Desktop text size" value={settings.fontSizeDesktop} min={10} max={30} suffix="px" onChange={(value) => update('fontSizeDesktop', value)} />
                  <NumberControl label="Mobile text size" value={settings.fontSizeMobile} min={10} max={30} suffix="px" onChange={(value) => update('fontSizeMobile', value)} />
                  <NumberControl label="Icon size" value={settings.iconSize} min={10} max={40} suffix="px" onChange={(value) => update('iconSize', value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">Font weight</span>
                    <select value={settings.fontWeight} onChange={(event) => update('fontWeight', Number(event.target.value))} className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
                      <option value={400}>Regular</option><option value={500}>Medium</option><option value={600}>Semi bold</option><option value={700}>Bold</option><option value={800}>Extra bold</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">Accessibility label</span>
                    <Input value={settings.ariaLabel} onChange={(event) => update('ariaLabel', event.target.value)} maxLength={100} />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Toggle checked={settings.uppercase} onChange={(value) => update('uppercase', value)} label="Uppercase text" />
                  <Toggle checked={settings.edgeFade} onChange={(value) => update('edgeFade', value)} label="Fade ribbon edges" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Publish and behavior</CardTitle>
                <CardDescription>The master switch and all animation behavior.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle checked={settings.isActive} onChange={(value) => update('isActive', value)} label="Show top ribbon" description="Master switch for the public website." />
                <Toggle checked={settings.showOnDesktop} onChange={(value) => update('showOnDesktop', value)} label="Show on desktop" />
                <Toggle checked={settings.showOnMobile} onChange={(value) => update('showOnMobile', value)} label="Show on mobile" />
                <Toggle checked={settings.sticky} onChange={(value) => update('sticky', value)} label="Sticky at top" description="Keeps the ribbon visible while scrolling." />
                <Toggle checked={settings.dismissible} onChange={(value) => update('dismissible', value)} label="Allow visitors to dismiss" description="Dismissal lasts for the current browser session." />
                <label className="block pt-2">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Animation</span>
                  <select value={settings.animationMode} onChange={(event) => update('animationMode', event.target.value as MarqueeSettings['animationMode'])} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
                    <option value="scroll">Infinite auto scroll</option>
                    <option value="static">Static centered messages</option>
                  </select>
                </label>
                {settings.animationMode === 'scroll' && (
                  <>
                    <label className="block pt-2">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">Scroll direction</span>
                      <select value={settings.direction} onChange={(event) => update('direction', event.target.value as MarqueeSettings['direction'])} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
                        <option value="left">Right to left</option>
                        <option value="right">Left to right</option>
                      </select>
                    </label>
                    <div className="pt-2">
                      <NumberControl label="Animation duration" value={settings.speed} min={5} max={180} suffix="s" onChange={(value) => update('speed', value)} />
                      <p className="mt-1 text-xs text-slate-500">Lower seconds move faster; higher seconds move slower.</p>
                    </div>
                    <Toggle checked={settings.pauseOnHover} onChange={(value) => update('pauseOnHover', value)} label="Pause on hover" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>Leave either field empty when no boundary is needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Start showing</span>
                  <Input type="datetime-local" value={toDateTimeInput(settings.startAt)} onChange={(event) => update('startAt', event.target.value ? new Date(event.target.value).toISOString() : null)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Stop showing</span>
                  <Input type="datetime-local" value={toDateTimeInput(settings.endAt)} onChange={(event) => update('endAt', event.target.value ? new Date(event.target.value).toISOString() : null)} />
                </label>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Pages to display on</CardTitle>
                <CardDescription>“All public pages” overrides individual page selections.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {MARQUEE_PAGE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    <input type="checkbox" checked={settings.pages.includes(option.value)} onChange={() => togglePage(option.value)} className="h-4 w-4 accent-emerald-600" />
                    <span>{option.label}</span>
                    <code className="ml-auto text-xs text-slate-400">{option.value}</code>
                  </label>
                ))}
                {customPages.map((page) => (
                  <div key={page} className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                    <code className="flex-1">{page}</code>
                    <button type="button" onClick={() => update('pages', settings.pages.filter((route) => route !== page))} aria-label={`Remove ${page}`} className="rounded p-1 hover:bg-emerald-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Input value={customRoute} onChange={(event) => setCustomRoute(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustomRoute(); } }} placeholder="/your-custom-page" />
                  <button type="button" onClick={addCustomRoute} className="inline-flex h-9 items-center gap-1 rounded-md bg-slate-800 px-3 text-sm font-medium text-white hover:bg-slate-900">
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={saveSettings} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-6 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
