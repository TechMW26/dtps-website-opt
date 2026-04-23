'use client';

import { useState, useRef, useEffect } from 'react';
import { COUNTRIES, getCountry, digitsOnly } from '@/lib/validation';

interface PhoneInputProps {
  countryCode: string;
  number: string;
  onCountryChange: (code: string) => void;
  onNumberChange: (n: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
}

export default function PhoneInput({
  countryCode,
  number,
  onCountryChange,
  onNumberChange,
  placeholder = 'Phone number',
  error,
  className = '',
  inputClassName = '',
  id,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const country = getCountry(countryCode);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const maxLen = Math.max(...country.lengths);

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`}>
      <div
        className={`flex w-full items-stretch rounded-lg border ${
          error ? 'border-red-400' : 'border-gray-300'
        } bg-white focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition`}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 px-3 py-2 border-r border-gray-200 bg-gray-50 rounded-l-lg text-sm hover:bg-gray-100 transition"
          aria-label="Select country"
          aria-expanded={open}
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="font-medium text-gray-700">{country.dialCode}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-500" aria-hidden>
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={placeholder}
          value={number}
          onChange={(e) => onNumberChange(digitsOnly(e.target.value).slice(0, maxLen))}
          maxLength={maxLen}
          className={`flex-1 min-w-0 px-3 py-2 text-sm bg-transparent outline-none rounded-r-lg ${inputClassName}`}
        />
      </div>

      {open ? (
        <ul className="absolute z-30 mt-1 max-h-64 w-full min-w-[260px] overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {COUNTRIES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => {
                  onCountryChange(c.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-orange-50 ${
                  c.code === countryCode ? 'bg-orange-50 font-semibold' : ''
                }`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-gray-500">{c.dialCode}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
