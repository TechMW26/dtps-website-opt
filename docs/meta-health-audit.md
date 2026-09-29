# Health audit remediation — 29 September 2026

The supplied Zappush PDF reports a category-level Health and Wellness restriction
and health inference through navigation, URLs and conversion events. Its one-page
export cuts off the individual violation details. This is a third-party report,
not confirmation of this account's current status in Meta Events Manager.

## Implemented

- Removed Meta Pixel bootstrap, automatic PageView and all four noscript pixels.
- Blocked all browser Meta standard/custom events and CAPI forwarding, including
  the server-side purchase sender. Old clients hitting `/api/meta/capi` receive a
  successful suppressed response before their payload is read.
- Removed Meta script, image and connection hosts from the CSP.
- Updated the privacy notice to describe the disabled Meta integration.
- Kept customer-facing programme names accurate. Abbreviated slugs are not a
  workaround for data-source restrictions; health-related conversion events
  remain blocked regardless of their URL or event name.

| Programme | Public URL | Former URL |
| --- | --- | --- |
| Weight loss | `/wldtps` | `/weight-loss-plan`, `/weight-loss` |
| PCOD | `/pcdtps` | `/pcod` |
| Therapeutic nutrition | `/tpdtps` | `/plans/therapeutic` |
| Thyroid support | `/thydtps` | `/thyroid`, `/thyroid-plan` |
| Wedding | `/wddtps` | `/plans/wedding` |
| 2499 programme | `/wldtps-2499` | `/weight-loss-plan-2499` |
| Enquiry form | `/wldtps/lead/1` | `/weight-loss/Leadform/1` |

Thyroid shares the existing therapeutic page and its `/tpdtps` canonical; there
was no separate thyroid product page. The form's thank-you path also redirects.
Redirects are permanent (308) and retain query parameters. Category IDs and
database content are unchanged. Existing CMS links normalize when rendered, and
old marquee targeting remains compatible. Sitemap and canonical URLs use the
new public paths.

## Verification and operational follow-up

Run `node --test tests/meta-audit.test.cjs`, `npx tsc --noEmit`, and `npm run build`.
After deploying, verify redirects and inspect browser requests on home, plan,
form, checkout and success pages: no Meta Pixel/CAPI requests should leave the
application. Meta conversion attribution and retargeting from these events will
stop. First-party order handling and other analytics integrations remain active.

Check the actual domain's category and diagnostics in Meta Events Manager and
update advertising destination URLs. No account review, restriction removal,
deployment, historical data deletion or external gateway change is performed
by this code. Any independently configured tracking gateway must be checked
separately. Re-enabling Meta needs a reviewed data-sharing design; abbreviation,
hashing or relabeling sensitive events is not sufficient.

## Follow-up screening and product-name protection

Meta custom data now uses a strict allowlist of numeric `value`, `num_items`, and
the storefront currency `INR`. Names, categories, item arrays, catalog IDs and
order references are omitted, including name fallbacks in item IDs. Checkout
event IDs use random identifiers instead of embedding product IDs. This does
not alter the customer cart, stored order, receipt or visible product names.
Both browser and server transports enforce the filter independently. Source
URLs discard query strings and fragments; condition-specific URLs are omitted.
All Meta transmission remains disabled. Even aggregate conversion values can
reveal health interests in context, so this filter does not authorize tracking.

Prioritized recommendations from code inspection (not a Meta account review):

1. Verify the actual data-source category, Diagnostics, blocked events and
   geography in Events Manager. Check whether the issue is data sharing, ad
   rejection or an account restriction before choosing a remedy. Request review
   only if the classification is inaccurate. Do not rename events or rotate
   pixels/domains to avoid a valid restriction.
2. If a permitted tracking design is agreed, keep automatic event detection and
   automatic advanced matching off. Audit any external gateway or tag manager;
   repo changes cannot disable independently configured integrations.
3. Review substantiation for `98% Of Our PCOD Clients See` in `app/pcod/page.tsx`,
   `Guaranteed Weight Loss` and `Upto 5 Kg in a Month` in
   `app/weight-loss-plan/page.tsx`, and `Can Be Reversed` in
   `app/plans/therapeutic/page.tsx`. Suggested copy: `Personalised nutrition
   support for your goals` and `Nutrition support alongside medical care`.
   Do not present an individual outcome as guaranteed. Review text embedded in
   hero/guarantee images as well. No marketing copy was changed in this pass.
4. Keep condition names and contact details out of campaign parameters and
   analytics event labels. Preserve essential checkout identifiers internally.
5. Review GA4 and Clarity separately: GA4 still receives item names/full page
   URLs, and Clarity initializes without an application-level consent check.
   Review consent and replay masking/exclusion on forms and checkout. This is
   separate from Meta blocking and has not been modified by this change.
6. Use first-party order reporting for reliable revenue totals while Meta
   measurement is paused; do not treat an absence of Meta purchases as an order
   processing failure.

Meta's public Business Tools and advertising policy pages could not be fetched
during this pass (login/rate-limit responses). Current account-specific rules
and eligibility still require verification in Events Manager. No claim that
these code changes will remove a category-level restriction is made.
