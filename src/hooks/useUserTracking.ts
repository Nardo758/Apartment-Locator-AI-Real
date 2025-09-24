import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './useUser';

export interface UserInteractionHookProps {
  pageContext?: string;
  componentContext?: string;
}

export const useUserTracking = ({ pageContext, componentContext }: UserInteractionHookProps = {}) => {
  const { user } = useUser();

  const trackActivity = useCallback(async (
    activityType: string,
    details: {
      pageName?: string;
      componentName?: string;
      actionDetails?: any;
      beforeState?: any;
      afterState?: any;
      metadata?: any;
    }
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: activityType,
        page_name: details.pageName || pageContext,
        component_name: details.componentName || componentContext,
        action_details: details.actionDetails,
        metadata: {
          ...details.metadata,
          before_state: details.beforeState,
          after_state: details.afterState,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          user_agent: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`
        }
      });

      if (error) {
        console.error('Failed to track activity:', error);
      }
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }, [user, pageContext, componentContext]);

  const trackButtonClick = useCallback((buttonName: string, additionalData?: any) => {
    trackActivity('button_click', {
      actionDetails: { button_name: buttonName },
      metadata: additionalData
    });
  }, [trackActivity]);

  const trackFormSubmit = useCallback((formType: string, formData?: any) => {
    trackActivity('form_submission', {
      actionDetails: {
        form_type: formType,
        form_fields: formData ? Object.keys(formData) : []
      },
      metadata: formData
    });
  }, [trackActivity]);

  const trackFormFieldChange = useCallback((fieldName: string, oldValue: any, newValue: any) => {
    trackActivity('form_field_change', {
      actionDetails: {
        field_name: fieldName,
        old_value: oldValue,
        new_value: newValue
      }
    });
  }, [trackActivity]);

  const trackFilterChange = useCallback((filterType: string, filterValue: any, actionType: 'add' | 'remove' | 'update') => {
    trackActivity('filter_change', {
      actionDetails: {
        filter_type: filterType,
        filter_value: filterValue,
        action_type: actionType
      }
    });
  }, [trackActivity]);

  const trackSearch = useCallback((searchParams: any, resultsCount: number) => {
    trackActivity('search_executed', {
      componentName: 'search',
      actionDetails: searchParams,
      metadata: { results_count: resultsCount }
    });
  }, [trackActivity]);

  const trackApartmentInteraction = useCallback((apartmentId: string, action: string, details?: any) => {
    trackActivity('apartment_interaction', {
      componentName: 'apartment_card',
      actionDetails: { apartment_id: apartmentId, action, ...details }
    });
  }, [trackActivity]);

  const trackFormSubmission = useCallback((formName: string, formData: any, success: boolean) => {
    trackActivity('form_submission', {
      componentName: formName,
      actionDetails: formData,
      metadata: { success, form_name: formName }
    });
  }, [trackActivity]);

  const trackModalAction = useCallback((modalName: string, action: 'open' | 'close' | 'submit') => {
    trackActivity('modal_action', {
      actionDetails: {
        modal_name: modalName,
        action: action
      }
    });
  }, [trackActivity]);

  const trackUserPreferenceChange = useCallback((preferenceType: string, oldValue: any, newValue: any) => {
    trackActivity('preference_change', {
      actionDetails: {
        preference_type: preferenceType,
        old_value: oldValue,
        new_value: newValue
      }
    });
  }, [trackActivity]);

  const trackFeatureUsage = useCallback((featureName: string, usageData?: any) => {
    trackActivity('feature_usage', {
      actionDetails: {
        feature_name: featureName
      },
      metadata: usageData
    });
  }, [trackActivity]);

  const trackNavigationAction = useCallback((fromPage: string, toPage: string, trigger?: string) => {
    trackActivity('navigation', {
      actionDetails: {
        from_page: fromPage,
        to_page: toPage,
        trigger: trigger
      }
    });
  }, [trackActivity]);

  const trackErrorOccurrence = useCallback((errorType: string, errorMessage: string, errorContext?: any) => {
    trackActivity('error_occurrence', {
      actionDetails: {
        error_type: errorType,
        error_message: errorMessage
      },
      metadata: errorContext
    });
  }, [trackActivity]);

  const trackTimeSpent = useCallback((startTime: number, activityType: string) => {
    const timeSpent = Date.now() - startTime;
    trackActivity('time_spent', {
      actionDetails: {
        activity_type: activityType,
        duration_ms: timeSpent,
        duration_seconds: Math.round(timeSpent / 1000)
      }
    });
  }, [trackActivity]);

  const trackPropertyInteraction = useCallback((propertyId: string, interactionType: 'view' | 'save' | 'contact' | 'share' | 'compare') => {
    trackActivity('property_interaction', {
      actionDetails: {
        property_id: propertyId,
        interaction_type: interactionType
      }
    });
  }, [trackActivity]);

  const trackAIInteraction = useCallback((aiFeature: string, inputData?: any, outputData?: any) => {
    trackActivity('ai_interaction', {
      actionDetails: {
        ai_feature: aiFeature,
        input_data: inputData,
        output_data: outputData
      }
    });
  }, [trackActivity]);

  const trackPageVisit = useCallback((pageName: string, additionalData = {}) => {
    trackActivity('page_visit', {
      pageName,
      metadata: additionalData
    });
  }, [trackActivity]);

  const trackPreferenceChange = useCallback((field: string, oldValue: any, newValue: any) => {
    trackActivity('preference_change', {
      componentName: 'preferences_form',
      actionDetails: { field, old_value: oldValue, new_value: newValue }
    });
  }, [trackActivity]);

  return {
    trackActivity,
    trackPageVisit,
    trackPreferenceChange,
    trackSearch,
    trackApartmentInteraction,
    trackFormSubmission,
    trackButtonClick,
    trackFormSubmit,
    trackFormFieldChange,
    trackFilterChange,
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