'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import PhoneInput from '@/components/ui/PhoneInput';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateRequired,
  validateFutureDate,
  DEFAULT_COUNTRY_CODE,
} from '@/lib/validation';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  countryIso: string;
  phoneNumber: string;
  service: string;
  preferredDate: string;
}

const INITIAL: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  countryIso: DEFAULT_COUNTRY_CODE,
  phoneNumber: '',
  service: '',
  preferredDate: '',
};

export default function AppointmentForm() {
  const router = useRouter();
  const [data, setData] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validateAll = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    const fn = validateName(data.firstName, 'First name'); if (fn) e.firstName = fn;
    const ln = validateName(data.lastName, 'Last name'); if (ln) e.lastName = ln;
    const em = validateEmail(data.email); if (em) e.email = em;
    const sv = validateRequired(data.service, 'Service'); if (sv) e.service = sv;
    const dt = validateFutureDate(data.preferredDate); if (dt) e.preferredDate = dt;
    const ph = validatePhone(data.phoneNumber, data.countryIso); if (!ph.ok) e.phoneNumber = ph.error;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.errors) setErrors(json.errors);
        setServerError(json.message || 'Could not book appointment. Please try again.');
        setSubmitting(false);
        return;
      }

      try {
        sessionStorage.setItem(
          'lastAppointment',
          JSON.stringify({
            id: json.appointmentId,
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: `${data.countryIso === 'IN' ? '+91' : ''}${data.phoneNumber}`,
            service: data.service,
            preferredDate: data.preferredDate,
          })
        );
      } catch {}

      router.push(`/appointment/success?id=${json.appointmentId}`);
    } catch (err) {
      console.error(err);
      setServerError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  const inputCls = (err?: string) =>
    `w-full rounded-lg border ${err ? 'border-red-400' : 'border-gray-300'} bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition`;

  return (
    <form className="appointment-form space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => setField('firstName', e.target.value)}
            placeholder="First Name"
            className={inputCls(errors.firstName)}
            autoComplete="given-name"
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => setField('lastName', e.target.value)}
            placeholder="Last Name"
            className={inputCls(errors.lastName)}
            autoComplete="family-name"
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="Email Address"
          className={inputCls(errors.email)}
          autoComplete="email"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <PhoneInput
          countryCode={data.countryIso}
          number={data.phoneNumber}
          onCountryChange={(c) => setField('countryIso', c)}
          onNumberChange={(n) => setField('phoneNumber', n)}
          error={errors.phoneNumber}
          placeholder="Phone Number"
        />
      </div>

      <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Service</label>
          <select
            value={data.service}
            onChange={(e) => setField('service', e.target.value)}
            className={inputCls(errors.service)}
          >
            <option value="">Select Service</option>
            <option value="weight-loss">Weight Loss</option>
            <option value="pcod">PCOD Management</option>
            <option value="wedding">Wedding Plan</option>
            <option value="therapeutic">Therapeutic</option>
            <option value="general">General Consultation</option>
          </select>
          {errors.service && <p className="mt-1 text-xs text-red-500">{errors.service}</p>}
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Preferred Date</label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={data.preferredDate}
            onChange={(e) => setField('preferredDate', e.target.value)}
            className={inputCls(errors.preferredDate)}
          />
          {errors.preferredDate && <p className="mt-1 text-xs text-red-500">{errors.preferredDate}</p>}
        </div>
      </div>

      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Booking...' : 'Book An Appointment'}
      </Button>
    </form>
  );
}
