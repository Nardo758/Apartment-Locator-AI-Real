export type JsonObject = any

export interface ActivityData {
  activityType: string;
  pageUrl?: string;
  elementClicked?: string;
  activityData?: any;
  sessionId: string;
}

export interface SessionData {
  sessionId: string;
  deviceInfo: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContentData {
  contentType: string;
  contentId?: string;
  contentData?: any;
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
    console.warn('Supabase integration removed - using API routes');

    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  private async createSession() {
    if (!this.userId) return;
    console.warn('Supabase integration removed - using API routes');
  }

  private async endSession() {
    if (!this.userId) return;
    console.warn('Supabase integration removed - using API routes');
  }

  async trackActivity(data: Omit<ActivityData, 'sessionId'>) {
    if (!this.userId) return;
    console.warn('Supabase integration removed - using API routes');
  }

  async trackPageView(url?: string) {
    console.warn('Supabase integration removed - using API routes');
  }

  async trackClick(element: string, additionalData?: JsonObject) {
    console.warn('Supabase integration removed - using API routes');
  }

  async trackSearch(queryOrPayload: string | { query: string; results?: unknown[]; [k: string]: unknown }) {
    console.warn('Supabase integration removed - using API routes');
  }

  async trackContent(data: ContentData) {
    if (!this.userId) return;
    console.warn('Supabase integration removed - using API routes');
  }

  async trackInteraction(type: string, target: string, data?: JsonObject) {
    console.warn('Supabase integration removed - using API routes');
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getUserId(): string | null {
    return this.userId;
  }
}

export const dataTracker = new DataTracker();

if (typeof window !== 'undefined') {
  let currentUrl = window.location.href;
  
  setTimeout(() => dataTracker.trackPageView(), 1000);
  
  const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      dataTracker.trackPageView();
    }
  });
  
  observer.observe(document, { subtree: true, childList: true });
}
