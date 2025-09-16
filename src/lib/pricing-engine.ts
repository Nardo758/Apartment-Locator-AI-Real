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
  };
  marketTiming: 'optimal' | 'good' | 'fair' | 'poor';
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

  generateRecommendation(unitData: ApartmentIQData, marketContext?: any): PricingRecommendation {
    const baseRent = unitData.currentRent;
    let suggestedRent = baseRent;
    const reasoning: string[] = [];

    // 1. Market velocity adjustment
    const velocityAdj = this.velocityMultipliers[unitData.marketVelocity];
    if (velocityAdj !== 1.0) {
      suggestedRent *= velocityAdj;
      if (velocityAdj > 1.0) {
        reasoning.push(`Hot market (+${((velocityAdj - 1) * 100).toFixed(1)}%)`);
      } else {
        reasoning.push(`Slow market (${((velocityAdj - 1) * 100).toFixed(1)}%)`);
      }
    }

    // 2. Days on market penalty
    const domPenalty = this.calculateDOMPenalty(unitData.daysOnMarket);
    if (domPenalty > 0) {
      suggestedRent *= (1 - domPenalty);
      reasoning.push(`${unitData.daysOnMarket} days on market (-${(domPenalty * 100).toFixed(1)}%)`);
    }

    // 3. Market position adjustment
    const positionAdj = this.positionAdjustments[unitData.marketPosition];
    if (positionAdj !== 0) {
      suggestedRent *= (1 - positionAdj);
      if (positionAdj > 0) {
        reasoning.push(`Above market pricing (-${(positionAdj * 100).toFixed(1)}%)`);
      } else {
        reasoning.push(`Below market opportunity (+${(Math.abs(positionAdj) * 100).toFixed(1)}%)`);
      }
    }

    // 4. Concession urgency adjustment
    const concessionAdj = this.concessionAdjustments[unitData.concessionUrgency];
    if (concessionAdj > 0) {
      suggestedRent *= (1 - concessionAdj);
      reasoning.push(`High concession urgency (-${(concessionAdj * 100).toFixed(1)}%)`);
    }

    // 5. Rent trend consideration
    if (unitData.rentTrend === 'decreasing' && unitData.rentChangePercent < -5) {
      suggestedRent *= 0.98; // Additional 2% if strong downward trend
      reasoning.push('Strong downward rent trend (-2%)');
    } else if (unitData.rentTrend === 'increasing' && unitData.daysOnMarket < 10) {
      suggestedRent *= 1.02; // Can increase if trending up and moving fast
      reasoning.push('Upward rent trend with quick movement (+2%)');
    }

    // 6. Lease probability consideration
    if (unitData.leaseProbability < 0.3) {
      suggestedRent *= 0.95; // 5% reduction for very low probability
      reasoning.push('Very low lease probability (-5%)');
    } else if (unitData.leaseProbability > 0.8) {
      suggestedRent *= 1.02; // 2% increase for high probability
      reasoning.push('High lease probability (+2%)');
    }

    // Calculate final metrics
    const adjustmentAmount = suggestedRent - baseRent;
    const adjustmentPercent = (adjustmentAmount / baseRent) * 100;

    // Determine strategy
    const strategy = this.determineStrategy(adjustmentPercent, unitData.daysOnMarket);
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidence(unitData, marketContext);
    
    // Determine urgency level
    const urgencyLevel = this.determineUrgency(unitData.daysOnMarket, unitData.concessionUrgency);
    
    // Estimate lease timeline
    const expectedLeaseDays = this.estimateLeaseTimeline(
      suggestedRent, baseRent, unitData.marketVelocity, unitData.daysOnMarket
    );
    
    // Calculate revenue impact
    const revenueImpact = this.calculateRevenueImpact(
      baseRent, suggestedRent, unitData.daysOnMarket, expectedLeaseDays
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
      expectedLeaseDays,
      revenueImpact,
      marketTiming
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
}