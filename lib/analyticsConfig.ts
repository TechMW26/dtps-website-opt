/**
 * Event registry.
 * -----------------------------------------------------------------------------
 * One row per tracked action, so the mapping from a real application action to
 * a GA4 event, a Zappush event and a Meta event can be reviewed in a single
 * place instead of being scattered across call sites.
 *
 * Column sources, all verified against Zappush's own documentation:
 *   dataLayer   — GA4 name; Zappush translates it. A push is world-readable.
 *   zappush     — the SDK name; `track()` does not translate.
 *   meta        — what the integration forwards, for reference only.
 *
 * This project does NOT enable Meta forwarding, so the `meta` column documents
 * intent and is never read at runtime.
 *
 * Events that do not exist in this application are marked `notApplicable` with
 * the reason, rather than being invented to fill the table.
 */

export interface EventDefinition {
  /** The application action that triggers this event. */
  trigger: string;
  /** GA4 name for `window.dataLayer.push({ event })`, or null when unpushable. */
  dataLayer: string | null;
  /** Zappush SDK name for `window.zappush.track()`. */
  zappush: string;
  /** Meta standard event the integration would forward, for reference. */
  meta: string | null;
  /** Deduplication key, so the same conversion cannot be emitted twice. */
  dedup: string;
  /** How the payload is transported, which decides who can read it. */
  transport: 'dataLayer' | 'sdk' | 'dataLayer+sdk';
  note?: string;
}

export const EVENTS = {
  /**
   * Initial page view and SPA navigations.
   *
   * Not pushed to the DataLayer: Zappush ignores `page_view` (it fires its own)
   * and GA4 receives the manual `gaPageView()` call in `PixelTracker`. Pushing
   * it as well would either be ignored or double-counted.
   */
  pageView: {
    trigger: 'Initial document load and every App Router pathname change',
    dataLayer: null,
    zappush: 'page_viewed',
    meta: 'PageView',
    dedup: 'full pathname + query string, once per navigation',
    transport: 'sdk',
    note: 'GA4 page_view is emitted by gaPageView(); Zappush ignores a pushed page_view and fires its own.',
  },

  /** A plan / programme page opening. */
  viewItem: {
    trigger: 'A plan page mounts and the plan is resolved from the catalogue',
    dataLayer: 'view_item',
    zappush: 'product_viewed',
    meta: 'ViewContent',
    dedup: 'opaque plan id, once per page view per session',
    transport: 'dataLayer+sdk',
  },

  /** A plan is chosen for purchase ("Buy Now"). */
  addToCart: {
    trigger: 'Plan selection stores the cart and hands off to /checkout',
    dataLayer: 'add_to_cart',
    zappush: 'product_added_to_cart',
    meta: 'AddToCart',
    dedup: 'the existing sessionStorage cart-selection marker',
    transport: 'dataLayer+sdk',
  },

  /** The checkout page is reached with a real cart. */
  beginCheckout: {
    trigger: '/checkout mounts with a non-empty cart',
    dataLayer: 'begin_checkout',
    zappush: 'checkout_started',
    meta: 'InitiateCheckout',
    dedup: 'checkout session id, once per cart selection',
    transport: 'dataLayer+sdk',
  },

  /**
   * Payment details submitted (the Razorpay modal opened for a created order).
   * Contact fields travel through the SDK only, never the shared DataLayer.
   */
  addPaymentInfo: {
    trigger: 'Order created and the Razorpay checkout modal opened',
    dataLayer: 'add_payment_info',
    zappush: 'payment_info_submitted',
    meta: 'AddPaymentInfo',
    dedup: 'order id',
    transport: 'dataLayer+sdk',
  },

  /**
   * Confirmed purchase. Fired only from the verified order path, which today
   * means `/checkout/success` after `/api/orders` reports `paymentStatus ===
   * 'completed'` for the exact order id in the URL.
   * See `lib/tracking.ts` → `trackVerifiedPurchase`.
   */
  purchase: {
    trigger: 'A trusted, completed order is confirmed by the orders API',
    dataLayer: 'purchase',
    zappush: 'checkout_completed',
    meta: 'Purchase',
    dedup: 'transaction_id (the stable database order id) plus a persistent marker',
    transport: 'sdk',
    note: 'transaction_id is what stops a refreshed confirmation page counting twice.',
  },

  /** A lead was captured by a form. */
  generateLead: {
    trigger: 'Contact form or lead form submission accepted by the API',
    dataLayer: 'generate_lead',
    zappush: 'generate_lead',
    meta: 'Lead',
    dedup: 'submission id, once per accepted submission',
    transport: 'sdk',
    note: 'Zappush documents that only the four contact fields may be sent. Never the service or form answers.',
  },

  /** An appointment or call was booked. */
  schedule: {
    trigger: 'Appointment booking accepted by the API',
    dataLayer: null,
    zappush: 'schedule',
    meta: 'Schedule',
    dedup: 'appointment id, once per accepted booking',
    transport: 'sdk',
    note: '`schedule` has no GA4 equivalent, so a GTM data layer push can never emit it. SDK only.',
  },
} as const satisfies Record<string, EventDefinition>;

/** Product-event names Zappush forwards to Meta with a fixed field set. */
export const ZAPPUSH_META_PRODUCT_EVENTS = [
  'view_item',
  'add_to_cart',
  'begin_checkout',
  'add_shipping_info',
  'add_payment_info',
  'purchase',
] as const;

/** Currency of every price in this store. Payloads are INR-only by design. */
export const STORE_CURRENCY = 'INR';

/**
 * Events from the brief that this application cannot produce. Recorded so the
 * omission is a reviewed decision rather than an oversight — the brief itself
 * asks that irrelevant events not be implemented to fill a list.
 */
export const NOT_APPLICABLE_EVENTS: Array<{ event: string; reason: string }> = [
  { event: 'search / view_search_results', reason: 'No site search exists; /help renders static content only.' },
  { event: 'view_cart / remove_from_cart', reason: 'Checkout is a single-plan hand-off; there is no cart UI.' },
  { event: 'view_item_list / select_item', reason: 'Plan cards are rendered per page; there is no list/collection route.' },
  { event: 'add_shipping_info', reason: 'Plans are services; the checkout has no shipping step.' },
  { event: 'refund / order_refunded', reason: 'No refund flow exists in the application.' },
  { event: 'sign_up / CompleteRegistration', reason: 'Customer accounts do not exist; auth is admin-only.' },
  { event: 'login / user_logged_in', reason: 'No customer-facing login exists.' },
  { event: 'newsletter subscription', reason: 'No newsletter feature exists.' },
  { event: 'lead qualified / verify_lead', reason: 'No trusted backend qualification signal is available.' },
];
