export interface PricingNotification {
  id: string;
  type: 'urgent_action' | 'price_opportunity' | 'competitor_alert' | 'seasonal_adjustment' | 'automated_update' | 'market_shift';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  unitId?: string;
  propertyName?: string;
  actionRequired: boolean;
  actionText?: string;
  actionUrl?: string;
  data: any;
  timestamp: string;
  expiresAt?: string;
  isRead: boolean;
  isArchived: boolean;
  userId: string;
  channels: NotificationChannel[];
}

export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';

export interface NotificationPreferences {
  userId: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
  types: {
    urgent_action: boolean;
    price_opportunity: boolean;
    competitor_alert: boolean;
    seasonal_adjustment: boolean;
    automated_update: boolean;
    market_shift: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
  frequency: {
    immediate: boolean;
    daily_digest: boolean;
    weekly_summary: boolean;
  };
}

export interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  createdAt: string;
  isActive: boolean;
}

export class NotificationSystem {
  private notifications: PricingNotification[] = [];
  private preferences: Map<string, NotificationPreferences> = new Map();
  private subscriptions: Map<string, PushSubscription> = new Map();

  constructor() {
    this.initializeDefaultPreferences();
  }

  private initializeDefaultPreferences(): void {
    // Default preferences for demo
    const defaultPrefs: NotificationPreferences = {
      userId: 'demo-user',
      channels: {
        push: true,
        email: true,
        sms: false,
        in_app: true
      },
      types: {
        urgent_action: true,
        price_opportunity: true,
        competitor_alert: true,
        seasonal_adjustment: false,
        automated_update: false,
        market_shift: true
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'America/Chicago'
      },
      frequency: {
        immediate: true,
        daily_digest: false,
        weekly_summary: true
      }
    };

    this.preferences.set('demo-user', defaultPrefs);
  }

  async sendNotification(notification: Omit<PricingNotification, 'id' | 'timestamp' | 'isRead' | 'isArchived'>): Promise<string> {
    const fullNotification: PricingNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      isArchived: false
    };

    this.notifications.push(fullNotification);

    // Check user preferences
    const userPrefs = this.preferences.get(notification.userId);
    if (!userPrefs) {
      console.warn(`No preferences found for user ${notification.userId}`);
      return fullNotification.id;
    }

    // Check if notification type is enabled
    if (!userPrefs.types[notification.type]) {
      console.log(`Notification type ${notification.type} disabled for user ${notification.userId}`);
      return fullNotification.id;
    }

    // Check quiet hours
    if (this.isInQuietHours(userPrefs)) {
      console.log(`Notification delayed due to quiet hours for user ${notification.userId}`);
      // In a real implementation, you'd schedule this for later
      return fullNotification.id;
    }

    // Send through enabled channels
    for (const channel of notification.channels) {
      if (userPrefs.channels[channel]) {
        await this.sendThroughChannel(fullNotification, channel);
      }
    }

    return fullNotification.id;
  }

  private isInQuietHours(prefs: NotificationPreferences): boolean {
    if (!prefs.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: prefs.quietHours.timezone 
    }).slice(0, 5);

    const start = prefs.quietHours.start;
    const end = prefs.quietHours.end;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    return currentTime >= start && currentTime <= end;
  }

  private async sendThroughChannel(notification: PricingNotification, channel: NotificationChannel): Promise<void> {
    switch (channel) {
      case 'push':
        await this.sendPushNotification(notification);
        break;
      case 'email':
        await this.sendEmailNotification(notification);
        break;
      case 'sms':
        await this.sendSMSNotification(notification);
        break;
      case 'in_app':
        // In-app notifications are handled by storing in the notifications array
        console.log(`In-app notification stored: ${notification.title}`);
        break;
    }
  }

  private async sendPushNotification(notification: PricingNotification): Promise<void> {
    // Simulate push notification
    console.log(`📱 Push Notification: ${notification.title}`);
    
    // In a real implementation, you would:
    // 1. Get the user's push subscription
    // 2. Use web-push library to send the notification
    // 3. Handle any errors or expired subscriptions
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        data: notification.data,
        requireInteraction: notification.priority === 'high',
        actions: notification.actionRequired ? [
          {
            action: 'view',
            title: notification.actionText || 'View Details'
          }
        ] : undefined
      });
    }
  }

  private async sendEmailNotification(notification: PricingNotification): Promise<void> {
    // Simulate email notification
    console.log(`📧 Email Notification: ${notification.title} to user ${notification.userId}`);
    
    // In a real implementation, you would:
    // 1. Use an email service (SendGrid, AWS SES, etc.)
    // 2. Send formatted HTML email with notification details
    // 3. Include action buttons if applicable
  }

  private async sendSMSNotification(notification: PricingNotification): Promise<void> {
    // Simulate SMS notification
    console.log(`📱 SMS Notification: ${notification.title} to user ${notification.userId}`);
    
    // In a real implementation, you would:
    // 1. Use an SMS service (Twilio, AWS SNS, etc.)
    // 2. Send concise SMS with key details
    // 3. Include short link for more details
  }

  // Predefined notification templates
  createUrgentActionNotification(unitId: string, propertyName: string, daysOnMarket: number, recommendedAction: string): Omit<PricingNotification, 'id' | 'timestamp' | 'isRead' | 'isArchived'> {
    return {
      type: 'urgent_action',
      priority: 'high',
      title: `🚨 Urgent: Unit ${unitId} needs pricing action`,
      message: `Unit ${unitId} at ${propertyName} has been on market for ${daysOnMarket} days. ${recommendedAction}`,
      unitId,
      propertyName,
      actionRequired: true,
      actionText: 'Review Pricing',
      actionUrl: `/pricing-demo?unit=${unitId}`,
      data: { unitId, daysOnMarket, recommendedAction },
      userId: 'demo-user',
      channels: ['push', 'email', 'in_app']
    };
  }

  createPriceOpportunityNotification(unitId: string, propertyName: string, opportunity: string, potentialIncrease: number): Omit<PricingNotification, 'id' | 'timestamp' | 'isRead' | 'isArchived'> {
    return {
      type: 'price_opportunity',
      priority: 'medium',
      title: `💰 Pricing opportunity for Unit ${unitId}`,
      message: `${opportunity}. Potential increase: $${potentialIncrease}`,
      unitId,
      propertyName,
      actionRequired: true,
      actionText: 'View Opportunity',
      actionUrl: `/pricing-demo?unit=${unitId}`,
      data: { unitId, opportunity, potentialIncrease },
      userId: 'demo-user',
      channels: ['push', 'in_app']
    };
  }

  createCompetitorAlertNotification(competitorName: string, changeType: string, impact: string): Omit<PricingNotification, 'id' | 'timestamp' | 'isRead' | 'isArchived'> {
    return {
      type: 'competitor_alert',
      priority: 'medium',
      title: `🏢 Competitor Alert: ${competitorName}`,
      message: `${competitorName} ${changeType}. ${impact}`,
      actionRequired: false,
      data: { competitorName, changeType, impact },
      userId: 'demo-user',
      channels: ['push', 'in_app']
    };
  }

  createSeasonalAdjustmentNotification(season: string, adjustment: number, reasoning: string): Omit<PricingNotification, 'id' | 'timestamp' | 'isRead' | 'isArchived'> {
    return {
      type: 'seasonal_adjustment',
      priority: 'low',
      title: `🌟 Seasonal Pricing Update: ${season}`,
      message: `${reasoning}. Suggested adjustment: ${adjustment > 0 ? '+' : ''}${adjustment}%`,
      actionRequired: false,
      data: { season, adjustment, reasoning },
      userId: 'demo-user',
      channels: ['in_app']
    };
  }

  createAutomatedUpdateNotification(unitId: string, oldPrice: number, newPrice: number, reason: string): Omit<PricingNotification, 'id' | 'timestamp' | 'isRead' | 'isArchived'> {
    return {
      type: 'automated_update',
      priority: 'low',
      title: `✅ Price Updated: Unit ${unitId}`,
      message: `Automatically updated from $${oldPrice} to $${newPrice}. ${reason}`,
      unitId,
      actionRequired: false,
      data: { unitId, oldPrice, newPrice, reason },
      userId: 'demo-user',
      channels: ['in_app', 'email']
    };
  }

  // Notification management
  getNotifications(userId: string, options?: {
    unreadOnly?: boolean;
    type?: PricingNotification['type'];
    limit?: number;
  }): PricingNotification[] {
    let filtered = this.notifications.filter(n => n.userId === userId && !n.isArchived);

    if (options?.unreadOnly) {
      filtered = filtered.filter(n => !n.isRead);
    }

    if (options?.type) {
      filtered = filtered.filter(n => n.type === options.type);
    }

    // Sort by priority and timestamp
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  markAllAsRead(userId: string): void {
    this.notifications
      .filter(n => n.userId === userId)
      .forEach(n => n.isRead = true);
  }

  archiveNotification(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isArchived = true;
    }
  }

  getUnreadCount(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.isRead && !n.isArchived).length;
  }

  updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const current = this.preferences.get(userId);
    if (current) {
      this.preferences.set(userId, { ...current, ...preferences });
    }
  }

  getPreferences(userId: string): NotificationPreferences | null {
    return this.preferences.get(userId) || null;
  }

  // Push subscription management
  async subscribeToPush(userId: string, subscription: Omit<PushSubscription, 'userId' | 'createdAt' | 'isActive'>): Promise<void> {
    const fullSubscription: PushSubscription = {
      ...subscription,
      userId,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    this.subscriptions.set(userId, fullSubscription);
    console.log(`User ${userId} subscribed to push notifications`);
  }

  unsubscribeFromPush(userId: string): void {
    this.subscriptions.delete(userId);
    console.log(`User ${userId} unsubscribed from push notifications`);
  }

  // Demo helper methods
  async triggerDemoNotifications(): Promise<void> {
    // Simulate various notification scenarios
    
    // Urgent action needed
    await this.sendNotification(
      this.createUrgentActionNotification('001', 'Sunset Apartments', 45, 'Consider 8% rent reduction')
    );

    // Price opportunity
    await this.sendNotification(
      this.createPriceOpportunityNotification('002', 'Urban Heights', 'Market gap identified', 150)
    );

    // Competitor alert
    await this.sendNotification(
      this.createCompetitorAlertNotification('Riverside Commons', 'reduced rent by 5%', 'Monitor for market impact')
    );

    // Seasonal adjustment
    await this.sendNotification(
      this.createSeasonalAdjustmentNotification('Peak Season', 8, 'Summer demand surge supports premium pricing')
    );

    // Automated update
    await this.sendNotification(
      this.createAutomatedUpdateNotification('003', 2800, 2650, 'Low-risk adjustment approved automatically')
    );
  }
}