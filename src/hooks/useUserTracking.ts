import { useCallback } from 'react';
import { dataTracker } from '@/lib/data-tracker';

export interface UserInteractionHookProps {
  pageContext?: string;
  componentContext?: string;
}

export const useUserTracking = ({ pageContext, componentContext }: UserInteractionHookProps = {}) => {
  
  const trackButtonClick = useCallback((buttonName: string, additionalData?: any) => {
    dataTracker.trackClick(`button_${buttonName}`, {
      page: pageContext,
      component: componentContext,
      ...additionalData,
      timestamp: new Date().toISOString()
    });
  }, [pageContext, componentContext]);

  const trackFormSubmit = useCallback((formType: string, formData?: any) => {
    dataTracker.trackContent({
      contentType: 'form_submission',
      action: 'create',
      contentData: {
        form_type: formType,
        page: pageContext,
        component: componentContext,
        form_fields: formData ? Object.keys(formData) : [],
        timestamp: new Date().toISOString(),
        ...formData
      }
    });
  }, [pageContext, componentContext]);

  const trackFormFieldChange = useCallback((fieldName: string, oldValue: any, newValue: any) => {
    dataTracker.trackContent({
      contentType: 'form_field_change',
      action: 'update',
      contentData: {
        field_name: fieldName,
        old_value: oldValue,
        new_value: newValue,
        page: pageContext,
        component: componentContext,
        timestamp: new Date().toISOString()
      }
    });
  }, [pageContext, componentContext]);

  const trackFilterChange = useCallback((filterType: string, filterValue: any, actionType: 'add' | 'remove' | 'update') => {
    dataTracker.trackInteraction('filter_change', filterType, {
      filter_value: filterValue,
      action_type: actionType,
      page: pageContext,
      component: componentContext,
      timestamp: new Date().toISOString()
    });
  }, [pageContext, componentContext]);

  const trackSearch = useCallback((query: string, searchType: string, results?: any) => {
    dataTracker.trackSearch(query, {
      search_type: searchType,
      page: pageContext,
      component: componentContext,
      results_count: results?.length || 0,
      timestamp: new Date().toISOString()
    });
  }, [pageContext, componentContext]);

  const trackModalAction = useCallback((modalName: string, action: 'open' | 'close' | 'submit') => {
    dataTracker.trackInteraction('modal_action', modalName, {
      action: action,
      page: pageContext,
      component: componentContext,
      timestamp: new Date().toISOString()
    });
  }, [pageContext, componentContext]);

  const trackUserPreferenceChange = useCallback((preferenceType: string, oldValue: any, newValue: any) => {
    dataTracker.trackContent({
      contentType: 'user_preference',
      action: 'update',
      contentData: {
        preference_type: preferenceType,
        old_value: oldValue,
        new_value: newValue,
        page: pageContext,
        component: componentContext,
        timestamp: new Date().toISOString()
      }
    });
  }, [pageContext, componentContext]);

  const trackFeatureUsage = useCallback((featureName: string, usageData?: any) => {
    dataTracker.trackInteraction('feature_usage', featureName, {
      page: pageContext,
      component: componentContext,
      usage_data: usageData,
      timestamp: new Date().toISOString()
    });
  }, [pageContext, componentContext]);

  const trackNavigationAction = useCallback((fromPage: string, toPage: string, trigger?: string) => {
    dataTracker.trackInteraction('navigation', 'page_change', {
      from_page: fromPage,
      to_page: toPage,
      trigger: trigger, // 'click', 'programmatic', 'back_button', etc.
      timestamp: new Date().toISOString()
    });
  }, []);

  const trackErrorOccurrence = useCallback((errorType: string, errorMessage: string, errorContext?: any) => {
    dataTracker.trackContent({
      contentType: 'error_occurrence',
      action: 'create',
      contentData: {
        error_type: errorType,
        error_message: errorMessage,
        page: pageContext,
        component: componentContext,
        error_context: errorContext,
        timestamp: new Date().toISOString()
      }
    });
  }, [pageContext, componentContext]);

  const trackTimeSpent = useCallback((startTime: number, activityType: string) => {
    const timeSpent = Date.now() - startTime;
    dataTracker.trackInteraction('time_spent', activityType, {
      duration_ms: timeSpent,
      duration_seconds: Math.round(timeSpent / 1000),
      page: pageContext,
      component: componentContext,
      timestamp: new Date().toISOString()
    });
  }, [pageContext, componentContext]);

  const trackPropertyInteraction = useCallback((propertyId: string, interactionType: 'view' | 'save' | 'contact' | 'share' | 'compare') => {
    dataTracker.trackContent({
      contentType: 'property_interaction',
      action: 'create',
      contentId: propertyId,
      contentData: {
        interaction_type: interactionType,
        property_id: propertyId,
        page: pageContext,
        component: componentContext,
        timestamp: new Date().toISOString()
      }
    });
  }, [pageContext, componentContext]);

  const trackAIInteraction = useCallback((aiFeature: string, inputData?: any, outputData?: any) => {
    dataTracker.trackContent({
      contentType: 'ai_interaction',
      action: 'create',
      contentData: {
        ai_feature: aiFeature,
        input_data: inputData,
        output_data: outputData,
        page: pageContext,
        component: componentContext,
        timestamp: new Date().toISOString()
      }
    });
  }, [pageContext, componentContext]);

  return {
    trackButtonClick,
    trackFormSubmit,
    trackFormFieldChange,
    trackFilterChange,
    trackSearch,
    trackModalAction,
    trackUserPreferenceChange,
    trackFeatureUsage,
    trackNavigationAction,
    trackErrorOccurrence,
    trackTimeSpent,
    trackPropertyInteraction,
    trackAIInteraction
  };
};