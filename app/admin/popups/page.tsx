'use client';
/* eslint-disable @next/next/no-img-element -- admin previews render dynamic upload URLs at their natural proportions */

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, ImagePlus, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_POPUP_SETTINGS, POPUP_PAGE_OPTIONS, withPopupDefaults, type PopupSettings } from '@/lib/popup-settings';

function freshPopup(): PopupSettings {
  return JSON.parse(JSON.stringify(DEFAULT_POPUP_SETTINGS));
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3">
      <div><p className="text-sm font-semibold text-slate-900">{label}</p>{description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}</div>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-600' : 'bg-slate-300'}`}>
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function RangeField({ label, value, min, max, step = 1, suffix, onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-sm font-medium text-slate-700"><span>{label}</span><span className="font-normal text-slate-500">{value}{suffix}</span></span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="h-2 w-full cursor-pointer accent-emerald-600" />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span><div className="flex gap-2"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 rounded-md border border-slate-200 bg-white p-1" /><Input value={value} onChange={(event) => onChange(event.target.value)} maxLength={7} /></div></label>;
}

function ImageUpload({ label, value, uploading, onUpload, onRemove }: { label: string; value: string; uploading: boolean; onUpload: (file?: File) => void; onRemove: () => void }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={value} alt={`${label} preview`} className="w-full object-contain" style={{ height: 176 }} />
          <button type="button" onClick={onRemove} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white shadow" aria-label={`Remove ${label}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      ) : (
        <label className="flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600 hover:bg-slate-100">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-emerald-600" /> : <ImagePlus className="h-6 w-6 text-slate-400" />}
          <span>{uploading ? 'Uploading…' : 'Choose image'}</span><span className="text-xs text-slate-400">JPG, PNG or WebP · max 10 MB</span>
          <input type="file" accept="image/*" disabled={uploading} className="sr-only" onChange={(event) => onUpload(event.target.files?.[0])} />
        </label>
      )}
    </div>
  );
}

function PopupPreview({ popup }: { popup: PopupSettings }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="relative bg-[#f4efe7]">
        {popup.image ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={popup.image} alt="Popup preview" className={`w-full ${popup.imageFit === 'cover' ? 'object-cover' : 'object-contain'}`} style={{ height: 288 }} /></> : <div className="grid h-72 place-items-center text-sm text-slate-400">Upload an image to preview</div>}
        {popup.showCloseButton && <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-slate-700 shadow">×</span>}
      </div>
      <div className="p-5" style={{ backgroundColor: popup.surfaceColor, color: popup.textColor }}>
        <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase" style={{ backgroundColor: `${popup.accentColor}20`, color: popup.accentColor }}>Exclusive offer</span>
        <h3 className="mt-3 text-xl font-extrabold leading-tight">{popup.title || 'Popup title'}</h3>
        <p className="mt-2 text-xs leading-5 opacity-65">{popup.subtitle}</p>
        {popup.showPhoneField && <div className="mt-4 flex h-11 items-center rounded-xl border border-slate-300 bg-white text-slate-700"><span className="px-3 text-xs font-bold">🇮🇳 +91</span><span className="h-6 w-px bg-slate-300" /><span className="px-3 text-xs text-slate-400">{popup.phonePlaceholder}</span></div>}
        <div className="mt-3 grid h-11 place-items-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: popup.accentColor }}>{popup.ctaText}</div>
      </div>
    </div>
  );
}

export default function PopupsPage() {
  const [popups, setPopups] = useState<PopupSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'desktop' | 'mobile' | null>(null);
  const [form, setForm] = useState<PopupSettings>(freshPopup);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPopups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/popups', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load popups');
      setPopups((data.popups || []).map((popup: Partial<PopupSettings>) => withPopupDefaults(popup)));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load popups' });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchPopups(); }, [fetchPopups]);

  function update<K extends keyof PopupSettings>(key: K, value: PopupSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  function openCreate() { setEditingId(null); setForm(freshPopup()); setEditorOpen(true); setMessage(null); }
  function openEdit(popup: PopupSettings) {
    setEditingId(popup._id || null);
    setForm({ ...withPopupDefaults(popup), startAt: popup.startAt ? new Date(popup.startAt).toISOString().slice(0, 16) : '', endAt: popup.endAt ? new Date(popup.endAt).toISOString().slice(0, 16) : '' });
    setEditorOpen(true); setMessage(null);
  }
  function closeEditor(force = false) { if (!force && (saving || uploading)) return; setEditorOpen(false); setEditingId(null); setForm(freshPopup()); }

  async function uploadImage(device: 'desktop' | 'mobile', file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) { setMessage({ type: 'error', text: 'Choose an image smaller than 10 MB.' }); return; }
    setUploading(device);
    try {
      const body = new FormData(); body.append('file', file); body.append('deviceType', `popup-${device}`);
      const response = await fetch('/api/banner-upload', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      update(device === 'desktop' ? 'image' : 'mobileImage', data.optimizedUrl || data.url);
    } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed' }); }
    finally { setUploading(null); }
  }

  async function savePopup(event: React.FormEvent) {
    event.preventDefault();
    if (!form.image || !form.pages.length) { setMessage({ type: 'error', text: 'Upload a desktop image and select at least one page.' }); return; }
    setSaving(true);
    try {
      const response = await fetch('/api/popups', { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingId ? { ...form, _id: editingId } : form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save popup');
      setMessage({ type: 'success', text: editingId ? 'Popup updated and published.' : 'Popup created and published.' });
      closeEditor(true);
      await fetchPopups();
    } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save popup' }); }
    finally { setSaving(false); }
  }

  async function deletePopup(id?: string) {
    if (!id || !window.confirm('Delete this popup permanently?')) return;
    const response = await fetch(`/api/popups?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) { setMessage({ type: 'error', text: data.error || 'Unable to delete popup' }); return; }
    setMessage({ type: 'success', text: 'Popup deleted.' });
    await fetchPopups();
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h1 className="text-2xl font-bold text-slate-950">Popups</h1><p className="mt-1 text-sm text-slate-600">Create targeted, scheduled and conversion-ready website offers.</p></div>
          <button type="button" onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"><Plus className="h-4 w-4" /> Create popup</button>
        </div>
        {message && <div className={`rounded-lg border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{message.text}</div>}

        {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div> : popups.length === 0 ? (
          <Card className="border-dashed"><CardContent className="grid min-h-64 place-items-center text-center"><div><ImagePlus className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-3 font-bold text-slate-900">No popups yet</h2><p className="mt-1 text-sm text-slate-500">Create your first targeted offer.</p></div></CardContent></Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {popups.map((popup) => (
              <Card key={popup._id} className="overflow-hidden border-slate-200">
                <div className="relative h-48 overflow-hidden bg-slate-100">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={popup.image} alt={popup.title} className="w-full object-contain" style={{ height: '100%' }} /><span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${popup.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'}`}>{popup.isActive ? 'Active' : 'Inactive'}</span></div>
                <CardContent className="p-5"><h2 className="line-clamp-1 font-bold text-slate-950">{popup.title}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{popup.subtitle}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600"><span className="rounded-lg bg-slate-100 px-2.5 py-2">Delay: {popup.displayDelayMs / 1000}s</span><span className="rounded-lg bg-slate-100 px-2.5 py-2">Priority: {popup.priority}</span><span className="rounded-lg bg-slate-100 px-2.5 py-2">{popup.showOnMobile ? 'Mobile' : 'No mobile'}</span><span className="rounded-lg bg-slate-100 px-2.5 py-2">{popup.showOnDesktop ? 'Desktop' : 'No desktop'}</span></div>
                  <p className="mt-3 truncate text-xs text-slate-500">Pages: {popup.pages.map((page) => POPUP_PAGE_OPTIONS.find((item) => item.value === page)?.label || page).join(', ')}</p>
                  {popup.redirectUrl && <p className="mt-1 flex items-center gap-1 truncate text-xs text-emerald-700"><ExternalLink className="h-3 w-3 shrink-0" />{popup.redirectUrl}</p>}
                  <div className="mt-5 flex gap-2"><button type="button" onClick={() => openEdit(popup)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white"><Pencil className="h-4 w-4" /> Edit</button><button type="button" onClick={() => void deletePopup(popup._id)} className="grid h-10 w-10 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Delete ${popup.title}`}><Trash2 className="h-4 w-4" /></button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm md:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEditor(); }}>
          <form onSubmit={savePopup} className="mx-auto grid min-h-full max-w-7xl items-start gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
            <div className="sticky top-6 hidden lg:block"><div className="mb-3 flex items-center justify-between text-white"><div><p className="font-bold">Live preview</p><p className="text-xs text-white/60">Conversion panel preview</p></div></div><PopupPreview popup={form} /></div>
            <div className="overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:px-7"><div><h2 className="text-xl font-bold text-slate-950">{editingId ? 'Edit popup' : 'Create popup'}</h2><p className="text-xs text-slate-500">All changes appear in the preview immediately.</p></div><button type="button" onClick={() => closeEditor()} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100" aria-label="Close editor"><X className="h-5 w-5" /></button></div>
              <div className="space-y-6 p-4 md:p-7">
                <Card><CardHeader><CardTitle>Content and artwork</CardTitle><CardDescription>Use separate artwork where the mobile crop needs different composition.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Headline" value={form.title} onChange={(value) => update('title', value)} /><Field label="Button text" value={form.ctaText} onChange={(value) => update('ctaText', value)} /></div><label><span className="mb-1.5 block text-sm font-medium text-slate-700">Supporting text</span><Textarea value={form.subtitle} onChange={(event) => update('subtitle', event.target.value)} maxLength={300} /></label><div className="grid gap-5 md:grid-cols-2"><ImageUpload label="Desktop artwork *" value={form.image} uploading={uploading === 'desktop'} onUpload={(file) => void uploadImage('desktop', file)} onRemove={() => update('image', '')} /><ImageUpload label="Mobile artwork (optional)" value={form.mobileImage} uploading={uploading === 'mobile'} onUpload={(file) => void uploadImage('mobile', file)} onRemove={() => update('mobileImage', '')} /></div></CardContent></Card>

                <Card><CardHeader><CardTitle>Targeting and schedule</CardTitle><CardDescription>Choose where, when and on which devices this popup can appear.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{POPUP_PAGE_OPTIONS.map((option) => <label key={option.value} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm"><input type="checkbox" checked={form.pages.includes(option.value)} onChange={(event) => { const pages = event.target.checked ? option.value === '*' ? ['*'] : [...form.pages.filter((item) => item !== '*'), option.value] : form.pages.filter((item) => item !== option.value); update('pages', pages); }} className="h-4 w-4 accent-emerald-600" />{option.label}</label>)}</div><div className="grid gap-3 sm:grid-cols-2"><Toggle checked={form.isActive} onChange={(value) => update('isActive', value)} label="Published" /><Toggle checked={form.showOnDesktop} onChange={(value) => update('showOnDesktop', value)} label="Show on desktop" /><Toggle checked={form.showOnMobile} onChange={(value) => update('showOnMobile', value)} label="Show on mobile" /></div><div className="grid gap-4 sm:grid-cols-2"><Field type="datetime-local" label="Start date (optional)" value={form.startAt} onChange={(value) => update('startAt', value)} /><Field type="datetime-local" label="End date (optional)" value={form.endAt} onChange={(value) => update('endAt', value)} /></div><RangeField label="Priority when multiple popups match" value={form.priority} min={0} max={100} suffix="" onChange={(value) => update('priority', value)} /></CardContent></Card>

                <Card><CardHeader><CardTitle>Display behavior</CardTitle><CardDescription>Fast defaults replace the previous hard-coded three-second delay.</CardDescription></CardHeader><CardContent className="space-y-5"><RangeField label="Appearance delay" value={form.displayDelayMs} min={0} max={10000} step={100} suffix="ms" onChange={(value) => update('displayDelayMs', value)} /><label><span className="mb-1.5 block text-sm font-medium text-slate-700">Display frequency</span><select value={form.displayFrequency} onChange={(event) => update('displayFrequency', event.target.value as PopupSettings['displayFrequency'])} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="every_load">Every page load</option><option value="session">Once per browser session</option><option value="daily">Once per day</option></select></label><Toggle checked={form.showConfetti} onChange={(value) => update('showConfetti', value)} label="Show confetti on appearance" description="Runs a full-screen celebration once when this popup opens." /><div className="grid gap-3 sm:grid-cols-2"><Toggle checked={form.dismissOnOverlay} onChange={(value) => update('dismissOnOverlay', value)} label="Close on backdrop click" /><Toggle checked={form.showCloseButton} onChange={(value) => update('showCloseButton', value)} label="Show close button" /></div></CardContent></Card>

                <Card><CardHeader><CardTitle>Conversion and redirect</CardTitle><CardDescription>Collect a phone lead, redirect visitors, or use the popup as a direct CTA.</CardDescription></CardHeader><CardContent className="space-y-5"><Toggle checked={form.showPhoneField} onChange={(value) => update('showPhoneField', value)} label="Collect mobile number" description="When off, the button redirects directly." /><div className="grid gap-4 sm:grid-cols-2"><Field label="Phone placeholder" value={form.phonePlaceholder} onChange={(value) => update('phonePlaceholder', value)} /><Field label="Redirect route or URL" value={form.redirectUrl} onChange={(value) => update('redirectUrl', value)} placeholder="/299plan or https://…" /></div><Toggle checked={form.openInNewTab} onChange={(value) => update('openInNewTab', value)} label="Open redirect in a new tab" /><label><span className="mb-1.5 block text-sm font-medium text-slate-700">Success message</span><Textarea value={form.successMessage} onChange={(event) => update('successMessage', event.target.value)} maxLength={240} /></label><RangeField label="Delay before redirect/close" value={form.successDelayMs} min={0} max={5000} step={100} suffix="ms" onChange={(value) => update('successDelayMs', value)} /></CardContent></Card>

                <Card><CardHeader><CardTitle>Visual design</CardTitle><CardDescription>Control modal proportions and brand styling.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-sm font-medium text-slate-700">Artwork fitting</span><select value={form.imageFit} onChange={(event) => update('imageFit', event.target.value as PopupSettings['imageFit'])} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="contain">Show complete image</option><option value="cover">Fill and crop</option></select></label><RangeField label="Desktop maximum width" value={form.desktopMaxWidth} min={560} max={1100} step={10} suffix="px" onChange={(value) => update('desktopMaxWidth', value)} /></div><div className="grid gap-4 sm:grid-cols-3"><ColorField label="Accent" value={form.accentColor} onChange={(value) => update('accentColor', value)} /><ColorField label="Panel background" value={form.surfaceColor} onChange={(value) => update('surfaceColor', value)} /><ColorField label="Text" value={form.textColor} onChange={(value) => update('textColor', value)} /></div><RangeField label="Backdrop opacity" value={form.overlayOpacity} min={20} max={95} suffix="%" onChange={(value) => update('overlayOpacity', value)} /></CardContent></Card>
              </div>
              <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:px-7"><button type="button" onClick={() => closeEditor()} className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" disabled={saving || Boolean(uploading)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{editingId ? 'Save changes' : 'Publish popup'}</button></div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
