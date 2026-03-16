'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './DynamicPopup.module.css';

interface PopupData {
  _id: string;
  title?: string;
  image: string;
  pages: string[];
}

interface DynamicPopupProps {
  page: string;
}

export default function DynamicPopup({ page }: DynamicPopupProps) {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const res = await fetch(`/api/popups?action=getPopup&page=${page}`);
        if (!res.ok) throw new Error('Failed to fetch popup');
        const data = await res.json();
        
        if (data.popup) {
          setPopup(data.popup);
          
          // Show popup after 3 seconds on every page load/refresh
          const timer = setTimeout(() => {
            setShowPopup(true);
          }, 3000);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error fetching popup:', error);
      }
    };

    fetchPopup();
  }, [page]);

  const handleClose = () => {
    setShowPopup(false);
    // Popup will show again on next page refresh - no storage
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveLead',
          phoneNumber,
          page
        })
      });

      if (!res.ok) throw new Error('Failed to save lead');
      
      setSubmitted(true);
      setPhoneNumber('');
      
      // Close popup after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showPopup || !popup) {
    return null;
  }

  return (
    <div className={styles.popupOverlay} onClick={handleClose}>
      <div className={styles.popupContainer} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>
          ✕
        </button>

        <div className={styles.popupContent}>
          <div className={styles.imageSection}>
            <Image
              src={popup.image}
              alt={popup.title || 'Special Offer'}
              fill
              className="object-cover"
              priority
            />
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className={styles.formSection}>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                required
                className={styles.phoneInput}
              />
              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className={styles.submitBtn}
              >
                {loading ? 'Saving...' : 'Claim'}
              </button>
            </form>
          ) : (
            <div className={styles.successMessage}>
              <p>Thank you! We'll contact you soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
