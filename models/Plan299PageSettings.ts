import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPlan299PageSettings extends Document {
  key: 'global';
  heroLayoutVersion: number;
  showTextContent: boolean;
  showPricingCard: boolean;
  showPlanBanner: boolean;
  useCustomBackground: boolean;
  desktopBackgroundImage: string;
  mobileBackgroundImage: string;
  backgroundColor: string;
  backgroundPositionDesktop: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backgroundPositionMobile: 'center' | 'top' | 'bottom' | 'left' | 'right';
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
  textAlignment: 'left' | 'center' | 'right';
  cardPosition: 'left' | 'right';
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
  createdAt: Date;
  updatedAt: Date;
}

const Plan299PageSettingsSchema = new Schema<IPlan299PageSettings>(
  {
    key: { type: String, enum: ['global'], default: 'global', unique: true },
    heroLayoutVersion: { type: Number, min: 2, default: 3 },
    showTextContent: { type: Boolean, default: true },
    showPricingCard: { type: Boolean, default: true },
    showPlanBanner: { type: Boolean, default: true },
    useCustomBackground: { type: Boolean, default: false },
    desktopBackgroundImage: { type: String, default: '' },
    mobileBackgroundImage: { type: String, default: '' },
    backgroundColor: { type: String, default: '#014e4e' },
    backgroundPositionDesktop: { type: String, enum: ['center', 'top', 'bottom', 'left', 'right'], default: 'center' },
    backgroundPositionMobile: { type: String, enum: ['center', 'top', 'bottom', 'left', 'right'], default: 'center' },
    overlayColor: { type: String, default: '#014e4e' },
    overlayOpacity: { type: Number, min: 0, max: 100, default: 0 },
    showEyebrow: { type: Boolean, default: false },
    eyebrowText: { type: String, default: 'Personalised weight-loss plan', maxlength: 120 },
    eyebrowColor: { type: String, default: '#f9d67b' },
    headingLine1Prefix: { type: String, default: 'Guaranteed', maxlength: 120 },
    headingLine1Highlight: { type: String, default: 'Weight Loss', maxlength: 120 },
    headingLine2Prefix: { type: String, default: 'with', maxlength: 120 },
    headingLine2Highlight: { type: String, default: 'Ghar Ka Khana', maxlength: 120 },
    headingLine2Suffix: { type: String, default: 'Diet Plan', maxlength: 120 },
    headingColor: { type: String, default: '#ffffff' },
    highlightColor: { type: String, default: '#ff8a14' },
    description: { type: String, default: '', maxlength: 500 },
    descriptionColor: { type: String, default: '#ffffff' },
    showResultBadge: { type: Boolean, default: true },
    resultPrefix: { type: String, default: 'Up to', maxlength: 80 },
    resultValue: { type: String, default: '5', maxlength: 30 },
    resultSuffix: { type: String, default: 'kgs in a month', maxlength: 80 },
    resultTextColor: { type: String, default: '#ffffff' },
    resultValueColor: { type: String, default: '#ff8a14' },
    resultBorderColor: { type: String, default: '#ffffff' },
    resultBackgroundColor: { type: String, default: '#014e4e' },
    showHeroButton: { type: Boolean, default: false },
    heroButtonText: { type: String, default: 'Start Your Journey', maxlength: 80 },
    heroButtonLink: { type: String, default: '#plan-offer', maxlength: 500 },
    heroButtonBackgroundColor: { type: String, default: '#ff8a14' },
    heroButtonTextColor: { type: String, default: '#ffffff' },
    textAlignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
    cardPosition: { type: String, enum: ['left', 'right'], default: 'right' },
    heroMinHeightDesktop: { type: Number, min: 300, max: 1000, default: 560 },
    heroMinHeightMobile: { type: Number, min: 300, max: 1400, default: 680 },
    heroPaddingDesktop: { type: Number, min: 0, max: 160, default: 12 },
    heroPaddingMobile: { type: Number, min: 0, max: 120, default: 32 },
    cardMaxWidth: { type: Number, min: 280, max: 600, default: 350 },
    cardOffsetXDesktop: { type: Number, min: -400, max: 400, default: 0 },
    cardOffsetYDesktop: { type: Number, min: -300, max: 300, default: 0 },
    cardOffsetXMobile: { type: Number, min: -120, max: 120, default: 0 },
    cardOffsetYMobile: { type: Number, min: -300, max: 300, default: 0 },
    showCardBadge: { type: Boolean, default: true },
    showCardFeatures: { type: Boolean, default: true },
    showCardDuration: { type: Boolean, default: true },
    showCardBuyButton: { type: Boolean, default: true },
    cardSectionTitle: { type: String, default: "What you'll get:", maxlength: 100 },
    cardButtonText: { type: String, default: 'Buy Now', maxlength: 80 },
    cardButtonLink: { type: String, default: '/checkout', maxlength: 500 },
    cardBackgroundColor: { type: String, default: '#ffffff' },
    cardButtonBackgroundColor: { type: String, default: '#ff8a14' },
    cardHeadingColor: { type: String, default: '#1f2937' },
    cardMutedColor: { type: String, default: '#6b7280' },
    cardFeatureCount: { type: Number, min: 1, max: 20, default: 5 },
  },
  { timestamps: true }
);

const Plan299PageSettings: Model<IPlan299PageSettings> =
  mongoose.models.Plan299PageSettings ||
  mongoose.model<IPlan299PageSettings>('Plan299PageSettings', Plan299PageSettingsSchema);

export default Plan299PageSettings;
