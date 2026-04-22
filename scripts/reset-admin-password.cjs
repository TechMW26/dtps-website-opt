/* eslint-disable */
/**
 * Reset (or create) the admin login password.
 *
 * Usage:
 *   node scripts/reset-admin-password.cjs <email> <newPassword>
 *
 * Example:
 *   node scripts/reset-admin-password.cjs admin@dtpoonamsagar.com 'Admin@Login2025'
 *
 * Requires MONGODB_URI to be set (reads .env / .env.local automatically).
 */

// Minimal .env loader (avoid extra deps).
const fs = require('fs');
const path = require('path');
function loadEnv(file) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let [, k, v] = m;
    if (process.env[k]) continue;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    process.env[k] = v;
  }
}
loadEnv('.env.local');
loadEnv('.env');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const [, , emailArg, passwordArg, nameArg] = process.argv;

if (!emailArg || !passwordArg) {
  console.error('Usage: node scripts/reset-admin-password.cjs <email> <newPassword> [name]');
  process.exit(1);
}

const email = emailArg.toLowerCase().trim();
const password = passwordArg;
const name = nameArg || 'Admin';

if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in environment.');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(uri);
    const Admin =
      mongoose.models.Admin ||
      mongoose.model(
        'Admin',
        new mongoose.Schema(
          {
            email: { type: String, unique: true, lowercase: true, trim: true, required: true },
            password: { type: String, required: true, select: false },
            name: { type: String, required: true },
            role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
          },
          { timestamps: true }
        )
      );

    const hash = await bcrypt.hash(password, 12);

    const existing = await Admin.findOne({ email });
    if (existing) {
      existing.password = hash;
      // bypass the pre-save hook (it would re-hash) by using updateOne
      await Admin.updateOne({ _id: existing._id }, { $set: { password: hash } });
      console.log(`Password reset for ${email}`);
    } else {
      await Admin.create({ email, password: hash, name, role: 'superadmin' });
      console.log(`Created new superadmin ${email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
