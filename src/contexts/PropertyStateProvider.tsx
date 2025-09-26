import React, { useState, useEffect, useCallback } from 'react'
import { Property } from '@/data/mockData'
import { toast } from 'sonner'
import { defaultSearchFilters, defaultUserPreferences, safeParseJSON, SearchFilters, UserPreferences } from './property-state-utils'
import { PartialOfferFormData } from '@/data/OfferFormTypes'
import { PropertyStateContext } from './property-state-context'
import { PropertyStateContextType } from './PropertyStateContextTypes'

export const PropertyStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [offerFormData, setOfferFormData] = useState<PartialOfferFormData>({});
  const [favoriteProperties, setFavoriteProperties] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [searchFilters, setSearchFiltersState] = useState<SearchFilters>(() =>
    safeParseJSON<SearchFilters>('apartmentiq-filters', defaultSearchFilters)
  )

  const [userPreferences, setUserPreferencesState] = useState<UserPreferences>(() =>
    safeParseJSON<UserPreferences>('apartmentiq-preferences', defaultUserPreferences)
  )

  useEffect(() => {
    const savedFavorites = safeParseJSON('apartmentiq-favorites', [] as string[])
    setFavoriteProperties(savedFavorites)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('apartmentiq-favorites', JSON.stringify(favoriteProperties))
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error)
      toast.error('Failed to save favorites')
    }
  }, [favoriteProperties])

  useEffect(() => {
    try {
      localStorage.setItem('apartmentiq-preferences', JSON.stringify(userPreferences))
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error)
      toast.error('Failed to save preferences')
    }
  }, [userPreferences])

  useEffect(() => {
    try {
      localStorage.setItem('apartmentiq-filters', JSON.stringify(searchFilters))
    } catch (error) {
      console.error('Error saving filters to localStorage:', error)
      toast.error('Failed to save search filters')
    }
  }, [searchFilters])

  const setSearchFilters = useCallback((filters: Partial<SearchFilters>) => {
    setSearchFiltersState((prev) => ({ ...prev, ...filters }))
    setHasUnsavedChanges(true)
  }, [])

  const setUserPreferences = useCallback((preferences: Partial<UserPreferences>) => {
    setUserPreferencesState((prev) => ({
      ...prev,
      ...preferences,
      lastActiveDate: new Date().toISOString(),
    }))
    setHasUnsavedChanges(true)
  }, [])

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavoriteProperties(prev => {
      const isFavorited = prev.includes(propertyId)
      const newFavorites = isFavorited ? prev.filter(id => id !== propertyId) : [...prev, propertyId]
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
      return newFavorites
    })
  }, [])

  const clearOfferFormData = useCallback(() => setOfferFormData({}), [])

  const resetSearchFilters = useCallback(() => setSearchFiltersState(defaultSearchFilters), [])

  const clearAllData = useCallback(() => {
    setSelectedProperty(null)
    setOfferFormData({})
    setFavoriteProperties([])
  setSearchFiltersState(defaultSearchFilters)
  setUserPreferencesState(defaultUserPreferences)
    setHasUnsavedChanges(false)

    localStorage.removeItem('apartmentiq-favorites')
    localStorage.removeItem('apartmentiq-preferences')
    localStorage.removeItem('apartmentiq-filters')

    toast.success('All data cleared')
  }, [])

  return (
    <PropertyStateContext.Provider
      value={{
        selectedProperty,
        setSelectedProperty,
        favoriteProperties,
        setFavoriteProperties,
        toggleFavorite,
        offerFormData,
        setOfferFormData,
        clearOfferFormData,
        searchFilters,
        setSearchFilters,
        resetSearchFilters,
        userPreferences,
        setUserPreferences,
        clearAllData,
        hasUnsavedChanges,
        setHasUnsavedChanges,
      }}
    >
      {children}
    </PropertyStateContext.Provider>
  )
}
