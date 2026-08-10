'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { MarqueeSettings } from '@/lib/marquee';
import { marqueeMatchesPath } from '@/lib/marquee';
import MarqueeRibbon from './MarqueeRibbon';

export default function DynamicMarquee() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<MarqueeSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    fetch('/api/marquee', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load ribbon');
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setSettings(data.settings);
      })
      .catch((error) => console.error('Top ribbon fetch error:', error));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!settings?.startAt && !settings?.endAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [settings?.startAt, settings?.endAt]);

  useEffect(() => {
    if (!settings) return;
    const version = settings.updatedAt || 'default';
    setDismissed(window.sessionStorage.getItem(`top-ribbon-dismissed:${version}`) === 'true');
  }, [settings]);

  const isScheduledNow = useMemo(() => {
    if (!settings) return false;
    const start = settings.startAt ? new Date(settings.startAt).getTime() : null;
    const end = settings.endAt ? new Date(settings.endAt).getTime() : null;
    return (!start || now >= start) && (!end || now < end);
  }, [settings, now]);

  if (
    !settings ||
    !settings.isActive ||
    dismissed ||
    !isScheduledNow ||
    !marqueeMatchesPath(pathname || '/', settings.pages) ||
    (!settings.showOnDesktop && !settings.showOnMobile)
  ) {
    return null;
  }

  const visibilityClass = settings.showOnDesktop && settings.showOnMobile
    ? ''
    : settings.showOnDesktop
      ? 'hidden md:block'
      : 'block md:hidden';

  const handleDismiss = () => {
    const version = settings.updatedAt || 'default';
    window.sessionStorage.setItem(`top-ribbon-dismissed:${version}`, 'true');
    setDismissed(true);
  };

  return <MarqueeRibbon settings={settings} onDismiss={handleDismiss} className={visibilityClass} />;
}
