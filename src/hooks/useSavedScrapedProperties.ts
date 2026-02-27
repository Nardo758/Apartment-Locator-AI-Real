import { useState, useCallback, useEffect } from 'react';
import type { ScrapedProperty } from '@/lib/savings-calculator';

const STORAGE_KEY = 'apartmentiq-saved-scraped';

export interface SavedPropertyData {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  min_rent?: number;
  max_rent?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  image_url?: string;
  website_url?: string;
  amenities?: string[];
  pet_policy?: string;
  specials?: string;
  concession_type?: string;
  concession_value?: number;
  effective_price?: number;
  sqft?: number;
  savedAt: string;
}

function loadSaved(): SavedPropertyData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSaved(items: SavedPropertyData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save properties to localStorage:', e);
  }
}

export function useSavedScrapedProperties() {
  const [saved, setSaved] = useState<SavedPropertyData[]>(loadSaved);

  useEffect(() => {
    const handler = () => setSaved(loadSaved());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isSaved = useCallback((propertyId: string) => {
    return saved.some(p => p.id === propertyId);
  }, [saved]);

  const toggleSaveScraped = useCallback((property: ScrapedProperty) => {
    setSaved(prev => {
      const exists = prev.some(p => p.id === property.id);
      const next = exists
        ? prev.filter(p => p.id !== property.id)
        : [...prev, {
            id: property.id,
            name: property.name,
            address: property.address,
            city: property.city,
            state: property.state,
            min_rent: property.min_rent,
            max_rent: property.max_rent,
            bedrooms_min: property.bedrooms_min,
            bedrooms_max: property.bedrooms_max,
            bathrooms_min: property.bathrooms_min,
            image_url: property.image_url,
            website_url: property.website_url,
            amenities: property.amenities as string[] | undefined,
            pet_policy: property.pet_policy,
            specials: property.special_offers,
            concession_type: property.concession_type,
            concession_value: property.concession_value,
            effective_price: property.effective_price,
            savedAt: new Date().toISOString(),
          }];
      persistSaved(next);
      return next;
    });
  }, []);

  const toggleSaveDashboard = useCallback((property: {
    id: string;
    name: string;
    address: string;
    baseRent: number;
    bedrooms: number;
    bathrooms: number;
    sqft?: number;
    imageUrl?: string;
    amenities?: string[];
  }) => {
    setSaved(prev => {
      const exists = prev.some(p => p.id === property.id);
      const next = exists
        ? prev.filter(p => p.id !== property.id)
        : [...prev, {
            id: property.id,
            name: property.name,
            address: property.address,
            city: '',
            min_rent: property.baseRent,
            max_rent: property.baseRent,
            bedrooms_min: property.bedrooms,
            bathrooms_min: property.bathrooms,
            sqft: property.sqft,
            image_url: property.imageUrl,
            amenities: property.amenities,
            savedAt: new Date().toISOString(),
          }];
      persistSaved(next);
      return next;
    });
  }, []);

  const removeSaved = useCallback((propertyId: string) => {
    setSaved(prev => {
      const next = prev.filter(p => p.id !== propertyId);
      persistSaved(next);
      return next;
    });
  }, []);

  return { saved, isSaved, toggleSaveScraped, toggleSaveDashboard, removeSaved };
}
