import { supabase } from "@/integrations/supabase/client";

export type JsonObject = Record<string, unknown>;

export interface ActivityData {
  activityType: string;
  pageUrl?: string;
  elementClicked?: string;
  activityData?: JsonObject;
  sessionId: string;
}

export interface SessionData {
  sessionId: string;
  deviceInfo: JsonObject;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContentData {
  contentType: string;
  contentId?: string;
  contentData?: JsonObject;
  action: 'create' | 'update' | 'delete' | 'view';
}

class DataTracker {
  private sessionId: string;
  private deviceInfo: JsonObject;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.deviceInfo = this.getDeviceInfo();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo(): JsonObject {
    return {
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform
    };
  }

  private async initializeSession() {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;

    if (this.userId) {
      await this.createSession();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.userId = session.user.id;
        this.createSession();
      } else {
        this.userId = null;
      }
    });

    // Track page unload for session duration
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  private async createSession() {
    if (!this.userId) return;

    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      await (supabase as any).from('user_sessions').insert({
        user_id: this.userId,
        session_id: this.sessionId,
        device_info: this.deviceInfo,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }

  private async endSession() {
    if (!this.userId) return;

    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      await (supabase as any)
        .from('user_sessions')
        .update({
          logout_time: new Date().toISOString(),
          session_duration: Math.floor((Date.now() - parseInt(this.sessionId.split('_')[1])) / 1000)
        })
        .eq('session_id', this.sessionId);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  async trackActivity(data: Omit<ActivityData, 'sessionId'>) {
    if (!this.userId) return;

    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      await (supabase as any).from('user_activity_logs').insert({
        user_id: this.userId,
        session_id: this.sessionId,
        activity_type: data.activityType,
        page_url: data.pageUrl || window.location.href,
        element_clicked: data.elementClicked,
        activity_data: data.activityData || {},
        device_info: this.deviceInfo
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }

  async trackPageView(url?: string) {
    await this.trackActivity({
      activityType: 'page_view',
      pageUrl: url || window.location.href,
      activityData: {
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    });
  }

  async trackClick(element: string, additionalData?: JsonObject) {
    await this.trackActivity({
      activityType: 'click',
      elementClicked: element,
      activityData: additionalData
    });
  }

  async trackSearch(queryOrPayload: string | { query: string; results?: unknown[]; [k: string]: unknown }) {
    const payload = typeof queryOrPayload === 'string' ? { query: queryOrPayload, results: [] as unknown[] } : queryOrPayload;
    await this.trackActivity({
      activityType: 'search',
      activityData: {
        query: payload.query,
        results_count: Array.isArray(payload.results) ? payload.results.length : 0,
        results: Array.isArray(payload.results) ? payload.results : []
      }
    });
  }

  async trackContent(data: ContentData) {
    if (!this.userId) return;

    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      await (supabase as any).from('user_content_logs').insert({
        session_id: this.sessionId,
        content_type: data.contentType,
        content_id: data.contentId,
        content_data: data.contentData || {},
        action: data.action
      });
    } catch (error) {
      console.error('Failed to track content:', error);
    }
  }

  async trackInteraction(type: string, target: string, data?: JsonObject) {
    await this.trackActivity({
      activityType: 'interaction',
      activityData: {
        interaction_type: type,
        target,
        ...data
      }
    });
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getUserId(): string | null {
    return this.userId;
  }
}

// Create singleton instance
export const dataTracker = new DataTracker();

// Auto-track page views on route changes
if (typeof window !== 'undefined') {
  let currentUrl = window.location.href;
  
  // Track initial page view
  setTimeout(() => dataTracker.trackPageView(), 1000);
  
  // Monitor for URL changes (for SPA routing)
  const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      dataTracker.trackPageView();
    }
  });
  
  observer.observe(document, { subtree: true, childList: true });
}