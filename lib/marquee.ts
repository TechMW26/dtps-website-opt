export type MarqueeAnimationMode = 'scroll' | 'static';
export type MarqueeDirection = 'left' | 'right';

export interface MarqueeItem {
  _id?: string;
  clientId?: string;
  text: string;
  icon: string;
  link: string;
  openInNewTab: boolean;
  enabled: boolean;
}

export interface MarqueeSettings {
  _id?: string;
  key?: string;
  isActive: boolean;
  items: MarqueeItem[];
  animationMode: MarqueeAnimationMode;
  direction: MarqueeDirection;
  speed: number;
  pauseOnHover: boolean;
  sticky: boolean;
  dismissible: boolean;
  edgeFade: boolean;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  pages: string[];
  startAt: string | null;
  endAt: string | null;
  backgroundColor: string;
  backgroundColorEnd: string;
  useGradient: boolean;
  textColor: string;
  heightDesktop: number;
  heightMobile: number;
  fontSizeDesktop: number;
  fontSizeMobile: number;
  fontWeight: number;
  iconSize: number;
  uppercase: boolean;
  ariaLabel: string;
  updatedAt?: string;
}

export const MARQUEE_PAGE_OPTIONS = [
  { label: 'All public pages', value: '*' },
  { label: 'Home', value: '/' },
  { label: 'Weight Loss', value: '/weight-loss-plan' },
  { label: 'PCOD', value: '/pcod' },
  { label: 'All Plans', value: '/plans' },
  { label: 'Contact', value: '/contact' },
  { label: 'Appointment', value: '/appointment' },
  { label: 'Good Read / Blog', value: '/blog' },
] as const;

export const DEFAULT_MARQUEE_SETTINGS: MarqueeSettings = {
  isActive: false,
  items: [
    {
      clientId: 'default-offer',
      text: 'Special offer — book your consultation today',
      icon: '✨',
      link: '/appointment',
      openInNewTab: false,
      enabled: true,
    },
  ],
  animationMode: 'scroll',
  direction: 'left',
  speed: 24,
  pauseOnHover: true,
  sticky: false,
  dismissible: false,
  edgeFade: true,
  showOnDesktop: true,
  showOnMobile: true,
  pages: ['*'],
  startAt: null,
  endAt: null,
  backgroundColor: '#005b57',
  backgroundColorEnd: '#00877f',
  useGradient: true,
  textColor: '#ffffff',
  heightDesktop: 40,
  heightMobile: 36,
  fontSizeDesktop: 14,
  fontSizeMobile: 12,
  fontWeight: 600,
  iconSize: 18,
  uppercase: false,
  ariaLabel: 'Current offers',
};

export function isSafeMarqueeLink(value: string) {
  if (!value) return true;
  if (value.startsWith('/') && !value.startsWith('//')) return true;

  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function marqueeMatchesPath(pathname: string, pages: string[]) {
  if (!pages.length || pages.includes('*')) return true;

  return pages.some((page) => {
    if (page === '/') return pathname === '/';
    return pathname === page || pathname.startsWith(`${page}/`);
  });
}
