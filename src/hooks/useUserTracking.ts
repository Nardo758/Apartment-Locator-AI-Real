import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './useUser';
import type { Database } from '@/supabase/types';

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

import type { Json } from '@/supabase/types';

const toJson = (value: unknown): Json | null => {
  if (value === null || value === undefined) return null;
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return value as string | number | boolean;
  if (Array.isArray(value)) return value.map((v) => toJson(v)) as Json[];
  if (t === 'object') {
    const out: { [k: string]: Json | undefined } = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = toJson(v) ?? undefined;
    }
    return out as Json;
  }
  // fallback to string
  return String(value) as unknown as Json;
};

export const useUserTracking = ({ pageContext, componentContext }: UserInteractionHookProps = {}) => {
  const { user } = useUser();

  const trackActivity = useCallback(async (
    activityType: string,
    details: ActivityDetails = {}
  ): Promise<void> => {
    if (!user) return;

    try {
      // Build a payload typed to the generated Database Insert type to satisfy TS
      const payload: Database["public"]["Tables"]["user_activities"]["Insert"] = {
        user_id: user.id,
        activity_type: activityType,
        page_name: details.pageName || pageContext,
        component_name: details.componentName || componentContext,
        action_details: toJson(details.actionDetails),
        metadata: toJson({
          ...(details.metadata ?? {}),
          before_state: details.beforeState ?? null,
          after_state: details.afterState ?? null,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          screen_resolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : null
        })
      };

      // Bypass typing issue with explicit cast - the payload is correctly typed
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const { error } = await (supabase as any).from('user_activities').insert(payload);

      if (error) {
        console.error('Failed to track activity:', error);
      }
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
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