import { useCallback } from 'react';
import { useUser } from './useUser';

export interface UserInteractionHookProps {
  pageContext?: string;
  componentContext?: string;
}

type AnyObject = Record<string, unknown>;

type ActivityDetails = {
  pageName?: string;
  componentName?: string;
  actionDetails?: AnyObject | unknown[] | string | number | null;
  beforeState?: unknown;
  afterState?: unknown;
  metadata?: AnyObject | null;
};

export const useUserTracking = ({ pageContext, componentContext }: UserInteractionHookProps = {}) => {
  const { user } = useUser();

  const trackActivity = useCallback(async (
    activityType: string,
    details: ActivityDetails = {}
  ): Promise<void> => {
    if (!user) return;
    console.warn('Supabase integration removed - using API routes');
  }, [user, pageContext, componentContext]);

  const trackButtonClick = useCallback((buttonName: string, additionalData?: AnyObject) => {
    trackActivity('button_click', {
      actionDetails: { button_name: buttonName },
      metadata: additionalData
    });
  }, [trackActivity]);

  const trackFormSubmit = useCallback((formType: string, formData?: AnyObject) => {
    trackActivity('form_submission', {
      actionDetails: {
        form_type: formType,
        form_fields: formData ? Object.keys(formData) : []
      },
      metadata: formData
    });
  }, [trackActivity]);

  const trackFormFieldChange = useCallback((fieldName: string, oldValue: unknown, newValue: unknown) => {
    trackActivity('form_field_change', {
      actionDetails: {
        field_name: fieldName,
        old_value: oldValue,
        new_value: newValue
      }
    });
  }, [trackActivity]);

  const trackFilterChange = useCallback((filterType: string, filterValue: unknown, actionType: 'add' | 'remove' | 'update') => {
    trackActivity('filter_change', {
      actionDetails: {
        filter_type: filterType,
        filter_value: filterValue,
        action_type: actionType
      }
    });
  }, [trackActivity]);

  const trackSearch = useCallback((searchParams: AnyObject | string | number, resultsCount: number) => {
    trackActivity('search_executed', {
      componentName: 'search',
      actionDetails: searchParams,
      metadata: { results_count: resultsCount }
    });
  }, [trackActivity]);

  const trackApartmentInteraction = useCallback((apartmentId: string, action: string, details?: AnyObject) => {
    trackActivity('apartment_interaction', {
      componentName: 'apartment_card',
      actionDetails: { apartment_id: apartmentId, action, ...details }
    });
  }, [trackActivity]);

  const trackFormSubmission = useCallback((formName: string, formData: AnyObject, success: boolean) => {
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

  const trackUserPreferenceChange = useCallback((preferenceType: string, oldValue: unknown, newValue: unknown) => {
    trackActivity('preference_change', {
      actionDetails: {
        preference_type: preferenceType,
        old_value: oldValue,
        new_value: newValue
      }
    });
  }, [trackActivity]);

  const trackFeatureUsage = useCallback((featureName: string, usageData?: AnyObject) => {
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

  const trackErrorOccurrence = useCallback((errorType: string, errorMessage: string, errorContext?: AnyObject) => {
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

  const trackAIInteraction = useCallback((aiFeature: string, inputData?: AnyObject, outputData?: AnyObject) => {
    trackActivity('ai_interaction', {
      actionDetails: {
        ai_feature: aiFeature,
        input_data: inputData,
        output_data: outputData
      }
    });
  }, [trackActivity]);

  const trackPageVisit = useCallback((pageName: string, additionalData: AnyObject = {}) => {
    trackActivity('page_visit', {
      pageName,
      metadata: additionalData
    });
  }, [trackActivity]);

  const trackPreferenceChange = useCallback((field: string, oldValue: unknown, newValue: unknown) => {
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
