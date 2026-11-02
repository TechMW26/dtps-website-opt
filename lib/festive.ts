// Diwali festive theme switch.
// The decorations show automatically between START and END (IST).
// Force it with NEXT_PUBLIC_DIWALI_THEME=on or turn it off with NEXT_PUBLIC_DIWALI_THEME=off.

export const DIWALI_THEME_START = '2026-10-28T00:00:00+05:30';
export const DIWALI_THEME_END = '2026-11-16T00:00:00+05:30';

export function isDiwaliSeason(now: number = Date.now()): boolean {
  const flag = process.env.NEXT_PUBLIC_DIWALI_THEME;
  if (flag === 'off') return false;
  if (flag === 'on') return true;
  return now >= new Date(DIWALI_THEME_START).getTime() && now < new Date(DIWALI_THEME_END).getTime();
}

export const DIWALI_BURST_EVENT = 'dtps:diwali-burst';

/** Fire crackers from anywhere: fireDiwaliCrackers(x, y) or fireDiwaliCrackers() for a random show. */
export function fireDiwaliCrackers(x?: number, y?: number) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DIWALI_BURST_EVENT, { detail: { x, y } }));
}
