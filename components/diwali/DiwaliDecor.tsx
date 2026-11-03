'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { DIWALI_BURST_EVENT, fireDiwaliCrackers, isDiwaliSeason } from '@/lib/festive';
import styles from './Diwali.module.css';

type Vars = CSSProperties & Record<`--${string}`, string | number | null | undefined>;

/** true only on the client, during the Diwali window (avoids hydration mismatch). */
export function useDiwaliSeason() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    setActive(isDiwaliSeason());
  }, []);
  return active;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ================= Building blocks ================= */

export function Diya({ size, style }: { size?: number; style?: CSSProperties }) {
  const vars: Vars = { ...style };
  if (size) vars['--diya-size'] = `${size}px`;
  return (
    <span className={styles.diya} style={vars} aria-hidden="true">
      <span className={styles.flame} />
      <svg className={styles.diyaBowl} viewBox="0 0 60 30" preserveAspectRatio="none">
        <ellipse cx="30" cy="26" rx="9" ry="3" fill="#9a3d0d" />
        <path d="M2 6 Q30 42 58 6 Q30 14 2 6 Z" fill="#c2571a" />
        <ellipse cx="30" cy="6" rx="28" ry="5" fill="#e07a2e" />
        <ellipse cx="30" cy="6" rx="20" ry="2.6" fill="#7a2e0c" />
        <circle cx="17" cy="15" r="1.8" fill="#f9d67b" />
        <circle cx="30" cy="18.5" r="1.8" fill="#f9d67b" />
        <circle cx="43" cy="15" r="1.8" fill="#f9d67b" />
      </svg>
    </span>
  );
}

export function Candle({ width = 16, height = 44, band = '#ff9100' }: { width?: number; height?: number; band?: string }) {
  const vars: Vars = { '--candle-w': `${width}px`, '--candle-h': `${height}px`, '--candle-band': band };
  return (
    <span className={styles.candle} style={vars} aria-hidden="true">
      <span className={styles.flame} />
      <span className={styles.candleWick} />
      <span className={styles.candleBody} />
    </span>
  );
}

const RAYS = Array.from({ length: 18 }, (_, i) => ({
  angle: (360 / 18) * i + (i % 3) * 7,
  len: 14 + ((i * 7) % 13),
  delay: ((i * 37) % 60) / 100,
}));

export function Fuljhadi({ tilt = -14, className = '' }: { tilt?: number; className?: string }) {
  const vars: Vars = { '--tilt': `${tilt}deg` };
  return (
    <span className={`${styles.fuljhadi} ${className}`} style={vars} aria-hidden="true">
      <span className={styles.fuljhadiStick} />
      <span className={styles.fuljhadiHead}>
        {RAYS.map((ray, i) => (
          <span
            key={i}
            className={styles.fuljhadiRay}
            style={{ '--angle': `${ray.angle}deg`, '--len': `${ray.len}px`, '--ray-delay': `${ray.delay}s` } as Vars}
          />
        ))}
      </span>
    </span>
  );
}

const ANAR_COLORS = ['#fff3c4', '#ffd166', '#ff9100', '#ffffff'];
const ANAR_DROPS = Array.from({ length: 22 }, (_, i) => ({
  dx: ((i % 11) - 5) * 5,
  dy: -(50 + ((i * 13) % 26)),
  delay: (i * 0.07) % 1.1,
  color: ANAR_COLORS[i % ANAR_COLORS.length],
}));

export function Anar({ className = '' }: { className?: string }) {
  return (
    <span className={`${styles.anar} ${className}`} aria-hidden="true">
      <span className={styles.anarFount}>
        {ANAR_DROPS.map((d, i) => (
          <span
            key={i}
            className={styles.anarDrop}
            style={{ '--dx': `${d.dx}px`, '--dy': `${d.dy}px`, '--drop-delay': `${d.delay}s`, '--spark-color': d.color } as Vars}
          />
        ))}
      </span>
      <span className={styles.anarPot} />
    </span>
  );
}

/* ================= Symbols: swastik, lotus, bell, kandil ================= */

export function Swastik({ color = '#c4161c' }: { color?: string }) {
  return (
    <svg className={styles.swastik} viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 14 V86 M14 50 H86 M50 14 H84 M86 50 V84 M50 86 H16 M14 50 V16"
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="square"
      />
      <circle cx="31" cy="31" r="6" fill={color} />
      <circle cx="69" cy="31" r="6" fill={color} />
      <circle cx="31" cy="69" r="6" fill={color} />
      <circle cx="69" cy="69" r="6" fill={color} />
    </svg>
  );
}

export function Lotus({ width }: { width?: number }) {
  const vars: Vars = {};
  if (width) vars['--lotus-w'] = `${width}px`;
  return (
    <svg className={styles.lotus} style={vars} viewBox="0 0 120 72" aria-hidden="true">
      <ellipse cx="60" cy="66" rx="42" ry="5" fill="#2f8f6b" opacity="0.85" />
      <path d="M60 62 C38 62 18 50 8 32 C28 30 48 42 60 62 Z" fill="#f9a8d4" stroke="#db2777" strokeWidth="1" />
      <path d="M60 62 C82 62 102 50 112 32 C92 30 72 42 60 62 Z" fill="#f9a8d4" stroke="#db2777" strokeWidth="1" />
      <path d="M60 62 C44 54 32 36 34 14 C50 22 58 40 60 62 Z" fill="#f472b6" stroke="#be185d" strokeWidth="1" />
      <path d="M60 62 C76 54 88 36 86 14 C70 22 62 40 60 62 Z" fill="#f472b6" stroke="#be185d" strokeWidth="1" />
      <path d="M60 4 C73 22 73 44 60 62 C47 44 47 22 60 4 Z" fill="#ec4899" stroke="#9d174d" strokeWidth="1" />
      <path d="M60 14 V56" stroke="#fbcfe8" strokeWidth="1.2" opacity="0.8" />
    </svg>
  );
}

function Bell({ width }: { width?: number }) {
  const vars: Vars = {};
  if (width) vars['--bell-w'] = `${width}px`;
  return (
    <svg className={styles.bell} style={vars} viewBox="0 0 20 24" aria-hidden="true">
      <path d="M10 2 C5 2 4 8 4 12 L2 17 H18 L16 12 C16 8 15 2 10 2 Z" fill="#e0a92e" stroke="#a8770f" strokeWidth="1" />
      <circle cx="10" cy="20" r="2.6" fill="#a8770f" />
    </svg>
  );
}

const KANDIL_COLORS: Record<string, [string, string]> = {
  red: ['#c8102e', '#9b0d24'],
  pink: ['#db2777', '#9d174d'],
  orange: ['#ea580c', '#b84308'],
  teal: ['#0f766e', '#0b524d'],
};

export function Kandil({ width, color = 'red', delay = 0 }: { width?: number; color?: keyof typeof KANDIL_COLORS; delay?: number }) {
  const [main, dark] = KANDIL_COLORS[color];
  const vars: Vars = { '--swing-delay': `${delay}s` };
  if (width) vars['--kandil-w'] = `${width}px`;
  return (
    <span className={`${styles.kandil} ${styles.kandilLit}`} style={vars} aria-hidden="true">
      <svg viewBox="0 0 60 112">
        <path d="M30 0 V10" stroke="#c9a227" strokeWidth="1.5" />
        <circle cx="30" cy="10" r="3" fill="#e0a92e" />
        <path d="M18 12 H42 L47 21 H13 Z" fill="#e0a92e" stroke="#a8770f" strokeWidth="1" />
        <path d="M13 21 H47 L57 51 L47 81 H13 L3 51 Z" fill={main} stroke="#f5c451" strokeWidth="2" />
        <path d="M13 21 L3 51 L13 81 Z" fill={dark} />
        <path d="M47 21 L57 51 L47 81 Z" fill={dark} />
        <path d="M13 21 V81 M47 21 V81" stroke="#f5c451" strokeWidth="1.2" />
        <path d="M3 51 H13 M47 51 H57" stroke="#f5c451" strokeWidth="1" />
        <ellipse className={styles.kandilGlow} cx="30" cy="51" rx="22" ry="27" fill="#ffd36b" />
        <circle cx="30" cy="51" r="13" fill="#fff6dc" stroke="#d4a017" strokeWidth="2" />
        <g transform="translate(20.5 41.5) scale(0.19)">
          <path
            d="M50 14 V86 M14 50 H86 M50 14 H84 M86 50 V84 M50 86 H16 M14 50 V16"
            fill="none"
            stroke="#c4161c"
            strokeWidth="11"
            strokeLinecap="square"
          />
          <circle cx="31" cy="31" r="7" fill="#c4161c" />
          <circle cx="69" cy="31" r="7" fill="#c4161c" />
          <circle cx="31" cy="69" r="7" fill="#c4161c" />
          <circle cx="69" cy="69" r="7" fill="#c4161c" />
        </g>
        <path d="M13 81 H47 L41 90 H19 Z" fill="#e0a92e" stroke="#a8770f" strokeWidth="1" />
        <g stroke="#f5c451" strokeWidth="1.4">
          <path d="M22 90 V104 M26 90 V108 M30 90 V110 M34 90 V108 M38 90 V104" />
        </g>
        <circle cx="30" cy="110" r="2" fill="#e0a92e" />
      </svg>
    </span>
  );
}

/* ================= Jhoomar strands (side margins only) ================= */

type StrandEnd = 'diya' | 'bell' | 'lotus' | 'kandil';
interface StrandSpec {
  x: number;
  top: number;
  beads: number;
  end: StrandEnd;
  size: number;
  bead?: number;
  gap?: number;
  color?: keyof typeof KANDIL_COLORS;
}

const BEAD_COLORS = ['#f59e0b', '#fbbf24', '#ea580c'];

function Strand({ spec, index, mirror }: { spec: StrandSpec; index: number; mirror: boolean }) {
  const vars: Vars = {
    '--x': `${mirror ? -spec.x : spec.x}px`,
    '--top': `${spec.top}px`,
    '--swing-delay': `${(index % 5) * 0.45}s`,
  };
  if (spec.bead) vars['--bead'] = `${spec.bead}px`;
  if (spec.gap) vars['--bead-gap'] = `${spec.gap}px`;
  return (
    <span className={styles.strand} style={vars}>
      {Array.from({ length: spec.beads }, (_, i) => (
        <span key={i} className={styles.bead} style={{ '--bead-color': BEAD_COLORS[i % BEAD_COLORS.length] } as Vars} />
      ))}
      <span className={styles.strandEnd}>
        {spec.end === 'diya' && <Diya size={spec.size} />}
        {spec.end === 'bell' && <Bell width={spec.size} />}
        {spec.end === 'lotus' && <Lotus width={spec.size} />}
        {spec.end === 'kandil' && <Kandil width={spec.size} color={spec.color} delay={index * 0.3} />}
      </span>
    </span>
  );
}

// Desktop: 7 strands per side (14 total) shaped like a chandelier.
const DESKTOP_STRANDS: StrandSpec[] = [
  { x: -36, top: 30, beads: 6, end: 'bell', size: 14 },
  { x: -24, top: 34, beads: 10, end: 'diya', size: 22 },
  { x: -12, top: 36, beads: 14, end: 'lotus', size: 26 },
  { x: 0, top: 38, beads: 17, end: 'kandil', size: 44 },
  { x: 12, top: 36, beads: 14, end: 'lotus', size: 26 },
  { x: 24, top: 34, beads: 10, end: 'diya', size: 22 },
  { x: 36, top: 30, beads: 6, end: 'bell', size: 14 },
];
const TABLET_STRANDS: StrandSpec[] = [
  { x: -10, top: 6, beads: 6, end: 'bell', size: 12, bead: 6, gap: 6 },
  { x: 0, top: 6, beads: 11, end: 'diya', size: 20, bead: 6, gap: 6 },
  { x: 10, top: 6, beads: 6, end: 'bell', size: 12, bead: 6, gap: 6 },
];
const MOBILE_STRANDS: StrandSpec[] = [{ x: 0, top: 4, beads: 12, end: 'diya', size: 14, bead: 5, gap: 5 }];

function SideJhoomar({ side }: { side: 'left' | 'right' }) {
  const mirror = side === 'right';
  return (
    <div className={`${styles.jhoomarSide} ${mirror ? styles.jhoomarRight : styles.jhoomarLeft}`} aria-hidden="true">
      <div className={styles.onlyDesktop}>
        <span className={styles.jhoomarCap}>
          <svg viewBox="0 0 100 42">
            <circle cx="50" cy="5" r="4" fill="#e0a92e" />
            <path d="M50 9 V12" stroke="#a8770f" strokeWidth="2" />
            <path d="M6 32 Q50 -2 94 32 Z" fill="#e0a92e" stroke="#a8770f" strokeWidth="1.2" />
            <path d="M22 26 Q50 8 78 26" fill="none" stroke="#fff1c9" strokeWidth="1.5" opacity="0.8" />
            <rect x="4" y="31" width="92" height="6" rx="2" fill="#b8860b" />
            <g fill="#c4161c">
              <circle cx="20" cy="34" r="1.6" />
              <circle cx="35" cy="34" r="1.6" />
              <circle cx="50" cy="34" r="1.6" />
              <circle cx="65" cy="34" r="1.6" />
              <circle cx="80" cy="34" r="1.6" />
            </g>
          </svg>
        </span>
        {DESKTOP_STRANDS.map((spec, i) => (
          <Strand key={i} spec={spec} index={i} mirror={mirror} />
        ))}
      </div>
      <div className={styles.onlyTablet}>
        {TABLET_STRANDS.map((spec, i) => (
          <Strand key={i} spec={spec} index={i} mirror={mirror} />
        ))}
      </div>
      <div className={styles.onlyMobile}>
        {MOBILE_STRANDS.map((spec, i) => (
          <Strand key={i} spec={spec} index={i} mirror={mirror} />
        ))}
      </div>
    </div>
  );
}

/* ================= Top diya ladi ================= */

const BULB_COLORS = [
  ['#ffd23f', 'rgba(255, 210, 63, 0.55)'],
  ['#ff6b35', 'rgba(255, 107, 53, 0.5)'],
  ['#ff4f9a', 'rgba(255, 79, 154, 0.45)'],
  ['#3fe0c5', 'rgba(63, 224, 197, 0.45)'],
  ['#fff4d6', 'rgba(255, 244, 214, 0.55)'],
];
const SCALLOPS = 6;
const BULBS_PER_SCALLOP = 7;
const WIRE_H = 40; // viewBox height
const SAG = 24;

function ladiPoints() {
  const width = 1000 / SCALLOPS;
  const bulbs: { x: number; y: number }[] = [];
  let path = 'M0 4';
  for (let s = 0; s < SCALLOPS; s++) {
    const x0 = s * width;
    path += ` Q${x0 + width / 2} ${4 + SAG * 2} ${x0 + width} 4`;
    for (let b = 1; b <= BULBS_PER_SCALLOP; b++) {
      const t = b / (BULBS_PER_SCALLOP + 1);
      bulbs.push({ x: x0 + width * t, y: 4 + 4 * SAG * t * (1 - t) });
    }
  }
  return { path, bulbs, width };
}
const LADI = ladiPoints();

export function DiwaliTopLadi() {
  const active = useDiwaliSeason();
  if (!active) return null;

  return (
    <>
    <SideJhoomar side="left" />
    <SideJhoomar side="right" />
    <div className={styles.ladi} aria-hidden="true">
      <svg className={styles.ladiWire} viewBox={`0 0 1000 ${WIRE_H}`} preserveAspectRatio="none">
        <path d={LADI.path} fill="none" stroke="#7a5a2a" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      </svg>
      {LADI.bulbs.map((b, i) => {
        const [color, glow] = BULB_COLORS[i % BULB_COLORS.length];
        return (
          <span
            key={i}
            className={styles.bulb}
            style={{
              left: `${(b.x / 1000) * 100}%`,
              top: `${(b.y / WIRE_H) * 100}%`,
              '--bulb-color': color,
              '--bulb-glow': glow,
              '--bulb-delay': `${(i % 5) * 0.35}s`,
            } as Vars}
          />
        );
      })}
      {Array.from({ length: SCALLOPS }, (_, s) => s)
        .filter((s) => s % 2 === 1)
        .map((s) => (
          <span
            key={s}
            className={styles.hangingDiya}
            style={{ left: `${((s * LADI.width + LADI.width / 2) / 1000) * 100}%`, '--swing-delay': `${s * 0.4}s` } as Vars}
          >
            <span className={styles.hangingThread} />
            <Diya size={26} />
          </span>
        ))}
    </div>
    </>
  );
}

/* ================= Home section divider ================= */

export function DiyaDivider() {
  const active = useDiwaliSeason();
  if (!active) return null;
  return (
    <div className={styles.divider} aria-hidden="true">
      <span className={styles.dividerHang}>
        <Kandil color="red" delay={0.2} />
      </span>
      <span className={styles.dividerMid}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerDiyas}>
          <span className={styles.dividerOuter}>
            <Diya size={26} />
          </span>
          <Diya size={32} />
          <Lotus />
          <Diya size={32} />
          <span className={styles.dividerOuter}>
            <Diya size={26} />
          </span>
        </span>
        <span className={styles.dividerLine} />
      </span>
      <span className={styles.dividerHang}>
        <Kandil color="pink" delay={0.9} />
      </span>
    </div>
  );
}

/* ================= Footer strip: candles, fuljhadi, anar, lotus ================= */

export function DiwaliFooterDecor() {
  const active = useDiwaliSeason();
  if (!active) return null;
  return (
    <div className={`footer-shell ${styles.footerDecor}`} aria-hidden="true">
      <div className={styles.footerRow}>
        <span className={styles.footerGroup}>
          <Anar />
          <Fuljhadi tilt={-18} />
          <Candle height={50} />
          <Candle height={36} band="#014e4e" />
          <span className={styles.hideMobile}>
            <Diya size={36} />
          </span>
        </span>
        <span className={styles.footerGreeting}>
          <span className={styles.greetRow}>
            <Lotus />
            <span className={styles.greetTitle}>Shubh Deepavali</span>
            <Lotus />
          </span>
          <span className={styles.greetLine}>Ghar ka khana, ghar ki mithas - healthy rahiye, roshan rahiye!</span>
        </span>
        <span className={styles.footerGroup}>
          <span className={styles.hideMobile}>
            <Diya size={36} />
          </span>
          <Candle height={36} band="#014e4e" />
          <Candle height={50} />
          <Fuljhadi tilt={18} />
          <Anar />
        </span>
      </div>
    </div>
  );
}

/* ================= Crackers + fuljhadi cursor + floating diya ================= */

const SPARK_SETS = [
  ['#ffd23f', '#fff4d6', '#ff9100'],
  ['#ff4f9a', '#ffd6e8', '#ffd23f'],
  ['#3fe0c5', '#e6fffa', '#f9d67b'],
  ['#ff6b35', '#ffd23f', '#ffffff'],
];
const SPARKS_PER_BURST = 26;

interface Burst {
  id: number;
  x: number;
  y: number;
  rise: number;
  delay: number;
  colors: string[];
  size: number;
}

let burstSeq = 0;

function CrackerLayer({ welcome }: { welcome: boolean }) {
  const [bursts, setBursts] = useState<Burst[]>([]);

  const launch = useCallback((x?: number, y?: number) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const shots =
      typeof x === 'number' && typeof y === 'number'
        ? [{ x, y, delay: 0 }, { x: x + 90, y: Math.max(60, y - 120), delay: 0.25 }, { x: x + 30, y: Math.max(60, y - 220), delay: 0.5 }]
        : [0.18, 0.5, 0.82, 0.34, 0.66].map((fx, i) => ({
            x: w * fx,
            y: h * (0.18 + ((i * 7) % 4) * 0.07),
            delay: i * 0.35,
          }));

    const created: Burst[] = shots.map((s, i) => ({
      id: ++burstSeq,
      x: Math.min(w - 20, Math.max(20, s.x)),
      y: s.y,
      rise: Math.max(80, h - s.y),
      delay: s.delay,
      colors: SPARK_SETS[(burstSeq + i) % SPARK_SETS.length],
      size: w < 768 ? 60 : 95,
    }));
    setBursts((prev) => [...prev, ...created].slice(-12));
    const ids = new Set(created.map((b) => b.id));
    window.setTimeout(() => setBursts((prev) => prev.filter((b) => !ids.has(b.id))), 3200);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onBurst = (e: Event) => {
      const detail = (e as CustomEvent<{ x?: number; y?: number }>).detail || {};
      launch(detail.x, detail.y);
    };
    window.addEventListener(DIWALI_BURST_EVENT, onBurst);

    // Crackers after the intro, on every page load / refresh.
    const timer = welcome ? window.setTimeout(() => launch(), 3700) : undefined;
    return () => {
      window.removeEventListener(DIWALI_BURST_EVENT, onBurst);
      window.clearTimeout(timer);
    };
  }, [launch, welcome]);

  if (bursts.length === 0) return null;

  return (
    <div className={styles.fireLayer} aria-hidden="true">
      {bursts.map((b) => (
        <span key={b.id} className={styles.burst} style={{ left: b.x, top: b.y, '--delay': `${b.delay}s`, '--rise': `${b.rise}px` } as Vars}>
          <span className={styles.rocket} />
          <span className={styles.flash} />
          {Array.from({ length: SPARKS_PER_BURST }, (_, i) => (
            <span
              key={i}
              className={styles.spark}
              style={{
                '--angle': `${(360 / SPARKS_PER_BURST) * i}deg`,
                '--dist': `${b.size * (0.7 + ((i * 17) % 10) / 30)}px`,
                '--spark-color': b.colors[i % b.colors.length],
              } as Vars}
            />
          ))}
        </span>
      ))}
    </div>
  );
}

function FuljhadiCursor() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const layer = layerRef.current;
      const now = performance.now();
      if (!layer || now - last < 35 || layer.childElementCount > 40) return;
      last = now;
      for (let i = 0; i < 2; i++) {
        const spark = document.createElement('span');
        spark.className = styles.trailSpark;
        spark.style.left = `${e.clientX}px`;
        spark.style.top = `${e.clientY}px`;
        spark.style.setProperty('--tx', `${(Math.random() - 0.5) * 36}px`);
        spark.style.setProperty('--ty', `${Math.random() * 30 + 6}px`);
        spark.addEventListener('animationend', () => spark.remove(), { once: true });
        layer.appendChild(spark);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return <div ref={layerRef} className={styles.trailLayer} aria-hidden="true" />;
}

function FloatingDiya() {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setOpen(false), 6000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <button
      type="button"
      className={styles.floatBtn}
      aria-label="Happy Diwali - tap to light crackers"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        fireDiwaliCrackers(rect.left + 60, Math.max(80, rect.top - 220));
      }}
    >
      <Diya />
      <span className={`${styles.floatLabel} ${open ? styles.floatLabelOpen : ''}`}>Happy Diwali!</span>
    </button>
  );
}

/* ================= Intro: gold bomb + red swastik + "Happy Diwali" spinning up ================= */

const GOLD_SPARKS = ['#fff6d5', '#f5c451', '#ffb020', '#ff7a1a', '#ffffff', '#e0a92e'];
const BOMB_SPARKS = Array.from({ length: 56 }, (_, i) => ({
  angle: (360 / 56) * i + (i % 4) * 2,
  dist: 26 + ((i * 13) % 20),
  len: 12 + ((i * 7) % 16),
  delay: (i % 3) * 0.05,
  color: GOLD_SPARKS[i % GOLD_SPARKS.length],
}));
const SIDE_BURSTS = [
  { x: 14, y: 22, delay: 0.4 },
  { x: 86, y: 20, delay: 0.6 },
  { x: 18, y: 76, delay: 0.85 },
  { x: 82, y: 74, delay: 1.05 },
];
const SIDE_SPARKS = Array.from({ length: 22 }, (_, i) => ({
  angle: (360 / 22) * i,
  dist: 9 + ((i * 7) % 7),
  color: i % 4 === 0 ? '#ff4f6d' : GOLD_SPARKS[i % GOLD_SPARKS.length],
}));
const EMBERS = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 2 + (i % 3),
  delay: ((i * 29) % 140) / 100,
  dur: 2.6 + ((i * 17) % 20) / 10,
  drift: ((i * 23) % 60) - 30,
}));
const MANDALA_PETALS = Array.from({ length: 16 }, (_, i) => (360 / 16) * i);

function GoldLetters({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <>
      {text.split('').map((ch, i) =>
        ch === ' ' ? (
          <span key={i} className={styles.introSpace} />
        ) : (
          <span key={i} className={styles.introLetter} style={{ '--i': i + offset } as Vars}>
            {ch}
          </span>
        )
      )}
    </>
  );
}

function DiwaliIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 4500);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div className={styles.intro} aria-hidden="true">
      <span className={styles.introBackdrop} />

      {EMBERS.map((e, i) => (
        <span
          key={i}
          className={styles.ember}
          style={{
            left: `${e.left}%`,
            '--size': `${e.size}px`,
            '--delay': `${e.delay}s`,
            '--dur': `${e.dur}s`,
            '--drift': `${e.drift}px`,
          } as Vars}
        />
      ))}

      <span className={styles.introBomb}>
        <span className={styles.introFlash} />
        <span className={styles.introRing} />
        <span className={styles.introRing} style={{ '--delay': '0.18s' } as Vars} />
        {BOMB_SPARKS.map((sp, i) => (
          <span
            key={i}
            className={styles.introSpark}
            style={{
              '--angle': `${sp.angle}deg`,
              '--dist': `${sp.dist}vmin`,
              '--len': `${sp.len}px`,
              '--delay': `${sp.delay}s`,
              '--spark-color': sp.color,
            } as Vars}
          />
        ))}
      </span>

      {SIDE_BURSTS.map((b, bi) => (
        <span key={bi} className={styles.introSide} style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          {SIDE_SPARKS.map((sp, i) => (
            <span
              key={i}
              className={styles.introSpark}
              style={{
                '--angle': `${sp.angle}deg`,
                '--dist': `${sp.dist}vmin`,
                '--len': '10px',
                '--delay': `${b.delay}s`,
                '--spark-color': sp.color,
              } as Vars}
            />
          ))}
        </span>
      ))}

      <span className={styles.introTrail} />

      <div className={styles.introStage}>
        <div className={styles.introEmblem}>
          <div className={styles.mandala}>
            <span className={styles.mandalaRing}>
              <svg viewBox="0 0 100 100">
                {MANDALA_PETALS.map((deg) => (
                  <path
                    key={deg}
                    d="M50 2 C55 9 55 15 50 20 C45 15 45 9 50 2 Z"
                    fill={deg % 45 === 0 ? '#f5c451' : '#e0a92e'}
                    stroke="#a8770f"
                    strokeWidth="0.6"
                    transform={`rotate(${deg} 50 50)`}
                  />
                ))}
                <circle cx="50" cy="50" r="31" fill="none" stroke="#f5c451" strokeWidth="1" strokeDasharray="2 3" />
              </svg>
            </span>
            <span className={styles.mandalaCore}>
              <Swastik />
            </span>
            <span className={styles.mandalaLotus}>
              <Lotus />
            </span>
          </div>

          <div className={styles.introTitle}>
            <GoldLetters text="Happy Diwali" />
          </div>
          <div className={styles.introOrnament}>
            <span className={styles.introDiamond} />
          </div>
          <div className={styles.introHindi}>{'शुभ दीपावली'}</div>
          <div className={styles.introSub}>With love from Team DTPS</div>
        </div>
      </div>
    </div>
  );
}

/** Mount once in the layout: intro, crackers, fuljhadi cursor trail and the floating diya button. */
export default function DiwaliFestive() {
  const active = useDiwaliSeason();
  const pathname = usePathname();
  // Intro + opening crackers only when the visitor lands on the home page.
  const [isHome] = useState(pathname === '/');
  const [showIntro, setShowIntro] = useState(isHome);
  const hideIntro = useCallback(() => setShowIntro(false), []);

  useEffect(() => {
    if (prefersReducedMotion()) setShowIntro(false);
  }, []);

  if (!active) return null;
  return (
    <>
      {showIntro && <DiwaliIntro onDone={hideIntro} />}
      <CrackerLayer welcome={isHome} />
      <FuljhadiCursor />
      <FloatingDiya />
    </>
  );
}
