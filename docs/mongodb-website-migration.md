# Website MongoDB migration

Target: the shared DTPS Atlas project, `DTPSCluster` (M10, AWS Mumbai).
Use a separate `dtps_website` database so application collections remain isolated.

## Server configuration

Keep credentials server-only, in ignored `.env.local` and the hosting secret store:

```text
MONGODB_URI=<Atlas connection URI with database credentials>
MONGODB_DATABASE=dtps_website
```

The staged website runtime is MongoDB-only: no Firestore initialization, SDK
imports, provider selection, or silent fallback. Do not deploy this version before
the transfer and connectivity checks succeed. The currently deployed previous
version uses Firestore with a temporary read-only cutover gate. Firebase Admin is a development-only
dependency for the source-export tools, not a website runtime dependency.

## Structure and cost

CMS and singleton settings share `website_content`, identified by namespace and
original document ID. Commerce, authentication and telemetry keep separate
collections because their records have different access, transaction and audit
requirements. Every record uses a full source document path as its MongoDB ID;
identical IDs in different logical collections cannot collide.

The server reuses one connection pool (maximum five connections per process,
zero minimum, idle expiry). Queries execute on MongoDB and retain existing API
response shapes. Payment lookup uses order/provider indexes instead of loading
the entire payment history. Blob media stays referenced by its existing URL.

No records are discarded to save storage. Payment attempts, historical customer
snapshots, questionnaire answers and independently edited content remain intact.
Exact Firestore timestamp precision and field-type metadata are retained alongside
MongoDB values. No automatic retention/TTL policy is enabled.

## Export and verification

Run a dry run first with the exact configured source project and database:

```sh
node --env-file=.recovery/firestore-source.env --env-file=.env.local scripts/migrate-website-to-mongodb.mjs \
  --project dtps-2cbac --source-database dtps-native-staging \
  --target-database dtps_website
```

The source is explicitly checked against configured credentials. Enumeration
includes all website namespaces, `_websiteAdminState`, and nested subcollections,
including children of missing parent records. Unrelated application collections
are excluded. Backups and manifests are written into ignored `.recovery/` with
restricted local permissions. Output contains counts and hashes, never document
contents or credentials.

`--accelerated-source` uses the public Firestore v1 APIs with explicit 1,000-entry
pages, including missing parent documents. All pagination tokens and all descendant
collections are still exhausted. Enumeration concurrency is bounded at 64.

Add `--execute` to import after source and target are verified. Existing conflicting
target data stops the operation. `--refresh-source` permits updating a previously
imported record only if it has not changed independently in MongoDB. The importer
does not delete source or destination records. It verifies each record's canonical
hash, namespace counts, and a second source scan before reporting success.

Pause production website writes for final reconciliation and cutover. A copying
pass cannot establish that writes arriving afterward have been included. Confirm
the production Firebase project/database independently: the named database above
is the local configuration, not proof of the hosting configuration.

The tested `WEBSITE_MIGRATION_READ_ONLY=true` bridge pauses API mutations and
side-effecting authentication/bootstrap reads while retaining public content and
media reads. Confirm the live response header `x-website-migration: read-only`
before asserting `--source-quiesced`. Keep the bridge active until the Mongo-only
release is verified, and remove the flag to resume normal operation.

If a source changed during the initial copy, use `--reconcile-backup <manifest>`
with `--source-quiesced --execute`. This validates the protected backup, performs
one fresh complete recursive scan, updates only unchanged-owned target records,
and verifies every final hash/count. Source deletions stop reconciliation; no
record is silently discarded. The write-pause assertion does not freeze unrelated
external writers, so ensure no other system is writing website namespaces.

For a complete snapshot exported while writes remain paused, `--import-backup
<manifest> --source-quiesced --execute` imports without another source scan.
It requires the saved quiescence assertion and validates all record hashes,
paths and namespace counts before writing. If submissions have resumed since
the export, this snapshot is no longer current: reconcile with a fresh paused
source scan instead of treating an old snapshot as final.

`scripts/verify-public-cutover.mjs --capture .recovery/public-baseline.json`
records hashes for 11 public APIs. After deployment, use `--verify` with the
same file to verify unchanged catalog, media references and page settings.
This public check does not replace the full private-record verification.

After import, create the website query indexes and run compatibility tests against
MongoDB, then configure hosting MongoDB variables and verify checkout, payment
verification, admin login, CMS reads/writes, forms, telemetry and media. Retain
the source and export for rollback. Remove obsolete FIREBASE_* and FIRESTORE_NATIVE_*
credentials from the hosting environment only after verified cutover; keep the
protected source-export configuration offline. Rolling back to the previous
Firestore-backed release after new MongoDB writes requires reconciling those writes.

The user upgraded this cluster from Free to M10 with backups enabled. Keep the
protected export too, and monitor combined website/application storage before
migrating the application into the same cluster. Database pooling and targeted
indexes are retained on M10; no additional cluster or duplicated media is needed.

## Current status

Implementation is ready locally; production has not switched to MongoDB. Both
complete exports contain 12,869 records across 13 website namespaces. The second
export completed all parent/descendant checks under the production write pause;
all 12,869 canonical hashes match the initial backup. No source data was deleted.

The final export is `.recovery/mongo-2026-10-09T20-12-58-536Z/manifest.json`.
The initial export excluded 85 application collections; the later source root
inventory contained 84. Unrelated application records were never copied.

Atlas reports the M10 upgrade complete, but every officially published node under
`fav0awp.mongodb.net` presents a certificate for `*.suatj13.mongodb.net`.
Connections fail with `ERR_TLS_CERT_ALTNAME_INVALID`. Certificate verification
must not be disabled to work around this. No website records have been imported.
The temporary website write pause was removed using a redeployment of the
existing Firestore-backed release. Deployment `dpl_2u6qu9FZ4N7LzXamF6Tk9fiBAfqu`
was verified READY on `dtpoonamsagar.com`; authentication reads return 200 and
an invalid order action returns 400, with no migration header. All 11 public
API hashes still match. The export is marked `sourceWritesResumedAt`; a new
paused reconciliation is required before cutover after Atlas repairs connectivity.

Validation: 73 local tests passed, one explicitly opt-in live test skipped, and
the production Webpack build/typecheck passed. A live Mongo adapter check passed
before the M10 upgrade; the expanded post-upgrade first-write test and final
deployment remain blocked. No paid checkout was performed during testing.
