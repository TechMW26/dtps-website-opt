// API utility functions for fetching data from MongoDB

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
    const res = await fetch(`/api/pricing?page=${page}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch pricing');
    }
    
    const data = await res.json();
    return data.pricing?.filter((p: Pricing) => p.isActive) || [];
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return [];
  }
}

export async function getPricingByCategory(category: 'weight-loss' | 'pcod' | 'new-wedding-plan' | 'therapeutic-diet-plans'): Promise<Pricing[]> {
  try {
    const res = await fetch(`/api/pricing?category=${category}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch pricing');
    }
    
    const data = await res.json();
    return data.pricing?.filter((p: Pricing) => p.isActive) || [];
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return [];
  }
}

export async function getRecognitions(page?: string): Promise<Recognition[]> {
  try {
    const url = page ? `/api/recognitions?page=${page}` : '/api/recognitions';
    const res = await fetch(url, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch recognitions');
    }
    
    const data = await res.json();
    return data.recognitions?.filter((r: Recognition) => r.isActive) || [];
  } catch (error) {
    console.error('Error fetching recognitions:', error);
    return [];
  }
}

export async function getAllPricing(): Promise<Pricing[]> {
  try {
    const res = await fetch('/api/pricing', {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch pricing');
    }
    
    const data = await res.json();
    return data.pricing?.filter((p: Pricing) => p.isActive) || [];
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return [];
  }
}
