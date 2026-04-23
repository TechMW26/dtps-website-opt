// Shared form validation helpers + country-code phone validation.

export interface Country {
  code: string;        // ISO 2-letter
  name: string;
  dialCode: string;    // e.g. "+91"
  flag: string;        // emoji
  /** Allowed national-significant-number length(s), excluding dial code. */
  lengths: number[];
  /** Optional regex the national number must match. */
  pattern?: RegExp;
}

export const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India',          dialCode: '+91',  flag: '🇮🇳', lengths: [10],     pattern: /^[6-9]\d{9}$/ },
  { code: 'US', name: 'United States',  dialCode: '+1',   flag: '🇺🇸', lengths: [10] },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44',  flag: '🇬🇧', lengths: [10, 11] },
  { code: 'AE', name: 'UAE',            dialCode: '+971', flag: '🇦🇪', lengths: [9] },
  { code: 'CA', name: 'Canada',         dialCode: '+1',   flag: '🇨🇦', lengths: [10] },
  { code: 'AU', name: 'Australia',      dialCode: '+61',  flag: '🇦🇺', lengths: [9] },
  { code: 'SG', name: 'Singapore',      dialCode: '+65',  flag: '🇸🇬', lengths: [8] },
  { code: 'SA', name: 'Saudi Arabia',   dialCode: '+966', flag: '🇸🇦', lengths: [9] },
  { code: 'NZ', name: 'New Zealand',    dialCode: '+64',  flag: '🇳🇿', lengths: [8, 9, 10] },
  { code: 'DE', name: 'Germany',        dialCode: '+49',  flag: '🇩🇪', lengths: [10, 11] },
  { code: 'FR', name: 'France',         dialCode: '+33',  flag: '🇫🇷', lengths: [9] },
  { code: 'NP', name: 'Nepal',          dialCode: '+977', flag: '🇳🇵', lengths: [10] },
  { code: 'BD', name: 'Bangladesh',     dialCode: '+880', flag: '🇧🇩', lengths: [10] },
  { code: 'LK', name: 'Sri Lanka',      dialCode: '+94',  flag: '🇱🇰', lengths: [9] },
];

export const DEFAULT_COUNTRY_CODE = 'IN';

export const getCountry = (code: string): Country =>
  COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];

/** Strip all non-digit characters. */
export const digitsOnly = (v: string) => String(v || '').replace(/\D/g, '');

export interface PhoneValidationResult {
  ok: boolean;
  error?: string;
  /** E.164 form, e.g. "+919893027688" */
  e164?: string;
}

export function validatePhone(
  national: string,
  countryCode: string = DEFAULT_COUNTRY_CODE
): PhoneValidationResult {
  const country = getCountry(countryCode);
  const digits = digitsOnly(national);

  if (!digits) return { ok: false, error: 'Phone number is required' };
  if (!country.lengths.includes(digits.length)) {
    const expected = country.lengths.join(' or ');
    return { ok: false, error: `Enter a valid ${country.name} number (${expected} digits)` };
  }
  if (country.pattern && !country.pattern.test(digits)) {
    return { ok: false, error: `Enter a valid ${country.name} mobile number` };
  }
  return { ok: true, e164: `${country.dialCode}${digits}` };
}

// ---------- Generic field validators ----------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[A-Za-z][A-Za-z\s'.-]{0,49}$/;

export function validateEmail(v: string): string | null {
  const value = (v || '').trim();
  if (!value) return 'Email is required';
  if (value.length > 100) return 'Email is too long';
  if (!EMAIL_RE.test(value)) return 'Enter a valid email address';
  return null;
}

export function validateName(v: string, label = 'Name'): string | null {
  const value = (v || '').trim();
  if (!value) return `${label} is required`;
  if (value.length < 2) return `${label} must be at least 2 characters`;
  if (!NAME_RE.test(value)) return `${label} contains invalid characters`;
  return null;
}

export function validateRequired(v: string, label: string): string | null {
  if (!v || !String(v).trim()) return `${label} is required`;
  return null;
}

export function validateMessage(v: string, min = 5, max = 1000): string | null {
  const value = (v || '').trim();
  if (!value) return 'Message is required';
  if (value.length < min) return `Message must be at least ${min} characters`;
  if (value.length > max) return `Message must be under ${max} characters`;
  return null;
}

export function validateFutureDate(v: string): string | null {
  if (!v) return 'Date is required';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return 'Enter a valid date';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return 'Date must be today or later';
  return null;
}
