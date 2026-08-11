export type PopupFrequency = 'every_load' | 'session' | 'daily';
export type PopupImageFit = 'contain' | 'cover';

export interface PopupSettings {
  _id?: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage: string;
  pages: string[];
  isActive: boolean;
  displayDelayMs: number;
  displayFrequency: PopupFrequency;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  startAt: string;
  endAt: string;
  priority: number;
  showPhoneField: boolean;
  phonePlaceholder: string;
  ctaText: string;
  redirectUrl: string;
  openInNewTab: boolean;
  successMessage: string;
  successDelayMs: number;
  dismissOnOverlay: boolean;
  showCloseButton: boolean;
  desktopMaxWidth: number;
  imageFit: PopupImageFit;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
  overlayOpacity: number;
  createdAt?: string;
  updatedAt?: string;
}

export const POPUP_PAGE_OPTIONS = [
  { value: '*', label: 'All pages' },
  { value: 'home', label: 'Home' },
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'pcod', label: 'PCOD' },
  { value: 'therapeutic', label: 'Therapeutic Plans' },
  { value: 'wedding', label: 'Wedding Plans' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'contact', label: 'Contact' },
  { value: 'blog', label: 'Blog' },
] as const;

export const DEFAULT_POPUP_SETTINGS: PopupSettings = {
  title: 'Unlock this special offer',
  subtitle: 'Enter your mobile number and our team will help you get started.',
  image: '',
  mobileImage: '',
  pages: ['home'],
  isActive: true,
  displayDelayMs: 400,
  displayFrequency: 'every_load',
  showOnDesktop: true,
  showOnMobile: true,
  startAt: '',
  endAt: '',
  priority: 0,
  showPhoneField: true,
  phonePlaceholder: '10-digit mobile number',
  ctaText: 'Claim Offer',
  redirectUrl: '',
  openInNewTab: false,
  successMessage: "Thank you! We'll contact you shortly.",
  successDelayMs: 900,
  dismissOnOverlay: true,
  showCloseButton: true,
  desktopMaxWidth: 860,
  imageFit: 'contain',
  accentColor: '#ff850b',
  surfaceColor: '#ffffff',
  textColor: '#172033',
  overlayOpacity: 72,
};

export function withPopupDefaults(popup: Partial<PopupSettings>): PopupSettings {
  return { ...DEFAULT_POPUP_SETTINGS, ...popup };
}
