'use client';

/**
 * Tiny client tracker that pings /api/track-visitor on:
 *   - first mount (pageview)
 *   - every route change (pageview + duration of previous page)
 *   - every 30s heartbeat while the tab is visible
 *   - tab close / hide (sendBeacon flush)
 *
 * The session id is stored in sessionStorage so a single browsing
 * session is one Visitor document. No PII beyond what the server
 * derives from headers (IP, UA) is captured.
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const HEARTBEAT_MS = 30_000;
const SESSION_KEY = 'dtps_sid';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid =
      (crypto as any)?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, sid as string);
  }
  return sid as string;
}

function send(payload: Record<string, unknown>, beacon = false) {
  try {
    const url = '/api/track-visitor';
    const body = JSON.stringify(payload);
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch { /* swallow */ }
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const enteredAtRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    // Don't track admin pages – internal sessions shouldn't pollute analytics.
    if (!pathname || pathname.startsWith('/admin')) return;

    const sid = getSessionId();
    const now = Date.now();
    const prevDuration = lastPathRef.current ? now - enteredAtRef.current : 0;

    send({
      sessionId: sid,
      event: 'pageview',
      path: pathname,
      title: typeof document !== 'undefined' ? document.title : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      language: typeof navigator !== 'undefined' ? navigator.language : undefined,
      durationMs: prevDuration,
    });

    enteredAtRef.current = now;
    lastPathRef.current = pathname;

    // Heartbeat while tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        send({
          sessionId: sid,
          event: 'heartbeat',
          path: pathname,
          durationMs: HEARTBEAT_MS,
        });
        enteredAtRef.current = Date.now();
      }
    }, HEARTBEAT_MS);

    // Flush remaining duration on hide / unload
    const flush = () => {
      const elapsed = Date.now() - enteredAtRef.current;
      if (elapsed <= 0) return;
      send(
        {
          sessionId: sid,
          event: 'heartbeat',
          path: pathname,
          durationMs: elapsed,
        },
        true
      );
      enteredAtRef.current = Date.now();
    };

    const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pathname]);

  return null;
}
