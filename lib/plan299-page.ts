export type Plan299Alignment = 'left' | 'center' | 'right';
export type Plan299CardPosition = 'left' | 'right';
export type Plan299BackgroundPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface Plan299PageSettings {
  _id?: string;
  key?: string;
  heroLayoutVersion: number;
  showTextContent: boolean;
  showPricingCard: boolean;
  showPlanBanner: boolean;
  useCustomBackground: boolean;
  desktopBackgroundImage: string;
  mobileBackgroundImage: string;
  backgroundColor: string;
  backgroundPositionDesktop: Plan299BackgroundPosition;
  backgroundPositionMobile: Plan299BackgroundPosition;
  overlayColor: string;
  overlayOpacity: number;
  showEyebrow: boolean;
  eyebrowText: string;
  eyebrowColor: string;
  headingLine1Prefix: string;
  headingLine1Highlight: string;
  headingLine2Prefix: string;
  headingLine2Highlight: string;
  headingLine2Suffix: string;
  headingColor: string;
  highlightColor: string;
  description: string;
  descriptionColor: string;
  showResultBadge: boolean;
  resultPrefix: string;
  resultValue: string;
  resultSuffix: string;
  resultTextColor: string;
  resultValueColor: string;
  resultBorderColor: string;
  resultBackgroundColor: string;
  showHeroButton: boolean;
  heroButtonText: string;
  heroButtonLink: string;
  heroButtonBackgroundColor: string;
  heroButtonTextColor: string;
  textAlignment: Plan299Alignment;
  cardPosition: Plan299CardPosition;
  heroMinHeightDesktop: number;
  heroMinHeightMobile: number;
  heroPaddingDesktop: number;
  heroPaddingMobile: number;
  cardMaxWidth: number;
  cardOffsetXDesktop: number;
  cardOffsetYDesktop: number;
  cardOffsetXMobile: number;
  cardOffsetYMobile: number;
  showCardBadge: boolean;
  showCardFeatures: boolean;
  showCardDuration: boolean;
  showCardBuyButton: boolean;
  cardSectionTitle: string;
  cardButtonText: string;
  cardButtonLink: string;
  cardBackgroundColor: string;
  cardButtonBackgroundColor: string;
  cardHeadingColor: string;
  cardMutedColor: string;
  cardFeatureCount: number;
  updatedAt?: string;
}

export const DEFAULT_PLAN_299_SETTINGS: Plan299PageSettings = {
  heroLayoutVersion: 4,
  showTextContent: true,
  showPricingCard: true,
  showPlanBanner: true,
  useCustomBackground: false,
  desktopBackgroundImage: '',
  mobileBackgroundImage: '',
  backgroundColor: '#014e4e',
  backgroundPositionDesktop: 'center',
  backgroundPositionMobile: 'center',
  overlayColor: '#014e4e',
  overlayOpacity: 0,
  showEyebrow: false,
  eyebrowText: 'Personalised weight-loss plan',
  eyebrowColor: '#f9d67b',
  headingLine1Prefix: 'Guaranteed',
  headingLine1Highlight: 'Weight Loss',
  headingLine2Prefix: 'with',
  headingLine2Highlight: 'Ghar Ka Khana',
  headingLine2Suffix: 'Diet Plan',
  headingColor: '#ffffff',
  highlightColor: '#ff8a14',
  description: '',
  descriptionColor: '#ffffff',
  showResultBadge: true,
  resultPrefix: 'Up to',
  resultValue: '5',
  resultSuffix: 'kgs in a month',
  resultTextColor: '#ffffff',
  resultValueColor: '#ff8a14',
  resultBorderColor: '#ffffff',
  resultBackgroundColor: '#014e4e',
  showHeroButton: false,
  heroButtonText: 'Start Your Journey',
  heroButtonLink: '#plan-offer',
  heroButtonBackgroundColor: '#ff8a14',
  heroButtonTextColor: '#ffffff',
  textAlignment: 'center',
  cardPosition: 'right',
  heroMinHeightDesktop: 560,
  heroMinHeightMobile: 740,
  heroPaddingDesktop: 12,
  heroPaddingMobile: 32,
  cardMaxWidth: 350,
  cardOffsetXDesktop: 0,
  cardOffsetYDesktop: 0,
  cardOffsetXMobile: 0,
  cardOffsetYMobile: 0,
  showCardBadge: true,
  showCardFeatures: true,
  showCardDuration: true,
  showCardBuyButton: true,
  cardSectionTitle: "What you'll get:",
  cardButtonText: 'Buy Now',
  cardButtonLink: '/checkout',
  cardBackgroundColor: '#ffffff',
  cardButtonBackgroundColor: '#ff8a14',
  cardHeadingColor: '#1f2937',
  cardMutedColor: '#6b7280',
  cardFeatureCount: 5,
};

export function isSafePlan299Url(value: string, allowEmpty = true) {
  if (!value) return allowEmpty;
  if (value.startsWith('#')) return true;
  if (value.startsWith('/') && !value.startsWith('//')) return true;

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
