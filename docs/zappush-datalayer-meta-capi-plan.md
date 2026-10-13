# Zappush + DataLayer + Meta Pixel/CAPI — design & migration plan

Status: **plan for approval. No code changes have been made.**
Author: engineering. Audience: site owner (account holder), engineering reviewer.
Related: [meta-health-audit.md](./meta-health-audit.md), [mongodb-website-migration.md](./mongodb-website-migration.md).

## 0. Why this document exists

The request is to install Zappush, route events through the DataLayer, and connect
Meta Pixel **and** Conversions API end to end. Zappush is a **third-party
tracking gateway**: once its script is in the page it owns a Meta pixel and CAPI
delivery on its own, independent of our code.

That collides with decisions this repository already implements and documents:

| Existing decision | Where | Conflict with the request |
| --- | --- | --- |
| Meta browser events restricted to an allowlist | [lib/meta-policy.ts](../lib/meta-policy.ts) | Zappush emits its own full event set |
| CAPI hard-disabled (`canSendMetaEvents() === false`) | [lib/meta-policy.ts](../lib/meta-policy.ts) | "Connect CAPI" turns it on |
| Product names/IDs stripped from Meta payloads | [lib/meta-policy.ts](../lib/meta-policy.ts) | Zappush sends `item_id`/`item_name` as `content_ids` |
| Single Meta pixel `1444341400930947`, no other sender | [lib/meta-config.ts](../lib/meta-config.ts) | Zappush adds a second Meta source |
| Already a second CAPI sender in our own code | [app/api/orders/route.ts](../app/api/orders/route.ts) | Would double-purchase |
| "Any independently configured tracking gateway must be checked separately" | [meta-health-audit.md](./meta-health-audit.md) | This is that gateway |
| Third-party report of a Meta **Health and Wellness** data-source restriction | [meta-health-audit.md](./meta-health-audit.md) | A gateway is a second data source in the same category |

**Therefore, two things in the prompt cannot be satisfied by engineering at all**,
and are recorded here as owner decisions rather than tasks:

1. **Meta eligibility.** A Zappush connection is a *new data source* on the same
   domain and category. Nothing in this repository can determine whether Meta
   accepts it; only the account holder and Meta Events Manager can.
2. **Consent content.** The site has **no cookie consent banner** today.
   [lib/meta-policy.ts](../lib/meta-policy.ts) states the restriction is
   category-level and not removable by code. Whether tracking may activate before
   a consent choice is a policy/legal decision, not an implementation detail.

The plan below is therefore written as a **gated migration**: each phase has an
explicit precondition, and no phase that enables Meta transmission is executed
without the owner's written confirmation. Everything up to the gate is fully
specifiable from the repository and the vendor documentation.

## 1. Detected application (Phase 1 findings)

| Question | Finding | Evidence |
| --- | --- | --- |
| Framework | **Next.js 16 (App Router)** + React 18, builds with `next build --webpack` | [package.json](../package.json) `dev`/`build` |
| Entry / root layout | `app/layout.tsx` renders `<head>` and `next/script` tags | [app/layout.tsx](../app/layout.tsx) |
| Router | App Router — `usePathname()` / `useSearchParams()`; **no `react-router`** | [components/PixelTracker.tsx](../components/PixelTracker.tsx) |
| DataLayer | **Exists** — `window.dataLayer` is created by the GA4 init script | [app/layout.tsx](../app/layout.tsx) GA4 block |
| GA4 | `G-R647JLBMXD` via gtag.js, `send_page_view: false`, page views fired manually | [app/layout.tsx](../app/layout.tsx), [lib/pixel.ts](../lib/pixel.ts) |
| Meta Pixel | `1444341400930947`, `beforeInteractive` bootstrap, `autoConfig` off | [lib/meta-config.ts](../lib/meta-config.ts) |
| Meta CAPI | Implemented but **suppressed** (`canSendMetaEvents()` → `false`) | [lib/meta-policy.ts](../lib/meta-policy.ts) |
| Microsoft Clarity | Loaded, production-host-gated, no consent check | [components/ClarityTracker.tsx](../components/ClarityTracker.tsx) |
| Other analytics | Visitor telemetry (`/api/track-visitor`), admin traffic dashboard | [components/VisitorTracker.tsx](../components/VisitorTracker.tsx) |
| Zappush | **Not installed** anywhere | repo-wide search: only mention is a doc reference |
| Consent management | **None** (no banner, no Consent Mode v2) | repo-wide search, privacy-policy §6 |
| Payment provider | **Razorpay** | [app/checkout/CheckoutContent.tsx](../app/checkout/CheckoutContent.tsx) |
| Order confirmation | `/checkout/success?orderId=…`, verifies against DB before emitting | [lib/meta-funnel.ts](../lib/meta-funnel.ts) |
| Business model | **Service / subscription** (diet & nutrition plans). No physical catalog, no cart page, no remove-from-cart, no refunds flow, no account registration | routes under [app/](../app) |
| Currency | **INR**, hardcoded as the storefront currency | [lib/meta-policy.ts](../lib/meta-policy.ts) |

### 1.1 Business model → which prompt event lists apply

The prompt says "do not assume the project is an ecommerce website". It is not a
catalog store; it is a **service** site selling diet plans. Mapping the prompt's
three lists against what actually exists:

| Prompt event | Applies? | Reason |
| --- | --- | --- |
| Page view / SPA route change | **Yes** | Already implemented |
| Internal search | **No** | No site search exists (`/help` is static copy) |
| Contact form submission | **Yes** | [components/contact/ContactForm.tsx](../components/contact/ContactForm.tsx) |
| Newsletter subscription | **No** | No newsletter feature |
| Lead generation | **Yes** | [components/weight-loss/LeadFormMultiStep.tsx](../components/weight-loss/LeadFormMultiStep.tsx) |
| Account registration | **No** | Admin login only; no customer accounts |
| Login | **No** | Customer-facing login does not exist |
| Product list viewed | **No** | No list/collection page |
| Product detail viewed | **Yes** (plan page) | e.g. [app/299plan/page.tsx](../app/299plan/page.tsx) |
| Product selected | **Partial** | Plan → checkout selection is the only selection step |
| Add to cart | **Partial** | "Buy Now" stores a single-product cart, no cart UI |
| Remove from cart | **No** | No cart exists |
| Cart viewed | **No** | No cart page/drawer |
| Checkout started | **Yes** | `/checkout` |
| Shipping information submitted | **No** | Service product; no shipping step |
| Payment information submitted | **Yes** | Razorpay modal opened |
| Purchase completed | **Yes** | `/checkout/success` |
| Refund processed | **No** | No refund flow in the app |
| Service viewed / appointment / quote / contact request | **Yes** | `/appointment`, `/contact` |
| Lead qualified | **No** | No trusted backend qualification signal |

Refunds and shipping are **not** implemented, and the prompt explicitly says not
to implement irrelevant events to fill a list. They stay out unless the owner
wants a backend refund signal added separately.

## 2. Verified Zappush contract (Phases 2–5, 8)

Fetched from the vendor's own documentation during this review — no fields are
invented. Sources: `zappush.com/docs/get-started/install-tracker`,
`/docs/reference/sdk`, `/docs/reference/data-layer`.

### 2.1 Install snippet (verbatim, from the prompt)

```html
<script>!function(w,z){z=w.zappush=w.zappush||{};z.q=z.q||[];z.track=z.track||function(e,d){z.q.push([e,d])}}(window)</script>
<script src="https://api.zappush.com/s/zp_bcd40e532430663af84df043b9c5403d.js" defer></script>
```

### 2.2 Two delivery paths — and the one that matters for health data

| Path | Payload | Event names | Privacy |
| --- | --- | --- | --- |
| `window.dataLayer.push({ event, user_data, ecommerce })` | Wrapped, GA4 shape | **GA4 names**, translated | **World-readable** by every script on the page |
| `window.zappush.track(name, flatObject)` | Flat | **Zappush names**, no translation | Contact details stay out of the shared data layer |

Documented facts that drive the design:

- A push **without a string `event` is ignored**, so the `zp_` push and the
  `{ zappush_event, zappush_properties }` shape are *not* a live contract on a
  Next.js SPA. Only the documented mappings in §2.3 are safe to rely on.
- **`page_view` is ignored** — the tracker fires its own page view. Our SPA
  navigations therefore must use the SDK path, or Zappush will not see them.
- Pushes made before the tracker loads are replayed, **after consent resolves**.
- `zappush.track()` is safe at any time; calls are buffered and replayed.
- Only these methods hold consent: `setConsent({ analytics_storage, ad_storage,
  ad_user_data, ad_personalization })` and `withdrawConsent()`. Both are
  **tracker-script only** and follow Google Consent Mode v2.
- Contact keys read (inside `user_data`): `email`, `phone_number`,
  `address.{first_name,last_name,city,region,postal_code,country}`. Flat
  equivalents (`phone`, `first_name`, `zip`, `state`, `country`, …) are read at
  the **top level of a push**, or directly by `track()`.
- Phone must be **E.164 with country code**; country is **ISO 3166-1 alpha-2**.
- `value` must be a **number > 0** or the conversion reports no revenue.
  `transaction_id` is what dedupes a refreshed confirmation page, and is sent to
  Meta as `order_id`.
- **What reaches Meta on the seven product events** — a fixed set, everything
  else dropped: `value`, `currency`, `content_ids` (from `item_id`),
  `num_items` (from `quantity`), `content_type`, `order_id`, `coupon`.
  For item events, `item_id` is **required**.
- On every other event all metadata is forwarded **except** contact fields, which
  Zappush sends separately as Meta user data.

### 2.3 Event name reference (authoritative mapping)

| GA4 name (push) | Zappush name (`track`) | Meta event |
| --- | --- | --- |
| `view_item` | `product_viewed` | `ViewContent` |
| `add_to_cart` | `product_added_to_cart` | `AddToCart` |
| `remove_from_cart` | `product_removed_from_cart` | custom |
| `view_cart` | `cart_viewed` | custom |
| `begin_checkout` | `checkout_started` | `InitiateCheckout` |
| `add_shipping_info` | `checkout_shipping_info_submitted` | `AddShippingInfo` |
| `add_payment_info` | `payment_info_submitted` | `AddPaymentInfo` |
| `purchase` | `checkout_completed` | `Purchase` |
| `search` | `search_performed` | `Search` |
| `generate_lead` | `generate_lead` | `Lead` |
| — | `schedule` | `Schedule` |
| `sign_up` | `user_signed_up` | `CompleteRegistration` |
| `refund` | `order_refunded` | custom |

`lead_generated` / `verify_lead` are legacy and being deprecated — new code uses
`generate_lead`.

Explicitly documented restriction on lead payloads: *"Do not add the service,
treatment, consultation type, offer, or any other description of what the lead
asked for."* That is consistent with our existing rule, and this plan never sends
plan names, condition names, or form answers as event metadata.

## 3. Target architecture

```
React (App Router)
  ├─ ZappushTracker  (consent gate + setConsent/withdrawConsent)
  ├─ DataLayer adapter  → window.dataLayer.push (GA4 shape, GA4 names)
  ├─ Zappush SDK adapter → window.zappush.track (Zappush names, flat, contact fields)
  └─ existing Meta Pixel/CAPI path (unchanged, or explicitly retired — see §7)
                                     │
                        Zappush gateway (owns Meta pixel + CAPI)
                                     │
                              Meta Events Manager
```

### 3.1 Files

| File | Action | Purpose |
| --- | --- | --- |
| `app/layout.tsx` | edit | Install snippet in `<head>` **behind the consent gate**; add `<ZappushTracker/>` |
| `components/ZappushTracker.tsx` | **new** | Loads the script, drives `setConsent`/`withdrawConsent`, owns SPA page-view hand-off |
| `lib/zappush.ts` | **new** | Thin, SSR-safe adapter over `window.zappush` + the push shape |
| `lib/dataLayer.ts` | **new** | `pushEvent()` with `ecommerce: null` clearing and `event` validation |
| `lib/tracking-consent.ts` | **new** | Single source of truth for granted/denied; emits changes |
| `lib/analyticsConfig.ts` | **new** | Event registry: trigger, canonical name, payload, DL name, SDK name, Meta name, dedup key |
| `lib/pixel.ts`, `lib/meta-funnel.ts`, `lib/meta-policy.ts`, `lib/meta-config.ts` | edit **only if §7 option B is chosen** | Otherwise untouched |
| `next.config.js` | edit | CSP for `https://api.zappush.com` (+ `connect-src`) |
| `app/privacy-policy/page.tsx` | edit | Disclose Zappush, its Meta pixel/CAPI, and external-transfer scope |
| `tests/zappush-integration.test.cjs` | **new** | Guards: snippet verbatim, no duplicate install, no health data in payloads, dedup, consent |
| `tests/meta-audit.test.cjs` | edit **only if §7 option B** | Currently asserts CAPI stays blocked |
| `docs/meta-health-audit.md` | edit | Cross-reference this plan and its outcome |

### 3.2 Payload policy (the part that preserves current safeguards)

The Zappush client sees **real** values (GA4 needs them, and Meta needs
`content_ids` to attribute). Everything is therefore decided at the **event
boundary**, not by blanking names:

| Field | Sent to Zappush | Sent to Meta (via Zappush) |
| --- | --- | --- |
| `value`, `currency` (INR), `num_items` | yes | yes |
| `transaction_id` / `order_id` | yes (opaque DB order id) | yes |
| `coupon` code | **no** — a coupon code can encode a condition; the discount is already reflected in `value` | no |
| `item_id` | **stable opaque id** (see below) | yes — `item_id` is required on item events |
| `item_name` | **descriptive of the goods, not the condition** (see below) | **no** — only `item_id` becomes `content_ids`; on non-product events Zappush drops `items` entirely |
| `email`, `phone` (E.164) | yes, via `track()` / `user_data` | yes, as hashed user data |
| condition names, plan names, form answers, service names | **never** — documented vendor restriction | never |
| card numbers, CVV, tokens, passwords | **never** | never |

**`item_name` decision.** The current CMS product names are condition-revealing
(`"PCOD Care"`, `"Thyroid …"`, `"Weight Loss Plan - …"`). Because `item_id` is
required on item events but also flows to Meta, the plan is:

- Emit a **stable opaque `item_id`** derived from the existing `planName` slug
  (e.g. `dtps-plan-<hash>`), minted once per plan, stored in
  `lib/checkout-catalog.ts` — never re-minted, so attribution stays continuous.
- Emit `item_name` as a **non-condition label** (e.g. `"Nutrition Programme"` /
  `"Diet Plan — 10 days"`), used for Zappush dashboard reporting only. This does
  not change anything a customer sees: the visible cart, order and receipt keep
  their real names, exactly as the current implementation already does.

This is the smallest change that satisfies "use stable product identifiers" and
"satisfy the vendor contract" while keeping the health signal out of third-party
systems. It is **not** a substitute for the eligibility decision in §0.

**Session capping (recommended).** The documented behaviour is that Zappush
persists contact fields for the session and attributes later events to the same
person. For a health site that means one email plus our item data can link a
whole browsing session. Recommendation: send contact fields **on the purchase and
lead events only**, never on `view_item`-class events, and document the trade-off
(worse match rate on upper-funnel events).

## 4. Event implementation matrix

Everything below is the Phase-4/5 "one row per event" deliverable. `DL` = GA4
shape pushed via `window.dataLayer.push`. `SDK` = `window.zappush.track(name, …)`.

| # | Trigger | Canonical event | Payload (real data source) | DataLayer | Zappush SDK | Meta | Dedup strategy | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Initial load | `page_view` | path, title (no query string beyond allowlist) | *not pushed* — Zappush fires its own; **GA only** via existing `gaPageView` | — | `PageView` (Zappush-owned) | one initial view per load | T-A, T-B |
| 2 | SPA navigation | `page_view` | `usePathname()` | *not pushed* (documented: `page_view` is ignored) | `track('page_viewed')` only if the vendor's own route event does not cover it — **verify in T-C** | — | de-dupe by full path+query | T-B, T-C |
| 3 | Plan page mount | `view_item` | opaque `item_id`, `item_name`, `price`, `quantity:1`, `value=price`, `currency:'INR'` | `view_item` | `product_viewed` | `ViewContent` | once per route per session | T-B |
| 4 | "Buy Now" / plan select | `add_to_cart` → flushed as selection | single-product cart from `sessionStorage` | `add_to_cart` | `product_added_to_cart` | `AddToCart` | `meta:cart-selection` marker (reuse existing) | T-B |
| 5 | `/checkout` mount | `begin_checkout` | real cart value/`num_items` | `begin_checkout` | `checkout_started` | `InitiateCheckout` | one per checkout session id | T-B |
| 6 | Razorpay modal opened, order created | `add_payment_info` | `value = order.total` (DB), `payment_type` | `add_payment_info` | `payment_info_submitted` | `AddPaymentInfo` | key `api_<orderId>` | T-B |
| 7 | `/checkout/success` + **verified** DB order | `purchase` | `transaction_id = orderId`, `value = order.total` (discounted), `currency:'INR'`, `items[]` from DB | `purchase` | `checkout_completed` | `Purchase` | `transaction_id` + existing persistent marker + in-flight guard | T-F |
| 8 | Contact form success | `generate_lead` | `email`, `phone` (E.164) only | `generate_lead` | `generate_lead` | `Lead` | once per submission id | T-B |
| 9 | Multi-step lead form success | `generate_lead` | as above | `generate_lead` | `generate_lead` | `Lead` | once per submission id | T-B |
| 10 | Appointment success | `schedule` | `email`, `phone`, `first_name`, `last_name` | *not pushable* — `schedule` has no GA4 name | `schedule` | `Schedule` | once per appointment id | T-B |
| 11 | Contact form (secondary) | — | — | — | — | already `Contact` via existing pixel; **do not duplicate** | — | T-G |

Not implemented, with reasons in §1.1: `search`, `view_search_results`,
`view_cart`, `remove_from_cart`, `add_shipping_info`, `refund`, `sign_up`,
`login`, `view_item_list`, `select_item` (optional, no list UI).

### 4.1 Mapping the prompt's Phase-8 table

| Prompt row | Decision |
| --- | --- |
| Product viewed → `ViewContent` | implemented (row 3) |
| Add to cart → `AddToCart` | implemented (row 4) |
| Checkout started → `InitiateCheckout` | implemented (row 5) |
| Shipping info → `AddShippingInfo` | **not applicable** — no shipping step |
| Payment info → `AddPaymentInfo` | implemented (row 6) |
| Purchase → `Purchase` | implemented (row 7) |
| Lead captured → `Lead` | implemented (rows 8–9) |
| Appointment booked → `Schedule` | implemented (row 10) |
| Registration → `CompleteRegistration` | **not applicable** — no customer accounts |
| Search → `Search` | **not applicable** — no site search |

## 5. Deduplication design (Phase 5, 8)

Three independent sources can each emit a `Purchase`:

- **A.** the Zappush gateway (Meta pixel + CAPI), keyed by `transaction_id` /
  `order_id`;
- **B.** the server CAPI call already in
  [app/api/orders/route.ts](../app/api/orders/route.ts), keyed by
  `eventId = orderId`;
- **C.** the browser pixel path in [lib/pixel.ts](../lib/pixel.ts), keyed by
  `eventID = purchase_<orderId>`.

A and B dedupe against each other **only if** the identifiers coincide. Because
the gateway sends `order_id = transaction_id` and our server sends
`eventId = orderId`, and both emit the same Meta event name for the same
`order_id`, Meta's documented event-name + event-id/`order_id` matching should
collapse them — **but this is a Meta-side behaviour we cannot verify from the
repository.** It must be confirmed in Events Manager (Test D/E) or removed by
choosing §7 option B.

Unambiguous rules, independent of that uncertainty:

1. `Purchase` fires **only** on `/checkout/success` and **only** after
   `isVerifiedPurchase()` passes against the DB. The Razorpay callback must keep
   redirecting without emitting (already true, and guarded by a test).
2. `transaction_id`/`order_id` is always the **stable DB `orderId`** — never a
   payment id, never a timestamp.
3. The existing persistent marker (`localStorage`) plus the in-flight `Map` stay
   in place; they are what survive a thank-you-page refresh today.
4. Failed/unverified orders must never emit. `paymentStatus !== 'completed'` is
   disqualifying.
5. The gateway's `_zp` cross-app→browser attribution code is
   **vendor-controlled** and cannot be de-duplicated from our code. Note it in
   the privacy text.

## 6. Consent (Phase 9) — the blocking dependency

There is **no consent banner in this repository**, so "respect applicable consent
requirements" cannot be implemented against an existing system. The design is:

- `lib/tracking-consent.ts` is the single source of truth, exposing
  `getConsent()`, `setConsent(choice)`, `onConsentChange(fn)` and mapping to the
  four Consent Mode v2 keys Zappush reads.
- The Zappush **script is not loaded at all** until marketing consent is granted
  (script tag inserted by `ZappushTracker`). This is stronger than loading and
  then withdrawing, and it satisfies "avoid activating non-essential tracking
  before the necessary consent".
- On grant → `zappush.setConsent({ analytics_storage:'granted',
  ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted' })`.
  On withdrawal → `zappush.withdrawConsent()`.
- GA4 and Clarity are **already** unconditional today; the same gate should be
  extended to them in the same change, or the consent story is incoherent.
- Until a banner exists, the gate defaults to **denied**, meaning Zappush would
  load for nobody. That is a deliberate, reviewable state — not a bug.

**Requires the owner:** where the banner comes from, and what it says. Also
whether the site must support `setConsent` at all (Zappush only honours it when
"Consent management" is turned on for the store AND the banner does not already
speak Consent Mode v2).

## 7. The Meta-eligibility gate (Phase 7, 8) — one of two mutually exclusive paths

The prompt's Phase 7 step is to *inspect the Zappush Meta connection page and
complete the connection*. That page is `https://app.zappush.com/connect/meta/…`
and is **authenticated**. I have not opened it, have no credentials for it, and
will not attempt to bypass authentication. Its current state is therefore
**unknown**, and it is listed as a blocking manual step.

Once the owner has resolved eligibility, exactly **one** of these is implemented.
They must not both run.

### Option A — Zappush owns Meta (closest to the prompt)

- Install and feed the gateway per §4.
- **Retire our own Meta senders** to avoid duplicate delivery:
  `META_PIXEL_BOOTSTRAP` in [lib/meta-config.ts](../lib/meta-config.ts),
  the noscript pixel in [app/layout.tsx](../app/layout.tsx), the browser funnel
  in [lib/meta-funnel.ts](../lib/meta-funnel.ts), and the server `Purchase` in
  [app/api/orders/route.ts](../app/api/orders/route.ts).
- `tests/meta-audit.test.cjs` must be updated: it currently asserts the
  bootstrap is the only pixel and that CAPI stays blocked. Those assertions become
  false by design, and the test must be rewritten to assert the *new* invariants
  (single Meta source = Zappush; our code sends no Meta events).
- Requires: Zappush connection confirmed, and `test_event_code` handling for
  Test Events (never retained in production).

### Option B — keep our Meta path, Zappush as DataLayer/analytics only

- Install Zappush, feed the **DataLayer** and Zappush's **non-Meta** analytics.
- Keep our pixel allowlist, CAPI suppression, and payload filtering **exactly as
  they are**; no Meta event leaves through Zappush because none is configured.
- Existing tests and [meta-health-audit.md](./meta-health-audit.md) remain valid.
- Trade-off: only partial progress on the prompt (Phase 7/8 not satisfied).

**Recommendation: Option B now, Option A only after Meta eligibility is
confirmed in writing.** Option A is irreversible in the sense that once the
gateway is connected, events flow; and the repository cannot detect a
Meta-side restriction for us.

## 8. Security (Phase 9)

| Requirement | How it is met |
| --- | --- |
| CAPI token never in client code | The token lives in Zappush's account, entered in their UI — it never enters this repo. Our `META_CAPI_ACCESS_TOKEN` remains a server-only env var with no `NEXT_PUBLIC_` prefix |
| No secrets in bundles | No new `NEXT_PUBLIC_` variables except the tracker public key, which is not a secret |
| CSP | add `https://api.zappush.com` to `script-src` and `connect-src` in [next.config.js](../next.config.js) — currently it would be blocked |
| Validate payloads | `lib/analyticsConfig.ts` builds each payload from a fixed schema; no spread of cart/order objects into events |

## 9. Testing plan (Phase 10) — and what is honestly testable here

| Test | Procedure | Verifiable in this repo? |
| --- | --- | --- |
| A. Installation | static test: snippet load is gated, present once, URL unchanged; manual: Network tab shows one `zp_….js` | static **yes**, live **no** |
| B. DataLayer | unit test with a stubbed `window.pushes` for names/payloads/dedup; manual `window.dataLayer` inspection | **yes** |
| C. Zappush | vendor dashboard receipt — requires login | **no — owner** |
| D. Meta Pixel | Events Manager Test Events — requires account | **no — owner** |
| E. CAPI | controlled test conversion, check diagnostics/dedup | **no — owner** |
| F. Purchase flow | success / failure / abandon / refresh / repeat callback / duplicate webhook; assert exactly one `Purchase` | success, failure, refresh, repeat **yes**; live Razorpay **no** |
| G. Regression | existing suites: `npm test` (`tests/*.test.cjs|mjs`), `npx tsc --noEmit`, `npm run build`, plus manual nav/cart/forms | **yes** |

Tests that cannot be executed here will be reported as **BLOCKED**, not **PASSED**.

## 10. Phased execution checklist

Ordered so nothing irreversible happens before the owner's decisions.

**Gate 0 — owner decisions (blocks Phases 6–8 of the prompt)**

- [ ] **D1** Is Meta/Zappush tracking *permitted* for this domain and category?
      Confirm in Events Manager; note the audit's Health & Wellness report.
- [ ] **D2** Option A (Zappush owns Meta) or Option B (keep our Meta path)?
- [ ] **D3** Where does the consent banner come from, and what is its text?
- [ ] **D4** Confirm the store is billed in **INR** only (payloads are
      INR-only today).
- [ ] **D5** Provide Meta Pixel/Dataset ID + CAPI token **inside Zappush** (not
      in this repo), or confirm Option B.

## Phase A — implementation status (13 October 2026)

Phase A is **built**, not merely planned. What was actually done, and the two
places where it diverged from this document:

| Item | Status | Location |
| --- | --- | --- |
| Consent state, denied by default | Implemented | `lib/tracking-consent.ts` |
| Consent prompt (no banner existed) | Implemented | `ConsentBanner` in `components/ZappushTracker.tsx` |
| Tracker loaded only after a grant | Implemented | `components/ZappushTracker.tsx` |
| DataLayer adapter | Implemented | `lib/dataLayer.ts` |
| Zappush SDK adapter | Implemented | `lib/zappush.ts` |
| Event registry | Implemented | `lib/analyticsConfig.ts` |
| Safe plan identifiers/labels | Implemented | `lib/plan-labels.ts` |
| Event orchestration + dedup | Implemented | `lib/tracking.ts` |
| CSP entries | Implemented | `next.config.js` |
| Automated guards | Implemented | `tests/zappush-integration.test.cjs` |
| Meta forwarding | **Still blocked** | needs owner decisions D1/D2/D5 |

Two divergences worth recording:

1. **The consent prompt appears on every page load until a choice is made**, rather
   than being a "documented integration interface" only. A real CMP should
   replace it (`applyExternalConsent()` or the same cookie) — see
   [zappush-integration.md](./zappush-integration.md).
2. **The plans were not added to `lib/checkout-catalog.ts`.** One was already
   resolvable by its existing aliases (`2499-plan-1-monthly`). The others are the
   *client* cart objects, which are not validated against that catalogue on the
   checkout hot path, so rewriting them risked the live payment flow. The safe
   identifier is minted in `lib/plan-labels.ts` instead: the plan's existing slug
   is hashed, which needs no change to what the checkout reads or what the
   customer sees.



## Phase A checklist — all items complete

1. `lib/dataLayer.ts`, `lib/zappush.ts`, `lib/analyticsConfig.ts`,
   `lib/tracking-consent.ts`, `lib/consent-events.ts`, `lib/plan-labels.ts`,
   `lib/tracking.ts`, `components/ZappushTracker.tsx`. **Done**
2. CSP entries in `next.config.js`. **Done** (two entries: `script-src`,
   `connect-src`; no wildcard)
3. Tracker injection, gated on consent and de-duplicated. **Done** (in
   `components/ZappushTracker.tsx`, deliberately *not* in `app/layout.tsx`)
4. Opaque `item_id` minting. **Done** in `lib/plan-labels.ts` rather than
   `lib/checkout-catalog.ts` — see the divergence note above
5. Wire the events in §4 into the existing call sites. **Done** for
   plan view, add to cart (`storeCheckoutProducts`), begin checkout,
   add payment info, purchase, contact lead, lead form, appointment
6. `tests/zappush-integration.test.cjs`. **Done** — 35 guards, all passing
   (see `docs/zappush-integration.md` for the full verification table)

## Audit pass — 13 October 2026 (second review)

A read-only audit of the Phase A work found two real defects, both fixed:

| Finding | Severity | Fix |
| --- | --- | --- |
| Revocation was gated on our own `__dtpsZappushStubInstalled` flag, which the vendor script never sets. If the vendor file won the race, `withdrawConsent()` was skipped **and** the script was removed, leaving a live tracker with no way left to stop it | High | `removeTracker()` now calls `withdrawZappushConsent()` unconditionally (it is a safe no-op when absent) and revokes *before* removing the tag |
| The deny-list was case- and separator-sensitive, so `Email`, `PHONE_NUMBER`, `dateOfBirth`, `Condition` walked straight past it | Medium | Keys are normalised (lowercased, separators stripped) on both sides of the comparison; `dateofbirth`, `birthdate`, `sex`, `customerphone` and others added |

Also fixed: `npm run lint` was completely broken because `next lint` was removed
in Next 16. See `docs/zappush-integration.md` for the replacement and its
justification.

Confirmed by the audit and left alone: the consent gate cannot be bypassed; no
SSR/hydration divergence; existing Meta behaviour is untouched; no double-fire or
lost-conversion path in the purchase retry loop.

Explicitly recorded as **not** changed: GA4, Microsoft Clarity and the Meta pixel
remain unconditional. Only Zappush is consent-gated. This is now documented with
its consequence — a visitor who rejects still sends to GA4 and Clarity.

**Phase B — only after D1/D2 confirm Option A**

7. Retire our Meta senders (§7 Option A) and rewrite `tests/meta-audit.test.cjs`.
8. Manual Test Events run with a test event code, then remove the code.
9. Deploy through the existing workflow; verify receipt in Zappush and Events
   Manager; update `docs/meta-health-audit.md`.

## 11. Final report scaffold (Phase 12)

Status labels: **IMPLEMENTED** (code present) · **TESTED** (test executed and
passed) · **VERIFIED** (receiving system confirmed) · **BLOCKED**.

| Item | Status | Note |
| --- | --- | --- |
| Framework detected | IMPLEMENTED | Next.js 16 App Router + React 18 |
| Tracker installed | **BLOCKED** | pending D1/D3 |
| DataLayer adapter | not started | Phase A |
| Zappush SDK adapter | not started | Phase A |
| Events implemented | not started | matrix in §4 |
| Meta Pixel via Zappush | **BLOCKED** | pending D1/D2/D5 |
| CAPI via Zappush | **BLOCKED** | pending D1/D2/D5, and see §5 |
| Deduplication | not started | design in §5 |
| Consent & security | **BLOCKED** | no banner exists (D3) |
| Tests executed | none run | no code changed yet |
| Build/deploy | not run | no code changed yet |
| Missing credentials/permissions | — | Zappush dashboard, Meta Events Manager, Razorpay test mode |

## 12. Open risks

1. **A second Meta source re-opens a category-level restriction.** The audit
   documents it; a gateway does not remove it. Highest risk in the whole plan.
2. **Duplicate Purchase across three senders** until §7 Option A removes ours.
   Mitigated by `transaction_id`, not eliminated without Meta-side verification.
3. **The `_zp` cross-app URL code** is vendor-controlled and cannot be
   de-duplicated or excluded by our code.
4. **`item_id` is required on item events and flows to Meta.** Hence the opaque
   id in §3.2 — but it still makes the client's whole catalog visible to Meta, one
   id at a time.
5. **Zappush runs a second Meta pixel.** Even with Option A, that pixel is not
   ours to configure or turn off; its settings live in the vendor account.
6. **No consent banner** would make the whole feature inert (gate defaults to
   denied). That is intentional, and must not be "fixed" by defaulting to granted.
