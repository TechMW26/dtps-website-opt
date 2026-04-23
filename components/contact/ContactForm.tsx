'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import PhoneInput from '@/components/ui/PhoneInput';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateMessage,
  DEFAULT_COUNTRY_CODE,
} from '@/lib/validation';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  countryIso: string;
  phoneNumber: string;
  message: string;
}

const INITIAL: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  countryIso: DEFAULT_COUNTRY_CODE,
  phoneNumber: '',
  message: '',
};

export default function ContactForm() {
  const [data, setData] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validateAll = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    const fn = validateName(data.firstName, 'First name'); if (fn) e.firstName = fn;
    const ln = validateName(data.lastName, 'Last name'); if (ln) e.lastName = ln;
    const em = validateEmail(data.email); if (em) e.email = em;
    const ph = validatePhone(data.phoneNumber, data.countryIso); if (!ph.ok) e.phoneNumber = ph.error;
    const msg = validateMessage(data.message); if (msg) e.message = msg;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.errors) setErrors(json.errors);
        setServerError(json.message || 'Could not send your message. Please try again.');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setData(INITIAL);
    } catch (err) {
      console.error(err);
      setServerError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (err?: string) =>
    `w-full rounded-lg border ${err ? 'border-red-400' : 'border-gray-300'} bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition`;

  if (success) {
    return (
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-emerald-700">Thank you!</h3>
        <p className="mt-1 text-sm text-emerald-700/80">We have received your message and will get back to you soon.</p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-3 text-sm font-semibold text-[#FF850B] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <input
            type="text"
            placeholder="First Name"
            value={data.firstName}
            onChange={(e) => setField('firstName', e.target.value)}
            className={inputCls(errors.firstName)}
            autoComplete="given-name"
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Last Name"
            value={data.lastName}
            onChange={(e) => setField('lastName', e.target.value)}
            className={inputCls(errors.lastName)}
            autoComplete="family-name"
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
        </div>
      </div>

      <div className="form-group">
        <input
          type="email"
          placeholder="E-mail Address"
          value={data.email}
          onChange={(e) => setField('email', e.target.value)}
          className={inputCls(errors.email)}
          autoComplete="email"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      <div className="form-group">
        <PhoneInput
          countryCode={data.countryIso}
          number={data.phoneNumber}
          onCountryChange={(c) => setField('countryIso', c)}
          onNumberChange={(n) => setField('phoneNumber', n)}
          error={errors.phoneNumber}
          placeholder="Phone Number"
        />
      </div>

      <div className="form-group">
        <textarea
          placeholder="Message"
          rows={4}
          value={data.message}
          onChange={(e) => setField('message', e.target.value)}
          className={inputCls(errors.message)}
        />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
      </div>

      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
