/**
 * Health-safe plan labels.
 * -----------------------------------------------------------------------------
 * The application's real plan names describe conditions ("PCOD Management Plan",
 * "Weight Loss Plan"), and the checkout catalogue returns them verbatim. That is
 * correct for the customer's cart, order and receipt — and it is what the
 * existing Meta policy keeps out of analytics payloads.
 *
 * Third-party analytics (Zappush, and anything it forwards to) must not receive
 * a condition, a treatment or a weight-loss claim. This module converts a real
 * plan into two safe values:
 *
 *   item_id   — a stable, opaque identifier, minted once per plan and never
 *               re-minted, so attribution stays continuous across deploys.
 *               Zappush requires `item_id` on item events and sends it to Meta
 *               as `content_ids`, which is exactly why it must carry no meaning.
 *   item_name — a generic, non-clinical label for dashboard reporting.
 *
 * Nothing here changes what a customer sees. The cart, order, invoice and
 * receipt keep their real names.
 */

/** Page-level grouping. These are product categories, not conditions. */
export type PlanFamily = 'nutrition-programme' | 'nutrition-consultation' | 'nutrition-support';

const FAMILY_BY_PAGE: Record<string, PlanFamily> = {
  'weight-loss': 'nutrition-programme',
  pcod: 'nutrition-programme',
  wedding: 'nutrition-programme',
  therapeutic: 'nutrition-support',
  thyroid: 'nutrition-support',
  '2499-plan': 'nutrition-programme',
  appointment: 'nutrition-consultation',
};

const LABEL_BY_FAMILY: Record<PlanFamily, string> = {
  'nutrition-programme': 'Nutrition Programme',
  'nutrition-support': 'Nutrition Support Plan',
  'nutrition-consultation': 'Nutrition Consultation',
};

/**
 * Deterministic, non-reversible identifier.
 *
 * FNV-1a over the plan's stable slug. A hash — not the slug itself — because
 * the slug contains the condition ("pcod-1-month") and the id is forwarded to
 * Meta. Verified for uniqueness across the catalogue by the unit guard.
 */
function hash(input: string): string {
  let value = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 0x01000193) >>> 0;
  }
  return value.toString(36).padStart(7, '0');
}

/** Lowercase, hyphenated slug used as the hash input. */
function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface SafePlan {
  item_id: string;
  item_name: string;
  item_variant?: string;
  price: number;
  quantity: number;
}

/**
 * Build the analytics-safe view of a plan.
 *
 * `planId` must be the stable catalogue key (for example the document id or the
 * page-derived slug the checkout catalogue already validates against). It is
 * hashed, so the identifier stays constant for a given plan forever.
 */
export function toSafePlan(input: {
  planId: string;
  page?: string;
  price: number;
  quantity?: number;
  duration?: string | null;
}): SafePlan {
  const family = FAMILY_BY_PAGE[slug(input.page ?? '')] ?? 'nutrition-programme';
  const quantity = Number.isSafeInteger(input.quantity) && (input.quantity ?? 0) > 0 ? (input.quantity as number) : 1;
  const price = Number.isFinite(input.price) && input.price >= 0 ? input.price : 0;
  const duration = typeof input.duration === 'string' ? input.duration.trim().slice(0, 40) : '';

  return {
    item_id: `dtps-${family}-${hash(slug(input.planId))}`,
    item_name: duration ? `${LABEL_BY_FAMILY[family]} — ${duration}` : LABEL_BY_FAMILY[family],
    ...(duration ? { item_variant: duration } : {}),
    price,
    quantity,
  };
}

/**
 * Analytics-safe label for a plan that only has a display name available
 * (for example a page that reads `plan.planName` before checkout). Never
 * returns the plan's own name.
 */
export function toSafeLabel(page?: string, duration?: string | null): string {
  const family = FAMILY_BY_PAGE[slug(page ?? '')] ?? 'nutrition-programme';
  const trimmed = typeof duration === 'string' ? duration.trim().slice(0, 40) : '';
  return trimmed ? `${LABEL_BY_FAMILY[family]} — ${trimmed}` : LABEL_BY_FAMILY[family];
}

/**
 * Human-readable navigation labels. Used only as a fallback when a page has no
 * title, because a condition-bearing tab title must not reach Zappush.
 */
const ROUTE_LABELS: Array<[string, string]> = [
  ['/checkout/success', 'Order Confirmed'],
  ['/checkout', 'Checkout'],
  ['/appointment', 'Book an Appointment'],
  ['/contact', 'Contact'],
  ['/blog', 'Articles'],
  ['/help', 'Help'],
  ['/terms', 'Terms'],
  ['/privacy-policy', 'Privacy Policy'],
];

/** A non-identifying, non-clinical page label for a pathname. */
export function safePageTitle(pathname: string): string {
  for (const [prefix, label] of ROUTE_LABELS) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return label;
  }
  if (/^\/(wldtps|pcdtps|tpdtps|thydtps|wddtps|299plan|weight-loss-plan)/.test(pathname)) {
    return 'Nutrition Plan';
  }
  return 'Page';
}

/**
 * Query parameters that may appear in an analytics URL. Everything else is
 * dropped: the app never needs a case id, a form answer or a campaign value
 * from a health page in an analytics payload.
 */
const ALLOWED_QUERY_KEYS = new Set(['orderId', 'id', 'status']);

/** Strip sensitive query parameters and any fragment from a URL. */
export function safePageUrl(input: string): string | undefined {
  if (typeof input !== 'string' || input.length === 0) return undefined;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:') return undefined;
    if (!['dtpoonamsagar.com', 'www.dtpoonamsagar.com'].includes(url.hostname)) return undefined;
    const params = new URLSearchParams();
    for (const [key, value] of url.searchParams) {
      if (ALLOWED_QUERY_KEYS.has(key)) params.set(key, value);
    }
    const query = params.toString();
    return `${url.origin}${url.pathname}${query ? `?${query}` : ''}`;
  } catch {
    return undefined;
  }
}

/** Current page URL, already stripped of anything sensitive. */
export function currentSafePageUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return safePageUrl(window.location.href);
}
