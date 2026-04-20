/* One-time script: delete all orders with createdAt before 2026-04-20 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set in .env.local'); process.exit(1); }

const cutoff = new Date('2026-04-20T00:00:00.000Z');

(async () => {
  await mongoose.connect(MONGODB_URI, { dbName: 'DTPS-Ecommerce' });
  const Order = mongoose.connection.collection('orders');

  const count = await Order.countDocuments({ createdAt: { $lt: cutoff } });
  console.log(`Orders before ${cutoff.toISOString()}: ${count}`);

  if (count === 0) {
    console.log('Nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  const result = await Order.deleteMany({ createdAt: { $lt: cutoff } });
  console.log(`Deleted: ${result.deletedCount} order(s).`);
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
