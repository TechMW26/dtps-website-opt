/**
 * Zappush tracker identifiers and the Consent Mode v2 keys it reads.
 * -----------------------------------------------------------------------------
 * The tracker key, the script URL and the Meta connection identifier are all
 * public by design (the script URL is fetched by every visitor's browser), so
 * they live in source rather than the environment. No secret belongs here.
 *
 * The guard in `tests/zappush-integration.test.cjs` asserts the script URL is
 * byte-for-byte identical to the one in the vendor dashboard. Do not "tidy" it.
 */

/** Exact tracker script from the Zappush dashboard. Verified verbatim. */
export const ZAPPUSH_TRACKER_SRC =
  'https://api.zappush.com/s/zp_bcd40e532430663af84df043b9c5403d.js';

/** Origin added to the Content-Security-Policy in `next.config.js`. */
export const ZAPPUSH_ORIGIN = 'https://api.zappush.com';

/**
 * Zappush's queue stub. It buffers `zappush.track()` calls made before the
 * tracker finishes loading, which is why our own code never needs a readiness
 * check. Kept as a string because it is installed as a raw inline script
 * before the external file, exactly as the install guide requires.
 */
export const ZAPPUSH_QUEUE_STUB =
  '!function(w,z){z=w.zappush=z.zappush||{};z.q=z.q||[];z.track=z.track||function(e,d){z.q.push([e,d])}}(window)';

/**
 * Meta connection for this store, as given by the account owner. It is an
 * opaque token, not a credential: it identifies which connection to open in
 * the Zappush dashboard and grants no access on its own. It is recorded here
 * for traceability only and is not used at runtime.
 */
export const ZAPPUSH_META_CONNECTION_ID = 'hQ4RIEt5_sK0PpTJWV7kOHYH9N9AEjhLfoJtuVKTJ54';

/** Dashboard URL a human must open to finish Meta setup. Never fetched by code. */
export const ZAPPUSH_META_CONNECT_URL = `https://app.zappush.com/connect/meta/${ZAPPUSH_META_CONNECTION_ID}`;

/**
 * The four Google Consent Mode v2 keys Zappush reads. Listed here so the
 * consent module and the tracker component cannot drift apart.
 */
export const ZAPPUSH_CONSENT_KEYS = [
  'analytics_storage',
  'ad_storage',
  'ad_user_data',
  'ad_personalization',
] as const;
