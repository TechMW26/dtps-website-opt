// API utility functions for fetching data from MongoDB

const noStoreRequestInit: RequestInit = { cache: 'no-store' };

export interface Pricing {
  _id: string;
  planName: string;
  price: number;
  originalPrice: number;
  duration: string;
  durationLabel: string;
  features: Array<{ text: string; included: boolean }>;
  badge: string;
  badgeColor: string;
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  category: 'weight-loss' | 'pcod' | 'new-wedding-plan' | 'therapeutic-diet-plans';
  popular: boolean;
  isActive: boolean;
}

export interface Recognition {
  _id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
  page: string;
  isFeatured: boolean;
  isActive: boolean;
}

export async function getPricingByPage(page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding'): Promise<Pricing[]> {
  try {
    const res = await fetch(`/api/pricing?page=${page}`, noStoreRequestInit);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.pricing?.filter((p: Pricing) => p.isActive) || [];
  } catch {
    return [];
  }
}

export async function getPricingByCategory(category: 'weight-loss' | 'pcod' | 'new-wedding-plan' | 'therapeutic-diet-plans'): Promise<Pricing[]> {
  try {
    const res = await fetch(`/api/pricing?category=${category}`, noStoreRequestInit);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.pricing?.filter((p: Pricing) => p.isActive) || [];
  } catch {
    return [];
  }
}

export async function getRecognitions(page?: string): Promise<Recognition[]> {
  try {
    const url = page ? `/api/recognitions?page=${page}` : '/api/recognitions';
    const res = await fetch(url, noStoreRequestInit);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.recognitions?.filter((r: Recognition) => r.isActive) || [];
  } catch {
    return [];
  }
}

export async function getAllPricing(): Promise<Pricing[]> {
  try {
    const res = await fetch('/api/pricing', noStoreRequestInit);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.pricing?.filter((p: Pricing) => p.isActive) || [];
  } catch {
    return [];
  }
}
