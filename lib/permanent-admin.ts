import Admin from '@/models/Admin';

type PermanentAdminConfig = {
  email: string;
  password: string;
  name: string;
};

function pickFirst(...values: Array<string | undefined>) {
  for (const value of values) {
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

export function getPermanentAdminConfig(): PermanentAdminConfig | null {
  const email = pickFirst(
    process.env.PERMANENT_ADMIN_EMAIL,
    process.env.ADMIN_EMAIL
  ).toLowerCase();

  const password = pickFirst(
    process.env.PERMANENT_ADMIN_PASSWORD,
    process.env.ADMIN_PASSWORD
  );

  const name = pickFirst(
    process.env.PERMANENT_ADMIN_NAME,
    process.env.ADMIN_NAME,
    'Permanent Admin'
  );

  if (!email || !password) {
    return null;
  }

  return {
    email,
    password,
    name,
  };
}

export async function ensurePermanentAdminExists() {
  const config = getPermanentAdminConfig();
  if (!config) {
    return null;
  }

  const existing = await Admin.findOne({ email: config.email }).select('+password');

  if (!existing) {
    await Admin.create({
      email: config.email,
      password: config.password,
      name: config.name,
      role: 'superadmin',
      isPermanent: true,
    });
    return config.email;
  }

  let shouldSave = false;
  if (existing.role !== 'superadmin') {
    existing.role = 'superadmin';
    shouldSave = true;
  }
  if (!existing.isPermanent) {
    existing.isPermanent = true;
    shouldSave = true;
  }
  if (existing.name !== config.name) {
    existing.name = config.name;
    shouldSave = true;
  }

  if (shouldSave) {
    await existing.save();
  }

  return config.email;
}
