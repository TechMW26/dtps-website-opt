'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, ImagePlus, Loader2, RotateCcw, Save, Trash2 } from 'lucide-react';
import Plan299Hero from '@/components/Plan299Hero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_PLAN_299_SETTINGS, type Plan299PageSettings } from '@/lib/plan299-page';

function cloneDefaults(): Plan299PageSettings {
  return JSON.parse(JSON.stringify(DEFAULT_PLAN_299_SETTINGS));
}

function Toggle({ checked, onChange, label, description }: {
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
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${checked ? 'border-emerald-700 bg-emerald-600' : 'border-slate-600 bg-slate-500'}`}
      >
        <span className="absolute left-1 top-1 h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-200 ease-out" style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, maxLength = 120 }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={maxLength} />
    </label>
  );
}

function ColorField({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-12 cursor-pointer rounded-md border border-slate-200 bg-white p-1" />
        <Input value={value} onChange={(event) => onChange(event.target.value)} maxLength={7} />
      </div>
    </label>
  );
}

function RangeField({ label, value, min, max, suffix, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-sm font-medium text-slate-700">
        {label}<span className="font-normal text-slate-500">{value}{suffix}</span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-2 w-full cursor-pointer accent-emerald-600" />
    </label>
  );
}

function BackgroundUpload({ label, value, uploading, onUpload, onRemove }: {
  label: string;
  value: string;
  uploading: boolean;
  onUpload: (file?: File) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={`${label} preview`} className="h-40 w-full object-cover" />
          <button type="button" onClick={onRemove} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white shadow" aria-label={`Remove ${label}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600 hover:bg-slate-100">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-emerald-600" /> : <ImagePlus className="h-6 w-6 text-slate-400" />}
          <span>{uploading ? 'Uploading and optimizing…' : 'Choose background image'}</span>
          <span className="text-xs text-slate-400">JPG, PNG or WebP · maximum 10 MB</span>
          <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(event) => onUpload(event.target.files?.[0])} />
        </label>
      )}
    </div>
  );
}

function PreviewCard({ settings }: { settings: Plan299PageSettings }) {
  const features = ['Personalised diet plan', 'Dietitian consultations', 'Progress tracking'];
  return (
    <div className="overflow-hidden rounded-xl shadow-xl" style={{ backgroundColor: settings.cardBackgroundColor }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: settings.cardMutedColor }}>10 Days Trial</p>
            <p className="mt-1 font-bold uppercase" style={{ color: settings.cardHeadingColor }}>Plan</p>
          </div>
          {settings.showCardBadge && <span className="rounded-full border px-3 py-1 text-[9px] font-bold" style={{ borderColor: settings.cardButtonBackgroundColor, color: settings.cardHeadingColor }}>TRIAL</span>}
        </div>
        <div className="mt-5 flex items-end gap-2">
          <span className="text-4xl font-extrabold text-[#014e4e]">₹199</span>
          <span className="mb-1 text-sm text-slate-500 line-through">₹299</span>
        </div>
        {settings.showCardFeatures && (
          <>
            <div className="my-4 h-px bg-slate-200" />
            <p className="font-bold" style={{ color: settings.cardHeadingColor }}>{settings.cardSectionTitle}</p>
            <div className="mt-3 space-y-2">
              {features.slice(0, settings.cardFeatureCount).map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-xs" style={{ color: settings.cardMutedColor }}>
                  <span className="grid h-4 w-4 place-items-center rounded-full text-[10px] text-white" style={{ backgroundColor: settings.cardButtonBackgroundColor }}>✓</span>{feature}
                </div>
              ))}
            </div>
          </>
        )}
        {settings.showCardBuyButton && <button type="button" className="mt-5 w-full rounded-full py-3 text-xs font-bold uppercase text-white" style={{ backgroundColor: settings.cardButtonBackgroundColor }}>{settings.cardButtonText}</button>}
      </div>
    </div>
  );
}

export default function Plan299AdminPage() {
  const [settings, setSettings] = useState<Plan299PageSettings>(cloneDefaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'desktop' | 'mobile' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/plan-299-page', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load settings');
        return data.settings as Plan299PageSettings;
      })
      .then((data) => { if (!cancelled) setSettings(data); })
      .catch((error) => { if (!cancelled) setMessage({ type: 'error', text: error.message }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function update<K extends keyof Plan299PageSettings>(key: K, value: Plan299PageSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  async function uploadBackground(device: 'desktop' | 'mobile', file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'The background image must be smaller than 10 MB.' });
      return;
    }

    setUploading(device);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('deviceType', `plan-299-hero-${device}`);
      const response = await fetch('/api/banner-upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      update(device === 'desktop' ? 'desktopBackgroundImage' : 'mobileBackgroundImage', data.optimizedUrl || data.url);
      setMessage({ type: 'success', text: `${device === 'desktop' ? 'Desktop' : 'Mobile'} background uploaded. Save settings to publish it.` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      setUploading(null);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/plan-299-page', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save settings');
      setSettings(data.settings);
      setMessage({ type: 'success', text: '₹299 plan hero settings saved and published.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save settings' });
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    if (!window.confirm('Load the original ₹299 hero design? Nothing changes publicly until you save.')) return;
    setSettings(cloneDefaults());
    setMessage({ type: 'success', text: 'Original design loaded. Click Save Settings to publish it.' });
  }

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">₹299 Plan Page</h1>
            <p className="mt-1 text-sm text-slate-600">Complete hero and pricing-card customization for <code>/299plan</code>.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/299plan" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><ExternalLink className="h-4 w-4" /> View Page</a>
            <button type="button" onClick={resetForm} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Reset</button>
            <button type="button" onClick={saveSettings} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings</button>
          </div>
        </div>

        {message && <div className={`rounded-lg border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{message.text}</div>}

        <Card className="overflow-hidden border-slate-200">
          <CardHeader className="pb-3"><CardTitle>Live desktop preview</CardTitle><CardDescription>The public page uses the same component and settings.</CardDescription></CardHeader>
          <CardContent className="p-0">
            <div className="relative overflow-hidden bg-[#014e4e]">
              <Plan299Hero settings={{ ...settings, heroMinHeightDesktop: Math.min(settings.heroMinHeightDesktop, 520), heroMinHeightMobile: Math.min(settings.heroMinHeightMobile, 520) }} cardContent={<PreviewCard settings={settings} />} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader><CardTitle>Visibility</CardTitle><CardDescription>Show or hide every major hero element independently.</CardDescription></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Toggle checked={settings.showTextContent} onChange={(value) => update('showTextContent', value)} label="Show hero text" />
              <Toggle checked={settings.showPricingCard} onChange={(value) => update('showPricingCard', value)} label="Show pricing card" description="Hides only the card inside the hero." />
              <Toggle checked={settings.showResultBadge} onChange={(value) => update('showResultBadge', value)} label="Show result badge" />
              <Toggle checked={settings.showEyebrow} onChange={(value) => update('showEyebrow', value)} label="Show eyebrow label" />
              <Toggle checked={settings.showHeroButton} onChange={(value) => update('showHeroButton', value)} label="Show hero CTA button" />
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader><CardTitle>Layout</CardTitle><CardDescription>Responsive size, alignment, spacing, and card placement.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Text alignment</span><select value={settings.textAlignment} onChange={(event) => update('textAlignment', event.target.value as Plan299PageSettings['textAlignment'])} className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
                <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Card position</span><select value={settings.cardPosition} onChange={(event) => update('cardPosition', event.target.value as Plan299PageSettings['cardPosition'])} className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="right">Right</option><option value="left">Left</option></select></label>
              </div>
              <RangeField label="Desktop minimum height" value={settings.heroMinHeightDesktop} min={300} max={1000} suffix="px" onChange={(value) => update('heroMinHeightDesktop', value)} />
              <RangeField label="Mobile minimum height" value={settings.heroMinHeightMobile} min={300} max={1400} suffix="px" onChange={(value) => update('heroMinHeightMobile', value)} />
              <RangeField label="Desktop vertical padding" value={settings.heroPaddingDesktop} min={0} max={160} suffix="px" onChange={(value) => update('heroPaddingDesktop', value)} />
              <RangeField label="Mobile vertical padding" value={settings.heroPaddingMobile} min={0} max={120} suffix="px" onChange={(value) => update('heroPaddingMobile', value)} />
              <RangeField label="Maximum card width" value={settings.cardMaxWidth} min={280} max={600} suffix="px" onChange={(value) => update('cardMaxWidth', value)} />
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Card position fine-tuning</p>
                    <p className="mt-1 text-xs text-slate-500">The card keeps its original column when hero text is hidden. Use these sliders only when you want to nudge it.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings((current) => ({ ...current, cardOffsetXDesktop: 0, cardOffsetYDesktop: 0, cardOffsetXMobile: 0, cardOffsetYMobile: 0 }))}
                    className="flex-shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Center offsets
                  </button>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <RangeField label="Desktop horizontal" value={settings.cardOffsetXDesktop} min={-400} max={400} suffix="px" onChange={(value) => update('cardOffsetXDesktop', value)} />
                  <RangeField label="Desktop vertical" value={settings.cardOffsetYDesktop} min={-300} max={300} suffix="px" onChange={(value) => update('cardOffsetYDesktop', value)} />
                  <RangeField label="Mobile horizontal" value={settings.cardOffsetXMobile} min={-120} max={120} suffix="px" onChange={(value) => update('cardOffsetXMobile', value)} />
                  <RangeField label="Mobile vertical" value={settings.cardOffsetYMobile} min={-300} max={300} suffix="px" onChange={(value) => update('cardOffsetYMobile', value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200">
          <CardHeader><CardTitle>Hero content</CardTitle><CardDescription>Each line and highlighted phrase can be edited separately.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Eyebrow label" value={settings.eyebrowText} onChange={(value) => update('eyebrowText', value)} />
              <Field label="Line 1 prefix" value={settings.headingLine1Prefix} onChange={(value) => update('headingLine1Prefix', value)} />
              <Field label="Line 1 highlighted text" value={settings.headingLine1Highlight} onChange={(value) => update('headingLine1Highlight', value)} />
              <Field label="Line 2 prefix" value={settings.headingLine2Prefix} onChange={(value) => update('headingLine2Prefix', value)} />
              <Field label="Line 2 highlighted text" value={settings.headingLine2Highlight} onChange={(value) => update('headingLine2Highlight', value)} />
              <Field label="Line 2 suffix" value={settings.headingLine2Suffix} onChange={(value) => update('headingLine2Suffix', value)} />
            </div>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Description</span><Textarea value={settings.description} onChange={(event) => update('description', event.target.value)} maxLength={500} placeholder="Optional supporting copy" /></label>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ColorField label="Heading" value={settings.headingColor} onChange={(value) => update('headingColor', value)} />
              <ColorField label="Highlights" value={settings.highlightColor} onChange={(value) => update('highlightColor', value)} />
              <ColorField label="Eyebrow" value={settings.eyebrowColor} onChange={(value) => update('eyebrowColor', value)} />
              <ColorField label="Description" value={settings.descriptionColor} onChange={(value) => update('descriptionColor', value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader><CardTitle>Hero background</CardTitle><CardDescription>Upload separate desktop and mobile images, or retain a solid brand color.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <Toggle checked={settings.useCustomBackground} onChange={(value) => update('useCustomBackground', value)} label="Use custom background images" description="When off, the solid background color is used." />
            <div className="grid gap-5 md:grid-cols-2">
              <BackgroundUpload label="Desktop background" value={settings.desktopBackgroundImage} uploading={uploading === 'desktop'} onUpload={(file) => uploadBackground('desktop', file)} onRemove={() => update('desktopBackgroundImage', '')} />
              <BackgroundUpload label="Mobile background" value={settings.mobileBackgroundImage} uploading={uploading === 'mobile'} onUpload={(file) => uploadBackground('mobile', file)} onRemove={() => update('mobileBackgroundImage', '')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ColorField label="Fallback background" value={settings.backgroundColor} onChange={(value) => update('backgroundColor', value)} />
              <ColorField label="Overlay color" value={settings.overlayColor} onChange={(value) => update('overlayColor', value)} />
              <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Desktop image position</span><select value={settings.backgroundPositionDesktop} onChange={(event) => update('backgroundPositionDesktop', event.target.value as Plan299PageSettings['backgroundPositionDesktop'])} className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">{['center','top','bottom','left','right'].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Mobile image position</span><select value={settings.backgroundPositionMobile} onChange={(event) => update('backgroundPositionMobile', event.target.value as Plan299PageSettings['backgroundPositionMobile'])} className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">{['center','top','bottom','left','right'].map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <RangeField label="Overlay opacity" value={settings.overlayOpacity} min={0} max={100} suffix="%" onChange={(value) => update('overlayOpacity', value)} />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader><CardTitle>Result badge</CardTitle><CardDescription>Customize the “Up to 5 kgs” pill.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3"><Field label="Prefix" value={settings.resultPrefix} onChange={(value) => update('resultPrefix', value)} /><Field label="Value" value={settings.resultValue} onChange={(value) => update('resultValue', value)} /><Field label="Suffix" value={settings.resultSuffix} onChange={(value) => update('resultSuffix', value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><ColorField label="Text" value={settings.resultTextColor} onChange={(value) => update('resultTextColor', value)} /><ColorField label="Value" value={settings.resultValueColor} onChange={(value) => update('resultValueColor', value)} /><ColorField label="Border" value={settings.resultBorderColor} onChange={(value) => update('resultBorderColor', value)} /><ColorField label="Background" value={settings.resultBackgroundColor} onChange={(value) => update('resultBackgroundColor', value)} /></div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader><CardTitle>Hero CTA</CardTitle><CardDescription>Optional button below the hero message.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <Field label="Button text" value={settings.heroButtonText} onChange={(value) => update('heroButtonText', value)} />
              <Field label="Button link" value={settings.heroButtonLink} onChange={(value) => update('heroButtonLink', value)} maxLength={500} placeholder="#plan-offer or /checkout" />
              <div className="grid gap-4 sm:grid-cols-2"><ColorField label="Button background" value={settings.heroButtonBackgroundColor} onChange={(value) => update('heroButtonBackgroundColor', value)} /><ColorField label="Button text" value={settings.heroButtonTextColor} onChange={(value) => update('heroButtonTextColor', value)} /></div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200">
          <CardHeader><CardTitle>Hero pricing card</CardTitle><CardDescription>Pricing and benefits still come from Pricing Plans; these controls customize their hero presentation.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Toggle checked={settings.showCardBadge} onChange={(value) => update('showCardBadge', value)} label="Show plan badge" />
              <Toggle checked={settings.showCardFeatures} onChange={(value) => update('showCardFeatures', value)} label="Show benefits" />
              <Toggle checked={settings.showCardDuration} onChange={(value) => update('showCardDuration', value)} label="Show duration" />
              <Toggle checked={settings.showCardBuyButton} onChange={(value) => update('showCardBuyButton', value)} label="Show buy button" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Field label="Benefits heading" value={settings.cardSectionTitle} onChange={(value) => update('cardSectionTitle', value)} /><Field label="Button text" value={settings.cardButtonText} onChange={(value) => update('cardButtonText', value)} /><Field label="Button destination" value={settings.cardButtonLink} onChange={(value) => update('cardButtonLink', value)} maxLength={500} /><RangeField label="Initially visible benefits" value={settings.cardFeatureCount} min={1} max={20} suffix="" onChange={(value) => update('cardFeatureCount', value)} /></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><ColorField label="Card background" value={settings.cardBackgroundColor} onChange={(value) => update('cardBackgroundColor', value)} /><ColorField label="Button/checkmarks" value={settings.cardButtonBackgroundColor} onChange={(value) => update('cardButtonBackgroundColor', value)} /><ColorField label="Headings" value={settings.cardHeadingColor} onChange={(value) => update('cardHeadingColor', value)} /><ColorField label="Supporting text" value={settings.cardMutedColor} onChange={(value) => update('cardMutedColor', value)} /></div>
          </CardContent>
        </Card>

        <div className="flex justify-end"><button type="button" onClick={saveSettings} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-6 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings</button></div>
      </div>
    </div>
  );
}
