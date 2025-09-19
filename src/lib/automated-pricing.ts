import type { PricingRecommendation, ApartmentIQData } from './pricing-engine';
import type { NotificationSystem } from './notification-system';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  riskLevel: 'low' | 'medium' | 'high';
  maxAdjustmentPercent: number;
  requiresApproval: boolean;
  createdBy: string;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface AutomationCondition {
  type: 'days_on_market' | 'confidence_score' | 'market_position' | 'price_change' | 'competitor_action' | 'seasonal_factor';
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  value: number | string;
  value2?: number; // For 'between' operator
}

export interface AutomationAction {
  type: 'adjust_price' | 'send_notification' | 'add_concession' | 'schedule_review' | 'update_listing';
  parameters: Record<string, any>;
}

export interface PendingAction {
  id: string;
  unitId: string;
  ruleId: string;
  ruleName: string;
  action: AutomationAction;
  recommendedValue: number;
  currentValue: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'expired';
  approvedBy?: string;
  approvedAt?: string;
  executedAt?: string;
}

export interface AutomationSettings {
  isEnabled: boolean;
  maxDailyActions: number;
  maxAdjustmentPercent: number;
  requireApprovalAbove: number; // Percentage threshold
  autoApprovalRules: string[]; // Rule IDs that can auto-approve
  businessHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string;   // HH:MM
    timezone: string;
  };
  blackoutDates: string[]; // ISO date strings when automation is disabled
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  unitId: string;
  ruleId: string;
  action: string;
  oldValue: number;
  newValue: number;
  success: boolean;
  error?: string;
  triggeredBy: 'system' | 'user' | 'schedule';
}

export class AutomatedPricingSystem {
  private rules: Map<string, AutomationRule> = new Map();
  private pendingActions: Map<string, PendingAction> = new Map();
  private settings: AutomationSettings;
  private logs: AutomationLog[] = [];
  private notificationSystem?: NotificationSystem;

  constructor(notificationSystem?: NotificationSystem) {
    this.notificationSystem = notificationSystem;
    this.settings = this.getDefaultSettings();
    this.initializeDefaultRules();
  }

  private getDefaultSettings(): AutomationSettings {
    return {
      isEnabled: true,
      maxDailyActions: 10,
      maxAdjustmentPercent: 15,
      requireApprovalAbove: 5, // Require approval for >5% changes
      autoApprovalRules: ['low-risk-reduction', 'seasonal-adjustment'],
      businessHours: {
        enabled: true,
        start: '09:00',
        end: '17:00',
        timezone: 'America/Chicago'
      },
      blackoutDates: []
    };
  }

  private initializeDefaultRules(): void {
    // Low-risk automatic reductions
    this.addRule({
      id: 'low-risk-reduction',
      name: 'Low-Risk Price Reduction',
      description: 'Automatically reduce prices for units on market 30+ days with high confidence',
      isActive: true,
      conditions: [
        { type: 'days_on_market', operator: 'greater_than', value: 30 },
        { type: 'confidence_score', operator: 'greater_than', value: 0.8 },
        { type: 'price_change', operator: 'between', value: -10, value2: -3 }
      ],
      actions: [
        { type: 'adjust_price', parameters: { useRecommendation: true } },
        { type: 'send_notification', parameters: { type: 'automated_update' } }
      ],
      riskLevel: 'low',
      maxAdjustmentPercent: 8,
      requiresApproval: false,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      triggerCount: 0
    });

    // Seasonal adjustments
    this.addRule({
      id: 'seasonal-adjustment',
      name: 'Seasonal Price Adjustment',
      description: 'Apply seasonal pricing adjustments during peak/low seasons',
      isActive: true,
      conditions: [
        { type: 'seasonal_factor', operator: 'greater_than', value: 5 },
        { type: 'confidence_score', operator: 'greater_than', value: 0.7 }
      ],
      actions: [
        { type: 'adjust_price', parameters: { useSeasonalFactor: true } },
        { type: 'send_notification', parameters: { type: 'seasonal_adjustment' } }
      ],
      riskLevel: 'low',
      maxAdjustmentPercent: 5,
      requiresApproval: false,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      triggerCount: 0
    });

    // Competitor response
    this.addRule({
      id: 'competitor-response',
      name: 'Competitive Price Response',
      description: 'Respond to significant competitor price changes',
      isActive: true,
      conditions: [
        { type: 'competitor_action', operator: 'greater_than', value: 5 },
        { type: 'market_position', operator: 'equals', value: 'above' }
      ],
      actions: [
        { type: 'schedule_review', parameters: { priority: 'high', days: 1 } },
        { type: 'send_notification', parameters: { type: 'competitor_alert' } }
      ],
      riskLevel: 'medium',
      maxAdjustmentPercent: 12,
      requiresApproval: true,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      triggerCount: 0
    });

    // High-confidence opportunities
    this.addRule({
      id: 'high-confidence-opportunity',
      name: 'High-Confidence Price Increase',
      description: 'Automatically increase prices for high-opportunity units',
      isActive: true,
      conditions: [
        { type: 'confidence_score', operator: 'greater_than', value: 0.9 },
        { type: 'market_position', operator: 'equals', value: 'below' },
        { type: 'days_on_market', operator: 'less_than', value: 14 }
      ],
      actions: [
        { type: 'adjust_price', parameters: { useRecommendation: true } },
        { type: 'send_notification', parameters: { type: 'price_opportunity' } }
      ],
      riskLevel: 'low',
      maxAdjustmentPercent: 5,
      requiresApproval: false,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      triggerCount: 0
    });
  }

  addRule(rule: AutomationRule): void {
    this.rules.set(rule.id, rule);
  }

  updateRule(ruleId: string, updates: Partial<AutomationRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.set(ruleId, { ...rule, ...updates });
    }
  }

  deleteRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  getRules(): AutomationRule[] {
    return Array.from(this.rules.values());
  }

  getActiveRules(): AutomationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.isActive);
  }

  async evaluateUnit(
    unitData: ApartmentIQData, 
    recommendation: PricingRecommendation,
    competitorData?: any,
    seasonalData?: any
  ): Promise<PendingAction[]> {
    if (!this.settings.isEnabled) {
      return [];
    }

    const pendingActions: PendingAction[] = [];
    const activeRules = this.getActiveRules();

    for (const rule of activeRules) {
      if (this.evaluateConditions(rule.conditions, unitData, recommendation, competitorData, seasonalData)) {
        const action = await this.createPendingAction(rule, unitData, recommendation);
        if (action) {
          pendingActions.push(action);
        }
      }
    }

    return pendingActions;
  }

  private evaluateConditions(
    conditions: AutomationCondition[],
    unitData: ApartmentIQData,
    recommendation: PricingRecommendation,
    competitorData?: any,
    seasonalData?: any
  ): boolean {
    return conditions.every(condition => {
      let actualValue: number | string;

      switch (condition.type) {
        case 'days_on_market':
          actualValue = unitData.daysOnMarket;
          break;
        case 'confidence_score':
          actualValue = recommendation.confidenceScore;
          break;
        case 'market_position':
          actualValue = unitData.marketPosition;
          break;
        case 'price_change':
          actualValue = recommendation.adjustmentPercent;
          break;
        case 'competitor_action':
          actualValue = competitorData?.maxPriceChange || 0;
          break;
        case 'seasonal_factor':
          actualValue = seasonalData?.adjustmentPercent || 0;
          break;
        default:
          return false;
      }

      return this.evaluateCondition(condition, actualValue);
    });
  }

  private evaluateCondition(condition: AutomationCondition, actualValue: number | string): boolean {
    const { operator, value, value2 } = condition;

    if (typeof actualValue === 'string') {
      return operator === 'equals' && actualValue === value;
    }

    const numValue = typeof value === 'number' ? value : parseFloat(value as string);
    
    switch (operator) {
      case 'greater_than':
        return actualValue > numValue;
      case 'less_than':
        return actualValue < numValue;
      case 'equals':
        return actualValue === numValue;
      case 'between':
        const numValue2 = typeof value2 === 'number' ? value2 : parseFloat(value2 as string || '0');
        return actualValue >= Math.min(numValue, numValue2) && actualValue <= Math.max(numValue, numValue2);
      default:
        return false;
    }
  }

  private async createPendingAction(
    rule: AutomationRule,
    unitData: ApartmentIQData,
    recommendation: PricingRecommendation
  ): Promise<PendingAction | null> {
    const priceAction = rule.actions.find(a => a.type === 'adjust_price');
    if (!priceAction) {
      return null;
    }

    // Check if adjustment is within rule limits
    const adjustmentPercent = Math.abs(recommendation.adjustmentPercent);
    if (adjustmentPercent > rule.maxAdjustmentPercent) {
      return null;
    }

    const action: PendingAction = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      unitId: unitData.unitId,
      ruleId: rule.id,
      ruleName: rule.name,
      action: priceAction,
      recommendedValue: recommendation.suggestedRent,
      currentValue: recommendation.currentRent,
      confidence: recommendation.confidenceScore,
      riskLevel: rule.riskLevel,
      reasoning: `${rule.description}. ${recommendation.reasoning.join('. ')}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      status: 'pending'
    };

    this.pendingActions.set(action.id, action);

    // Auto-approve if conditions are met
    if (!rule.requiresApproval && 
        this.settings.autoApprovalRules.includes(rule.id) &&
        adjustmentPercent <= this.settings.requireApprovalAbove) {
      await this.approveAction(action.id, 'system');
    }

    return action;
  }

  async approveAction(actionId: string, approvedBy: string): Promise<boolean> {
    const action = this.pendingActions.get(actionId);
    if (!action || action.status !== 'pending') {
      return false;
    }

    action.status = 'approved';
    action.approvedBy = approvedBy;
    action.approvedAt = new Date().toISOString();

    // Execute the action
    return await this.executeAction(action);
  }

  rejectAction(actionId: string, rejectedBy: string): boolean {
    const action = this.pendingActions.get(actionId);
    if (!action || action.status !== 'pending') {
      return false;
    }

    action.status = 'rejected';
    return true;
  }

  private async executeAction(action: PendingAction): Promise<boolean> {
    try {
      // In a real implementation, this would update the actual listing price
      console.log(`🤖 Executing automated price change for Unit ${action.unitId}: $${action.currentValue} → $${action.recommendedValue}`);

      // Log the action
      const log: AutomationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        unitId: action.unitId,
        ruleId: action.ruleId,
        action: 'price_adjustment',
        oldValue: action.currentValue,
        newValue: action.recommendedValue,
        success: true,
        triggeredBy: 'system'
      };
      this.logs.push(log);

      // Update rule trigger count
      const rule = this.rules.get(action.ruleId);
      if (rule) {
        rule.triggerCount++;
        rule.lastTriggered = new Date().toISOString();
      }

      // Send notification
      if (this.notificationSystem) {
        await this.notificationSystem.sendNotification(
          this.notificationSystem.createAutomatedUpdateNotification(
            action.unitId,
            action.currentValue,
            action.recommendedValue,
            action.reasoning
          )
        );
      }

      action.status = 'executed';
      action.executedAt = new Date().toISOString();

      return true;
    } catch (error) {
      console.error(`Failed to execute action ${action.id}:`, error);
      
      const log: AutomationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        unitId: action.unitId,
        ruleId: action.ruleId,
        action: 'price_adjustment',
        oldValue: action.currentValue,
        newValue: action.recommendedValue,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        triggeredBy: 'system'
      };
      this.logs.push(log);

      return false;
    }
  }

  getPendingActions(status?: PendingAction['status']): PendingAction[] {
    const actions = Array.from(this.pendingActions.values());
    
    if (status) {
      return actions.filter(action => action.status === status);
    }
    
    return actions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getActionHistory(unitId?: string, limit: number = 50): AutomationLog[] {
    let filtered = this.logs;
    
    if (unitId) {
      filtered = filtered.filter(log => log.unitId === unitId);
    }
    
    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  getAutomationStats(): {
    totalRules: number;
    activeRules: number;
    pendingActions: number;
    executedToday: number;
    successRate: number;
  } {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = this.logs.filter(log => log.timestamp.startsWith(today));
    const successfulToday = todayLogs.filter(log => log.success).length;
    
    return {
      totalRules: this.rules.size,
      activeRules: this.getActiveRules().length,
      pendingActions: this.getPendingActions('pending').length,
      executedToday: todayLogs.length,
      successRate: todayLogs.length > 0 ? (successfulToday / todayLogs.length) * 100 : 100
    };
  }

  updateSettings(newSettings: Partial<AutomationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): AutomationSettings {
    return { ...this.settings };
  }

  // Cleanup expired actions
  cleanupExpiredActions(): void {
    const now = new Date().toISOString();
    
    for (const [actionId, action] of this.pendingActions.entries()) {
      if (action.status === 'pending' && action.expiresAt < now) {
        action.status = 'expired';
      }
    }
  }

  // Demo helper method
  async simulateAutomation(units: ApartmentIQData[], recommendations: PricingRecommendation[]): Promise<void> {
    console.log('🤖 Running automated pricing simulation...');
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const recommendation = recommendations[i];
      
      if (recommendation) {
        const pendingActions = await this.evaluateUnit(unit, recommendation);
        console.log(`Unit ${unit.unitId}: ${pendingActions.length} automation rules triggered`);
      }
    }
    
    // Auto-approve some actions for demo
    const pending = this.getPendingActions('pending');
    for (const action of pending.slice(0, 2)) {
      if (action.riskLevel === 'low') {
        await this.approveAction(action.id, 'system');
      }
    }
  }
}