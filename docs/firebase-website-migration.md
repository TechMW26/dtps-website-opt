# Historical website Firebase recovery

This records the previous recovery into Firebase, not the current runtime setup.
The staged website runtime uses only MongoDB; see `mongodb-website-migration.md`.
Do not run these historical Firebase write tools during or after MongoDB cutover.
Retain the source configuration offline only until the migration and rollback
window are complete.

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

The recovered plan catalog is recorded in `data/website-plans.json`. Plans without prices in the supplied PDF are deliberately inactive and marked `pricePending`.

The completed Razorpay recovery produced idempotent `websiteOrders` and `websitePayments` records, retaining provider evidence and explicit missing-field markers. Those records are included unchanged in the MongoDB transfer.

The old MongoDB collections could not be copied because the paid Atlas service was terminated and no website dump was available. The Firebase paths therefore preserve only verified source records; they do not fabricate missing catalog, address, discount, blog, or page-setting data.

## Recovery and validation

`data/recovery/content-seed.json` records the original Blob assets and recovery provenance. Fourteen visually audited composite before/after cards are restored into transformations and success stories. Eighteen article-media records remain unpublished drafts: the original article bodies and authors are unavailable. Individual photos are not paired speculatively.

The retired Firestore seed/import tools and index configuration have been removed from the website setup. Their historical versions remain recoverable through Git.

Legacy database modules, models and retired migration scripts have been removed. Historical recovery evidence stays outside the release in ignored `.recovery/`. Existing public legacy image IDs continue to redirect to verified Blob media through `/api/images/[fileId]`.

Checkout still resolves active catalog prices server-side. MongoDB payment verification updates the payment, order and coupon use in one transaction and cannot downgrade a completed order.
