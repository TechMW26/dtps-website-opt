# Website Firebase migration

The website server now uses Firebase Admin Firestore for its commerce and public-content paths. Configure the server with `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `FIREBASE_DATABASE_ID` (or the accepted `FIRESTORE_NATIVE_*` names). Keep these values server-only.

Collections used by the website are:

- `websitePricing`
- `websiteOrders`
- `websitePayments`
- `websiteCoupons`
- `websiteBlogs`
- `websiteLeads`
- `websiteFormSubmissions`
- `websitePageHeroes`, `websitePlanBanners`, `websiteSiteBanners`, `websitePopups`, `websiteMarquee`, `websitePlan299Settings`, `websiteAdmins`, `websiteSecurityLogs`, `websiteVisitors`
- `websiteRecognitions`, `websiteTestimonials`, `websiteSuccessStories`, `websiteTransformations`

Run `npm run firebase:seed` to create missing entries in the plan catalog from `data/firebase-website-plans.json`. Plans without prices in the supplied PDF are deliberately inactive and marked `pricePending`.

Razorpay recovery stays read-only until `.recovery/transactions/state.json` reports both `complete: true` and `paymentsComplete: true`. Then run `npm run firebase:import-recovery`; it writes idempotent `websiteOrders` and `websitePayments` documents and retains provider evidence plus explicit missing-field markers.

The old MongoDB collections could not be copied because the paid Atlas service was terminated and no website dump was available. The Firebase paths therefore preserve only verified source records; they do not fabricate missing catalog, address, discount, blog, or page-setting data.

## Recovery and validation

`data/recovery/content-seed.json` records the original Blob assets and recovery provenance. Fourteen visually audited composite before/after cards are restored into transformations and success stories. Eighteen article-media records remain unpublished drafts: the original article bodies and authors are unavailable. Individual photos are not paired speculatively.

`node scripts/seed-recovered-content.mjs` validates without writing. Execute only with `--execute --project <id> --database <id>` and matching server credentials. Existing records are preserved, including records with matching source assets.

Legacy database modules, models and retired migration scripts have been removed. Historical recovery evidence stays outside the release in ignored `.recovery/`. Existing public legacy image IDs continue to redirect to verified Blob media through `/api/images/[fileId]`.

Apply `website-firestore.indexes.json` with an operator account that can manage indexes. The application service account only needs data access. Checkout resolves active catalog prices server-side; payment verification updates the payment, order, and coupon use in one transaction and cannot downgrade a completed order.
