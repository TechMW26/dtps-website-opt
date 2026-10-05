/** Read-only Razorpay recovery. Keeps only orders matching this website's
 * UUID receipts and customer-name/email note shape; never creates payments.
 * No reconstructed catalog, address or discount values are invented.
 */
import Razorpay from 'razorpay';
import { mkdir, readFile, writeFile, readdir, rename } from 'node:fs/promises';
const api = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function readProvider(operation) {
  for (let attempt = 0; attempt < 8; attempt++) {
    await pause(500);
    try { return await operation(); }
    catch (error) {
      if (error.statusCode !== 429 || attempt === 7) throw new Error(`Razorpay recovery paused: HTTP ${error.statusCode || 'unknown'}`);
      await pause(Math.min(30000, 2000 * 2 ** attempt));
    }
  }
}
const directory = '.recovery/transactions';
await mkdir(directory, { recursive: true, mode: 0o700 });
const statePath = `${directory}/state.json`;
async function save(path, value) {
  await writeFile(`${path}.tmp`, JSON.stringify(value, null, 2), { mode: 0o600 });
  await rename(`${path}.tmp`, path);
}
let state;
try { state = JSON.parse(await readFile(statePath, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; state = { startedAt: new Date().toISOString(), to: Math.floor(Date.now() / 1000), scanned: 0, websiteOrders: 0, complete: false }; }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let pages = 0;
while (!state.complete && pages < 500) {
  const page = await readProvider(() => api.orders.all({ count: 100, skip: state.scanned, to: state.to }));
  for (const order of page.items) {
    if (!uuid.test(order.receipt || '') || typeof order.notes?.customerName !== 'string' || typeof order.notes?.customerEmail !== 'string' || order.notes?.clientId || order.notes?.paymentLinkId) continue;
    let existingPayments = [];
    try { existingPayments = JSON.parse(await readFile(`${directory}/${order.id}.json`, 'utf8')).payments || []; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    await save(`${directory}/${order.id}.json`, { source: 'razorpay', recoveredAt: new Date().toISOString(), order, payments: existingPayments, missingWebsiteFields: ['products', 'address', 'city', 'subtotal', 'discount', 'fullCouponDetails'] });
    state.websiteOrders++;
  }
  state.scanned += page.items.length;
  state.complete = page.items.length < 100;
  state.updatedAt = new Date().toISOString();
  await save(statePath, state);
  pages++;
  if (pages % 10 === 0 || state.complete) console.log(JSON.stringify(state));
}

// Scan payments in pages rather than making one provider request per order.
// Only records linked to the positively identified website orders are retained.
if (state.complete) {
  const ids = new Set((await readdir(directory)).filter(name => /^order_.*\.json$/.test(name)).map(name => name.slice(0, -5)));
  state.paymentScanned ||= 0;
  let paymentPages = 0;
  while (!state.paymentsComplete && paymentPages < 500) {
    const start = state.paymentScanned;
    const pages = await Promise.all([0, 1, 2].map(offset => readProvider(() => api.payments.all({ count: 100, skip: start + offset * 100, to: state.to }))));
    for (const page of pages) {
    for (const payment of page.items) {
      if (!ids.has(payment.order_id)) continue;
      const path = `${directory}/${payment.order_id}.json`;
      const record = JSON.parse(await readFile(path, 'utf8'));
      const byId = new Map(record.payments.map(item => [item.id, item]));
      byId.set(payment.id, payment);
      record.payments = [...byId.values()];
      await save(path, record);
    }
    state.paymentScanned += page.items.length;
    state.paymentsComplete = page.items.length < 100;
    state.updatedAt = new Date().toISOString();
    await save(statePath, state);
    paymentPages++;
    if (paymentPages % 10 === 0 || state.paymentsComplete) console.log(JSON.stringify(state));
    if (state.paymentsComplete) break;
    }
  }
}
