export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  category: 'market_shock' | 'economic_cycle' | 'competitive' | 'regulatory' | 'custom';
  timeframe: 'short_term' | 'medium_term' | 'long_term'; // 3mo, 1yr, 3yr
  probability: number; // 0-1
  severity: 'mild' | 'moderate' | 'severe' | 'extreme';
  parameters: ScenarioParameter[];
  assumptions: string[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface ScenarioParameter {
  parameter: string;
  baseValue: number;
  scenarioValue: number;
  changePercent: number;
  unit: string;
  description: string;
  confidence: number; // 0-1
}

export interface ScenarioAnalysis {
  scenarioId: string;
  portfolioId: string;
  analysisDate: string;
  results: ScenarioResult;
  unitImpacts: UnitScenarioImpact[];
  marketImpacts: MarketScenarioImpact[];
  financialImpacts: FinancialScenarioImpact;
  strategicRecommendations: StrategicRecommendation[];
  contingencyPlans: ContingencyPlan[];
  monitoringMetrics: MonitoringMetric[];
}

export interface ScenarioResult {
  overallImpact: 'positive' | 'neutral' | 'negative' | 'severe_negative';
  revenueImpact: {
    currentAnnualRevenue: number;
    scenarioAnnualRevenue: number;
    absoluteChange: number;
    percentageChange: number;
    timeline: RevenueTimeline[];
  };
  occupancyImpact: {
    currentOccupancy: number;
    scenarioOccupancy: number;
    absoluteChange: number;
    timeline: OccupancyTimeline[];
  };
  portfolioValue: {
    currentValue: number;
    scenarioValue: number;
    absoluteChange: number;
    percentageChange: number;
  };
  cashFlowImpact: {
    currentCashFlow: number;
    scenarioCashFlow: number;
    monthlyImpact: number;
    cumulativeImpact: number[];
  };
  recoveryTime: number; // months to return to baseline
  permanentImpact: number; // percentage of impact that's permanent
}

export interface UnitScenarioImpact {
  unitId: string;
  currentRent: number;
  scenarioRent: number;
  rentChange: number;
  occupancyProbability: number;
  daysToLease: number;
  requiredActions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface MarketScenarioImpact {
  market: string;
  currentMetrics: MarketMetrics;
  scenarioMetrics: MarketMetrics;
  competitivePosition: 'improved' | 'maintained' | 'weakened' | 'severely_impacted';
  marketShare: number;
  strategicOptions: string[];
}

export interface MarketMetrics {
  averageRent: number;
  vacancyRate: number;
  absorptionRate: number;
  newSupply: number;
  demandLevel: number;
}

export interface FinancialScenarioImpact {
  debtServiceCoverage: {
    current: number;
    scenario: number;
    covenantBuffer: number;
    riskLevel: 'safe' | 'warning' | 'breach';
  };
  liquidityPosition: {
    monthsOfRunway: number;
    additionalFundingNeeded: number;
    creditUtilization: number;
  };
  returnMetrics: {
    currentROI: number;
    scenarioROI: number;
    currentIRR: number;
    scenarioIRR: number;
  };
  capitalRequirements: {
    additionalCapital: number;
    capitalSources: string[];
    costOfCapital: number;
  };
}

export interface StrategicRecommendation {
  priority: 'immediate' | 'high' | 'medium' | 'low';
  category: 'pricing' | 'operations' | 'capital' | 'portfolio' | 'risk';
  recommendation: string;
  rationale: string;
  implementation: {
    timeline: string;
    cost: number;
    resources: string[];
    dependencies: string[];
  };
  expectedBenefit: string;
  riskMitigation: number; // percentage risk reduction
  successProbability: number;
}

export interface ContingencyPlan {
  trigger: string;
  triggerMetrics: {
    metric: string;
    threshold: number;
    operator: 'greater_than' | 'less_than';
  }[];
  actions: ContingencyAction[];
  decisionPoint: string;
  escalationPath: string[];
  resourceRequirements: string[];
  timeline: string;
  successCriteria: string[];
}

export interface ContingencyAction {
  action: string;
  description: string;
  cost: number;
  timeline: string;
  impact: string;
  reversibility: 'reversible' | 'partially_reversible' | 'irreversible';
}

export interface MonitoringMetric {
  metric: string;
  currentValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  dataSource: string;
  responsibleParty: string;
}

export interface RevenueTimeline {
  month: number;
  baseRevenue: number;
  scenarioRevenue: number;
  cumulativeImpact: number;
}

export interface OccupancyTimeline {
  month: number;
  baseOccupancy: number;
  scenarioOccupancy: number;
  unitsVacant: number;
}

export interface WhatIfAnalysis {
  analysisId: string;
  name: string;
  description: string;
  variables: WhatIfVariable[];
  results: WhatIfResult[];
  sensitivityAnalysis: SensitivityAnalysis;
  optimizationTargets: OptimizationTarget[];
  tradeoffs: TradeoffAnalysis[];
}

export interface WhatIfVariable {
  name: string;
  type: 'rent_change' | 'occupancy_target' | 'concession_level' | 'market_condition';
  currentValue: number;
  testValues: number[];
  unit: string;
  description: string;
}

export interface WhatIfResult {
  variableCombination: Record<string, number>;
  outcomes: {
    revenue: number;
    occupancy: number;
    profitability: number;
    riskScore: number;
  };
  feasibility: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface SensitivityAnalysis {
  mostSensitiveVariables: {
    variable: string;
    sensitivity: number; // impact per unit change
    confidence: number;
  }[];
  interactionEffects: {
    variables: string[];
    interactionStrength: number;
    description: string;
  }[];
  robustStrategies: string[];
}

export interface OptimizationTarget {
  objective: 'maximize_revenue' | 'maximize_occupancy' | 'minimize_risk' | 'maximize_roi';
  weight: number;
  constraints: OptimizationConstraint[];
  optimalStrategy: {
    variables: Record<string, number>;
    expectedOutcome: number;
    confidence: number;
  };
}

export interface OptimizationConstraint {
  variable: string;
  operator: 'min' | 'max' | 'equals';
  value: number;
  description: string;
}

export interface TradeoffAnalysis {
  tradeoff: string;
  options: TradeoffOption[];
  recommendation: string;
  riskAssessment: string;
}

export interface TradeoffOption {
  name: string;
  benefits: string[];
  costs: string[];
  riskLevel: 'low' | 'medium' | 'high';
  expectedOutcome: number;
  probability: number;
}

export class ScenarioPlanner {
  private scenarios: Map<string, ScenarioDefinition> = new Map();
  private analyses: Map<string, ScenarioAnalysis> = new Map();
  private whatIfAnalyses: Map<string, WhatIfAnalysis> = new Map();

  constructor() {
    this.initializePredefinedScenarios();
  }

  private initializePredefinedScenarios(): void {
    // Economic Recession Scenario
    this.addScenario({
      id: 'economic-recession',
      name: 'Economic Recession',
      description: 'Moderate economic downturn affecting employment and rental demand',
      category: 'economic_cycle',
      timeframe: 'medium_term',
      probability: 0.25,
      severity: 'moderate',
      parameters: [
        {
          parameter: 'unemployment_rate',
          baseValue: 3.5,
          scenarioValue: 7.2,
          changePercent: 105.7,
          unit: '%',
          description: 'Regional unemployment rate',
          confidence: 0.8
        },
        {
          parameter: 'median_income',
          baseValue: 65000,
          scenarioValue: 58500,
          changePercent: -10.0,
          unit: '$',
          description: 'Median household income',
          confidence: 0.7
        },
        {
          parameter: 'rental_demand',
          baseValue: 100,
          scenarioValue: 75,
          changePercent: -25.0,
          unit: 'index',
          description: 'Rental demand index',
          confidence: 0.85
        },
        {
          parameter: 'market_rent',
          baseValue: 2500,
          scenarioValue: 2125,
          changePercent: -15.0,
          unit: '$',
          description: 'Average market rent',
          confidence: 0.75
        }
      ],
      assumptions: [
        'Recession lasts 12-18 months',
        'Government stimulus limited',
        'No major industry relocations',
        'Gradual recovery over 24 months'
      ],
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      isActive: true
    });

    // Supply Surge Scenario
    this.addScenario({
      id: 'supply-surge',
      name: 'New Supply Surge',
      description: 'Significant increase in new apartment supply causing market saturation',
      category: 'market_shock',
      timeframe: 'short_term',
      probability: 0.4,
      severity: 'moderate',
      parameters: [
        {
          parameter: 'new_supply',
          baseValue: 1200,
          scenarioValue: 3500,
          changePercent: 191.7,
          unit: 'units',
          description: 'New units coming to market',
          confidence: 0.9
        },
        {
          parameter: 'vacancy_rate',
          baseValue: 8.5,
          scenarioValue: 15.2,
          changePercent: 78.8,
          unit: '%',
          description: 'Market vacancy rate',
          confidence: 0.85
        },
        {
          parameter: 'absorption_rate',
          baseValue: 85,
          scenarioValue: 60,
          changePercent: -29.4,
          unit: '%',
          description: 'Monthly absorption rate',
          confidence: 0.8
        }
      ],
      assumptions: [
        'New supply concentrated in similar property class',
        'Demand remains relatively stable',
        'Competitive pricing pressure',
        'Market rebalances within 18 months'
      ],
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      isActive: true
    });

    // Interest Rate Spike Scenario
    this.addScenario({
      id: 'interest-rate-spike',
      name: 'Interest Rate Spike',
      description: 'Rapid increase in interest rates affecting refinancing and property values',
      category: 'economic_cycle',
      timeframe: 'short_term',
      probability: 0.35,
      severity: 'severe',
      parameters: [
        {
          parameter: 'interest_rates',
          baseValue: 4.5,
          scenarioValue: 8.2,
          changePercent: 82.2,
          unit: '%',
          description: 'Commercial mortgage rates',
          confidence: 0.7
        },
        {
          parameter: 'property_values',
          baseValue: 100,
          scenarioValue: 85,
          changePercent: -15.0,
          unit: 'index',
          description: 'Property value index',
          confidence: 0.75
        },
        {
          parameter: 'refinancing_cost',
          baseValue: 100000,
          scenarioValue: 180000,
          changePercent: 80.0,
          unit: '$',
          description: 'Annual debt service increase',
          confidence: 0.85
        }
      ],
      assumptions: [
        'Fed raises rates aggressively',
        'Credit markets tighten',
        'Property sales volume decreases',
        'Rental demand increases (buy vs rent)'
      ],
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      isActive: true
    });
  }

  addScenario(scenario: ScenarioDefinition): void {
    this.scenarios.set(scenario.id, scenario);
  }

  runScenarioAnalysis(scenarioId: string, portfolioData: any, marketData: any): ScenarioAnalysis {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    const analysis: ScenarioAnalysis = {
      scenarioId,
      portfolioId: portfolioData.id || 'portfolio-1',
      analysisDate: new Date().toISOString(),
      results: this.calculateScenarioResults(scenario, portfolioData, marketData),
      unitImpacts: this.calculateUnitImpacts(scenario, portfolioData),
      marketImpacts: this.calculateMarketImpacts(scenario, marketData),
      financialImpacts: this.calculateFinancialImpacts(scenario, portfolioData),
      strategicRecommendations: this.generateStrategicRecommendations(scenario, portfolioData),
      contingencyPlans: this.generateContingencyPlans(scenario),
      monitoringMetrics: this.generateMonitoringMetrics(scenario)
    };

    this.analyses.set(`${scenarioId}-${Date.now()}`, analysis);
    return analysis;
  }

  private calculateScenarioResults(scenario: ScenarioDefinition, portfolioData: any, marketData: any): ScenarioResult {
    const currentRevenue = portfolioData.units?.reduce((sum: number, unit: any) => 
      sum + (unit.currentRent || 0), 0) || 0;
    
    // Apply scenario parameters to calculate impacts
    const rentChangeParam = scenario.parameters.find(p => p.parameter === 'market_rent');
    const demandChangeParam = scenario.parameters.find(p => p.parameter === 'rental_demand');
    const vacancyChangeParam = scenario.parameters.find(p => p.parameter === 'vacancy_rate');
    
    const rentImpact = rentChangeParam ? rentChangeParam.changePercent / 100 : 0;
    const demandImpact = demandChangeParam ? demandChangeParam.changePercent / 100 : 0;
    const vacancyImpact = vacancyChangeParam ? vacancyChangeParam.changePercent / 100 : 0;
    
    const scenarioRevenue = currentRevenue * (1 + rentImpact) * (1 + demandImpact * 0.5);
    const currentOccupancy = 0.88; // 88% base occupancy
    const scenarioOccupancy = Math.max(0.5, currentOccupancy * (1 - Math.abs(vacancyImpact) * 0.3));
    
    // Generate timeline data
    const revenueTimeline: RevenueTimeline[] = [];
    const occupancyTimeline: OccupancyTimeline[] = [];
    
    for (let month = 1; month <= 24; month++) {
      const progressFactor = Math.min(1, month / 12); // Impact builds over 12 months
      const monthlyRevenue = currentRevenue + (scenarioRevenue - currentRevenue) * progressFactor;
      const monthlyOccupancy = currentOccupancy + (scenarioOccupancy - currentOccupancy) * progressFactor;
      
      revenueTimeline.push({
        month,
        baseRevenue: currentRevenue,
        scenarioRevenue: monthlyRevenue,
        cumulativeImpact: (monthlyRevenue - currentRevenue) * month
      });
      
      occupancyTimeline.push({
        month,
        baseOccupancy: currentOccupancy,
        scenarioOccupancy: monthlyOccupancy,
        unitsVacant: Math.round((1 - monthlyOccupancy) * (portfolioData.units?.length || 100))
      });
    }

    // Calculate recovery time
    const recoveryTime = this.calculateRecoveryTime(scenario, rentImpact);
    const permanentImpact = this.calculatePermanentImpact(scenario);

    return {
      overallImpact: rentImpact < -0.1 ? 'severe_negative' : rentImpact < -0.05 ? 'negative' : 'neutral',
      revenueImpact: {
        currentAnnualRevenue: Math.round(currentRevenue),
        scenarioAnnualRevenue: Math.round(scenarioRevenue),
        absoluteChange: Math.round(scenarioRevenue - currentRevenue),
        percentageChange: Math.round(((scenarioRevenue - currentRevenue) / currentRevenue) * 100 * 100) / 100,
        timeline: revenueTimeline
      },
      occupancyImpact: {
        currentOccupancy: Math.round(currentOccupancy * 100) / 100,
        scenarioOccupancy: Math.round(scenarioOccupancy * 100) / 100,
        absoluteChange: Math.round((scenarioOccupancy - currentOccupancy) * 100) / 100,
        timeline: occupancyTimeline
      },
      portfolioValue: {
        currentValue: currentRevenue * 12, // Simple valuation multiple
        scenarioValue: scenarioRevenue * 12 * (1 - Math.abs(rentImpact) * 0.5),
        absoluteChange: 0,
        percentageChange: 0
      },
      cashFlowImpact: {
        currentCashFlow: currentRevenue * 0.65, // 65% NOI margin
        scenarioCashFlow: scenarioRevenue * 0.65,
        monthlyImpact: (scenarioRevenue - currentRevenue) * 0.65 / 12,
        cumulativeImpact: revenueTimeline.map(r => r.cumulativeImpact * 0.65)
      },
      recoveryTime,
      permanentImpact
    };
  }

  private calculateUnitImpacts(scenario: ScenarioDefinition, portfolioData: any): UnitScenarioImpact[] {
    const units = portfolioData.units || [];
    const rentChangeParam = scenario.parameters.find(p => p.parameter === 'market_rent');
    const rentImpact = rentChangeParam ? rentChangeParam.changePercent / 100 : 0;

    return units.map((unit: any) => {
      const currentRent = unit.currentRent || 2500;
      const scenarioRent = Math.round(currentRent * (1 + rentImpact));
      const rentChange = scenarioRent - currentRent;
      
      // Calculate risk level based on unit characteristics
      const daysOnMarket = unit.daysOnMarket || 0;
      const marketPosition = unit.marketPosition || 'at_market';
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      if (daysOnMarket > 30 && rentImpact < -0.1) riskLevel = 'critical';
      else if (daysOnMarket > 21 && rentImpact < -0.05) riskLevel = 'high';
      else if (rentImpact > -0.03) riskLevel = 'low';

      const requiredActions = this.generateUnitActions(riskLevel, rentChange, daysOnMarket);

      return {
        unitId: unit.unitId || unit.id,
        currentRent,
        scenarioRent,
        rentChange,
        occupancyProbability: Math.max(0.3, 0.85 + rentImpact * 2),
        daysToLease: Math.max(5, 20 + Math.abs(rentChange) / 50),
        requiredActions,
        riskLevel
      };
    });
  }

  private generateUnitActions(riskLevel: string, rentChange: number, daysOnMarket: number): string[] {
    const actions: string[] = [];
    
    if (riskLevel === 'critical') {
      actions.push('Implement emergency pricing strategy');
      actions.push('Offer significant concessions');
      actions.push('Increase marketing spend by 200%');
      actions.push('Consider temporary rent reduction');
    } else if (riskLevel === 'high') {
      actions.push('Adjust pricing strategy');
      actions.push('Implement targeted concessions');
      actions.push('Enhance marketing efforts');
    } else if (riskLevel === 'medium') {
      actions.push('Monitor market closely');
      actions.push('Prepare contingency pricing');
    } else {
      actions.push('Maintain current strategy');
      actions.push('Monitor for opportunities');
    }
    
    return actions;
  }

  private calculateMarketImpacts(scenario: ScenarioDefinition, marketData: any): MarketScenarioImpact[] {
    // Mock market impact calculation
    const markets = ['Austin', 'Dallas', 'Houston']; // Example markets
    
    return markets.map(market => {
      const rentParam = scenario.parameters.find(p => p.parameter === 'market_rent');
      const vacancyParam = scenario.parameters.find(p => p.parameter === 'vacancy_rate');
      const supplyParam = scenario.parameters.find(p => p.parameter === 'new_supply');
      
      const currentMetrics: MarketMetrics = {
        averageRent: 2500,
        vacancyRate: 8.5,
        absorptionRate: 85,
        newSupply: 1200,
        demandLevel: 100
      };
      
      const scenarioMetrics: MarketMetrics = {
        averageRent: rentParam ? currentMetrics.averageRent * (1 + rentParam.changePercent / 100) : currentMetrics.averageRent,
        vacancyRate: vacancyParam ? currentMetrics.vacancyRate * (1 + vacancyParam.changePercent / 100) : currentMetrics.vacancyRate,
        absorptionRate: currentMetrics.absorptionRate * 0.8, // Assume 20% decline
        newSupply: supplyParam ? supplyParam.scenarioValue : currentMetrics.newSupply,
        demandLevel: currentMetrics.demandLevel * 0.85 // Assume 15% demand decline
      };
      
      const competitivePosition = this.assessCompetitivePosition(currentMetrics, scenarioMetrics);
      
      return {
        market,
        currentMetrics,
        scenarioMetrics,
        competitivePosition,
        marketShare: 12.5, // Mock market share
        strategicOptions: this.generateMarketStrategicOptions(competitivePosition)
      };
    });
  }

  private assessCompetitivePosition(current: MarketMetrics, scenario: MarketMetrics): MarketScenarioImpact['competitivePosition'] {
    const rentChange = (scenario.averageRent - current.averageRent) / current.averageRent;
    const vacancyChange = (scenario.vacancyRate - current.vacancyRate) / current.vacancyRate;
    
    if (rentChange < -0.15 || vacancyChange > 0.5) return 'severely_impacted';
    if (rentChange < -0.05 || vacancyChange > 0.2) return 'weakened';
    if (rentChange > 0 && vacancyChange < 0) return 'improved';
    return 'maintained';
  }

  private generateMarketStrategicOptions(position: MarketScenarioImpact['competitivePosition']): string[] {
    switch (position) {
      case 'severely_impacted':
        return [
          'Consider strategic disposal of underperforming assets',
          'Implement aggressive cost reduction',
          'Explore alternative revenue streams',
          'Negotiate debt restructuring'
        ];
      case 'weakened':
        return [
          'Enhance property differentiation',
          'Implement targeted marketing campaigns',
          'Consider strategic partnerships',
          'Optimize operational efficiency'
        ];
      case 'maintained':
        return [
          'Maintain market position',
          'Monitor competitive landscape',
          'Prepare for market opportunities',
          'Focus on operational excellence'
        ];
      case 'improved':
        return [
          'Capitalize on competitive advantage',
          'Consider strategic acquisitions',
          'Expand market presence',
          'Invest in premium positioning'
        ];
      default:
        return ['Monitor market conditions'];
    }
  }

  private calculateFinancialImpacts(scenario: ScenarioDefinition, portfolioData: any): FinancialScenarioImpact {
    const interestRateParam = scenario.parameters.find(p => p.parameter === 'interest_rates');
    const refinancingParam = scenario.parameters.find(p => p.parameter === 'refinancing_cost');
    
    const currentDSCR = 1.45;
    const scenarioDSCR = interestRateParam ? currentDSCR * (1 - interestRateParam.changePercent / 100 * 0.3) : currentDSCR;
    
    return {
      debtServiceCoverage: {
        current: currentDSCR,
        scenario: Math.round(scenarioDSCR * 100) / 100,
        covenantBuffer: scenarioDSCR - 1.25, // Assuming 1.25 covenant
        riskLevel: scenarioDSCR < 1.25 ? 'breach' : scenarioDSCR < 1.35 ? 'warning' : 'safe'
      },
      liquidityPosition: {
        monthsOfRunway: 11.6,
        additionalFundingNeeded: refinancingParam ? refinancingParam.scenarioValue - refinancingParam.baseValue : 0,
        creditUtilization: 0.65
      },
      returnMetrics: {
        currentROI: 8.5,
        scenarioROI: 6.2,
        currentIRR: 12.3,
        scenarioIRR: 9.1
      },
      capitalRequirements: {
        additionalCapital: refinancingParam ? (refinancingParam.scenarioValue - refinancingParam.baseValue) * 2 : 0,
        capitalSources: ['Credit facilities', 'Partner capital', 'Asset sales'],
        costOfCapital: interestRateParam ? interestRateParam.scenarioValue : 6.5
      }
    };
  }

  private generateStrategicRecommendations(scenario: ScenarioDefinition, portfolioData: any): StrategicRecommendation[] {
    const recommendations: StrategicRecommendation[] = [];
    
    // Generate recommendations based on scenario severity
    if (scenario.severity === 'severe' || scenario.severity === 'extreme') {
      recommendations.push({
        priority: 'immediate',
        category: 'risk',
        recommendation: 'Implement comprehensive risk mitigation strategy',
        rationale: `${scenario.name} poses significant risk to portfolio performance`,
        implementation: {
          timeline: '30 days',
          cost: 50000,
          resources: ['Management team', 'External consultants'],
          dependencies: ['Board approval', 'Stakeholder alignment']
        },
        expectedBenefit: 'Reduce portfolio risk by 40-50%',
        riskMitigation: 45,
        successProbability: 0.8
      });
    }
    
    // Pricing-specific recommendations
    const rentParam = scenario.parameters.find(p => p.parameter === 'market_rent');
    if (rentParam && rentParam.changePercent < -5) {
      recommendations.push({
        priority: 'high',
        category: 'pricing',
        recommendation: 'Implement defensive pricing strategy',
        rationale: 'Market rent decline requires proactive pricing adjustments',
        implementation: {
          timeline: '14 days',
          cost: 25000,
          resources: ['Revenue management team', 'Pricing tools'],
          dependencies: ['Market analysis', 'Competitive intelligence']
        },
        expectedBenefit: 'Maintain occupancy levels and minimize revenue loss',
        riskMitigation: 30,
        successProbability: 0.75
      });
    }
    
    return recommendations;
  }

  private generateContingencyPlans(scenario: ScenarioDefinition): ContingencyPlan[] {
    const plans: ContingencyPlan[] = [];
    
    // Revenue decline contingency
    if (scenario.parameters.some(p => p.parameter === 'market_rent' && p.changePercent < -10)) {
      plans.push({
        trigger: 'Revenue decline exceeds 15%',
        triggerMetrics: [
          { metric: 'monthly_revenue', threshold: -15, operator: 'less_than' },
          { metric: 'occupancy_rate', threshold: 80, operator: 'less_than' }
        ],
        actions: [
          {
            action: 'Implement emergency cost reduction',
            description: 'Reduce operating expenses by 20%',
            cost: 0,
            timeline: '30 days',
            impact: 'Preserve cash flow',
            reversibility: 'partially_reversible'
          },
          {
            action: 'Access emergency credit facility',
            description: 'Draw on available credit lines',
            cost: 15000, // Interest cost
            timeline: '7 days',
            impact: 'Maintain liquidity',
            reversibility: 'reversible'
          }
        ],
        decisionPoint: 'Monthly performance review',
        escalationPath: ['Property Manager', 'Regional Manager', 'Executive Team'],
        resourceRequirements: ['Finance team', 'Operations team'],
        timeline: '90 days',
        successCriteria: ['Cash flow stabilization', 'Occupancy recovery']
      });
    }
    
    return plans;
  }

  private generateMonitoringMetrics(scenario: ScenarioDefinition): MonitoringMetric[] {
    const metrics: MonitoringMetric[] = [
      {
        metric: 'Portfolio Revenue',
        currentValue: 125000,
        warningThreshold: 115000,
        criticalThreshold: 105000,
        frequency: 'weekly',
        dataSource: 'Property management system',
        responsibleParty: 'Revenue Manager'
      },
      {
        metric: 'Occupancy Rate',
        currentValue: 88.5,
        warningThreshold: 85.0,
        criticalThreshold: 80.0,
        frequency: 'daily',
        dataSource: 'Leasing system',
        responsibleParty: 'Leasing Manager'
      }
    ];
    
    // Add scenario-specific metrics
    scenario.parameters.forEach(param => {
      if (param.parameter === 'unemployment_rate') {
        metrics.push({
          metric: 'Regional Unemployment Rate',
          currentValue: param.baseValue,
          warningThreshold: param.baseValue * 1.5,
          criticalThreshold: param.scenarioValue * 0.8,
          frequency: 'monthly',
          dataSource: 'Bureau of Labor Statistics',
          responsibleParty: 'Market Research Analyst'
        });
      }
    });
    
    return metrics;
  }

  private calculateRecoveryTime(scenario: ScenarioDefinition, impact: number): number {
    // Recovery time based on scenario severity and impact
    const baseRecovery = {
      'mild': 6,
      'moderate': 12,
      'severe': 24,
      'extreme': 36
    };
    
    const recoveryMonths = baseRecovery[scenario.severity];
    return Math.round(recoveryMonths * (1 + Math.abs(impact)));
  }

  private calculatePermanentImpact(scenario: ScenarioDefinition): number {
    // Percentage of impact that's permanent
    const permanentImpacts = {
      'mild': 0.1,
      'moderate': 0.2,
      'severe': 0.4,
      'extreme': 0.6
    };
    
    return permanentImpacts[scenario.severity] * 100;
  }

  // What-If Analysis Implementation
  runWhatIfAnalysis(name: string, variables: WhatIfVariable[], portfolioData: any): WhatIfAnalysis {
    const analysisId = `whatif-${Date.now()}`;
    
    // Generate all combinations of variable values
    const results: WhatIfResult[] = this.generateWhatIfResults(variables, portfolioData);
    
    // Perform sensitivity analysis
    const sensitivityAnalysis = this.performSensitivityAnalysis(variables, results);
    
    // Define optimization targets
    const optimizationTargets = this.defineOptimizationTargets(variables, results);
    
    // Analyze tradeoffs
    const tradeoffs = this.analyzeTradeoffs(results);
    
    const analysis: WhatIfAnalysis = {
      analysisId,
      name,
      description: `What-if analysis with ${variables.length} variables`,
      variables,
      results,
      sensitivityAnalysis,
      optimizationTargets,
      tradeoffs
    };
    
    this.whatIfAnalyses.set(analysisId, analysis);
    return analysis;
  }

  private generateWhatIfResults(variables: WhatIfVariable[], portfolioData: any): WhatIfResult[] {
    const results: WhatIfResult[] = [];
    
    // Generate combinations (simplified - in practice would use more sophisticated sampling)
    variables[0].testValues.forEach(value1 => {
      if (variables.length > 1) {
        variables[1].testValues.forEach(value2 => {
          const combination: Record<string, number> = {
            [variables[0].name]: value1,
            [variables[1].name]: value2
          };
          
          const outcomes = this.calculateWhatIfOutcomes(combination, portfolioData);
          
          results.push({
            variableCombination: combination,
            outcomes,
            feasibility: this.assessFeasibility(combination, outcomes),
            recommendations: this.generateWhatIfRecommendations(combination, outcomes)
          });
        });
      } else {
        const combination: Record<string, number> = {
          [variables[0].name]: value1
        };
        
        const outcomes = this.calculateWhatIfOutcomes(combination, portfolioData);
        
        results.push({
          variableCombination: combination,
          outcomes,
          feasibility: this.assessFeasibility(combination, outcomes),
          recommendations: this.generateWhatIfRecommendations(combination, outcomes)
        });
      }
    });
    
    return results;
  }

  private calculateWhatIfOutcomes(combination: Record<string, number>, portfolioData: any): WhatIfResult['outcomes'] {
    const baseRevenue = portfolioData.units?.reduce((sum: number, unit: any) => 
      sum + (unit.currentRent || 0), 0) || 125000;
    
    // Apply variable changes
    let revenue = baseRevenue;
    let occupancy = 88.5;
    let riskScore = 30;
    
    Object.entries(combination).forEach(([variable, value]) => {
      if (variable.includes('rent')) {
        revenue *= (1 + value / 100);
        occupancy *= (1 - Math.abs(value) / 200); // Rent changes affect occupancy
      } else if (variable.includes('occupancy')) {
        occupancy = value;
        revenue *= (value / 100);
      }
    });
    
    const profitability = revenue * 0.65; // 65% NOI margin
    
    return {
      revenue: Math.round(revenue),
      occupancy: Math.round(occupancy * 100) / 100,
      profitability: Math.round(profitability),
      riskScore: Math.round(riskScore)
    };
  }

  private assessFeasibility(combination: Record<string, number>, outcomes: WhatIfResult['outcomes']): WhatIfResult['feasibility'] {
    // Simple feasibility assessment
    if (outcomes.occupancy < 70 || outcomes.revenue < 80000) return 'low';
    if (outcomes.occupancy < 85 || outcomes.revenue < 110000) return 'medium';
    return 'high';
  }

  private generateWhatIfRecommendations(combination: Record<string, number>, outcomes: WhatIfResult['outcomes']): string[] {
    const recommendations: string[] = [];
    
    if (outcomes.occupancy < 80) {
      recommendations.push('Consider rent reduction or concessions to improve occupancy');
    }
    
    if (outcomes.revenue > 140000) {
      recommendations.push('Strong revenue performance - consider expansion opportunities');
    }
    
    if (outcomes.riskScore > 60) {
      recommendations.push('High risk scenario - implement additional risk controls');
    }
    
    return recommendations;
  }

  private performSensitivityAnalysis(variables: WhatIfVariable[], results: WhatIfResult[]): SensitivityAnalysis {
    // Simplified sensitivity analysis
    const mostSensitiveVariables = variables.map(variable => ({
      variable: variable.name,
      sensitivity: this.calculateSensitivity(variable, results),
      confidence: 0.8
    })).sort((a, b) => b.sensitivity - a.sensitivity);
    
    return {
      mostSensitiveVariables,
      interactionEffects: [
        {
          variables: [variables[0]?.name, variables[1]?.name].filter(Boolean),
          interactionStrength: 0.3,
          description: 'Moderate interaction between pricing and occupancy variables'
        }
      ],
      robustStrategies: [
        'Maintain pricing flexibility',
        'Focus on occupancy optimization',
        'Implement dynamic pricing strategies'
      ]
    };
  }

  private calculateSensitivity(variable: WhatIfVariable, results: WhatIfResult[]): number {
    // Calculate how much revenue changes per unit change in variable
    const relevantResults = results.filter(r => 
      Object.keys(r.variableCombination).includes(variable.name)
    );
    
    if (relevantResults.length < 2) return 0;
    
    // Simple sensitivity calculation
    const revenueRange = Math.max(...relevantResults.map(r => r.outcomes.revenue)) - 
                        Math.min(...relevantResults.map(r => r.outcomes.revenue));
    const variableRange = Math.max(...variable.testValues) - Math.min(...variable.testValues);
    
    return variableRange > 0 ? revenueRange / variableRange : 0;
  }

  private defineOptimizationTargets(variables: WhatIfVariable[], results: WhatIfResult[]): OptimizationTarget[] {
    const bestRevenueResult = results.reduce((best, current) => 
      current.outcomes.revenue > best.outcomes.revenue ? current : best
    );
    
    return [
      {
        objective: 'maximize_revenue',
        weight: 1.0,
        constraints: [
          { variable: 'occupancy', operator: 'min', value: 80, description: 'Minimum 80% occupancy' }
        ],
        optimalStrategy: {
          variables: bestRevenueResult.variableCombination,
          expectedOutcome: bestRevenueResult.outcomes.revenue,
          confidence: 0.8
        }
      }
    ];
  }

  private analyzeTradeoffs(results: WhatIfResult[]): TradeoffAnalysis[] {
    return [
      {
        tradeoff: 'Revenue vs. Occupancy',
        options: [
          {
            name: 'High Revenue Strategy',
            benefits: ['Maximum revenue potential', 'Higher profit margins'],
            costs: ['Lower occupancy', 'Higher vacancy risk'],
            riskLevel: 'high',
            expectedOutcome: Math.max(...results.map(r => r.outcomes.revenue)),
            probability: 0.6
          },
          {
            name: 'High Occupancy Strategy',
            benefits: ['Stable occupancy', 'Lower vacancy risk', 'Predictable cash flow'],
            costs: ['Lower revenue per unit', 'Reduced profit margins'],
            riskLevel: 'low',
            expectedOutcome: Math.max(...results.map(r => r.outcomes.occupancy)),
            probability: 0.9
          }
        ],
        recommendation: 'Balanced approach targeting 85% occupancy with moderate pricing',
        riskAssessment: 'Medium risk with good upside potential'
      }
    ];
  }

  // Public methods for accessing data
  getScenario(scenarioId: string): ScenarioDefinition | undefined {
    return this.scenarios.get(scenarioId);
  }

  getAllScenarios(): ScenarioDefinition[] {
    return Array.from(this.scenarios.values());
  }

  getScenarioAnalysis(analysisId: string): ScenarioAnalysis | undefined {
    return this.analyses.get(analysisId);
  }

  getWhatIfAnalysis(analysisId: string): WhatIfAnalysis | undefined {
    return this.whatIfAnalyses.get(analysisId);
  }

  compareScenarios(scenarioIds: string[], portfolioData: any, marketData: any): {
    scenarios: ScenarioAnalysis[];
    comparison: {
      metric: string;
      values: { scenarioId: string; value: number }[];
    }[];
  } {
    const scenarios = scenarioIds.map(id => this.runScenarioAnalysis(id, portfolioData, marketData));
    
    const comparison = [
      {
        metric: 'Revenue Impact (%)',
        values: scenarios.map(s => ({
          scenarioId: s.scenarioId,
          value: s.results.revenueImpact.percentageChange
        }))
      },
      {
        metric: 'Recovery Time (months)',
        values: scenarios.map(s => ({
          scenarioId: s.scenarioId,
          value: s.results.recoveryTime
        }))
      }
    ];
    
    return { scenarios, comparison };
  }
}

export const scenarioPlanner = new ScenarioPlanner();