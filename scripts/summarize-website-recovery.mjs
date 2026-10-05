import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const directory = '.recovery/transactions';
const state = JSON.parse(await readFile(`${directory}/state.json`, 'utf8'));
const media = JSON.parse(await readFile('.recovery/website-media-report.json', 'utf8'));
const files = (await readdir(directory)).filter(name => /^order_.*\.json$/.test(name)).sort();
const digest = createHash('sha256');
let paidOrders = 0, payments = 0;
const statuses = {};
for (const filename of files) {
  const body = await readFile(`${directory}/${filename}`, 'utf8');
  const record = JSON.parse(body);
  if (`${record.order.id}.json` !== filename) throw new Error('Order identity mismatch');
  if (record.payments.some(payment => payment.order_id !== record.order.id)) throw new Error('Payment association mismatch');
  if (record.order.status === 'paid') paidOrders++;
  payments += record.payments.length;
  statuses[record.order.status] = (statuses[record.order.status] || 0) + 1;
  digest.update(filename).update(body);
}
const report = {
  capturedAt: new Date().toISOString(),
  media: { verified: media.verified, legacyImagesRecovered: media.legacyImagesRecovered },
  transactions: { websiteOrders: files.length, paidOrders, payments, statuses, providerOrdersScanned: state.scanned, ordersScanComplete: state.complete, paymentsScanComplete: state.paymentsComplete === true, sha256: digest.digest('hex') },
  databaseBackupRecovered: false,
  identification: 'Orders match the website checkout UUID receipt and customer-name/email note format. Review attribution and missing fields before importing into active website collections.',
  missingData: ['Original product selections and catalog', 'Addresses and city', 'Original subtotal and discount breakdown', 'Leads not recorded in Razorpay', 'Database-only blog text and page settings'],
  productionWebsiteChanged: false,
};
await writeFile('.recovery/recovery-summary.json', JSON.stringify(report, null, 2), { mode: 0o600 });
console.log(JSON.stringify(report, null, 2));
