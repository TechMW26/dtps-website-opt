'use client';

/**
 * World heat map for the admin Traffic page.
 *
 * Renders a low-poly world map (TopoJSON, ~100KB) with bubble markers
 * sized & coloured by visitor count. Supports zoom + pan; on zoom-in
 * the bubble layer switches from country aggregates to per-city
 * coordinates so operators can drill down geographically.
 */

import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { useAdminTheme } from './ui';

export interface MapLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  count: number;
}

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export default function TrafficWorldMap({
  locations,
  height = 480,
}: {
  locations: MapLocation[];
  height?: number;
}) {
  const t = useAdminTheme();
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([20, 20]);
  const [hover, setHover] = useState<MapLocation | null>(null);

  // Aggregate to country centroids when zoomed out.
  const points = useMemo(() => {
    if (zoom >= 2.5) return locations; // city-level when zoomed in
    const map = new Map<string, MapLocation>();
    for (const l of locations) {
      const key = l.country || `${l.lat.toFixed(0)}_${l.lng.toFixed(0)}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += l.count;
      } else {
        map.set(key, { ...l });
      }
    }
    return Array.from(map.values());
  }, [locations, zoom]);

  const maxCount = Math.max(1, ...points.map((p) => p.count));
  const radiusFor = (count: number) => 4 + (count / maxCount) * 16;
  const colorFor = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.66) return '#ef4444';
    if (ratio > 0.33) return '#f59e0b';
    return '#10b981';
  };

  const fillCountry = t.isDark ? '#1e293b' : '#e2e8f0';
  const strokeCountry = t.isDark ? '#0f172a' : '#cbd5e1';

  return (
    <div className={`rounded-xl border ${t.surface} relative overflow-hidden`}>
      <div className={`flex items-center justify-between p-4 border-b ${t.border}`}>
        <div>
          <h3 className={`text-base font-semibold ${t.text}`}>Visitors world map</h3>
          <p className={`text-xs ${t.textMuted}`}>
            Zoom in to switch from country aggregates to city-level coordinates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(1, z / 1.5))}
            className={`px-2 py-1 text-xs rounded border ${t.border} ${t.text} hover:bg-emerald-600 hover:text-white hover:border-emerald-600`}
          >
            −
          </button>
          <span className={`text-xs ${t.textMuted} w-12 text-center`}>×{zoom.toFixed(1)}</span>
          <button
            onClick={() => setZoom((z) => Math.min(8, z * 1.5))}
            className={`px-2 py-1 text-xs rounded border ${t.border} ${t.text} hover:bg-emerald-600 hover:text-white hover:border-emerald-600`}
          >
            +
          </button>
          <button
            onClick={() => { setZoom(1); setCenter([20, 20]); }}
            className={`px-2 py-1 text-xs rounded border ${t.border} ${t.text} hover:bg-emerald-600 hover:text-white hover:border-emerald-600`}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ height }} className="relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130 }}
          width={980}
          height={height}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            onMoveEnd={({ coordinates, zoom: z }) => {
              setCenter(coordinates as [number, number]);
              setZoom(z);
            }}
            maxZoom={8}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill: fillCountry, stroke: strokeCountry, strokeWidth: 0.5, outline: 'none' },
                      hover:   { fill: t.isDark ? '#334155' : '#cbd5e1', outline: 'none' },
                      pressed: { fill: t.isDark ? '#475569' : '#94a3b8', outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
            {points.map((p, i) => (
              <Marker key={i} coordinates={[p.lng, p.lat]}>
                <circle
                  r={radiusFor(p.count) / Math.max(1, zoom * 0.5)}
                  fill={colorFor(p.count)}
                  fillOpacity={0.55}
                  stroke={colorFor(p.count)}
                  strokeWidth={1}
                  onMouseEnter={() => setHover(p)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {hover && (
          <div className={`absolute top-3 left-3 rounded-lg border px-3 py-2 text-xs shadow-lg ${t.surface} ${t.text}`}>
            <p className="font-semibold">{hover.city || hover.country || 'Unknown'}</p>
            <p className={t.textMuted}>{hover.country || ''}</p>
            <p className="mt-1">
              <span className="font-bold">{hover.count}</span>{' '}
              <span className={t.textMuted}>session{hover.count === 1 ? '' : 's'}</span>
            </p>
            <p className={`${t.textMuted} mt-0.5`}>
              {hover.lat.toFixed(2)}, {hover.lng.toFixed(2)}
            </p>
          </div>
        )}

        <div className={`absolute bottom-3 right-3 rounded-lg border px-3 py-2 text-[10px] ${t.surface} ${t.textMuted} flex items-center gap-3`}>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"/>Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"/>Med</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/>High</span>
        </div>
      </div>
    </div>
  );
}
