export interface PortfolioRiskProfile {
  portfolioId: string;
  overallRiskScore: number; // 1-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAssessment: string;
  riskCategories: RiskCategory[];
  concentrationRisks: ConcentrationRisk[];
  marketRisks: MarketRisk[];
  operationalRisks: OperationalRisk[];
  financialRisks: FinancialRisk[];
  mitigationStrategies: MitigationStrategy[];
  stressTestResults: StressTestResult[];
  recommendations: RiskRecommendation[];
}

export interface RiskCategory {
  category: 'market' | 'credit' | 'operational' | 'liquidity' | 'concentration' | 'regulatory';
  riskScore: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  description: string;
  keyIndicators: RiskIndicator[];
}

export interface RiskIndicator {
  name: string;
  currentValue: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'deteriorating';
  description: string;
}

export interface ConcentrationRisk {
  type: 'geographic' | 'property_type' | 'tenant_profile' | 'price_range' | 'lease_expiry';
  description: string;
  concentration: number; // percentage
  riskLevel: 'low' | 'medium' | 'high';
  recommendedLimit: number;
  currentExposure: number;
  diversificationOptions: string[];
}

export interface MarketRisk {
  riskType: 'rent_decline' | 'vacancy_increase' | 'demand_shock' | 'supply_surge' | 'economic_downturn';
  probability: number;
  impact: number; // potential revenue loss percentage
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  description: string;
  triggers: string[];
  hedgingOptions: HedgingStrategy[];
}

export interface OperationalRisk {
  riskType: 'pricing_error' | 'system_failure' | 'compliance_breach' | 'reputation_damage' | 'key_personnel';
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: number;
  controlsInPlace: string[];
  residualRisk: number;
  actionItems: string[];
}

export interface FinancialRisk {
  riskType: 'cash_flow' | 'interest_rate' | 'refinancing' | 'covenant_breach' | 'capital_adequacy';
  exposure: number;
  riskMetrics: {
    valueAtRisk: number; // 95% confidence
    expectedShortfall: number;
    stressLoss: number;
  };
  covenants: FinancialCovenant[];
  liquidityPosition: LiquidityAnalysis;
}

export interface FinancialCovenant {
  covenant: string;
  currentRatio: number;
  requiredRatio: number;
  buffer: number;
  status: 'compliant' | 'warning' | 'breach';
  nextTestDate: string;
}

export interface LiquidityAnalysis {
  availableCash: number;
  creditLines: number;
  monthlyBurnRate: number;
  runwayMonths: number;
  liquidityRatio: number;
  status: 'strong' | 'adequate' | 'tight' | 'critical';
}

export interface HedgingStrategy {
  strategy: string;
  description: string;
  cost: number;
  effectiveness: number; // 0-1
  implementation: string;
  pros: string[];
  cons: string[];
}

export interface MitigationStrategy {
  id: string;
  riskCategory: string;
  strategy: string;
  description: string;
  implementation: {
    steps: string[];
    timeline: number; // days
    cost: number;
    resources: string[];
  };
  effectiveness: number; // 0-1
  status: 'planned' | 'in_progress' | 'implemented' | 'monitoring';
  kpis: string[];
}

export interface StressTestResult {
  scenario: string;
  description: string;
  assumptions: string[];
  impact: {
    revenueDecline: number;
    occupancyDrop: number;
    portfolioValue: number;
    cashFlowImpact: number;
  };
  duration: number; // months
  recoveryTime: number; // months
  survivability: 'strong' | 'moderate' | 'weak' | 'critical';
  requiredActions: string[];
}

export interface RiskRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  recommendation: string;
  rationale: string;
  implementation: {
    timeline: string;
    cost: number;
    complexity: 'low' | 'medium' | 'high';
  };
  expectedBenefit: string;
  riskReduction: number; // percentage
}

export interface RiskAlert {
  id: string;
  type: 'threshold_breach' | 'trend_deterioration' | 'external_event' | 'model_signal';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affectedUnits: string[];
  potentialImpact: number;
  recommendedActions: string[];
  timestamp: string;
  isAcknowledged: boolean;
  resolvedAt?: string;
}

export class RiskManagementSystem {
  private riskProfiles: Map<string, PortfolioRiskProfile> = new Map();
  private alerts: RiskAlert[] = [];
  private riskThresholds: Map<string, number> = new Map();

  constructor() {
    this.initializeRiskThresholds();
  }

  private initializeRiskThresholds(): void {
    this.riskThresholds.set('vacancy_rate', 0.15); // 15%
    this.riskThresholds.set('concentration_limit', 0.30); // 30%
    this.riskThresholds.set('debt_service_coverage', 1.25);
    this.riskThresholds.set('liquidity_ratio', 0.10); // 10%
    this.riskThresholds.set('rent_decline', 0.05); // 5%
  }

  assessPortfolioRisk(portfolioData: any, marketData: any, financialData: any): PortfolioRiskProfile {
    const portfolioId = portfolioData.id || 'portfolio-1';
    
    // Calculate risk categories
    const riskCategories = this.calculateRiskCategories(portfolioData, marketData, financialData);
    
    // Calculate overall risk score
    const overallRiskScore = this.calculateOverallRiskScore(riskCategories);
    
    // Assess concentration risks
    const concentrationRisks = this.assessConcentrationRisks(portfolioData);
    
    // Assess market risks
    const marketRisks = this.assessMarketRisks(marketData, portfolioData);
    
    // Assess operational risks
    const operationalRisks = this.assessOperationalRisks(portfolioData);
    
    // Assess financial risks
    const financialRisks = this.assessFinancialRisks(financialData, portfolioData);
    
    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(riskCategories);
    
    // Run stress tests
    const stressTestResults = this.runStressTests(portfolioData, marketData);
    
    // Generate recommendations
    const recommendations = this.generateRiskRecommendations(riskCategories, concentrationRisks);

    const riskProfile: PortfolioRiskProfile = {
      portfolioId,
      overallRiskScore,
      riskLevel: this.determineRiskLevel(overallRiskScore),
      lastAssessment: new Date().toISOString(),
      riskCategories,
      concentrationRisks,
      marketRisks,
      operationalRisks,
      financialRisks,
      mitigationStrategies,
      stressTestResults,
      recommendations
    };

    this.riskProfiles.set(portfolioId, riskProfile);
    this.generateRiskAlerts(riskProfile);
    
    return riskProfile;
  }

  private calculateRiskCategories(portfolioData: any, marketData: any, financialData: any): RiskCategory[] {
    return [
      {
        category: 'market',
        riskScore: this.calculateMarketRiskScore(marketData, portfolioData),
        trend: 'stable',
        impact: 'high',
        probability: 0.3,
        description: 'Risk from market downturns, rent declines, and demand changes',
        keyIndicators: [
          {
            name: 'Market Rent Growth',
            currentValue: 2.5,
            threshold: 0,
            status: 'normal',
            trend: 'stable',
            description: 'Year-over-year rent growth rate'
          },
          {
            name: 'Vacancy Rate',
            currentValue: 8.2,
            threshold: 15,
            status: 'normal',
            trend: 'stable',
            description: 'Portfolio vacancy rate'
          }
        ]
      },
      {
        category: 'concentration',
        riskScore: this.calculateConcentrationRiskScore(portfolioData),
        trend: 'stable',
        impact: 'medium',
        probability: 0.4,
        description: 'Risk from over-concentration in specific markets or property types',
        keyIndicators: [
          {
            name: 'Geographic Concentration',
            currentValue: 35,
            threshold: 50,
            status: 'normal',
            trend: 'stable',
            description: 'Percentage in single market'
          }
        ]
      },
      {
        category: 'operational',
        riskScore: this.calculateOperationalRiskScore(portfolioData),
        trend: 'improving',
        impact: 'medium',
        probability: 0.2,
        description: 'Risk from operational inefficiencies and system failures',
        keyIndicators: [
          {
            name: 'System Uptime',
            currentValue: 99.5,
            threshold: 99.0,
            status: 'normal',
            trend: 'stable',
            description: 'Pricing system availability'
          }
        ]
      },
      {
        category: 'liquidity',
        riskScore: this.calculateLiquidityRiskScore(financialData),
        trend: 'stable',
        impact: 'high',
        probability: 0.1,
        description: 'Risk from insufficient liquidity to meet obligations',
        keyIndicators: [
          {
            name: 'Cash Ratio',
            currentValue: 12.5,
            threshold: 10.0,
            status: 'normal',
            trend: 'improving',
            description: 'Cash as percentage of monthly expenses'
          }
        ]
      }
    ];
  }

  private calculateMarketRiskScore(marketData: any, portfolioData: any): number {
    let riskScore = 30; // Base score
    
    // Market velocity impact
    const slowMarkets = portfolioData.units?.filter((u: any) => 
      u.marketVelocity === 'slow' || u.marketVelocity === 'stale').length || 0;
    const totalUnits = portfolioData.units?.length || 1;
    const slowMarketRatio = slowMarkets / totalUnits;
    
    riskScore += slowMarketRatio * 30;
    
    // Days on market impact
    const avgDaysOnMarket = portfolioData.units?.reduce((sum: number, u: any) => 
      sum + (u.daysOnMarket || 0), 0) / totalUnits || 0;
    
    if (avgDaysOnMarket > 30) riskScore += 20;
    else if (avgDaysOnMarket > 21) riskScore += 10;
    
    return Math.min(100, riskScore);
  }

  private calculateConcentrationRiskScore(portfolioData: any): number {
    let riskScore = 20; // Base score
    
    // Geographic concentration (mock calculation)
    const primaryMarketShare = 0.35; // 35% in primary market
    if (primaryMarketShare > 0.5) riskScore += 30;
    else if (primaryMarketShare > 0.4) riskScore += 15;
    
    return Math.min(100, riskScore);
  }

  private calculateOperationalRiskScore(portfolioData: any): number {
    // Mock operational risk calculation
    return 25; // Low operational risk
  }

  private calculateLiquidityRiskScore(financialData: any): number {
    // Mock liquidity risk calculation
    const cashRatio = financialData?.cashRatio || 0.125;
    let riskScore = 20;
    
    if (cashRatio < 0.05) riskScore += 40; // Critical
    else if (cashRatio < 0.10) riskScore += 20; // Warning
    
    return Math.min(100, riskScore);
  }

  private calculateOverallRiskScore(riskCategories: RiskCategory[]): number {
    const weights = {
      market: 0.35,
      concentration: 0.20,
      operational: 0.15,
      liquidity: 0.30
    };
    
    let weightedScore = 0;
    let totalWeight = 0;
    
    riskCategories.forEach(category => {
      const weight = weights[category.category as keyof typeof weights] || 0.1;
      weightedScore += category.riskScore * weight;
      totalWeight += weight;
    });
    
    return Math.round(weightedScore / totalWeight);
  }

  private determineRiskLevel(riskScore: number): PortfolioRiskProfile['riskLevel'] {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private assessConcentrationRisks(portfolioData: any): ConcentrationRisk[] {
    return [
      {
        type: 'geographic',
        description: 'High concentration in Austin metro area',
        concentration: 65,
        riskLevel: 'medium',
        recommendedLimit: 50,
        currentExposure: 65,
        diversificationOptions: [
          'Expand to Dallas-Fort Worth market',
          'Consider Houston opportunities',
          'Explore San Antonio market'
        ]
      },
      {
        type: 'property_type',
        description: 'Focus on Class B multifamily properties',
        concentration: 80,
        riskLevel: 'high',
        recommendedLimit: 70,
        currentExposure: 80,
        diversificationOptions: [
          'Add Class A luxury properties',
          'Consider mixed-use developments',
          'Explore student housing segment'
        ]
      },
      {
        type: 'price_range',
        description: 'Concentration in $2,000-$3,000 rent range',
        concentration: 55,
        riskLevel: 'medium',
        recommendedLimit: 60,
        currentExposure: 55,
        diversificationOptions: [
          'Add affordable housing units',
          'Include luxury high-end units',
          'Diversify across price segments'
        ]
      }
    ];
  }

  private assessMarketRisks(marketData: any, portfolioData: any): MarketRisk[] {
    return [
      {
        riskType: 'rent_decline',
        probability: 0.25,
        impact: 8, // 8% potential decline
        timeframe: 'medium_term',
        description: 'Risk of market rent decline due to economic downturn',
        triggers: [
          'Unemployment rate > 6%',
          'GDP growth < 1%',
          'New supply > 15% of existing stock'
        ],
        hedgingOptions: [
          {
            strategy: 'Rent Stabilization Program',
            description: 'Implement minimum rent guarantees for key tenants',
            cost: 25000,
            effectiveness: 0.6,
            implementation: 'Negotiate with top 20% of tenants',
            pros: ['Predictable income', 'Tenant retention'],
            cons: ['Upfront cost', 'Limited upside potential']
          }
        ]
      },
      {
        riskType: 'vacancy_increase',
        probability: 0.35,
        impact: 12,
        timeframe: 'short_term',
        description: 'Risk of increased vacancy from market oversupply',
        triggers: [
          'New construction completions',
          'Economic uncertainty',
          'Competitor aggressive pricing'
        ],
        hedgingOptions: [
          {
            strategy: 'Flexible Lease Terms',
            description: 'Offer varied lease lengths and renewal incentives',
            cost: 15000,
            effectiveness: 0.4,
            implementation: 'Update lease templates and train staff',
            pros: ['Tenant flexibility', 'Competitive advantage'],
            cons: ['Operational complexity', 'Revenue volatility']
          }
        ]
      }
    ];
  }

  private assessOperationalRisks(portfolioData: any): OperationalRisk[] {
    return [
      {
        riskType: 'pricing_error',
        severity: 'medium',
        likelihood: 0.15,
        controlsInPlace: [
          'Automated pricing validation',
          'Daily pricing reports',
          'Management approval for large changes'
        ],
        residualRisk: 0.05,
        actionItems: [
          'Implement additional validation rules',
          'Enhance monitoring dashboards',
          'Regular staff training'
        ]
      },
      {
        riskType: 'system_failure',
        severity: 'high',
        likelihood: 0.08,
        controlsInPlace: [
          'Backup systems',
          'Regular maintenance',
          'Disaster recovery plan'
        ],
        residualRisk: 0.02,
        actionItems: [
          'Test disaster recovery procedures',
          'Upgrade backup infrastructure',
          'Enhance monitoring alerts'
        ]
      }
    ];
  }

  private assessFinancialRisks(financialData: any, portfolioData: any): FinancialRisk[] {
    const mockFinancialRisk: FinancialRisk = {
      riskType: 'cash_flow',
      exposure: 2500000, // $2.5M exposure
      riskMetrics: {
        valueAtRisk: 125000, // 5% of exposure
        expectedShortfall: 200000,
        stressLoss: 375000 // 15% stress scenario
      },
      covenants: [
        {
          covenant: 'Debt Service Coverage Ratio',
          currentRatio: 1.45,
          requiredRatio: 1.25,
          buffer: 0.20,
          status: 'compliant',
          nextTestDate: '2024-12-31'
        },
        {
          covenant: 'Loan to Value Ratio',
          currentRatio: 0.72,
          requiredRatio: 0.80,
          buffer: 0.08,
          status: 'compliant',
          nextTestDate: '2024-12-31'
        }
      ],
      liquidityPosition: {
        availableCash: 450000,
        creditLines: 1000000,
        monthlyBurnRate: 125000,
        runwayMonths: 11.6,
        liquidityRatio: 0.116,
        status: 'adequate'
      }
    };

    return [mockFinancialRisk];
  }

  private generateMitigationStrategies(riskCategories: RiskCategory[]): MitigationStrategy[] {
    const strategies: MitigationStrategy[] = [];
    
    riskCategories.forEach(category => {
      if (category.riskScore > 50) {
        strategies.push({
          id: `mitigate-${category.category}`,
          riskCategory: category.category,
          strategy: this.getMitigationStrategy(category.category),
          description: this.getMitigationDescription(category.category),
          implementation: {
            steps: this.getMitigationSteps(category.category),
            timeline: this.getMitigationTimeline(category.category),
            cost: this.getMitigationCost(category.category),
            resources: this.getMitigationResources(category.category)
          },
          effectiveness: this.getMitigationEffectiveness(category.category),
          status: 'planned',
          kpis: this.getMitigationKPIs(category.category)
        });
      }
    });
    
    return strategies;
  }

  private getMitigationStrategy(category: string): string {
    const strategies = {
      market: 'Dynamic Pricing and Market Diversification',
      concentration: 'Geographic and Asset Diversification',
      operational: 'Process Automation and Redundancy',
      liquidity: 'Cash Management and Credit Facility'
    };
    return strategies[category as keyof typeof strategies] || 'Risk Monitoring';
  }

  private getMitigationDescription(category: string): string {
    const descriptions = {
      market: 'Implement dynamic pricing to respond to market changes and diversify across multiple markets',
      concentration: 'Reduce concentration risk through strategic acquisitions in new markets and property types',
      operational: 'Enhance operational resilience through automation and backup systems',
      liquidity: 'Improve liquidity position through cash management and available credit facilities'
    };
    return descriptions[category as keyof typeof descriptions] || 'Monitor and respond to risk factors';
  }

  private getMitigationSteps(category: string): string[] {
    const steps = {
      market: [
        'Implement advanced pricing algorithms',
        'Identify target markets for expansion',
        'Develop market entry strategy',
        'Execute diversification plan'
      ],
      concentration: [
        'Analyze portfolio concentration metrics',
        'Identify diversification opportunities',
        'Develop acquisition criteria',
        'Execute strategic acquisitions'
      ],
      operational: [
        'Audit current processes',
        'Implement automation tools',
        'Develop backup procedures',
        'Train staff on new systems'
      ],
      liquidity: [
        'Assess current liquidity position',
        'Negotiate credit facilities',
        'Implement cash management system',
        'Monitor liquidity metrics'
      ]
    };
    return steps[category as keyof typeof steps] || ['Monitor risk factors'];
  }

  private getMitigationTimeline(category: string): number {
    const timelines = {
      market: 90,
      concentration: 180,
      operational: 60,
      liquidity: 30
    };
    return timelines[category as keyof typeof timelines] || 60;
  }

  private getMitigationCost(category: string): number {
    const costs = {
      market: 75000,
      concentration: 250000,
      operational: 45000,
      liquidity: 20000
    };
    return costs[category as keyof typeof costs] || 30000;
  }

  private getMitigationResources(category: string): string[] {
    const resources = {
      market: ['Revenue management team', 'Data analysts', 'Market research'],
      concentration: ['Acquisition team', 'Due diligence specialists', 'Capital'],
      operational: ['IT team', 'Operations staff', 'Training resources'],
      liquidity: ['Finance team', 'Banking relationships', 'Treasury management']
    };
    return resources[category as keyof typeof resources] || ['Management team'];
  }

  private getMitigationEffectiveness(category: string): number {
    const effectiveness = {
      market: 0.7,
      concentration: 0.8,
      operational: 0.9,
      liquidity: 0.85
    };
    return effectiveness[category as keyof typeof effectiveness] || 0.7;
  }

  private getMitigationKPIs(category: string): string[] {
    const kpis = {
      market: ['Revenue volatility', 'Market correlation', 'Pricing accuracy'],
      concentration: ['Geographic HHI', 'Property type distribution', 'Revenue concentration'],
      operational: ['System uptime', 'Error rates', 'Process efficiency'],
      liquidity: ['Cash ratio', 'Available credit', 'Debt service coverage']
    };
    return kpis[category as keyof typeof kpis] || ['Risk score'];
  }

  private runStressTests(portfolioData: any, marketData: any): StressTestResult[] {
    return [
      {
        scenario: 'Economic Recession',
        description: 'Moderate economic downturn with 15% rent decline and 25% vacancy increase',
        assumptions: [
          '15% market rent decline',
          '25% increase in vacancy rates',
          '6 month duration',
          'Limited new supply'
        ],
        impact: {
          revenueDecline: 28,
          occupancyDrop: 20,
          portfolioValue: -35,
          cashFlowImpact: -42
        },
        duration: 6,
        recoveryTime: 18,
        survivability: 'moderate',
        requiredActions: [
          'Reduce operating expenses by 15%',
          'Implement aggressive retention programs',
          'Access credit facilities',
          'Defer non-essential capital expenditures'
        ]
      },
      {
        scenario: 'Supply Shock',
        description: 'Significant new supply introduction causing market disruption',
        assumptions: [
          '30% increase in market supply',
          '10% rent pressure',
          '40% increase in vacancy',
          '12 month impact duration'
        ],
        impact: {
          revenueDecline: 22,
          occupancyDrop: 25,
          portfolioValue: -28,
          cashFlowImpact: -35
        },
        duration: 12,
        recoveryTime: 24,
        survivability: 'moderate',
        requiredActions: [
          'Implement competitive pricing strategy',
          'Enhance property differentiation',
          'Increase marketing spend',
          'Consider strategic dispositions'
        ]
      }
    ];
  }

  private generateRiskRecommendations(riskCategories: RiskCategory[], concentrationRisks: ConcentrationRisk[]): RiskRecommendation[] {
    const recommendations: RiskRecommendation[] = [];
    
    // High-risk categories get priority recommendations
    riskCategories.forEach(category => {
      if (category.riskScore > 60) {
        recommendations.push({
          priority: 'high',
          category: category.category,
          recommendation: `Implement comprehensive ${category.category} risk mitigation program`,
          rationale: `${category.category} risk score of ${category.riskScore} exceeds acceptable threshold`,
          implementation: {
            timeline: '60-90 days',
            cost: 50000,
            complexity: 'medium'
          },
          expectedBenefit: `Reduce ${category.category} risk by 30-40%`,
          riskReduction: 35
        });
      }
    });
    
    // Concentration risk recommendations
    const highConcentrationRisks = concentrationRisks.filter(risk => risk.riskLevel === 'high');
    highConcentrationRisks.forEach(risk => {
      recommendations.push({
        priority: 'medium',
        category: 'diversification',
        recommendation: `Reduce ${risk.type} concentration through strategic diversification`,
        rationale: `Current ${risk.concentration}% concentration exceeds recommended ${risk.recommendedLimit}% limit`,
        implementation: {
          timeline: '6-12 months',
          cost: 100000,
          complexity: 'high'
        },
        expectedBenefit: 'Improved portfolio resilience and risk-adjusted returns',
        riskReduction: 25
      });
    });
    
    return recommendations;
  }

  private generateRiskAlerts(riskProfile: PortfolioRiskProfile): void {
    // Generate alerts for high-risk conditions
    if (riskProfile.overallRiskScore > 70) {
      this.alerts.push({
        id: `alert-${Date.now()}`,
        type: 'threshold_breach',
        severity: 'critical',
        title: 'Portfolio Risk Score Exceeds Threshold',
        description: `Overall risk score of ${riskProfile.overallRiskScore} exceeds critical threshold of 70`,
        affectedUnits: ['portfolio-wide'],
        potentialImpact: riskProfile.overallRiskScore,
        recommendedActions: [
          'Review risk mitigation strategies',
          'Implement immediate risk reduction measures',
          'Schedule emergency risk committee meeting'
        ],
        timestamp: new Date().toISOString(),
        isAcknowledged: false
      });
    }
    
    // Generate alerts for specific risk categories
    riskProfile.riskCategories.forEach(category => {
      if (category.riskScore > 80) {
        this.alerts.push({
          id: `alert-${Date.now()}-${category.category}`,
          type: 'threshold_breach',
          severity: 'warning',
          title: `High ${category.category} Risk Detected`,
          description: `${category.category} risk score of ${category.riskScore} requires immediate attention`,
          affectedUnits: ['category-specific'],
          potentialImpact: category.riskScore,
          recommendedActions: [
            `Review ${category.category} risk factors`,
            'Implement targeted mitigation measures',
            'Increase monitoring frequency'
          ],
          timestamp: new Date().toISOString(),
          isAcknowledged: false
        });
      }
    });
  }

  // Public methods for accessing risk data
  getRiskProfile(portfolioId: string): PortfolioRiskProfile | undefined {
    return this.riskProfiles.get(portfolioId);
  }

  getRiskAlerts(severity?: RiskAlert['severity']): RiskAlert[] {
    if (severity) {
      return this.alerts.filter(alert => alert.severity === severity && !alert.isAcknowledged);
    }
    return this.alerts.filter(alert => !alert.isAcknowledged);
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isAcknowledged = true;
    }
  }

  updateRiskThreshold(metric: string, threshold: number): void {
    this.riskThresholds.set(metric, threshold);
  }

  getRiskThresholds(): Map<string, number> {
    return new Map(this.riskThresholds);
  }
}