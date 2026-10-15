# Zappush / DataLayer integration

Implementation notes for the consent-gated Zappush tracker and the DataLayer
adapter. For the design rationale, the Meta eligibility question and the
blocked Meta work, see
[zappush-datalayer-meta-capi-plan.md](./zappush-datalayer-meta-capi-plan.md).

## What is implemented

| Piece | File | Notes |
| --- | --- | --- |
| Consent state | `lib/tracking-consent.ts` | Denied by default; first-party `dtps_consent` cookie; Consent Mode v2 shape |
| Consent prompt | `components/ZappushTracker.tsx` | Accessible, reject-as-prominent-as-accept, reopenable |
| Tracker loader | `components/ZappushTracker.tsx` | Injects the script **only** after a grant |
| DataLayer adapter | `lib/dataLayer.ts` | GA4 shape, `ecommerce: null` clearing, blocked-event list |
| Zappush SDK adapter | `lib/zappush.ts` | Flat metadata, contact-field validation, forbidden-key filter |
| Event registry | `lib/analyticsConfig.ts` | One row per event: trigger, GA4 name, Zappush name, dedup |
| Orchestrator | `lib/tracking.ts` | Dedup, consent check, fan-out to GA4 + DataLayer + Zappush |
| Safe plan labels | `lib/plan-labels.ts` | Opaque `item_id`, generic `item_name` |
| Route integration | `components/PixelTracker.tsx` | Plan view, begin_checkout, purchase |

## Consent posture of the OTHER trackers (important)

Zappush, GA4 and the Meta Pixel are all consent-gated. A visitor who denies — or
has not yet chosen — makes no request to `api.zappush.com`,
`connect.facebook.net`/`fbevents.js` or `googletagmanager.com`, and sends no event
to any of them. Microsoft Clarity remains host-gated (not consent-gated), so
sessions still flow to Clarity regardless of the visitor's choice.

| Tracker | Loaded | Gated on consent? | Where |
| --- | --- | --- | --- |
| Zappush | only after a full grant | **Yes** | `components/ZappushTracker.tsx` |
| GA4 (`G-R647JLBMXD`) | only after a full grant | **Yes** | `components/ConsentGatedTags.tsx` |
| Microsoft Clarity | when the host matches | **No** | `components/ClarityTracker.tsx` |
| Meta Pixel | only after a full grant | **Yes** | `components/ConsentGatedTags.tsx` |

Meta browser events (`trackEvent`) and GA4 events (`gaEvent`/`gaPageView`) are
individually gated in `lib/pixel.ts`, and the loader scripts themselves are
injected by `ConsentGatedTags` only after consent, so both the event *and* the
script request stop on denial. The Meta bootstrap no longer fires the initial
PageView; `PixelTracker` owns the initial and SPA page views, all gated by the
same consent check.

**Consequence for a granted/denied comparison:** a visitor who rejects the prompt
sends page views/ecommerce to none of Zappush, GA4 or Meta, and no analytics
cookie is set. Clarity sessions are the only measurement that still flows.
Revisiting consent (withdrawal, or a later re-grant) is driven by the same
`dtps_consent` cookie and is picked up by every tracker without a reload.

### What a real fix looks like

1. Wrap the GA4 scripts in the same consent check (load them from
   `ZappushTracker`-style gated code, or gate `gaEvent`/`gaPageView` on
   `isTrackingAllowed()`).
2. Gate `ClarityTracker` on `isTrackingAllowed()` and call
   `Clarity.consent(false)` on withdrawal.
3. Decide the Meta question separately: `canSendMetaEvents()` is `false`, so the
   browser pixel currently sends `PageView` only, under the health-audit
   restrictions in `docs/meta-health-audit.md`.

`trackPageView` fires at most once per `pathname + search` per tab, so a
go-back/go-forward or a re-render cannot produce a second page view. The vendor
tracker fires its own page view on a real document load; this path covers SPA
navigation only, and is skipped entirely when `page_viewed` is not one of the
events the vendor actually consumes.

## Cookie, storage and security attributes

| Item | Value | Notes |
| --- | --- | --- |
| Cookie name | `dtps_consent` | First-party only; the gate reads this, not localStorage |
| `Path` | `/` | Site-wide, so the gate works on every route |
| `Max-Age` | 400 days | Capped by `MAX_COOKIE_AGE_SECONDS`; `setConsent` accepts a shorter cap |
| `SameSite` | `Lax` | Set by JS, so `Lax` rather than `Strict` avoids surprising cross-site entry behavior |
| `Secure` | added on `https:` only | Derived from `location.protocol` so local `http` development still works |
| `HttpOnly` | **no** | Cannot be — the gate is client-side and must read it. It holds no secret |
| `SameSite=None` | not used | No third-party embedding requires it |

Storage keys this work owns, all namespaced:

| Key | Store | Purpose |
| --- | --- | --- |
| `dtps_consent` | cookie | The consent decision |
| `dtps:consent:policy-version` | localStorage | Audit trail of the agreed wording version |
| `dtps:once:<key>` | sessionStorage | Per-tab dedup marker, committed only on an accepted send |
| `dtps:checkout-session` | sessionStorage | One id per checkout visit, for `begin_checkout` dedup |

Everything is wrapped so a blocked or full store degrades to in-memory dedup
rather than throwing. No secret is stored in any of them; the consent cookie
carries a decision and a public policy version, nothing else.

## Consent: how the gate actually works

1. The tracker script is **not** in `app/layout.tsx`. It is created with
   `document.createElement('script')` inside `ZappushTracker` and only after
   `isTrackingAllowed()` returns true.
2. Consent defaults to denied. No cookie, a malformed cookie, a partial cookie,
   or a cookie written under a different policy version all resolve to denied.
3. The visitor chooses in the prompt. The choice is stored in the `dtps_consent`
   cookie, bounded at 400 days. `setConsent` also accepts a shorter lifetime for
   a caller that has already established the visitor's age.
4. On grant: the stub is installed, the script is fetched, and
   `zappush.setConsent()` is called with all four Consent Mode v2 keys.
5. On withdrawal: `zappush.withdrawConsent()` for events already in flight, and
   the script tag is removed. New events stop because every emitter checks
   consent first.
6. A choice made in another tab is picked up by polling the cookie, so a CMP that
   only writes cookies still works.

`watchConsentOutsideChanges` polls once a second. That is a deliberate trade:
it is the only way to notice a cookie change made outside React, and a
`setInterval` on a string comparison is cheaper than a listener the platform does
not provide.

### Replacing the built-in prompt with a real CMP

If a consent manager is added later, do **not** keep both. Either:

- let the CMP write the same `dtps_consent` cookie in the same JSON shape, or
- call `applyExternalConsent({ analytics_storage, ad_storage, ad_user_data,
  ad_personalization })` from it. A partial grant is downgraded to denied.

Then delete the `ConsentBanner` branch. If the CMP already implements Google
Consent Mode v2 and Zappush's own consent handling is switched on for the store,
`setZappushConsent` becomes redundant but harmless.

## Consent is not the same as legal compliance

This code implements a mechanism and a default. It does not establish that the
site's consent flow is legally sufficient, and it does not establish that the
domain is eligible to share this data with an advertising platform. Both remain
open items owned by the account holder — see the plan document, Gate 0.

## Event payloads: what leaves the browser

Every payload is built from a fixed allowlist. Nothing is spread from a cart,
order or form object.

| Value | Where it comes from | Notes |
| --- | --- | --- |
| `value` | the database order total, or the catalogue price | must be > 0 or Zappush reports no revenue |
| `currency` | `STORE_CURRENCY` (`INR`) | never taken from user input |
| `transaction_id` | the database `orderId` | the refresh-dedup key; sent to Meta as `order_id` |
| `item_id` | `dtps-<family>-<fnv1a hash>` | opaque; stable forever for a given plan |
| `item_name` | `Nutrition Programme — 10 days` etc. | generic; never the plan's own name |
| `email`, `phone` | the form, validated | SDK path only, never the shared DataLayer |

Explicitly never sent: coupon codes, discount amounts, `item_category`, the
visitor's message, the appointment service, and the lead form's age, gender,
height and weight. `lib/zappush.ts` drops these keys even if a call site adds
them, which is why the filter is enforced in the transport rather than trusted
to the caller.

### Why the plan identifier is hashed

Zappush documents that `item_id` is required on item events and is forwarded to
Meta as `content_ids`. The catalogue's own identifiers contain the condition
(`pcod-1-month`), so the raw value would put a health signal into every product
event. `lib/plan-labels.ts` hashes the slug instead. The visible cart, order and
receipt are unchanged.

## Duplicate-control

| Risk | Control |
| --- | --- |
| Thank-you page refresh | `transaction_id` plus the existing persistent marker in `lib/meta-funnel.ts` |
| React double-invoke / remount | `emitOnce()` in `lib/tracking.ts` — in-memory set plus a sessionStorage marker |
| A failed send burning the key | `emitOnce()` commits the key **only after the send was accepted**, so a transient failure (`zappushTrack` returning false because the SDK has not loaded yet) can still be retried |
| Reactivating a gone-back checkout | `dtps:checkout-session` in sessionStorage |
| `page_view` counted twice | never pushed to the DataLayer; Zappush fires its own on load, and SPA changes go through `track()` once per pathname |
| A second Purchase sender | `lib/tracking.ts` emits no GA4 and no Meta purchase; `lib/meta-funnel.ts` owns both |

`emitOnce()` is deliberately *transactional* rather than a plain "seen" set. A
plain set marks the key before the send, so one failed attempt would suppress
that conversion for the rest of the session with no retry — a silently lost
purchase or lead, not just a duplicate. Every emitter therefore returns the real
delivery result, and a caller can retry a `false`.

What this does not do: it cannot confirm Zappush *received* the event. A `true`
means the call was handed to the SDK (or queued by the stub). The only
authoritative confirmation is the vendor dashboard.

`trackVerifiedPurchase` is only reachable from the verified-order path in
`PixelTracker`, which itself only runs after `trackPurchaseForOrder` accepted the
order from `/api/orders`.

## Event semantics differ per destination — do not assume equivalence

The same business action means slightly different things in each system. This is
the "document the differences" requirement, and it matters for reporting.

| Event | DataLayer (GA4 shape) | Zappush SDK | Meta | Difference to know about |
| --- | --- | --- | --- | --- |
| Page view | **not pushed** | `page_viewed` | `PageView` (vendor-owned) | GA4 gets `page_view` via `gaPageView()`, not the DataLayer. Zappush ignores a pushed `page_view` and fires its own on load |
| Plan view | `view_item` | `product_viewed` | `ViewContent` | GA4/Zappush receive an opaque `item_id` and a generic `item_name` |
| Add to cart | `add_to_cart` | `product_added_to_cart` | `AddToCart` | Fired on selection, not from a cart UI — there is no cart |
| Checkout start | `begin_checkout` | `checkout_started` | `InitiateCheckout` | Fired once per checkout visit |
| Payment info | `add_payment_info` | `payment_info_submitted` | `AddPaymentInfo` | Fired when the Razorpay modal opens for a created order, not on card entry |
| Purchase | **not pushed** | `checkout_completed` | `Purchase` (via `meta-funnel`, CAPI suppressed) | GA4 and Meta purchase are owned by `lib/meta-funnel.ts`; only Zappush comes from `lib/tracking.ts` |
| Lead | `generate_lead` pushed, no contact fields | `generate_lead` with contact fields | `Lead` | Contact fields go ONLY on the SDK path; a push is world-readable |
| Appointment | **not pushed** | `schedule` | `Schedule` | `schedule` has no GA4 name, so a GTM data layer push can never emit it |
| Contact form | **not pushed** | `generate_lead` | `Contact` (existing pixel) | The existing browser pixel already sends `Contact`; Zappush adds the lead |

Practical consequence: **GA4 and Zappush conversion counts will not match Meta**,
because Meta custom data is stripped to `value`/`currency`/`num_items` by
`lib/meta-policy.ts` while GA4 and Zappush receive item identifiers. That is
intentional and pre-existing; do not "fix" it by loosening the Meta filter.

## Rollback

The change is additive and reversible. In reverse order of risk:

1. **Stop Zappush entirely, keep everything else.** Remove `<ZappushTracker />`
   from `app/layout.tsx`. The scripts, CSP entries and event calls become inert
   because nothing installs the stub or injects the file. No event is lost from
   GA4 or Meta, which never depended on this work.
2. **Stop Zappush and remove the prompt.** Also delete the consent prompt branch
   in `components/ZappushTracker.tsx` and the `dtps_consent` cookie will stop
   being written. Existing cookies are harmless and expire on their own.
3. **Stop the extra events only.** Remove the `track*(...)` calls added to
   `components/PixelTracker.tsx`, `components/checkout/CheckoutContent.tsx`,
   `components/contact/ContactForm.tsx`, `components/appointment/AppointmentForm.tsx`
   and `components/weight-loss/LeadFormMultiStep.tsx`. The `page` field added to
   the plan-page cart objects can stay — nothing reads it without those calls.
4. **Full revert.** `git checkout -- app/ components/ lib/ docs/ next.config.js package.json`
   plus deleting the untracked files listed under "Files" above. This work
   touched no database, no API route logic and no payment code.

The only non-additive edits to existing files are: the two CSP entries in
`next.config.js`, the `lint` script in `package.json`, `<ZappushTracker />` in
`app/layout.tsx`, the `page` field on plan-page cart objects, the `track*` calls
at the five business sites, and the privacy-policy and audit doc text.

## Manual verification in the Zappush dashboard

Code cannot confirm delivery. These steps require dashboard access and must be
run by the account holder.

1. Load the site in a normal (not incognito) tab and **accept** the consent
   prompt. Confirm the Network tab shows exactly one request to
   `https://api.zappush.com/s/zp_bcd40e532430663af84df043b9c5403d.js`.
2. Open **Zappush → Analytics → Sessions**. A session should appear within a few
   minutes. If nothing appears, the snippet or the CSP is wrong — check the
   console for a blocked-script error first.
3. Open **Zappush → Analytics → Events**. Confirm `page_viewed`, then navigate
   between two pages and confirm a second `page_viewed`.
4. Visit a plan page. Confirm `product_viewed` arrives with an `item_id`
   beginning `dtps-` and a generic `item_name`. It must **not** read "PCOD" or
   "Weight Loss".
5. Select a plan, reach `/checkout`, then open the Razorpay modal. Confirm
   `product_added_to_cart`, `checkout_started` and `payment_info_submitted`.
6. Complete a real test payment. Confirm `checkout_completed` carries the order
   id as `transaction_id` and the order total as `value`. **Refresh the
   confirmation page** and confirm the count does not increase.
7. Submit the contact form and book an appointment. Confirm `generate_lead` and
   `schedule`, and that neither carries the message body or the chosen service.
8. Reload with the prompt **rejected** (clear the site cookie first). Confirm no
   new Zappush session or event is recorded.

Meta forwarding stays off. Do not connect it in the dashboard without first
reading `docs/meta-health-audit.md`.

## Not implemented, and why

The brief's own instruction is not to add events that do not exist. This
application has no site search, no cart UI, no shipping step, no refund flow, no
customer accounts and no newsletter. `NOT_APPLICABLE_EVENTS` in
`lib/analyticsConfig.ts` records each omission with its reason.

## Verifying locally

With consent denied (the default) and the Network tab open, loading any page
must produce **no request to `api.zappush.com`**. Accept the prompt and reload:
one request to the tracker file, plus one `page_viewed` on load and one per SPA
navigation.

In the console:

```js
window.dataLayer        // GA4 pushes; no page_view, no purchase
window.zappush.q        // queued SDK calls before the file loaded
document.cookie         // dtps_consent only after an explicit choice
```

## Verification status

Run in this environment on 13 October 2026. Re-run after the audit pass below.

| Check | Command | Result |
| --- | --- | --- |
| New guards | `node --test tests/zappush-integration.test.cjs` | **35 pass, 0 fail** |
| Full suite | `npm test` | **118 pass, 1 skipped, 1 fail** — the failure is pre-existing and unrelated |
| Types | `npx tsc --noEmit` | **clean** |
| Production build | `npm run build` | **success** (61/61 pages) |
| Lint | `npm run lint` | **2 errors / 344 warnings**, both errors pre-existing; **none in the files touched here** |

The one failing test is `tests/mongo-migration.test.mjs:120`, which fails with
`ENOENT … mkdtemp '.recovery\test-migration-'` because the gitignored `.recovery/`
directory (the local secrets holder) is absent on this machine. It touches no
file from this change, and the same test failed before this work began.

The two lint errors are `react-hooks/rules-of-hooks` for a conditional
`useTheme()` in `app/admin/security/page.tsx` and `components/admin/ui.tsx`.
Both predate this work.

### The `npm run lint` script was broken, and is now fixed

`package.json` used `next lint`. **`next lint` was removed in Next 16** — it is
not in the command list, so the CLI parsed `lint` as a *directory* and failed
with `Invalid project directory provided, no such directory: …\lint`. That is
why linting could not run at all before.

Replaced with a direct ESLint invocation scoped to what the old command
effectively covered:

```
eslint . --ext .ts,.tsx --ignore-pattern next.config.js --ignore-pattern tailwind.config.ts
```

The two ignores are deliberate: those are CommonJS config files whose
`require()` calls trip `@typescript-eslint/no-require-imports`, a rule that
cannot apply to them. Excluding them reproduces the old coverage rather than
introducing two new failures to "fix".

Note for a follow-up: `eslint-config-next` is pinned at `^14.0.0` while Next is
`16.2.10`. Linting works, but the config is two majors behind and should be
upgraded separately (it may surface new rules).

Verified by the guards, not by a live service:

- The script URL, the queue stub and the CSP origins are byte-exact.
- The tracker is injected once and only after a complete, current grant.
- No emitter produces a Zappush call while consent is denied.
- Revocation is gated on the SDK capability, not on our own stub flag, and the
  script is not torn down before the revocation is attempted.
- A purchase requires a completed order and a positive total, and a second
  attempt for the same order is suppressed.
- A failed send does not burn the dedup key, so a retry can still deliver.
- Plan identifiers are opaque, unique and stable; plan names never appear.
- `age`, `gender`, `height`, `weight`, `dateOfBirth`, `goal`, `service`,
  `coupon`, `message` and free text cannot reach the wire, under any spelling —
  the deny-list is normalised so `dateOfBirth` and `date_of_birth` match.
- `page_view` and the product events can never be pushed to the DataLayer.
- `canSendMetaEvents()` is still `false`, the pixel allowlist is unchanged, and
  no file touched here references Meta.

**Not verified, and not claimed:** any live delivery. No event has been seen
arriving in the Zappush dashboard, and no Meta connection exists. A test passing
proves the code does what is asserted, not that a third party received anything.

## Known remaining gap: the payload filter is a deny-list

`sanitizeMetadata` (`lib/zappush.ts`) removes known-bad keys. It does **not**
allow-list, so a *novel* key name would pass through. This is pinned by a test
(`an unknown key is the allow-by-default gap…`) so the limitation is explicit
rather than implied.

It is not currently exploitable: every emitter in `lib/tracking.ts` builds its
payload from `buildContact()` and `toSafePlan()` rather than spreading a form,
cart or order object, and that is asserted by the source guards. The deny-list is
defence in depth behind that. If a future caller spreads a raw object, this
becomes a live leak — which is why the tests assert the construction pattern, not
just the filter.

## Blocked, and owned by the account holder

- Whether this domain may forward Zappush events to Meta at all. A gateway is a
  second data source and the audit records a category-level restriction.
- Meta Pixel/Dataset ID, CAPI token, business connection, and test event code.
  These are entered **inside the Zappush dashboard**, never in this repository.
- The Zappush-side store settings: consent management on/off, and the "after a
  shopper withdraws" behaviour.
- Confirmation that the tracker is receiving events, which needs dashboard access.
- Whether GA4, Clarity and the Meta pixel should also be consent-gated. GA4 and
  the Meta pixel are now consent-gated (see "Consent posture of the OTHER
  trackers" above); Clarity remains host-gated only and is left to the account
  holder to review.

Nothing in this repository can verify any of the above, and no claim is made that
it has been verified.
