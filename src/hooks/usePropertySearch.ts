import { useState, useCallback } from 'react';
import { DatabaseService, PropertyWithSavings, SearchFilters } from '@/services/databaseService';

export interface PropertySearchState {
  properties: PropertyWithSavings[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  hasMore: boolean;
}

export interface PropertySearchOptions {
  useAIMatching?: boolean;
  sortBy?: 'price' | 'savings' | 'score' | 'date';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export const usePropertySearch = () => {
  const [state, setState] = useState<PropertySearchState>({
    properties: [],
    loading: false,
    error: null,
    totalResults: 0,
    hasMore: false
  });

  /**
   * AI-powered property matching based on user preferences and behavior
   */
  const applyAIMatching = useCallback((
    properties: PropertyWithSavings[], 
    userPreferences?: {
      budget?: number;
      preferredLocations?: string[];
      minBedrooms?: number;
      propertyTypes?: string[];
      prioritizeSavings?: boolean;
    }
  ): PropertyWithSavings[] => {
    if (!userPreferences) return properties;

    return properties
      .map(property => {
        let aiScore = property.recommendationScore;
        
        // Boost score based on user preferences
        if (userPreferences.budget && property.price <= userPreferences.budget) {
          aiScore += 10;
        }
        
        if (userPreferences.preferredLocations?.some(loc => 
          property.city.toLowerCase().includes(loc.toLowerCase())
        )) {
          aiScore += 15;
        }
        
        if (userPreferences.minBedrooms && property.bedrooms >= userPreferences.minBedrooms) {
          aiScore += 5;
        }
        
        if (userPreferences.propertyTypes?.includes(property.propertyType)) {
          aiScore += 8;
        }
        
        if (userPreferences.prioritizeSavings && property.savingsPercentage > 7) {
          aiScore += 20;
        }
        
        return {
          ...property,
          aiMatchScore: Math.min(100, aiScore)
        };
      })
      .sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
  }, []);

  /**
   * Search properties with optional AI matching
   */
  const searchProperties = useCallback(async (
    filters: SearchFilters = {},
    options: PropertySearchOptions = {}
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let properties = await DatabaseService.searchProperties(filters);
      
      // Apply AI matching if enabled
      if (options.useAIMatching) {
        // In a real implementation, you would get user preferences from context/store
        const mockUserPreferences = {
          budget: filters.maxPrice,
          preferredLocations: filters.location ? [filters.location] : ['Austin', 'Dallas'],
          minBedrooms: filters.bedrooms,
          propertyTypes: filters.propertyType ? [filters.propertyType] : undefined,
          prioritizeSavings: filters.minSavings !== undefined
        };
        
        properties = applyAIMatching(properties, mockUserPreferences);
      }
      
      // Apply sorting
      if (options.sortBy) {
        properties.sort((a, b) => {
          let aValue: number, bValue: number;
          
          switch (options.sortBy) {
            case 'price':
              aValue = a.price;
              bValue = b.price;
              break;
            case 'savings':
              aValue = a.potentialSavings;
              bValue = b.potentialSavings;
              break;
            case 'score':
              aValue = a.recommendationScore;
              bValue = b.recommendationScore;
              break;
            case 'date':
              aValue = new Date(a.listingDate).getTime();
              bValue = new Date(b.listingDate).getTime();
              break;
            default:
              return 0;
          }
          
          return options.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        });
      }
      
      // Apply pagination
      const offset = options.offset || 0;
      const limit = options.limit || properties.length;
      const paginatedProperties = properties.slice(offset, offset + limit);
      const hasMore = offset + limit < properties.length;
      
      setState({
        properties: paginatedProperties,
        loading: false,
        error: null,
        totalResults: properties.length,
        hasMore
      });
      
      return paginatedProperties;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search properties';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [applyAIMatching]);

  /**
   * Load more properties (for pagination)
   */
  const loadMore = useCallback(async (
    filters: SearchFilters = {},
    options: PropertySearchOptions = {}
  ) => {
    if (state.loading || !state.hasMore) return;
    
    const newOffset = state.properties.length;
    const moreProperties = await searchProperties(filters, {
      ...options,
      offset: newOffset
    });
    
    setState(prev => ({
      ...prev,
      properties: [...prev.properties, ...moreProperties],
      hasMore: newOffset + moreProperties.length < prev.totalResults
    }));
  }, [state.loading, state.hasMore, state.properties.length, searchProperties]);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setState({
      properties: [],
      loading: false,
      error: null,
      totalResults: 0,
      hasMore: false
    });
  }, []);

  /**
   * Get saved properties (mock implementation)
   */
  const getSavedProperties = useCallback(async (): Promise<PropertyWithSavings[]> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Mock implementation - in reality, this would fetch from user's saved properties
      const allProperties = await DatabaseService.getPropertiesWithSavings(0);
      const savedProperties = allProperties.slice(0, 2); // Mock: first 2 properties are "saved"
      
      setState(prev => ({
        ...prev,
        properties: savedProperties,
        loading: false,
        totalResults: savedProperties.length,
        hasMore: false
      }));
      
      return savedProperties;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get saved properties';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  return {
    // State
    properties: state.properties,
    loading: state.loading,
    error: state.error,
    totalResults: state.totalResults,
    hasMore: state.hasMore,
    
    // Actions
    searchProperties,
    loadMore,
    clearSearch,
    getSavedProperties
  };
};