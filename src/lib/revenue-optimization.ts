export interface DynamicPricingStrategy {
  unitId: string;
  strategyType: 'yield_management' | 'demand_surge' | 'inventory_optimization' | 'competitive_response';
  currentPrice: number;
  targetPrice: number;
  priceFloor: number;
  priceCeiling: number;
  adjustmentTriggers: PricingTrigger[];
  timeWindow: {
    startDate: string;
    endDate: string;
    checkInterval: number; // minutes
  };
  rules: DynamicPricingRule[];
  isActive: boolean;
}

export interface PricingTrigger {
  id: string;
  name: string;
  type: 'inventory_level' | 'demand_spike' | 'competitor_change' | 'time_based' | 'inquiry_volume';
  condition: {
    metric: string;
    operator: 'greater_than' | 'less_than' | 'equals' | 'percentage_change';
    value: number;
    timeframe?: number; // minutes
  };
  action: {
    type: 'increase_price' | 'decrease_price' | 'hold_price' | 'apply_concession';
    amount: number; // percentage or dollar amount
    maxAdjustment: number;
  };
  cooldown: number; // minutes before trigger can fire again
  lastTriggered?: string;
}

export interface DynamicPricingRule {
  priority: number;
  condition: string;
  action: string;
  parameters: Record<string, any>;
}

export interface YieldOptimization {
  unitId: string;
  currentOccupancyRate: number;
  targetOccupancyRate: number;
  revenuePerAvailableUnit: number;
  averageDailyRate: number;
  revenuePotential: number;
  optimization: {
    recommendedPrice: number;
    expectedOccupancy: number;
    projectedRevenue: number;
    revenueGain: number;
    riskAssessment: 'low' | 'medium' | 'high';
  };
  scenarios: YieldScenario[];
}

export interface YieldScenario {
  name: string;
  price: number;
  occupancyRate: number;
  revenue: number;
  profitMargin: number;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}

export interface ConcessionStrategy {
  unitId: string;
  currentConcessions: ConcessionOffer[];
  recommendedConcessions: ConcessionOffer[];
  effectivenessScore: number;
  costBenefit: {
    concessionCost: number;
    expectedRevenueGain: number;
    netBenefit: number;
    paybackPeriod: number; // days
  };
  alternativeStrategies: AlternativeConcession[];
}

export interface ConcessionOffer {
  type: 'rent_discount' | 'free_months' | 'deposit_reduction' | 'amenity_credit' | 'utility_credit';
  value: number;
  duration: number; // months
  description: string;
  cost: number;
  appeal: number; // 1-10 scale
  marketPenetration: number; // percentage of competitors offering similar
}

export interface AlternativeConcession {
  strategy: string;
  concessions: ConcessionOffer[];
  totalCost: number;
  expectedImpact: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RenewalOptimization {
  tenantId: string;
  unitId: string;
  currentRent: number;
  marketRent: number;
  tenantProfile: {
    leaseLength: number;
    paymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
    maintenanceRequests: number;
    renewalHistory: number;
    riskScore: number; // 1-10
  };
  renewalStrategy: {
    recommendedIncrease: number;
    renewalProbability: number;
    retentionValue: number;
    alternativeOptions: RenewalOption[];
  };
}

export interface RenewalOption {
  name: string;
  rentIncrease: number;
  leaseLength: number;
  incentives: string[];
  renewalProbability: number;
  netPresentValue: number;
}

export interface RevenueOptimizationResult {
  portfolioId: string;
  totalUnits: number;
  currentRevenue: number;
  optimizedRevenue: number;
  revenueGain: number;
  optimizationStrategies: OptimizationStrategy[];
  implementationPlan: ImplementationStep[];
  riskAssessment: PortfolioRiskAssessment;
  performanceMetrics: OptimizationMetrics;
}

export interface OptimizationStrategy {
  type: 'dynamic_pricing' | 'yield_management' | 'concession_optimization' | 'renewal_optimization';
  unitsAffected: number;
  revenueImpact: number;
  implementationCost: number;
  timeToImplement: number; // days
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}

export interface ImplementationStep {
  step: number;
  description: string;
  duration: number; // days
  dependencies: number[];
  resources: string[];
  expectedOutcome: string;
}

export interface PortfolioRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  monitoringRequirements: string[];
}

export interface RiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  probability: number;
  description: string;
  mitigation: string;
}

export interface OptimizationMetrics {
  revenueGrowth: number;
  occupancyRate: number;
  averageRent: number;
  netOperatingIncome: number;
  returnOnInvestment: number;
  paybackPeriod: number;
}

export class RevenueOptimizationEngine {
  private strategies: Map<string, DynamicPricingStrategy> = new Map();
  private yieldOptimizations: Map<string, YieldOptimization> = new Map();
  private concessionStrategies: Map<string, ConcessionStrategy> = new Map();
  private renewalOptimizations: Map<string, RenewalOptimization> = new Map();

  // Dynamic Pricing Implementation
  createDynamicPricingStrategy(unitData: any, marketData: any): DynamicPricingStrategy {
    const strategy: DynamicPricingStrategy = {
      unitId: unitData.unitId,
      strategyType: this.determineBestStrategy(unitData, marketData),
      currentPrice: unitData.currentRent,
      targetPrice: this.calculateTargetPrice(unitData, marketData),
      priceFloor: unitData.currentRent * 0.85,
      priceCeiling: unitData.currentRent * 1.15,
      adjustmentTriggers: this.createAdjustmentTriggers(unitData, marketData),
      timeWindow: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        checkInterval: 60 // Check every hour
      },
      rules: this.generateDynamicPricingRules(unitData),
      isActive: true
    };

    this.strategies.set(unitData.unitId, strategy);
    return strategy;
  }

  private determineBestStrategy(unitData: any, marketData: any): DynamicPricingStrategy['strategyType'] {
    const daysOnMarket = unitData.daysOnMarket || 0;
    const marketVelocity = unitData.marketVelocity || 'normal';
    const inventoryLevel = marketData?.inventoryLevel || 50;

    if (inventoryLevel > 80) return 'inventory_optimization';
    if (daysOnMarket > 30) return 'yield_management';
    if (marketVelocity === 'hot') return 'demand_surge';
    return 'competitive_response';
  }

  private calculateTargetPrice(unitData: any, marketData: any): number {
    const basePrice = unitData.currentRent;
    const marketPosition = unitData.marketPosition || 'at_market';
    const daysOnMarket = unitData.daysOnMarket || 0;

    let targetMultiplier = 1.0;

    // Market position adjustment
    if (marketPosition === 'below_market') targetMultiplier += 0.03;
    else if (marketPosition === 'above_market') targetMultiplier -= 0.05;

    // Days on market adjustment
    if (daysOnMarket > 30) targetMultiplier -= 0.08;
    else if (daysOnMarket < 7) targetMultiplier += 0.02;

    return Math.round(basePrice * targetMultiplier);
  }

  private createAdjustmentTriggers(unitData: any, marketData: any): PricingTrigger[] {
    const triggers: PricingTrigger[] = [];

    // Inventory level trigger
    triggers.push({
      id: 'inventory-low',
      name: 'Low Inventory Surge',
      type: 'inventory_level',
      condition: {
        metric: 'available_units',
        operator: 'less_than',
        value: 10,
        timeframe: 60
      },
      action: {
        type: 'increase_price',
        amount: 3, // 3% increase
        maxAdjustment: 8
      },
      cooldown: 240 // 4 hours
    });

    // Demand spike trigger
    triggers.push({
      id: 'demand-spike',
      name: 'High Inquiry Volume',
      type: 'inquiry_volume',
      condition: {
        metric: 'inquiries_per_hour',
        operator: 'greater_than',
        value: 5,
        timeframe: 120
      },
      action: {
        type: 'increase_price',
        amount: 2,
        maxAdjustment: 5
      },
      cooldown: 180
    });

    // Time-based trigger for urgent units
    if (unitData.daysOnMarket > 21) {
      triggers.push({
        id: 'urgent-reduction',
        name: 'Extended Market Time',
        type: 'time_based',
        condition: {
          metric: 'days_since_last_inquiry',
          operator: 'greater_than',
          value: 7
        },
        action: {
          type: 'decrease_price',
          amount: 4,
          maxAdjustment: 12
        },
        cooldown: 1440 // 24 hours
      });
    }

    return triggers;
  }

  private generateDynamicPricingRules(unitData: any): DynamicPricingRule[] {
    return [
      {
        priority: 1,
        condition: 'inquiries_today > 3 AND viewing_requests > 1',
        action: 'increase_price',
        parameters: { amount: 2, max: 5 }
      },
      {
        priority: 2,
        condition: 'days_on_market > 30 AND inquiries_week < 2',
        action: 'decrease_price',
        parameters: { amount: 5, max: 15 }
      },
      {
        priority: 3,
        condition: 'competitor_price_drop > 5% AND market_position = above',
        action: 'decrease_price',
        parameters: { amount: 3, max: 8 }
      }
    ];
  }

  // Yield Management Implementation
  optimizeYield(unitData: any, occupancyData: any, revenueData: any): YieldOptimization {
    const currentOccupancy = occupancyData.occupancyRate || 0.85;
    const currentRevenue = revenueData.monthlyRevenue || unitData.currentRent;
    const revpar = currentRevenue * currentOccupancy;

    const optimization: YieldOptimization = {
      unitId: unitData.unitId,
      currentOccupancyRate: currentOccupancy,
      targetOccupancyRate: this.calculateTargetOccupancy(unitData, occupancyData),
      revenuePerAvailableUnit: revpar,
      averageDailyRate: currentRevenue / 30,
      revenuePotential: this.calculateRevenuePotential(unitData, occupancyData),
      optimization: {
        recommendedPrice: 0,
        expectedOccupancy: 0,
        projectedRevenue: 0,
        revenueGain: 0,
        riskAssessment: 'medium'
      },
      scenarios: []
    };

    // Generate yield scenarios
    optimization.scenarios = this.generateYieldScenarios(unitData, currentOccupancy);
    
    // Select best scenario
    const bestScenario = optimization.scenarios.reduce((best, current) => 
      current.revenue > best.revenue ? current : best
    );

    optimization.optimization = {
      recommendedPrice: bestScenario.price,
      expectedOccupancy: bestScenario.occupancyRate,
      projectedRevenue: bestScenario.revenue,
      revenueGain: bestScenario.revenue - currentRevenue,
      riskAssessment: bestScenario.riskLevel
    };

    this.yieldOptimizations.set(unitData.unitId, optimization);
    return optimization;
  }

  private calculateTargetOccupancy(unitData: any, occupancyData: any): number {
    const marketOccupancy = occupancyData.marketAverage || 0.88;
    const propertyClass = unitData.propertyClass || 'B';
    
    let targetOccupancy = marketOccupancy;
    
    // Adjust based on property class
    if (propertyClass === 'A') targetOccupancy += 0.02;
    else if (propertyClass === 'C') targetOccupancy -= 0.03;
    
    return Math.min(0.98, Math.max(0.75, targetOccupancy));
  }

  private calculateRevenuePotential(unitData: any, occupancyData: any): number {
    const maxRent = unitData.currentRent * 1.15;
    const maxOccupancy = 0.95;
    return maxRent * maxOccupancy;
  }

  private generateYieldScenarios(unitData: any, currentOccupancy: number): YieldScenario[] {
    const baseRent = unitData.currentRent;
    
    return [
      {
        name: 'Revenue Maximization',
        price: Math.round(baseRent * 1.08),
        occupancyRate: Math.max(0.75, currentOccupancy - 0.05),
        revenue: Math.round(baseRent * 1.08 * Math.max(0.75, currentOccupancy - 0.05)),
        profitMargin: 0.65,
        riskLevel: 'medium',
        description: 'Increase rent 8% with slight occupancy decrease'
      },
      {
        name: 'Occupancy Focus',
        price: Math.round(baseRent * 0.96),
        occupancyRate: Math.min(0.95, currentOccupancy + 0.08),
        revenue: Math.round(baseRent * 0.96 * Math.min(0.95, currentOccupancy + 0.08)),
        profitMargin: 0.58,
        riskLevel: 'low',
        description: 'Reduce rent 4% to maximize occupancy'
      },
      {
        name: 'Balanced Approach',
        price: Math.round(baseRent * 1.02),
        occupancyRate: currentOccupancy,
        revenue: Math.round(baseRent * 1.02 * currentOccupancy),
        profitMargin: 0.62,
        riskLevel: 'low',
        description: 'Moderate 2% increase maintaining occupancy'
      }
    ];
  }

  // Concession Optimization
  optimizeConcessions(unitData: any, marketData: any, competitorData: any): ConcessionStrategy {
    const currentConcessions = this.getCurrentConcessions(unitData);
    const marketConcessions = this.analyzeMarketConcessions(competitorData);
    
    const strategy: ConcessionStrategy = {
      unitId: unitData.unitId,
      currentConcessions,
      recommendedConcessions: this.generateOptimalConcessions(unitData, marketConcessions),
      effectivenessScore: this.calculateConcessionEffectiveness(unitData, marketData),
      costBenefit: {
        concessionCost: 0,
        expectedRevenueGain: 0,
        netBenefit: 0,
        paybackPeriod: 0
      },
      alternativeStrategies: []
    };

    // Calculate cost-benefit
    strategy.costBenefit = this.calculateConcessionCostBenefit(
      strategy.recommendedConcessions,
      unitData
    );

    // Generate alternatives
    strategy.alternativeStrategies = this.generateAlternativeConcessionStrategies(
      unitData,
      marketConcessions
    );

    this.concessionStrategies.set(unitData.unitId, strategy);
    return strategy;
  }

  private getCurrentConcessions(unitData: any): ConcessionOffer[] {
    // Mock current concessions
    return unitData.concessions || [];
  }

  private analyzeMarketConcessions(competitorData: any): ConcessionOffer[] {
    // Analyze competitor concessions
    const marketConcessions: ConcessionOffer[] = [
      {
        type: 'free_months',
        value: 1,
        duration: 12,
        description: 'First month free',
        cost: 2500,
        appeal: 8,
        marketPenetration: 45
      },
      {
        type: 'deposit_reduction',
        value: 500,
        duration: 1,
        description: '$500 off security deposit',
        cost: 500,
        appeal: 6,
        marketPenetration: 30
      }
    ];

    return marketConcessions;
  }

  private generateOptimalConcessions(unitData: any, marketConcessions: ConcessionOffer[]): ConcessionOffer[] {
    const daysOnMarket = unitData.daysOnMarket || 0;
    const recommendations: ConcessionOffer[] = [];

    if (daysOnMarket > 30) {
      recommendations.push({
        type: 'free_months',
        value: 1,
        duration: 12,
        description: 'First month free - limited time',
        cost: unitData.currentRent,
        appeal: 9,
        marketPenetration: 45
      });
    }

    if (daysOnMarket > 45) {
      recommendations.push({
        type: 'deposit_reduction',
        value: 1000,
        duration: 1,
        description: 'Reduced security deposit',
        cost: 1000,
        appeal: 7,
        marketPenetration: 30
      });
    }

    return recommendations;
  }

  private calculateConcessionEffectiveness(unitData: any, marketData: any): number {
    // Simulate effectiveness calculation
    const daysOnMarket = unitData.daysOnMarket || 0;
    const marketVelocity = unitData.marketVelocity || 'normal';
    
    let effectiveness = 0.6;
    
    if (daysOnMarket > 30) effectiveness += 0.2;
    if (marketVelocity === 'slow' || marketVelocity === 'stale') effectiveness += 0.15;
    
    return Math.min(0.95, effectiveness);
  }

  private calculateConcessionCostBenefit(concessions: ConcessionOffer[], unitData: any): ConcessionStrategy['costBenefit'] {
    const totalCost = concessions.reduce((sum, c) => sum + c.cost, 0);
    const currentRent = unitData.currentRent;
    const daysOnMarket = unitData.daysOnMarket || 0;
    
    // Estimate revenue gain from faster leasing
    const currentVacancyLoss = (currentRent / 30) * Math.max(0, daysOnMarket - 14);
    const expectedDaysReduction = concessions.length * 10; // 10 days per concession
    const revenueGain = (currentRent / 30) * expectedDaysReduction;
    
    return {
      concessionCost: totalCost,
      expectedRevenueGain: Math.round(revenueGain),
      netBenefit: Math.round(revenueGain - totalCost),
      paybackPeriod: Math.round(totalCost / (currentRent / 30))
    };
  }

  private generateAlternativeConcessionStrategies(unitData: any, marketConcessions: ConcessionOffer[]): AlternativeConcession[] {
    return [
      {
        strategy: 'Aggressive Concession Package',
        concessions: [
          {
            type: 'free_months',
            value: 2,
            duration: 12,
            description: 'Two months free',
            cost: unitData.currentRent * 2,
            appeal: 10,
            marketPenetration: 15
          }
        ],
        totalCost: unitData.currentRent * 2,
        expectedImpact: 25,
        riskLevel: 'high'
      },
      {
        strategy: 'Value-Added Package',
        concessions: [
          {
            type: 'amenity_credit',
            value: 100,
            duration: 12,
            description: 'Monthly amenity credit',
            cost: 1200,
            appeal: 7,
            marketPenetration: 20
          }
        ],
        totalCost: 1200,
        expectedImpact: 15,
        riskLevel: 'low'
      }
    ];
  }

  // Portfolio-wide optimization
  optimizePortfolio(units: any[], marketData: any): RevenueOptimizationResult {
    const totalUnits = units.length;
    const currentRevenue = units.reduce((sum, unit) => sum + (unit.currentRent || 0), 0);
    
    // Apply optimization strategies
    const strategies: OptimizationStrategy[] = [
      {
        type: 'dynamic_pricing',
        unitsAffected: Math.floor(totalUnits * 0.6),
        revenueImpact: currentRevenue * 0.08,
        implementationCost: 5000,
        timeToImplement: 14,
        riskLevel: 'medium',
        description: 'Implement dynamic pricing for 60% of units'
      },
      {
        type: 'yield_management',
        unitsAffected: Math.floor(totalUnits * 0.4),
        revenueImpact: currentRevenue * 0.05,
        implementationCost: 3000,
        timeToImplement: 7,
        riskLevel: 'low',
        description: 'Optimize yield management for underperforming units'
      },
      {
        type: 'concession_optimization',
        unitsAffected: Math.floor(totalUnits * 0.3),
        revenueImpact: currentRevenue * 0.03,
        implementationCost: 2000,
        timeToImplement: 3,
        riskLevel: 'low',
        description: 'Optimize concession strategies for slow-moving units'
      }
    ];

    const totalRevenueGain = strategies.reduce((sum, s) => sum + s.revenueImpact, 0);
    
    return {
      portfolioId: 'portfolio-1',
      totalUnits,
      currentRevenue,
      optimizedRevenue: currentRevenue + totalRevenueGain,
      revenueGain: totalRevenueGain,
      optimizationStrategies: strategies,
      implementationPlan: this.createImplementationPlan(strategies),
      riskAssessment: this.assessPortfolioRisk(strategies, units),
      performanceMetrics: this.calculateOptimizationMetrics(currentRevenue, totalRevenueGain)
    };
  }

  private createImplementationPlan(strategies: OptimizationStrategy[]): ImplementationStep[] {
    return [
      {
        step: 1,
        description: 'Setup dynamic pricing infrastructure and monitoring',
        duration: 7,
        dependencies: [],
        resources: ['Technical team', 'Data integration'],
        expectedOutcome: 'Real-time pricing capability enabled'
      },
      {
        step: 2,
        description: 'Implement yield optimization for underperforming units',
        duration: 5,
        dependencies: [1],
        resources: ['Revenue management team'],
        expectedOutcome: '5% revenue increase for targeted units'
      },
      {
        step: 3,
        description: 'Deploy concession optimization strategies',
        duration: 3,
        dependencies: [1],
        resources: ['Marketing team', 'Leasing staff'],
        expectedOutcome: 'Reduced vacancy periods and improved conversion'
      }
    ];
  }

  private assessPortfolioRisk(strategies: OptimizationStrategy[], units: any[]): PortfolioRiskAssessment {
    const riskFactors: RiskFactor[] = [
      {
        factor: 'Market Volatility',
        impact: 'medium',
        probability: 0.3,
        description: 'Economic downturn could affect demand',
        mitigation: 'Maintain pricing flexibility and monitor leading indicators'
      },
      {
        factor: 'Competitor Response',
        impact: 'medium',
        probability: 0.4,
        description: 'Competitors may match pricing strategies',
        mitigation: 'Focus on value differentiation and service quality'
      }
    ];

    return {
      overallRisk: 'medium',
      riskFactors,
      mitigationStrategies: [
        'Implement gradual price changes',
        'Monitor competitor responses closely',
        'Maintain reserve pricing flexibility'
      ],
      monitoringRequirements: [
        'Daily pricing performance tracking',
        'Weekly competitor analysis',
        'Monthly portfolio performance review'
      ]
    };
  }

  private calculateOptimizationMetrics(currentRevenue: number, revenueGain: number): OptimizationMetrics {
    return {
      revenueGrowth: (revenueGain / currentRevenue) * 100,
      occupancyRate: 88.5,
      averageRent: (currentRevenue + revenueGain) / 12,
      netOperatingIncome: (currentRevenue + revenueGain) * 0.65,
      returnOnInvestment: (revenueGain / 10000) * 100, // Assuming $10k implementation cost
      paybackPeriod: 45 // days
    };
  }

  // Getters for strategies
  getDynamicPricingStrategy(unitId: string): DynamicPricingStrategy | undefined {
    return this.strategies.get(unitId);
  }

  getYieldOptimization(unitId: string): YieldOptimization | undefined {
    return this.yieldOptimizations.get(unitId);
  }

  getConcessionStrategy(unitId: string): ConcessionStrategy | undefined {
    return this.concessionStrategies.get(unitId);
  }
}