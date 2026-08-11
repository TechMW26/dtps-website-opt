'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { COUNTRIES, getCountry, validatePhone } from '@/lib/validation';
import { withPopupDefaults, type PopupSettings } from '@/lib/popup-settings';
import styles from './DynamicPopup.module.css';

interface DynamicPopupProps {
  page: string;
}

function frequencyKey(id: string) {
  return `dtps-popup-shown:${id}`;
}

function wasAlreadyShown(popup: PopupSettings) {
  if (!popup._id || popup.displayFrequency === 'every_load') return false;
  try {
    if (popup.displayFrequency === 'session') return sessionStorage.getItem(frequencyKey(popup._id)) === '1';
    return localStorage.getItem(frequencyKey(popup._id)) === new Date().toISOString().slice(0, 10);
  } catch {
    return false;
  }
}

function markShown(popup: PopupSettings) {
  if (!popup._id || popup.displayFrequency === 'every_load') return;
  try {
    if (popup.displayFrequency === 'session') sessionStorage.setItem(frequencyKey(popup._id), '1');
    else localStorage.setItem(frequencyKey(popup._id), new Date().toISOString().slice(0, 10));
  } catch {}
}

const CONFETTI_COLORS = ['#ff850b', '#ffb21c', '#008c5a', '#00a86b', '#ffffff', '#ffd166'];

function confettiValue(index: number, salt: number) {
  const value = Math.sin(index * 91.73 + salt * 37.11) * 10000;
  return value - Math.floor(value);
}

function PopupConfetti() {
  return (
    <div className={styles.confettiLayer} aria-hidden="true">
      {Array.from({ length: 84 }, (_, index) => {
        const width = 5 + confettiValue(index, 1) * 7;
        const height = 8 + confettiValue(index, 2) * 12;
        return (
          <span
            key={index}
            className={styles.confettiPiece}
            style={{
              '--confetti-left': `${confettiValue(index, 3) * 100}%`,
              '--confetti-delay': `${confettiValue(index, 4) * 650}ms`,
              '--confetti-duration': `${2600 + confettiValue(index, 5) * 1500}ms`,
              '--confetti-drift': `${-16 + confettiValue(index, 6) * 32}vw`,
              '--confetti-rotation': `${420 + confettiValue(index, 7) * 720}deg`,
              '--confetti-width': `${width}px`,
              '--confetti-height': `${height}px`,
              '--confetti-color': CONFETTI_COLORS[index % CONFETTI_COLORS.length],
              '--confetti-radius': index % 5 === 0 ? '50%' : index % 3 === 0 ? '3px' : '1px',
            } as CSSProperties}
          />
        );
      })}
    </div>
  );
}

export default function DynamicPopup({ page }: DynamicPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [popup, setPopup] = useState<PopupSettings | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryIso, setCountryIso] = useState('IN');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const country = useMemo(() => getCountry(countryIso), [countryIso]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function fetchPopup() {
      try {
        const response = await fetch(`/api/popups?action=getPopup&page=${encodeURIComponent(page)}`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || !data.popup) return;

        const nextPopup = withPopupDefaults(data.popup);
        const mobile = window.matchMedia('(max-width: 767px)').matches;
        if ((mobile && !nextPopup.showOnMobile) || (!mobile && !nextPopup.showOnDesktop) || wasAlreadyShown(nextPopup)) return;

        setPopup(nextPopup);
        timer = setTimeout(() => {
          if (cancelled) return;
          setShowPopup(true);
          markShown(nextPopup);
        }, nextPopup.displayDelayMs);
      } catch {
        if (!cancelled) setPopup(null);
      }
    }

    void fetchPopup();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [page]);

  useEffect(() => {
    if (!showPopup) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && popup?.showCloseButton) setShowPopup(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [popup?.showCloseButton, showPopup]);

  function redirect() {
    if (!popup?.redirectUrl) {
      setShowPopup(false);
      return;
    }
    if (popup.openInNewTab) window.open(popup.redirectUrl, '_blank', 'noopener,noreferrer');
    else window.location.assign(popup.redirectUrl);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!popup) return;
    if (!popup.showPhoneField) {
      redirect();
      return;
    }

    setPhoneError(null);
    const result = validatePhone(phoneNumber, countryIso);
    if (!result.ok) {
      setPhoneError(result.error || 'Enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      const search = new URLSearchParams(window.location.search);
      const sessionId = sessionStorage.getItem('dtps_sid') || '';
      const response = await fetch('/api/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveLead',
          phoneNumber,
          countryIso,
          page,
          popupId: popup._id,
          popupTitle: popup.title,
          sessionId,
          pageUrl: `${window.location.pathname}${window.location.search}`,
          referrer: document.referrer,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          utmSource: search.get('utm_source') || '',
          utmMedium: search.get('utm_medium') || '',
          utmCampaign: search.get('utm_campaign') || '',
          utmTerm: search.get('utm_term') || '',
          utmContent: search.get('utm_content') || '',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to submit your number');
      setSubmitted(true);
      setPhoneNumber('');
      window.setTimeout(redirect, popup.successDelayMs);
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || !showPopup || !popup) return null;

  const modal = (
    <div
      className={styles.popupOverlay}
      style={{ backgroundColor: `rgba(4, 18, 25, ${popup.overlayOpacity / 100})` }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && popup.dismissOnOverlay) setShowPopup(false);
      }}
    >
      {popup.showConfetti && <PopupConfetti />}
      <section
        className={styles.popupContainer}
        style={{ '--popup-width': `${popup.desktopMaxWidth}px`, '--popup-surface': popup.surfaceColor, '--popup-text': popup.textColor, '--popup-accent': popup.accentColor } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`popup-title-${popup._id}`}
      >
        {popup.showCloseButton && (
          <button className={styles.closeBtn} type="button" onClick={() => setShowPopup(false)} aria-label="Close offer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        )}

        <div className={styles.imageSection}>
          <picture>
            {popup.mobileImage && <source media="(max-width: 767px)" srcSet={popup.mobileImage} />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={popup.image} alt={popup.title || 'Special offer'} className={popup.imageFit === 'cover' ? styles.imageCover : styles.imageContain} />
          </picture>
        </div>

        <div className={styles.conversionPanel}>
          {!submitted ? (
            <form onSubmit={handleSubmit} className={styles.formSection}>
              <div className={styles.offerLabel}>Exclusive offer</div>
              <h2 id={`popup-title-${popup._id}`} className={styles.popupTitle}>{popup.title}</h2>
              {popup.subtitle && <p className={styles.popupSubtitle}>{popup.subtitle}</p>}

              {popup.showPhoneField && (
                <div>
                  <label className={styles.fieldLabel} htmlFor={`popup-phone-${popup._id}`}>Mobile number</label>
                  <div className={`${styles.phoneGroup} ${phoneError ? styles.phoneGroupError : ''}`}>
                    <select value={countryIso} onChange={(event) => { setCountryIso(event.target.value); setPhoneError(null); }} aria-label="Country code" className={styles.countrySelect}>
                      {COUNTRIES.map((item) => <option key={item.code} value={item.code}>{item.flag} {item.dialCode}</option>)}
                    </select>
                    <span className={styles.phoneDivider} aria-hidden="true" />
                    <input
                      id={`popup-phone-${popup._id}`}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder={popup.phonePlaceholder}
                      value={phoneNumber}
                      onChange={(event) => { setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, Math.max(...country.lengths))); setPhoneError(null); }}
                      className={styles.phoneInput}
                    />
                  </div>
                  {phoneError && <p className={styles.fieldError} role="alert">{phoneError}</p>}
                </div>
              )}

              <button type="submit" disabled={loading || (popup.showPhoneField && !phoneNumber)} className={styles.submitBtn}>
                {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
                {loading ? 'Submitting…' : popup.ctaText}
              </button>
              <p className={styles.privacyNote}>Your information is secure and will only be used to contact you about this offer.</p>
            </form>
          ) : (
            <div className={styles.successMessage} role="status">
              <span className={styles.successIcon}>✓</span>
              <h2>Request received</h2>
              <p>{popup.successMessage}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
