import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { toast } from 'sonner';

export interface NavigationOptions {
  replace?: boolean;
  state?: any;
  preventLoss?: boolean; // Prevent navigation if data loss would occur
}

export const useFlowNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navigateWithValidation = useCallback(
    (to: string, options: NavigationOptions = {}) => {
      const { replace = false, state, preventLoss = false } = options;
      
      // Check for unsaved changes if preventLoss is true
      if (preventLoss) {
        const hasUnsavedChanges = localStorage.getItem('hasUnsavedChanges') === 'true';
        if (hasUnsavedChanges) {
          const confirm = window.confirm(
            'You have unsaved changes. Are you sure you want to leave this page?'
          );
          if (!confirm) {
            return false;
          }
        }
      }
      
      try {
        navigate(to, { replace, state });
        return true;
      } catch (error) {
        console.error('Navigation error:', error);
        toast.error('Navigation failed. Please try again.');
        return false;
      }
    },
    [navigate]
  );
  
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const goHome = useCallback(() => {
    navigateWithValidation('/dashboard');
  }, [navigateWithValidation]);
  
  const goToOnboarding = useCallback(() => {
    navigateWithValidation('/program-ai');
  }, [navigateWithValidation]);
  
  const goToPropertyDetails = useCallback((propertyId: string) => {
    navigateWithValidation(`/property/${propertyId}`);
  }, [navigateWithValidation]);
  
  const goToGenerateOffer = useCallback((propertyId?: string) => {
    const url = propertyId ? `/generate-offer?property=${propertyId}` : '/generate-offer';
    navigateWithValidation(url);
  }, [navigateWithValidation]);
  
  const getCurrentRoute = useCallback(() => {
    return location.pathname;
  }, [location.pathname]);
  
  const isCurrentRoute = useCallback((route: string) => {
    return location.pathname === route;
  }, [location.pathname]);
  
  // Helper to build URL with query params
  const buildUrl = useCallback((path: string, params?: Record<string, string>) => {
    if (!params) return path;
    
    const searchParams = new URLSearchParams(params);
    return `${path}?${searchParams.toString()}`;
  }, []);
  
  return {
    navigate: navigateWithValidation,
    goBack,
    goHome,
    goToOnboarding,
    goToPropertyDetails,
    goToGenerateOffer,
    getCurrentRoute,
    isCurrentRoute,
    buildUrl,
    location
  };
};

// Hook for managing unsaved changes state
export const useUnsavedChanges = () => {
  const setHasUnsavedChanges = useCallback((hasChanges: boolean) => {
    localStorage.setItem('hasUnsavedChanges', hasChanges.toString());
  }, []);
  
  const clearUnsavedChanges = useCallback(() => {
    localStorage.removeItem('hasUnsavedChanges');
  }, []);
  
  const hasUnsavedChanges = useCallback(() => {
    return localStorage.getItem('hasUnsavedChanges') === 'true';
  }, []);
  
  return {
    setHasUnsavedChanges,
    clearUnsavedChanges,
    hasUnsavedChanges
  };
};