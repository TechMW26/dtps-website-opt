import 'server-only';
import { getWebsiteDatabase } from './website-database';

/** Prices and sellability always come from the restored server catalogue. */
export async function resolveCheckoutProducts(input: unknown) {
  if (!Array.isArray(input) || input.length === 0 || input.length > 20) throw new Error('Select between 1 and 20 plans.');
  const snapshot = await getWebsiteDatabase().collection('websitePricing').where('isActive', '==', true).get();
  const plans = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id })) as Array<Record<string, any>>;
  return input.map(item => {
    if (!item || typeof item.id !== 'string') throw new Error('Invalid plan. Please select your plan again.');
    const plan = plans.find(plan => {
      const slug = String(plan.planName).toLowerCase().replace(/\s+/g, '-');
      const cleanSlug = String(plan.planName).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const aliases = [plan._id, `${plan.page}-${slug}`, `${plan.page}-${cleanSlug}`];
      if (plan._id === 'weight-loss-1-month-2499') aliases.push('2499-plan-1-monthly');
      return aliases.includes(item.id);
    });
    const quantity = Number(item.quantity ?? 1);
    if (!plan || plan.pricePending || !Number.isFinite(plan.price) || plan.price <= 0) throw new Error('This plan is unavailable. Please select another plan.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error('Invalid plan quantity.');
    return { id: plan._id, name: String(plan.planName), duration: String(plan.duration || ''), price: Number(plan.price), quantity };
  });
}
