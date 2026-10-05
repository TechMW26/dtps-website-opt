'use client';

import { useEffect } from 'react';

export default function PageLoadError({ error, unstable_retry }: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('Page load failed:', error);
    // A tab left open across a release can still reference a removed bundle.
    // Retry a full load once per minute, never reload-loop on a persistent error.
    if (!/ChunkLoadError|Loading chunk .* failed|Failed to fetch dynamically imported module|Failed to load chunk/i.test(`${error.name}: ${error.message}`)) return;
    try {
      const key = `dtps-page-recovery:${location.pathname}`;
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last < 60_000) return;
      sessionStorage.setItem(key, String(Date.now()));
      location.reload();
    } catch { /* Manual recovery remains available if storage is disabled. */ }
  }, [error]);

  return <main style={{ padding: '48px 24px', maxWidth: 640, margin: 'auto', fontFamily: 'sans-serif', color: '#163b3b', background: '#fff' }}>
    <h1>This page couldn’t load</h1>
    <p>Your page is still available. Try again, or reload to fetch the latest version.</p>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <button onClick={unstable_retry} style={{ padding: '12px 20px', cursor: 'pointer' }}>Try again</button>
      <button onClick={() => location.reload()} style={{ padding: '12px 20px', cursor: 'pointer' }}>Reload page</button>
      <a href="/" style={{ padding: '12px 0' }}>Home</a>
    </div>
    {error.digest && <p>Reference: {error.digest}</p>}
  </main>;
}
