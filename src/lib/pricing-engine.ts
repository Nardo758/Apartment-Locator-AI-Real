export interface PricingRecommendation {
  unitId: string;
  currentRent: number;
  suggestedRent: number;
  adjustmentAmount: number;
  adjustmentPercent: number;
  confidenceScore: number; // 0-1
  urgencyLevel: 'immediate' | 'soon' | 'moderate' | 'low';
  strategy: 'aggressive_reduction' | 'moderate_reduction' | 'hold' | 'increase';
  reasoning: string[];
  expectedLeaseDays: number;
  revenueImpact: {
    currentAnnualRevenue: number;
    suggestedAnnualRevenue: number;
    totalImpact: number;
    monthsVacantCurrent: number;
    monthsVacantSuggested: number;
    breakEvenDays: number;
    vacancyCostCurrent: number;
    vacancyCostSuggested: number;
    netBenefit: number;
  };
  marketTiming: 'optimal' | 'good' | 'fair' | 'poor';
  leaseTimeline: {
    currentTrajectoryDays: number;
    suggestedTrajectoryDays: number;
    accelerationFactor: number;
    probabilityByWeek: {
      week1: number;
      week2: number;
      week4: number;
      week8: number;
    };
  };
}

export interface ApartmentIQData {
  // Basic unit info
  unitId: string;
  propertyName: string;
  unitNumber: string;
  address: string;
  zipCode: string;
  
  // Pricing data
  currentRent: number;
  originalRent: number;
  effectiveRent: number; // After concessions
  rentPerSqft: number;
  
  // Unit specifications
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  floor: number;
  floorPlan: string;
  
  // Market timing intelligence
  daysOnMarket: number;
  firstSeen: string;
  marketVelocity: 'hot' | 'normal' | 'slow' | 'stale';
  
  // Concession analysis
  concessionValue: number; // Dollar value of concessions
  concessionType: string;
  concessionUrgency: 'none' | 'standard' | 'aggressive' | 'desperate';
  
  // Historical trends
  rentTrend: 'increasing' | 'stable' | 'decreasing';
  rentChangePercent: number;
  concessionTrend: 'none' | 'increasing' | 'decreasing';
  
  // Competitive analysis
  marketPosition: 'below_market' | 'at_market' | 'above_market';
  percentileRank: number; // 1-100 rank vs similar units
  
  // Quality indicators
  amenityScore: number; // 1-100
  locationScore: number; // 1-100
  managementScore: number; // 1-100
  
  // Risk assessment
  leaseProbability: number; // 0-1 probability of quick lease
  negotiationPotential: number; // 1-10 scale
  urgencyScore: number; // 1-10 scale
  
  // Pricing recommendation
  pricingRecommendation?: PricingRecommendation;
  
  // Metadata
  dataFreshness: string;
  confidenceScore: number; // 0-1 reliability of data
}

export interface MLPricingModel {
  confidence: number;
  features: {
    marketTrend: number;
    seasonality: number;
    competitorActivity: number;
    demandSignal: number;
    supplyConstraint: number;
  };
  prediction: {
    optimalPrice: number;
    priceRange: { min: number; max: number };
    leaseTimeEstimate: number;
    riskScore: number;
  };
}

export interface CompetitorData {
  propertyId: string;
  distance: number;
  similarityScore: number;
  currentRent: number;
  daysOnMarket: number;
  concessions: string[];
  amenityScore: number;
  lastUpdated: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: {
    marketVolatility: number;
    competitorPressure: number;
    seasonalRisk: number;
    economicIndicators: number;
  };
  mitigationStrategies: string[];
  recommendedActions: string[];
}

export interface AutomationRule {
  id: string;
  name: string;
  conditions: {
    daysOnMarket?: number;
    marketVelocity?: string[];
    concessionLevel?: string[];
    competitorActivity?: boolean;
  };
  actions: {
    priceAdjustment?: number;
    addConcessions?: string[];
    alertManagement?: boolean;
    autoApply?: boolean;
  };
  enabled: boolean;
  priority: number;
}

export class PricingEngine {
  private velocityMultipliers = {
    hot: 1.05,     // Can price 5% higher in hot market
    normal: 1.0,   // Market rate
    slow: 0.97,    // 3% discount in slow market
    stale: 0.92    // 8% discount in stale market
  };

  private domPenalties: Record<string, number> = {
    '0-7': 0.0,      // No penalty first week
    '8-14': 0.02,    // 2% penalty week 2
    '15-21': 0.04,   // 4% penalty week 3
    '22-30': 0.07,   // 7% penalty week 4
    '31-45': 0.10,   // 10% penalty weeks 5-6
    '46-60': 0.15,   // 15% penalty weeks 7-8
    '61+': 0.20      // 20% penalty after 2 months
  };

  private concessionAdjustments = {
    none: 0.0,
    standard: 0.03,    // 3% adjustment for standard concessions
    aggressive: 0.06,  // 6% adjustment for aggressive concessions
    desperate: 0.12    // 12% adjustment for desperate concessions
  };

  private positionAdjustments = {
    below_market: -0.02,  // Can increase 2% if below market
    at_market: 0.0,       // No adjustment
    above_market: 0.05    // 5% reduction if above market
  };

  // New advanced velocity adjustments based on market conditions
  private marketVelocityPremiums = {
    hot: 0.05,     // 5% premium for hot markets
    normal: 0.0,   // No adjustment for normal markets
    slow: -0.03,   // 3% discount for slow markets
    stale: -0.08   // 8% discount for stale markets
  };

  // Progressive days-on-market penalties
  private progressiveDOMPenalties = [
    { minDays: 0, maxDays: 7, penalty: 0.0 },
    { minDays: 8, maxDays: 14, penalty: 0.02 },
    { minDays: 15, maxDays: 21, penalty: 0.04 },
    { minDays: 22, maxDays: 30, penalty: 0.07 },
    { minDays: 31, maxDays: 45, penalty: 0.10 },
    { minDays: 46, maxDays: 60, penalty: 0.15 },
    { minDays: 61, maxDays: 999, penalty: 0.20 }
  ];

  // Enhanced concession analysis with urgency levels
  private urgencyAdjustments = {
    immediate: 0.12,   // 12% adjustment for immediate urgency
    soon: 0.06,        // 6% adjustment for soon urgency
    moderate: 0.03,    // 3% adjustment for moderate urgency
    low: 0.0           // No adjustment for low urgency
  };

  generateRecommendation(unitData: ApartmentIQData, marketContext?: any): PricingRecommendation {
    const baseRent = unitData.currentRent;
    let suggestedRent = baseRent;
    const reasoning: string[] = [];

    // 1. Advanced Market Velocity Adjustments (Hot markets get 5% premium, stale markets get 8% discount)
    const velocityPremium = this.marketVelocityPremiums[unitData.marketVelocity];
    if (velocityPremium !== 0) {
      suggestedRent *= (1 + velocityPremium);
      if (velocityPremium > 0) {
        reasoning.push(`Hot market premium (+${(velocityPremium * 100).toFixed(1)}%)`);
      } else {
        reasoning.push(`${unitData.marketVelocity} market discount (${(velocityPremium * 100).toFixed(1)}%)`);
      }
    }

    // 2. Progressive Days-on-Market Penalties (2% at week 2 up to 20% after 2 months)
    const domPenalty = this.calculateProgressiveDOMPenalty(unitData.daysOnMarket);
    if (domPenalty > 0) {
      suggestedRent *= (1 - domPenalty);
      reasoning.push(`${unitData.daysOnMarket} days on market penalty (-${(domPenalty * 100).toFixed(1)}%)`);
    }

    // 3. Market Position Logic (Below-market units can increase 2%, above-market get 5% reduction)
    const positionAdj = this.positionAdjustments[unitData.marketPosition];
    if (positionAdj !== 0) {
      suggestedRent *= (1 - positionAdj);
      if (positionAdj > 0) {
        reasoning.push(`Above market position (-${(positionAdj * 100).toFixed(1)}%)`);
      } else {
        reasoning.push(`Below market opportunity (+${(Math.abs(positionAdj) * 100).toFixed(1)}%)`);
      }
    }

    // 4. Enhanced Concession Analysis with urgency levels (3-12% adjustments)
    const urgencyLevel = this.determineUrgency(unitData.daysOnMarket, unitData.concessionUrgency);
    const urgencyAdj = this.urgencyAdjustments[urgencyLevel];
    if (urgencyAdj > 0) {
      suggestedRent *= (1 - urgencyAdj);
      reasoning.push(`${urgencyLevel} urgency level (-${(urgencyAdj * 100).toFixed(1)}%)`);
    }

    // 5. Lease Probability Integration (Units with <30% probability get 5% reduction)
    if (unitData.leaseProbability < 0.3) {
      suggestedRent *= 0.95; // 5% reduction for very low probability
      reasoning.push('Low lease probability (-5%)');
    } else if (unitData.leaseProbability > 0.8) {
      suggestedRent *= 1.02; // 2% increase for high probability
      reasoning.push('High lease probability (+2%)');
    }

    // 6. Advanced Rent Trend Analysis
    if (unitData.rentTrend === 'decreasing' && unitData.rentChangePercent < -5) {
      suggestedRent *= 0.98; // Additional 2% if strong downward trend
      reasoning.push('Strong downward rent trend (-2%)');
    } else if (unitData.rentTrend === 'increasing' && unitData.daysOnMarket < 10) {
      suggestedRent *= 1.02; // Can increase if trending up and moving fast
      reasoning.push('Upward rent trend with quick movement (+2%)');
    }

    // 7. Amenity and Location Score Adjustments
    if (unitData.amenityScore > 80 && unitData.locationScore > 80) {
      suggestedRent *= 1.01; // 1% premium for high-quality units
      reasoning.push('Premium amenities and location (+1%)');
    } else if (unitData.amenityScore < 40 || unitData.locationScore < 40) {
      suggestedRent *= 0.99; // 1% discount for lower-quality units
      reasoning.push('Below-average amenities or location (-1%)');
    }

    // Calculate final metrics
    const adjustmentAmount = suggestedRent - baseRent;
    const adjustmentPercent = (adjustmentAmount / baseRent) * 100;

    // Determine strategy classification
    const strategy = this.determineStrategy(adjustmentPercent, unitData.daysOnMarket);
    
    // Calculate enhanced confidence score
    const confidenceScore = this.calculateEnhancedConfidence(unitData, marketContext);
    
    // Calculate smart lease timeline estimates
    const leaseTimeline = this.calculateSmartLeaseTimeline(
      suggestedRent, baseRent, unitData.marketVelocity, unitData.daysOnMarket
    );
    
    // Calculate comprehensive revenue impact analysis
    const revenueImpact = this.calculateComprehensiveRevenueImpact(
      baseRent, suggestedRent, unitData.daysOnMarket, leaseTimeline.suggestedTrajectoryDays
    );
    
    // Determine market timing
    const marketTiming = this.assessMarketTiming(unitData, marketContext);

    return {
      unitId: unitData.unitId,
      currentRent: baseRent,
      suggestedRent: Math.round(suggestedRent),
      adjustmentAmount: Math.round(adjustmentAmount),
      adjustmentPercent: Math.round(adjustmentPercent * 100) / 100,
      confidenceScore,
      urgencyLevel,
      strategy,
      reasoning,
      expectedLeaseDays: leaseTimeline.suggestedTrajectoryDays,
      revenueImpact,
      marketTiming,
      leaseTimeline
    };
  }

  private calculateDOMPenalty(daysOnMarket: number): number {
    if (daysOnMarket <= 7) return this.domPenalties['0-7'];
    if (daysOnMarket <= 14) return this.domPenalties['8-14'];
    if (daysOnMarket <= 21) return this.domPenalties['15-21'];
    if (daysOnMarket <= 30) return this.domPenalties['22-30'];
    if (daysOnMarket <= 45) return this.domPenalties['31-45'];
    if (daysOnMarket <= 60) return this.domPenalties['46-60'];
    return this.domPenalties['61+'];
  }

  private calculateProgressiveDOMPenalty(daysOnMarket: number): number {
    for (const penalty of this.progressiveDOMPenalties) {
      if (daysOnMarket >= penalty.minDays && daysOnMarket <= penalty.maxDays) {
        return penalty.penalty;
      }
    }
    return 0.20; // Maximum penalty for very long days on market
  }

  private calculateConfidence(unitData: ApartmentIQData, marketContext?: any): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence with more market data
    if (marketContext && marketContext.marketStats) {
      confidence += 0.1;
    }
    
    // Increase confidence with longer market history
    if (unitData.daysOnMarket > 14) {
      confidence += 0.1;
    }
    
    // Decrease confidence if market position is unclear
    if (unitData.marketPosition === 'at_market') {
      confidence -= 0.1;
    }
    
    // Increase confidence with high data freshness
    if (unitData.confidenceScore > 0.8) {
      confidence += 0.1;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private calculateEnhancedConfidence(unitData: ApartmentIQData, marketContext?: any): number {
    let confidence = 0.6; // Base confidence
    
    // Data quality factors
    if (unitData.confidenceScore > 0.8) {
      confidence += 0.15;
    } else if (unitData.confidenceScore > 0.6) {
      confidence += 0.1;
    }
    
    // Market data availability
    if (marketContext && marketContext.marketStats) {
      confidence += 0.1;
      if (marketContext.comparableUnits && marketContext.comparableUnits.length > 5) {
        confidence += 0.05;
      }
    }
    
    // Market timing factors
    if (unitData.daysOnMarket > 30) {
      confidence += 0.1; // More confident about urgent recommendations
    } else if (unitData.daysOnMarket < 7) {
      confidence -= 0.05; // Less confident about new listings
    }
    
    // Market position clarity
    if (unitData.marketPosition !== 'at_market' && unitData.percentileRank !== 50) {
      confidence += 0.05; // More confident when position is clear
    }
    
    // Historical data
    if (unitData.rentTrend !== 'stable') {
      confidence += 0.05; // Trends provide more insight
    }
    
    return Math.min(0.95, Math.max(0.3, confidence));
  }

  private determineUrgency(daysOnMarket: number, concessionUrgency: string): 'immediate' | 'soon' | 'moderate' | 'low' {
    if (daysOnMarket >= 30 || concessionUrgency === 'desperate') {
      return 'immediate';
    } else if (daysOnMarket >= 14 || concessionUrgency === 'aggressive') {
      return 'soon';
    } else if (daysOnMarket >= 7 || concessionUrgency === 'standard') {
      return 'moderate';
    } else {
      return 'low';
    }
  }

  private assessMarketTiming(unitData: ApartmentIQData, marketContext?: any): 'optimal' | 'good' | 'fair' | 'poor' {
    let score = 0;
    
    // Good timing factors
    if (['hot', 'normal'].includes(unitData.marketVelocity)) {
      score += 2;
    }
    if (unitData.rentTrend === 'increasing') {
      score += 1;
    }
    if (unitData.daysOnMarket < 14) {
      score += 1;
    }
    
    // Poor timing factors
    if (unitData.marketVelocity === 'stale') {
      score -= 2;
    }
    if (unitData.rentTrend === 'decreasing') {
      score -= 1;
    }
    if (unitData.daysOnMarket > 30) {
      score -= 2;
    }
    
    if (score >= 3) return 'optimal';
    if (score >= 1) return 'good';
    if (score >= -1) return 'fair';
    return 'poor';
  }

  private determineStrategy(adjustmentPercent: number, daysOnMarket: number): 'aggressive_reduction' | 'moderate_reduction' | 'hold' | 'increase' {
    if (adjustmentPercent <= -10) {
      return 'aggressive_reduction';
    } else if (adjustmentPercent <= -3) {
      return 'moderate_reduction';
    } else if (adjustmentPercent >= 3) {
      return 'increase';
    } else {
      return 'hold';
    }
  }

  private estimateLeaseTimeline(suggestedRent: number, currentRent: number, marketVelocity: string, currentDom: number): number {
    const baseDays: Record<string, number> = {
      'hot': 5,
      'normal': 12,
      'slow': 25,
      'stale': 40
    };
    
    let estimatedDays = baseDays[marketVelocity] || 20;
    
    // Adjust based on price change
    const priceChangeRatio = suggestedRent / currentRent;
    if (priceChangeRatio < 0.95) {  // 5%+ reduction
      estimatedDays = Math.floor(estimatedDays * 0.6);  // Should lease 40% faster
    } else if (priceChangeRatio < 0.98) {  // 2-5% reduction
      estimatedDays = Math.floor(estimatedDays * 0.8);  // Should lease 20% faster
    } else if (priceChangeRatio > 1.02) {  // 2%+ increase
      estimatedDays = Math.floor(estimatedDays * 1.3);  // May take 30% longer
    }
    
    return Math.max(1, estimatedDays);
  }

  private calculateRevenueImpact(currentRent: number, suggestedRent: number, currentDom: number, expectedLeaseDays: number) {
    // Assume current trajectory would take 50% longer than expected with new price
    const currentTrajectoryDays = Math.floor(expectedLeaseDays * 1.5);
    
    // Calculate revenue scenarios over 12 months
    const monthsVacantCurrent = Math.min(currentTrajectoryDays / 30, 2);  // Max 2 months
    const monthsVacantSuggested = Math.min(expectedLeaseDays / 30, 2);    // Max 2 months
    
    // Revenue with current pricing
    const currentRevenue = currentRent * (12 - monthsVacantCurrent);
    
    // Revenue with suggested pricing
    const suggestedRevenue = suggestedRent * (12 - monthsVacantSuggested);
    
    // Total impact
    const totalImpact = suggestedRevenue - currentRevenue;
    
    return {
      currentAnnualRevenue: Math.round(currentRevenue),
      suggestedAnnualRevenue: Math.round(suggestedRevenue),
      totalImpact: Math.round(totalImpact),
      monthsVacantCurrent: Math.round(monthsVacantCurrent * 10) / 10,
      monthsVacantSuggested: Math.round(monthsVacantSuggested * 10) / 10,
      breakEvenDays: Math.max(0, Math.floor((currentRent - suggestedRent) / suggestedRent * 30))
    };
  }

  private calculateSmartLeaseTimeline(suggestedRent: number, currentRent: number, marketVelocity: string, currentDom: number) {
    const baseDays: Record<string, number> = {
      'hot': 5,
      'normal': 12,
      'slow': 25,
      'stale': 40
    };
    
    let suggestedTrajectoryDays = baseDays[marketVelocity] || 20;
    let currentTrajectoryDays = Math.floor(suggestedTrajectoryDays * 1.5);
    
    // Adjust based on price change (40% faster leasing with 5%+ rent cuts)
    const priceChangeRatio = suggestedRent / currentRent;
    if (priceChangeRatio <= 0.95) {  // 5%+ reduction
      suggestedTrajectoryDays = Math.floor(suggestedTrajectoryDays * 0.6);  // 40% faster
    } else if (priceChangeRatio <= 0.98) {  // 2-5% reduction
      suggestedTrajectoryDays = Math.floor(suggestedTrajectoryDays * 0.8);  // 20% faster
    } else if (priceChangeRatio >= 1.02) {  // 2%+ increase
      suggestedTrajectoryDays = Math.floor(suggestedTrajectoryDays * 1.3);  // 30% slower
    }
    
    // Account for current days on market
    if (currentDom > 30) {
      currentTrajectoryDays += 10;
    }
    
    const accelerationFactor = currentTrajectoryDays / suggestedTrajectoryDays;
    
    // Calculate weekly lease probabilities
    const probabilityByWeek = {
      week1: Math.min(0.9, 0.3 + (1 / suggestedTrajectoryDays) * 7 * 2),
      week2: Math.min(0.9, 0.5 + (1 / suggestedTrajectoryDays) * 14 * 1.5),
      week4: Math.min(0.95, 0.7 + (1 / suggestedTrajectoryDays) * 28),
      week8: Math.min(0.98, 0.85 + (1 / suggestedTrajectoryDays) * 56 * 0.5)
    };
    
    return {
      currentTrajectoryDays,
      suggestedTrajectoryDays: Math.max(1, suggestedTrajectoryDays),
      accelerationFactor: Math.round(accelerationFactor * 100) / 100,
      probabilityByWeek
    };
  }

  private calculateComprehensiveRevenueImpact(currentRent: number, suggestedRent: number, currentDom: number, expectedLeaseDays: number) {
    // Enhanced revenue calculation with vacancy costs
    const currentTrajectoryDays = Math.floor(expectedLeaseDays * 1.5);
    
    // Calculate monthly vacancy periods
    const monthsVacantCurrent = Math.min(currentTrajectoryDays / 30, 3);  // Max 3 months
    const monthsVacantSuggested = Math.min(expectedLeaseDays / 30, 3);    // Max 3 months
    
    // Annual revenue calculations
    const currentRevenue = currentRent * (12 - monthsVacantCurrent);
    const suggestedRevenue = suggestedRent * (12 - monthsVacantSuggested);
    
    // Vacancy cost calculations (opportunity cost + carrying costs)
    const monthlyCarryingCost = currentRent * 0.15; // Assume 15% of rent in carrying costs
    const vacancyCostCurrent = monthsVacantCurrent * (currentRent + monthlyCarryingCost);
    const vacancyCostSuggested = monthsVacantSuggested * (suggestedRent + monthlyCarryingCost);
    
    // Net benefit calculation
    const totalImpact = suggestedRevenue - currentRevenue;
    const vacancySavings = vacancyCostCurrent - vacancyCostSuggested;
    const netBenefit = totalImpact + vacancySavings;
    
    // Break-even analysis
    const rentDifference = currentRent - suggestedRent;
    const breakEvenDays = rentDifference > 0 
      ? Math.floor((rentDifference * 30) / (suggestedRent + monthlyCarryingCost))
      : 0;
    
    return {
      currentAnnualRevenue: Math.round(currentRevenue),
      suggestedAnnualRevenue: Math.round(suggestedRevenue),
      totalImpact: Math.round(totalImpact),
      monthsVacantCurrent: Math.round(monthsVacantCurrent * 10) / 10,
      monthsVacantSuggested: Math.round(monthsVacantSuggested * 10) / 10,
      breakEvenDays,
      vacancyCostCurrent: Math.round(vacancyCostCurrent),
      vacancyCostSuggested: Math.round(vacancyCostSuggested),
      netBenefit: Math.round(netBenefit)
    };
  }
}

export interface PortfolioImpactSummary {
  totalUnits: number;
  totalCurrentRevenue: number;
  totalSuggestedRevenue: number;
  totalImpact: number;
  totalVacancySavings: number;
  totalNetBenefit: number;
  averageConfidenceScore: number;
  strategyDistribution: Record<string, number>;
  urgencyDistribution: Record<string, number>;
  recommendedActions: {
    immediate: string[];
    soon: string[];
    moderate: string[];
  };
}

export class PortfolioAnalyzer {
  static analyzePortfolio(recommendations: PricingRecommendation[]): PortfolioImpactSummary {
    const totalUnits = recommendations.length;
    
    // Calculate totals
    const totalCurrentRevenue = recommendations.reduce((sum, rec) => 
      sum + rec.revenueImpact.currentAnnualRevenue, 0);
    const totalSuggestedRevenue = recommendations.reduce((sum, rec) => 
      sum + rec.revenueImpact.suggestedAnnualRevenue, 0);
    const totalImpact = recommendations.reduce((sum, rec) => 
      sum + rec.revenueImpact.totalImpact, 0);
    const totalVacancySavings = recommendations.reduce((sum, rec) => 
      sum + (rec.revenueImpact.vacancyCostCurrent - rec.revenueImpact.vacancyCostSuggested), 0);
    const totalNetBenefit = recommendations.reduce((sum, rec) => 
      sum + rec.revenueImpact.netBenefit, 0);
    
    // Calculate averages
    const averageConfidenceScore = totalUnits > 0 
      ? recommendations.reduce((sum, rec) => sum + rec.confidenceScore, 0) / totalUnits
      : 0;
    
    // Strategy distribution
    const strategyDistribution: Record<string, number> = {};
    recommendations.forEach(rec => {
      strategyDistribution[rec.strategy] = (strategyDistribution[rec.strategy] || 0) + 1;
    });
    
    // Urgency distribution
    const urgencyDistribution: Record<string, number> = {};
    recommendations.forEach(rec => {
      urgencyDistribution[rec.urgencyLevel] = (urgencyDistribution[rec.urgencyLevel] || 0) + 1;
    });
    
    // Generate recommended actions
    const immediateActions: string[] = [];
    const soonActions: string[] = [];
    const moderateActions: string[] = [];
    
    recommendations.forEach(rec => {
      const action = `${rec.unitId}: ${rec.strategy} (${rec.adjustmentPercent > 0 ? '+' : ''}${rec.adjustmentPercent}%)`;
      
      switch (rec.urgencyLevel) {
        case 'immediate':
          immediateActions.push(action);
          break;
        case 'soon':
          soonActions.push(action);
          break;
        case 'moderate':
          moderateActions.push(action);
          break;
      }
    });
    
    return {
      totalUnits,
      totalCurrentRevenue: Math.round(totalCurrentRevenue),
      totalSuggestedRevenue: Math.round(totalSuggestedRevenue),
      totalImpact: Math.round(totalImpact),
      totalVacancySavings: Math.round(totalVacancySavings),
      totalNetBenefit: Math.round(totalNetBenefit),
      averageConfidenceScore: Math.round(averageConfidenceScore * 100) / 100,
      strategyDistribution,
      urgencyDistribution,
      recommendedActions: {
        immediate: immediateActions.slice(0, 10), // Limit to top 10
        soon: soonActions.slice(0, 10),
        moderate: moderateActions.slice(0, 10)
      }
    };
  }

  static generatePortfolioInsights(summary: PortfolioImpactSummary): string[] {
    const insights: string[] = [];
    
    // Revenue impact insights
    if (summary.totalImpact > 0) {
      insights.push(`Portfolio could generate $${summary.totalImpact.toLocaleString()} additional annual revenue`);
    } else {
      insights.push(`Portfolio optimization could reduce vacancy losses by $${Math.abs(summary.totalVacancySavings).toLocaleString()}`);
    }
    
    // Strategy insights
    const aggressiveCount = summary.strategyDistribution['aggressive_reduction'] || 0;
    if (aggressiveCount > summary.totalUnits * 0.3) {
      insights.push(`${aggressiveCount} units need aggressive pricing adjustments - market conditions are challenging`);
    }
    
    const increaseCount = summary.strategyDistribution['increase'] || 0;
    if (increaseCount > 0) {
      insights.push(`${increaseCount} units have pricing upside potential`);
    }
    
    // Urgency insights
    const immediateCount = summary.urgencyDistribution['immediate'] || 0;
    if (immediateCount > 0) {
      insights.push(`${immediateCount} units require immediate action (30+ days on market)`);
    }
    
    // Confidence insights
    if (summary.averageConfidenceScore > 0.8) {
      insights.push('High confidence in recommendations - strong data quality');
    } else if (summary.averageConfidenceScore < 0.6) {
      insights.push('Moderate confidence - consider gathering more market data');
    }
    
    return insights;
  }
}

// Advanced ML-Based Pricing Intelligence
export class MLPricingIntelligence {
  private static instance: MLPricingIntelligence;
  private competitorCache: Map<string, CompetitorData[]> = new Map();
  private automationRules: AutomationRule[] = [];

  static getInstance(): MLPricingIntelligence {
    if (!MLPricingIntelligence.instance) {
      MLPricingIntelligence.instance = new MLPricingIntelligence();
    }
    return MLPricingIntelligence.instance;
  }

  // ML-Based Price Prediction
  async generateMLPricingModel(unitData: ApartmentIQData, marketContext?: any): Promise<MLPricingModel> {
    const features = this.extractMLFeatures(unitData, marketContext);
    const prediction = await this.runMLPrediction(features, unitData);
    
    return {
      confidence: this.calculateMLConfidence(features, unitData),
      features,
      prediction
    };
  }

  private extractMLFeatures(unitData: ApartmentIQData, marketContext?: any) {
    const currentMonth = new Date().getMonth();
    const seasonalityScore = this.calculateSeasonality(currentMonth);
    
    return {
      marketTrend: this.calculateMarketTrend(unitData, marketContext),
      seasonality: seasonalityScore,
      competitorActivity: this.calculateCompetitorActivity(unitData),
      demandSignal: this.calculateDemandSignal(unitData),
      supplyConstraint: this.calculateSupplyConstraint(unitData, marketContext)
    };
  }

  private async runMLPrediction(features: any, unitData: ApartmentIQData) {
    // Simulated ML model prediction (in production, this would call actual ML service)
    const basePrice = unitData.currentRent;
    const marketMultiplier = 1 + (features.marketTrend * 0.1);
    const seasonalMultiplier = 1 + (features.seasonality * 0.05);
    const demandMultiplier = 1 + (features.demandSignal * 0.08);
    const supplyMultiplier = 1 - (features.supplyConstraint * 0.06);
    
    const optimalPrice = basePrice * marketMultiplier * seasonalMultiplier * demandMultiplier * supplyMultiplier;
    const variance = basePrice * 0.15; // 15% variance
    
    return {
      optimalPrice: Math.round(optimalPrice),
      priceRange: {
        min: Math.round(optimalPrice - variance),
        max: Math.round(optimalPrice + variance)
      },
      leaseTimeEstimate: this.estimateLeaseTime(features, unitData),
      riskScore: this.calculateRiskScore(features, unitData)
    };
  }

  // Risk Assessment Engine
  generateRiskAssessment(unitData: ApartmentIQData, competitors: CompetitorData[], marketContext?: any): RiskAssessment {
    const riskFactors = {
      marketVolatility: this.assessMarketVolatility(unitData, marketContext),
      competitorPressure: this.assessCompetitorPressure(unitData, competitors),
      seasonalRisk: this.assessSeasonalRisk(),
      economicIndicators: this.assessEconomicRisk(marketContext)
    };

    const overallRiskScore = (riskFactors.marketVolatility + riskFactors.competitorPressure + 
                             riskFactors.seasonalRisk + riskFactors.economicIndicators) / 4;

    const overallRisk = this.categorizeRisk(overallRiskScore);
    const mitigationStrategies = this.generateMitigationStrategies(riskFactors, overallRisk);
    const recommendedActions = this.generateRiskActions(riskFactors, unitData);

    return {
      overallRisk,
      riskFactors,
      mitigationStrategies,
      recommendedActions
    };
  }

  // Competitor Monitoring System
  async fetchCompetitorData(unitData: ApartmentIQData, radius: number = 2): Promise<CompetitorData[]> {
    const cacheKey = `${unitData.zipCode}-${radius}`;
    
    if (this.competitorCache.has(cacheKey)) {
      const cached = this.competitorCache.get(cacheKey)!;
      const cacheAge = Date.now() - new Date(cached[0]?.lastUpdated || 0).getTime();
      if (cacheAge < 3600000) { // 1 hour cache
        return cached;
      }
    }

    const competitors = await this.scrapeCompetitorData(unitData, radius);
    this.competitorCache.set(cacheKey, competitors);
    return competitors;
  }

  private async scrapeCompetitorData(unitData: ApartmentIQData, radius: number): Promise<CompetitorData[]> {
    // Simulated competitor data (in production, this would scrape real data)
    const mockCompetitors: CompetitorData[] = [
      {
        propertyId: 'comp-1',
        distance: 0.3,
        similarityScore: 0.85,
        currentRent: unitData.currentRent * 0.95,
        daysOnMarket: 12,
        concessions: ['1 month free'],
        amenityScore: unitData.amenityScore - 5,
        lastUpdated: new Date().toISOString()
      },
      {
        propertyId: 'comp-2',
        distance: 0.8,
        similarityScore: 0.78,
        currentRent: unitData.currentRent * 1.08,
        daysOnMarket: 25,
        concessions: ['$500 deposit', '2 weeks free'],
        amenityScore: unitData.amenityScore + 10,
        lastUpdated: new Date().toISOString()
      },
      {
        propertyId: 'comp-3',
        distance: 1.2,
        similarityScore: 0.72,
        currentRent: unitData.currentRent * 0.92,
        daysOnMarket: 8,
        concessions: [],
        amenityScore: unitData.amenityScore - 15,
        lastUpdated: new Date().toISOString()
      }
    ];

    return mockCompetitors.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  // Automation Engine
  addAutomationRule(rule: AutomationRule): void {
    this.automationRules.push(rule);
    this.automationRules.sort((a, b) => b.priority - a.priority);
  }

  evaluateAutomationRules(unitData: ApartmentIQData, competitors: CompetitorData[]): AutomationRule[] {
    return this.automationRules
      .filter(rule => rule.enabled)
      .filter(rule => this.ruleMatches(rule, unitData, competitors));
  }

  private ruleMatches(rule: AutomationRule, unitData: ApartmentIQData, competitors: CompetitorData[]): boolean {
    const { conditions } = rule;

    if (conditions.daysOnMarket && unitData.daysOnMarket < conditions.daysOnMarket) {
      return false;
    }

    if (conditions.marketVelocity && !conditions.marketVelocity.includes(unitData.marketVelocity)) {
      return false;
    }

    if (conditions.concessionLevel && !conditions.concessionLevel.includes(unitData.concessionUrgency)) {
      return false;
    }

    if (conditions.competitorActivity) {
      const hasActiveCompetitors = competitors.some(comp => comp.daysOnMarket < 14);
      if (!hasActiveCompetitors) return false;
    }

    return true;
  }

  // Helper methods for calculations
  private calculateMarketTrend(unitData: ApartmentIQData, marketContext?: any): number {
    let trend = 0;
    
    if (unitData.rentTrend === 'increasing') trend += 0.5;
    else if (unitData.rentTrend === 'decreasing') trend -= 0.5;
    
    if (marketContext?.marketGrowth > 0.03) trend += 0.3;
    else if (marketContext?.marketGrowth < -0.02) trend -= 0.3;
    
    return Math.max(-1, Math.min(1, trend));
  }

  private calculateSeasonality(month: number): number {
    // Peak season: May-September, Slow season: November-February
    const seasonalityMap = [
      -0.3, -0.2, 0.1, 0.3, 0.5, 0.6, 0.4, 0.3, 0.2, 0.0, -0.2, -0.3
    ];
    return seasonalityMap[month] || 0;
  }

  private calculateCompetitorActivity(unitData: ApartmentIQData): number {
    // Based on concession trends and market velocity
    let activity = 0;
    
    if (unitData.concessionTrend === 'increasing') activity += 0.4;
    if (unitData.marketVelocity === 'stale') activity += 0.3;
    else if (unitData.marketVelocity === 'hot') activity -= 0.2;
    
    return Math.max(0, Math.min(1, activity));
  }

  private calculateDemandSignal(unitData: ApartmentIQData): number {
    let demand = 0.5; // Base demand
    
    if (unitData.leaseProbability > 0.7) demand += 0.3;
    else if (unitData.leaseProbability < 0.3) demand -= 0.3;
    
    if (unitData.daysOnMarket < 7) demand += 0.2;
    else if (unitData.daysOnMarket > 30) demand -= 0.4;
    
    return Math.max(0, Math.min(1, demand));
  }

  private calculateSupplyConstraint(unitData: ApartmentIQData, marketContext?: any): number {
    let constraint = 0.5; // Base constraint
    
    if (marketContext?.inventoryLevels < 0.05) constraint += 0.3; // Low inventory
    else if (marketContext?.inventoryLevels > 0.15) constraint -= 0.3; // High inventory
    
    return Math.max(0, Math.min(1, constraint));
  }

  private calculateMLConfidence(features: any, unitData: ApartmentIQData): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence with better data quality
    if (unitData.confidenceScore > 0.8) confidence += 0.15;
    if (unitData.daysOnMarket > 14) confidence += 0.1; // More market data
    
    // Feature quality adjustments
    const featureQuality = (Math.abs(features.marketTrend) + Math.abs(features.demandSignal)) / 2;
    confidence += featureQuality * 0.1;
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  private estimateLeaseTime(features: any, unitData: ApartmentIQData): number {
    const baseDays = {
      'hot': 7,
      'normal': 14,
      'slow': 28,
      'stale': 45
    }[unitData.marketVelocity] || 21;

    // Adjust based on ML features
    let adjustment = 1.0;
    adjustment *= (1 - features.demandSignal * 0.3); // Higher demand = faster lease
    adjustment *= (1 + features.supplyConstraint * 0.2); // More supply = slower lease
    
    return Math.max(3, Math.round(baseDays * adjustment));
  }

  private calculateRiskScore(features: any, unitData: ApartmentIQData): number {
    let risk = 0.5; // Base risk
    
    risk += features.competitorActivity * 0.3;
    risk += (1 - features.demandSignal) * 0.2;
    risk -= features.seasonality * 0.1;
    
    if (unitData.daysOnMarket > 30) risk += 0.2;
    
    return Math.max(0, Math.min(1, risk));
  }

  private assessMarketVolatility(unitData: ApartmentIQData, marketContext?: any): number {
    let volatility = 0.5;
    
    if (unitData.rentChangePercent && Math.abs(unitData.rentChangePercent) > 10) {
      volatility += 0.3;
    }
    
    if (marketContext?.priceVolatility > 0.15) {
      volatility += 0.2;
    }
    
    return Math.max(0, Math.min(1, volatility));
  }

  private assessCompetitorPressure(unitData: ApartmentIQData, competitors: CompetitorData[]): number {
    if (!competitors.length) return 0.3;
    
    const avgCompetitorRent = competitors.reduce((sum, comp) => sum + comp.currentRent, 0) / competitors.length;
    const rentDifference = (unitData.currentRent - avgCompetitorRent) / avgCompetitorRent;
    
    let pressure = 0.5;
    if (rentDifference > 0.1) pressure += 0.3; // 10% above market
    else if (rentDifference < -0.05) pressure -= 0.2; // 5% below market
    
    // Factor in competitor concessions
    const competitorConcessions = competitors.reduce((sum, comp) => sum + comp.concessions.length, 0);
    pressure += (competitorConcessions / competitors.length) * 0.1;
    
    return Math.max(0, Math.min(1, pressure));
  }

  private assessSeasonalRisk(): number {
    const month = new Date().getMonth();
    const seasonalRisk = [0.6, 0.5, 0.3, 0.2, 0.1, 0.1, 0.2, 0.2, 0.3, 0.4, 0.5, 0.6];
    return seasonalRisk[month] || 0.5;
  }

  private assessEconomicRisk(marketContext?: any): number {
    let risk = 0.4; // Base economic risk
    
    if (marketContext?.unemploymentRate > 0.06) risk += 0.2;
    if (marketContext?.interestRates > 0.07) risk += 0.1;
    if (marketContext?.inflationRate > 0.05) risk += 0.1;
    
    return Math.max(0, Math.min(1, risk));
  }

  private categorizeRisk(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 0.3) return 'low';
    if (score < 0.5) return 'medium';
    if (score < 0.7) return 'high';
    return 'critical';
  }

  private generateMitigationStrategies(riskFactors: any, overallRisk: string): string[] {
    const strategies: string[] = [];
    
    if (riskFactors.marketVolatility > 0.6) {
      strategies.push('Consider shorter lease terms to maintain pricing flexibility');
      strategies.push('Implement dynamic pricing adjustments based on market conditions');
    }
    
    if (riskFactors.competitorPressure > 0.6) {
      strategies.push('Enhance unit amenities or services to differentiate from competitors');
      strategies.push('Consider strategic concessions rather than direct rent reductions');
    }
    
    if (riskFactors.seasonalRisk > 0.5) {
      strategies.push('Adjust marketing strategy for seasonal demand patterns');
      strategies.push('Plan maintenance and improvements during low-demand periods');
    }
    
    if (overallRisk === 'critical') {
      strategies.push('Implement immediate pricing review and adjustment protocol');
      strategies.push('Consider professional property management consultation');
    }
    
    return strategies;
  }

  private generateRiskActions(riskFactors: any, unitData: ApartmentIQData): string[] {
    const actions: string[] = [];
    
    if (unitData.daysOnMarket > 45) {
      actions.push('Immediate price reduction of 8-12% recommended');
      actions.push('Review and enhance property marketing materials');
    }
    
    if (riskFactors.competitorPressure > 0.7) {
      actions.push('Conduct competitive analysis within 0.5 mile radius');
      actions.push('Consider offering move-in incentives');
    }
    
    if (riskFactors.marketVolatility > 0.6) {
      actions.push('Increase market monitoring frequency to weekly');
      actions.push('Prepare contingency pricing scenarios');
    }
    
    return actions;
  }
}