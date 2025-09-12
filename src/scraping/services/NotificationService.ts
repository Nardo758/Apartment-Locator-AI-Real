/**
 * Notification service for price drops, new listings, and market alerts
 */

import { ScrapedProperty, MarketData } from '../core/types';
import { scrapingLogger } from '../utils/Logger';

export interface NotificationPreferences {
  userId: string;
  email?: string;
  phone?: string;
  pushToken?: string;
  preferences: {
    priceDrops: {
      enabled: boolean;
      minDropAmount: number; // Minimum price drop to notify
      minDropPercentage: number; // Minimum percentage drop
    };
    newListings: {
      enabled: boolean;
      maxPrice?: number;
      minBedrooms?: number;
      maxBedrooms?: number;
      preferredAmenities?: string[];
      cities?: string[];
    };
    marketAlerts: {
      enabled: boolean;
      marketChanges: boolean; // Hot/cold market changes
      concessionTrends: boolean; // New concession opportunities
      priceIndexChanges: boolean; // Overall market price changes
    };
    frequency: 'immediate' | 'daily' | 'weekly';
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'price_drop' | 'new_listing' | 'market_alert' | 'concession_opportunity';
  title: string;
  message: string;
  data: {
    propertyId?: string;
    oldPrice?: number;
    newPrice?: number;
    savings?: number;
    marketData?: any;
  };
  channels: Array<'email' | 'push' | 'sms'>;
  priority: 'low' | 'medium' | 'high';
  scheduledAt: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt: Date;
}

export interface MarketAlert {
  type: 'market_velocity_change' | 'price_trend_change' | 'concession_increase';
  city: string;
  state: string;
  message: string;
  data: any;
  severity: 'info' | 'warning' | 'critical';
}

export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private marketHistory: Map<string, MarketData[]> = new Map();
  private logger = scrapingLogger;
  private emailQueue: Notification[] = [];
  private pushQueue: Notification[] = [];
  private smsQueue: Notification[] = [];

  /**
   * Set user notification preferences
   */
  setUserPreferences(preferences: NotificationPreferences): void {
    this.preferences.set(preferences.userId, preferences);
    this.logger.info('User notification preferences updated', { 
      userId: preferences.userId,
      channels: [preferences.email ? 'email' : '', preferences.phone ? 'sms' : '', preferences.pushToken ? 'push' : ''].filter(Boolean)
    });
  }

  /**
   * Check for price drops and create notifications
   */
  async checkPriceDrops(currentProperties: ScrapedProperty[], previousProperties: ScrapedProperty[]): Promise<void> {
    const priceDrops = this.findPriceDrops(currentProperties, previousProperties);
    
    this.logger.info('Checking price drops', { 
      currentCount: currentProperties.length,
      previousCount: previousProperties.length,
      dropsFound: priceDrops.length
    });

    for (const drop of priceDrops) {
      await this.createPriceDropNotifications(drop.current, drop.previous);
    }
  }

  /**
   * Check for new listings and create notifications
   */
  async checkNewListings(newProperties: ScrapedProperty[]): Promise<void> {
    this.logger.info('Checking new listings', { count: newProperties.length });

    for (const property of newProperties) {
      await this.createNewListingNotifications(property);
    }
  }

  /**
   * Analyze market changes and create alerts
   */
  async analyzeMarketChanges(currentMarketData: MarketData, city: string, state: string): Promise<void> {
    const marketKey = `${city}-${state}`;
    const history = this.marketHistory.get(marketKey) || [];
    
    if (history.length > 0) {
      const previousData = history[history.length - 1];
      const alerts = this.detectMarketChanges(currentMarketData, previousData, city, state);
      
      for (const alert of alerts) {
        await this.createMarketAlertNotifications(alert);
      }
    }

    // Store current data for future comparisons
    history.push(currentMarketData);
    if (history.length > 30) { // Keep last 30 data points
      history.shift();
    }
    this.marketHistory.set(marketKey, history);
  }

  /**
   * Create concession opportunity notifications
   */
  async createConcessionNotifications(property: ScrapedProperty, concessions: Array<{ type: string; probability: number; value: string }>): Promise<void> {
    const highProbabilityConcessions = concessions.filter(c => c.probability > 70);
    
    if (highProbabilityConcessions.length === 0) return;

    const interestedUsers = await this.findInterestedUsers(property);
    
    for (const userId of interestedUsers) {
      const preferences = this.preferences.get(userId);
      if (!preferences?.preferences.marketAlerts.enabled) continue;

      const notification: Notification = {
        id: this.generateId(),
        userId,
        type: 'concession_opportunity',
        title: `💰 Concession Opportunity: ${property.name}`,
        message: `High chance of getting ${highProbabilityConcessions.map(c => c.type).join(', ')} at ${property.name}. Potential savings: ${highProbabilityConcessions[0].value}`,
        data: {
          propertyId: property.externalId,
          savings: this.extractSavingsAmount(highProbabilityConcessions[0].value)
        },
        channels: this.getPreferredChannels(preferences),
        priority: 'medium',
        scheduledAt: new Date(),
        status: 'pending',
        createdAt: new Date()
      };

      await this.queueNotification(notification);
    }
  }

  /**
   * Process notification queues
   */
  async processNotificationQueues(): Promise<void> {
    // Process email notifications
    if (this.emailQueue.length > 0) {
      await this.processEmailQueue();
    }

    // Process push notifications
    if (this.pushQueue.length > 0) {
      await this.processPushQueue();
    }

    // Process SMS notifications
    if (this.smsQueue.length > 0) {
      await this.processSmsQueue();
    }
  }

  /**
   * Get user's notification history
   */
  getUserNotifications(userId: string, limit: number = 50): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.status = 'sent';
      return true;
    }
    return false;
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    recentActivity: number; // Last 24 hours
  } {
    const notifications = Array.from(this.notifications.values());
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let recentActivity = 0;

    for (const notification of notifications) {
      // Count by type
      byType[notification.type] = (byType[notification.type] || 0) + 1;
      
      // Count by status
      byStatus[notification.status] = (byStatus[notification.status] || 0) + 1;
      
      // Count recent activity
      if (notification.createdAt.getTime() > oneDayAgo) {
        recentActivity++;
      }
    }

    return {
      total: notifications.length,
      byType,
      byStatus,
      recentActivity
    };
  }

  private findPriceDrops(current: ScrapedProperty[], previous: ScrapedProperty[]): Array<{ current: ScrapedProperty; previous: ScrapedProperty }> {
    const drops: Array<{ current: ScrapedProperty; previous: ScrapedProperty }> = [];
    const previousMap = new Map(previous.map(p => [p.externalId, p]));

    for (const currentProp of current) {
      const previousProp = previousMap.get(currentProp.externalId);
      
      if (previousProp && currentProp.currentPrice < previousProp.currentPrice) {
        const dropAmount = previousProp.currentPrice - currentProp.currentPrice;
        const dropPercentage = (dropAmount / previousProp.currentPrice) * 100;
        
        // Only consider significant drops
        if (dropAmount >= 50 && dropPercentage >= 2) {
          drops.push({ current: currentProp, previous: previousProp });
        }
      }
    }

    return drops;
  }

  private async createPriceDropNotifications(current: ScrapedProperty, previous: ScrapedProperty): Promise<void> {
    const dropAmount = previous.currentPrice - current.currentPrice;
    const dropPercentage = (dropAmount / previous.currentPrice) * 100;

    const interestedUsers = await this.findInterestedUsers(current);
    
    for (const userId of interestedUsers) {
      const preferences = this.preferences.get(userId);
      if (!preferences?.preferences.priceDrops.enabled) continue;
      
      // Check if drop meets user's thresholds
      if (dropAmount < preferences.preferences.priceDrops.minDropAmount ||
          dropPercentage < preferences.preferences.priceDrops.minDropPercentage) {
        continue;
      }

      const notification: Notification = {
        id: this.generateId(),
        userId,
        type: 'price_drop',
        title: `🎯 Price Drop Alert: ${current.name}`,
        message: `Price dropped by $${dropAmount} (${dropPercentage.toFixed(1)}%) to $${current.currentPrice}/month`,
        data: {
          propertyId: current.externalId,
          oldPrice: previous.currentPrice,
          newPrice: current.currentPrice,
          savings: dropAmount
        },
        channels: this.getPreferredChannels(preferences),
        priority: dropPercentage > 10 ? 'high' : 'medium',
        scheduledAt: new Date(),
        status: 'pending',
        createdAt: new Date()
      };

      await this.queueNotification(notification);
    }
  }

  private async createNewListingNotifications(property: ScrapedProperty): Promise<void> {
    const interestedUsers = await this.findInterestedUsers(property);
    
    for (const userId of interestedUsers) {
      const preferences = this.preferences.get(userId);
      if (!preferences?.preferences.newListings.enabled) continue;

      const notification: Notification = {
        id: this.generateId(),
        userId,
        type: 'new_listing',
        title: `🏠 New Listing: ${property.name}`,
        message: `New ${property.bedrooms}BR/${property.bathrooms}BA apartment for $${property.currentPrice}/month in ${property.city}`,
        data: {
          propertyId: property.externalId
        },
        channels: this.getPreferredChannels(preferences),
        priority: 'medium',
        scheduledAt: new Date(),
        status: 'pending',
        createdAt: new Date()
      };

      await this.queueNotification(notification);
    }
  }

  private detectMarketChanges(current: MarketData, previous: MarketData, city: string, state: string): MarketAlert[] {
    const alerts: MarketAlert[] = [];

    // Check median rent change
    const rentChange = (current.medianRent - previous.medianRent) / previous.medianRent;
    if (Math.abs(rentChange) > 0.05) { // 5% change
      alerts.push({
        type: 'price_trend_change',
        city,
        state,
        message: `Median rent ${rentChange > 0 ? 'increased' : 'decreased'} by ${(Math.abs(rentChange) * 100).toFixed(1)}% to $${current.medianRent}`,
        data: { previous: previous.medianRent, current: current.medianRent, change: rentChange },
        severity: Math.abs(rentChange) > 0.1 ? 'critical' : 'warning'
      });
    }

    // Check days on market change
    const domChange = (current.averageDaysOnMarket - previous.averageDaysOnMarket) / previous.averageDaysOnMarket;
    if (Math.abs(domChange) > 0.2) { // 20% change
      alerts.push({
        type: 'market_velocity_change',
        city,
        state,
        message: `Market velocity changed: Properties now rent ${domChange > 0 ? 'slower' : 'faster'} (${current.averageDaysOnMarket} vs ${previous.averageDaysOnMarket} days)`,
        data: { previous: previous.averageDaysOnMarket, current: current.averageDaysOnMarket },
        severity: 'info'
      });
    }

    // Check concession trends
    const currentConcessionCount = current.trendingConcessions.length;
    const previousConcessionCount = previous.trendingConcessions.length;
    
    if (currentConcessionCount > previousConcessionCount) {
      alerts.push({
        type: 'concession_increase',
        city,
        state,
        message: `More concessions available: ${current.trendingConcessions.map(c => c.type).join(', ')}`,
        data: { concessions: current.trendingConcessions },
        severity: 'info'
      });
    }

    return alerts;
  }

  private async createMarketAlertNotifications(alert: MarketAlert): Promise<void> {
    // Find users interested in this market
    const interestedUsers = Array.from(this.preferences.values())
      .filter(p => 
        p.preferences.marketAlerts.enabled &&
        (p.preferences.newListings.cities?.includes(alert.city.toLowerCase()) || !p.preferences.newListings.cities)
      );

    for (const preferences of interestedUsers) {
      const notification: Notification = {
        id: this.generateId(),
        userId: preferences.userId,
        type: 'market_alert',
        title: `📊 Market Alert: ${alert.city}, ${alert.state.toUpperCase()}`,
        message: alert.message,
        data: {
          marketData: alert.data
        },
        channels: this.getPreferredChannels(preferences),
        priority: alert.severity === 'critical' ? 'high' : 'medium',
        scheduledAt: new Date(),
        status: 'pending',
        createdAt: new Date()
      };

      await this.queueNotification(notification);
    }
  }

  private async findInterestedUsers(property: ScrapedProperty): Promise<string[]> {
    const interestedUsers: string[] = [];

    for (const [userId, preferences] of this.preferences) {
      if (this.isUserInterestedInProperty(property, preferences)) {
        interestedUsers.push(userId);
      }
    }

    return interestedUsers;
  }

  private isUserInterestedInProperty(property: ScrapedProperty, preferences: NotificationPreferences): boolean {
    const newListingPrefs = preferences.preferences.newListings;
    
    // Check price range
    if (newListingPrefs.maxPrice && property.currentPrice > newListingPrefs.maxPrice) {
      return false;
    }

    // Check bedroom requirements
    if (newListingPrefs.minBedrooms && property.bedrooms < newListingPrefs.minBedrooms) {
      return false;
    }

    if (newListingPrefs.maxBedrooms && property.bedrooms > newListingPrefs.maxBedrooms) {
      return false;
    }

    // Check city preferences
    if (newListingPrefs.cities && !newListingPrefs.cities.includes(property.city.toLowerCase())) {
      return false;
    }

    // Check amenity preferences
    if (newListingPrefs.preferredAmenities && newListingPrefs.preferredAmenities.length > 0) {
      const hasPreferredAmenity = newListingPrefs.preferredAmenities.some(preferred =>
        property.amenities.some(amenity => 
          amenity.toLowerCase().includes(preferred.toLowerCase())
        )
      );
      
      if (!hasPreferredAmenity) {
        return false;
      }
    }

    return true;
  }

  private getPreferredChannels(preferences: NotificationPreferences): Array<'email' | 'push' | 'sms'> {
    const channels: Array<'email' | 'push' | 'sms'> = [];
    
    if (preferences.email) channels.push('email');
    if (preferences.pushToken) channels.push('push');
    if (preferences.phone) channels.push('sms');
    
    return channels;
  }

  private async queueNotification(notification: Notification): Promise<void> {
    this.notifications.set(notification.id, notification);

    // Add to appropriate queues based on channels
    if (notification.channels.includes('email')) {
      this.emailQueue.push(notification);
    }
    
    if (notification.channels.includes('push')) {
      this.pushQueue.push(notification);
    }
    
    if (notification.channels.includes('sms')) {
      this.smsQueue.push(notification);
    }

    this.logger.debug('Notification queued', {
      id: notification.id,
      type: notification.type,
      userId: notification.userId,
      channels: notification.channels
    });
  }

  private async processEmailQueue(): Promise<void> {
    const batch = this.emailQueue.splice(0, 10); // Process in batches of 10
    
    for (const notification of batch) {
      try {
        await this.sendEmail(notification);
        notification.status = 'sent';
        notification.sentAt = new Date();
      } catch (error) {
        notification.status = 'failed';
        this.logger.error('Failed to send email notification', error as Error, {
          notificationId: notification.id
        });
      }
    }
  }

  private async processPushQueue(): Promise<void> {
    const batch = this.pushQueue.splice(0, 20); // Process in batches of 20
    
    for (const notification of batch) {
      try {
        await this.sendPushNotification(notification);
        notification.status = 'sent';
        notification.sentAt = new Date();
      } catch (error) {
        notification.status = 'failed';
        this.logger.error('Failed to send push notification', error as Error, {
          notificationId: notification.id
        });
      }
    }
  }

  private async processSmsQueue(): Promise<void> {
    const batch = this.smsQueue.splice(0, 5); // Process in batches of 5 (SMS is more expensive)
    
    for (const notification of batch) {
      try {
        await this.sendSms(notification);
        notification.status = 'sent';
        notification.sentAt = new Date();
      } catch (error) {
        notification.status = 'failed';
        this.logger.error('Failed to send SMS notification', error as Error, {
          notificationId: notification.id
        });
      }
    }
  }

  private async sendEmail(notification: Notification): Promise<void> {
    const preferences = this.preferences.get(notification.userId);
    if (!preferences?.email) {
      throw new Error('No email address for user');
    }

    // In a real implementation, you'd use a service like SendGrid, AWS SES, etc.
    this.logger.info('Sending email notification', {
      to: preferences.email,
      subject: notification.title,
      notificationId: notification.id
    });

    // Mock email sending
    await this.sleep(100);
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    const preferences = this.preferences.get(notification.userId);
    if (!preferences?.pushToken) {
      throw new Error('No push token for user');
    }

    // In a real implementation, you'd use FCM, APNS, etc.
    this.logger.info('Sending push notification', {
      token: preferences.pushToken,
      title: notification.title,
      notificationId: notification.id
    });

    // Mock push notification sending
    await this.sleep(50);
  }

  private async sendSms(notification: Notification): Promise<void> {
    const preferences = this.preferences.get(notification.userId);
    if (!preferences?.phone) {
      throw new Error('No phone number for user');
    }

    // In a real implementation, you'd use Twilio, AWS SNS, etc.
    this.logger.info('Sending SMS notification', {
      to: preferences.phone,
      message: notification.message,
      notificationId: notification.id
    });

    // Mock SMS sending
    await this.sleep(200);
  }

  private extractSavingsAmount(value: string): number {
    const match = value.match(/\$?([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const notificationService = new NotificationService();