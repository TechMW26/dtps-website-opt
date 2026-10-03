/**
 * The whole site offers condition-related nutrition services. Renaming a URL,
 * hashing identifiers or sending an event through CAPI does not remove the
 * health inference. Browser events are explicitly allowlisted and filtered.
 * CAPI and arbitrary custom events remain disabled; enabling browser events
 * does not establish Meta approval for this data source.
 */
export function canSendMetaEvents(): boolean {
  return false;
}

// Browser actions only; CAPI and arbitrary custom event names stay disabled.
export function isAllowedMetaBrowserEvent(event: string): boolean {
  return ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout',
    'AddPaymentInfo', 'Purchase', 'Lead', 'Contact', 'Schedule'].includes(event);
}

/**
 * Defence in depth, not permission to send a health-related conversion.
 * Build a fresh allowlisted object: never spread cart/order data into Meta.
 * Omit names, catalog IDs (which may themselves contain names), categories,
 * item arrays, order references and arbitrary/nested fields entirely.
 */
export function sanitizeMetaCustomData(input: unknown): Record<string, number | string> {
  const result: Record<string, number | string> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return result;
  const data = input as Record<string, unknown>;
  if (typeof data.value === 'number' && Number.isFinite(data.value) && data.value >= 0) {
    result.value = data.value;
  }
  // This storefront bills in INR. Do not accept arbitrary strings as currency.
  if (data.currency === 'INR') result.currency = 'INR';
  if (typeof data.num_items === 'number' && Number.isSafeInteger(data.num_items) && data.num_items >= 0) {
    result.num_items = data.num_items;
  }
  return result;
}

/** Drop query strings/fragments and suppress condition-specific source URLs. */
export function sanitizeMetaSourceUrl(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return undefined;
    if (!['dtpoonamsagar.com', 'www.dtpoonamsagar.com'].includes(url.hostname)) return undefined;
    if (!['/', '/checkout', '/checkout/success'].includes(url.pathname)) return undefined;
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}
