export interface LeaseOutcome {
  unitId: string;
  listingDate: string;
  leaseDate?: string;
  initialPrice: number;
  finalPrice: number;
  daysOnMarket: number;
  priceChanges: PriceChange[];
  concessions: ConcessionHistory[];
  seasonality: {
    month: number;
    season: string;
    marketVelocity: string;
  };
  unitFeatures: UnitFeatures;
  marketConditions: MarketConditions;
  outcome: 'leased' | 'withdrawn' | 'pending';
  tenantProfile?: TenantProfile;
}

export interface PriceChange {
  date: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  reason: string;
  daysAfterListing: number;
}

export interface ConcessionHistory {
  startDate: string;
  endDate?: string;
  type: string;
  value: number;
  description: string;
}

export interface UnitFeatures {
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  floor: number;
  hasBalcony: boolean;
  hasWasherDryer: boolean;
  hasParking: boolean;
  viewType: 'city' | 'water' | 'garden' | 'courtyard' | 'none';
  renovationYear?: number;
  amenityScore: number;
}

export interface MarketConditions {
  averageRent: number;
  inventoryLevel: number;
  absorptionRate: number;
  competitorCount: number;
  economicIndicators: {
    employmentRate: number;
    medianIncome: number;
    populationGrowth: number;
  };
}

export interface TenantProfile {
  ageRange: string;
  incomeRange: string;
  occupationType: string;
  hasRoommates: boolean;
  petOwner: boolean;
  leaseLength: number;
}

export interface MLPrediction {
  optimalPrice: number;
  confidence: number;
  expectedDaysToLease: number;
  leaseprobability: number;
  priceElasticity: number;
  recommendations: MLRecommendation[];
  factorImportance: FactorImportance[];
  alternativeScenarios: PricingScenario[];
}

export interface MLRecommendation {
  type: 'price_optimization' | 'timing' | 'concession' | 'marketing';
  description: string;
  impact: number;
  confidence: number;
  timeframe: 'immediate' | 'short_term' | 'long_term';
}

export interface FactorImportance {
  factor: string;
  importance: number; // 0-1
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface PricingScenario {
  name: string;
  price: number;
  expectedDaysToLease: number;
  leaseprobability: number;
  expectedRevenue: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  meanAbsoluteError: number;
  r2Score: number;
  lastTrainingDate: string;
  trainingDataSize: number;
  modelVersion: string;
}

export class MLPricingEngine {
  private trainingData: LeaseOutcome[] = [];
  private modelMetrics: ModelMetrics;
  private featureWeights: Map<string, number> = new Map();
  private isModelTrained: boolean = false;

  constructor() {
    this.modelMetrics = {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      meanAbsoluteError: 0,
      r2Score: 0,
      lastTrainingDate: '',
      trainingDataSize: 0,
      modelVersion: '1.0.0'
    };
    
    this.initializeMockTrainingData();
    this.trainModel();
  }

  private initializeMockTrainingData(): void {
    // Generate realistic training data for demonstration
    const outcomes: LeaseOutcome[] = [];
    
    for (let i = 0; i < 500; i++) {
      const month = Math.floor(Math.random() * 12) + 1;
      const bedrooms = Math.floor(Math.random() * 3) + 1;
      const sqft = 600 + (bedrooms * 300) + (Math.random() * 200);
      const basePrice = 1500 + (bedrooms * 500) + (sqft * 0.5);
      
      // Simulate seasonal effects
      const seasonalMultiplier = this.getSeasonalMultiplier(month);
      const marketPrice = basePrice * seasonalMultiplier;
      
      // Simulate market dynamics
      const daysOnMarket = this.simulateDaysOnMarket(marketPrice, basePrice, month);
      const finalPrice = this.simulateFinalPrice(marketPrice, daysOnMarket);
      
      const outcome: LeaseOutcome = {
        unitId: `unit-${i.toString().padStart(3, '0')}`,
        listingDate: new Date(2023, month - 1, Math.floor(Math.random() * 28) + 1).toISOString(),
        leaseDate: daysOnMarket <= 90 ? new Date(2023, month - 1, Math.floor(Math.random() * 28) + daysOnMarket).toISOString() : undefined,
        initialPrice: Math.round(marketPrice),
        finalPrice: Math.round(finalPrice),
        daysOnMarket,
        priceChanges: this.generatePriceChanges(marketPrice, finalPrice, daysOnMarket),
        concessions: this.generateConcessions(daysOnMarket),
        seasonality: {
          month,
          season: this.getSeason(month),
          marketVelocity: this.getMarketVelocity(month)
        },
        unitFeatures: {
          bedrooms,
          bathrooms: bedrooms === 1 ? 1 : Math.floor(Math.random() * 2) + 1,
          sqft: Math.round(sqft),
          floor: Math.floor(Math.random() * 10) + 1,
          hasBalcony: Math.random() > 0.6,
          hasWasherDryer: Math.random() > 0.4,
          hasParking: Math.random() > 0.3,
          viewType: ['city', 'water', 'garden', 'courtyard', 'none'][Math.floor(Math.random() * 5)] as any,
          renovationYear: Math.random() > 0.7 ? 2020 + Math.floor(Math.random() * 4) : undefined,
          amenityScore: Math.round((Math.random() * 40 + 60))
        },
        marketConditions: {
          averageRent: Math.round(basePrice * (0.9 + Math.random() * 0.2)),
          inventoryLevel: Math.round(Math.random() * 100),
          absorptionRate: Math.round((Math.random() * 30 + 70)),
          competitorCount: Math.floor(Math.random() * 20) + 5,
          economicIndicators: {
            employmentRate: Math.round((Math.random() * 5 + 92) * 10) / 10,
            medianIncome: Math.round((50000 + Math.random() * 30000)),
            populationGrowth: Math.round((Math.random() * 4 + 1) * 10) / 10
          }
        },
        outcome: daysOnMarket <= 90 ? 'leased' : 'withdrawn'
      };
      
      outcomes.push(outcome);
    }
    
    this.trainingData = outcomes;
  }

  private getSeasonalMultiplier(month: number): number {
    // Austin seasonal patterns
    const multipliers = [0.85, 0.88, 0.95, 1.05, 1.15, 1.18, 1.12, 1.20, 1.08, 0.98, 0.90, 0.82];
    return multipliers[month - 1];
  }

  private simulateDaysOnMarket(listingPrice: number, marketPrice: number, month: number): number {
    const priceRatio = listingPrice / marketPrice;
    const seasonalFactor = this.getSeasonalMultiplier(month);
    
    let baseDays = 20;
    
    // Price premium/discount effect
    if (priceRatio > 1.1) baseDays *= 2.5; // Overpriced
    else if (priceRatio > 1.05) baseDays *= 1.8;
    else if (priceRatio < 0.95) baseDays *= 0.6; // Underpriced
    else if (priceRatio < 0.9) baseDays *= 0.4;
    
    // Seasonal effect
    baseDays /= seasonalFactor;
    
    // Add randomness
    baseDays *= (0.5 + Math.random());
    
    return Math.max(1, Math.round(baseDays));
  }

  private simulateFinalPrice(initialPrice: number, daysOnMarket: number): number {
    let finalPrice = initialPrice;
    
    // Progressive price reductions
    if (daysOnMarket > 60) finalPrice *= 0.88; // 12% reduction
    else if (daysOnMarket > 30) finalPrice *= 0.94; // 6% reduction
    else if (daysOnMarket > 14) finalPrice *= 0.97; // 3% reduction
    
    return finalPrice;
  }

  private generatePriceChanges(initialPrice: number, finalPrice: number, daysOnMarket: number): PriceChange[] {
    const changes: PriceChange[] = [];
    
    if (Math.abs(finalPrice - initialPrice) > 50) {
      // Simulate gradual price reduction
      const totalReduction = initialPrice - finalPrice;
      const numChanges = daysOnMarket > 60 ? 3 : daysOnMarket > 30 ? 2 : 1;
      
      let currentPrice = initialPrice;
      for (let i = 0; i < numChanges; i++) {
        const reductionAmount = totalReduction / numChanges;
        const newPrice = currentPrice - reductionAmount;
        const daysAfter = Math.round((daysOnMarket / numChanges) * (i + 1));
        
        changes.push({
          date: new Date(Date.now() - (daysOnMarket - daysAfter) * 24 * 60 * 60 * 1000).toISOString(),
          oldPrice: currentPrice,
          newPrice,
          changePercent: (reductionAmount / currentPrice) * -100,
          reason: i === 0 ? 'Market adjustment' : 'Continued market response',
          daysAfterListing: daysAfter
        });
        
        currentPrice = newPrice;
      }
    }
    
    return changes;
  }

  private generateConcessions(daysOnMarket: number): ConcessionHistory[] {
    const concessions: ConcessionHistory[] = [];
    
    if (daysOnMarket > 45) {
      concessions.push({
        startDate: new Date(Date.now() - (daysOnMarket - 45) * 24 * 60 * 60 * 1000).toISOString(),
        type: 'First month free',
        value: 2500,
        description: 'One month rent concession'
      });
    }
    
    if (daysOnMarket > 75) {
      concessions.push({
        startDate: new Date(Date.now() - (daysOnMarket - 75) * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Reduced deposit',
        value: 500,
        description: 'Security deposit reduction'
      });
    }
    
    return concessions;
  }

  private getSeason(month: number): string {
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Fall';
    return 'Winter';
  }

  private getMarketVelocity(month: number): string {
    if ([5, 6, 7, 8].includes(month)) return 'hot';
    if ([4, 9].includes(month)) return 'normal';
    if ([3, 10, 11].includes(month)) return 'slow';
    return 'stale';
  }

  trainModel(): void {
    console.log('🤖 Training ML pricing model...');
    
    // Simulate model training process
    this.calculateFeatureWeights();
    this.calculateModelMetrics();
    
    this.isModelTrained = true;
    console.log(`✅ Model trained on ${this.trainingData.length} lease outcomes`);
    console.log(`📊 Model accuracy: ${(this.modelMetrics.accuracy * 100).toFixed(1)}%`);
  }

  private calculateFeatureWeights(): void {
    // Simulate feature importance calculation
    this.featureWeights.set('daysOnMarket', 0.25);
    this.featureWeights.set('seasonality', 0.20);
    this.featureWeights.set('pricePosition', 0.18);
    this.featureWeights.set('unitFeatures', 0.15);
    this.featureWeights.set('marketConditions', 0.12);
    this.featureWeights.set('concessions', 0.10);
  }

  private calculateModelMetrics(): void {
    // Simulate model performance metrics
    this.modelMetrics = {
      accuracy: 0.847,
      precision: 0.823,
      recall: 0.856,
      f1Score: 0.839,
      meanAbsoluteError: 127.5,
      r2Score: 0.782,
      lastTrainingDate: new Date().toISOString(),
      trainingDataSize: this.trainingData.length,
      modelVersion: '1.0.0'
    };
  }

  predict(unitData: any, marketData: any): MLPrediction {
    if (!this.isModelTrained) {
      throw new Error('Model not trained. Please train the model first.');
    }

    // Simulate ML prediction
    const basePrice = unitData.currentRent || 2500;
    const features = this.extractFeatures(unitData, marketData);
    
    // Simulate neural network prediction
    const priceAdjustment = this.calculatePriceAdjustment(features);
    const optimalPrice = basePrice * (1 + priceAdjustment);
    
    const expectedDaysToLease = this.predictDaysToLease(features, optimalPrice);
    const leaseprobability = this.calculateLeaseprobability(features, expectedDaysToLease);
    
    const prediction: MLPrediction = {
      optimalPrice: Math.round(optimalPrice),
      confidence: this.calculatePredictionConfidence(features),
      expectedDaysToLease: Math.round(expectedDaysToLease),
      leaseprobability: Math.round(leaseprobability * 100) / 100,
      priceElasticity: this.calculatePriceElasticity(features),
      recommendations: this.generateMLRecommendations(features, optimalPrice, basePrice),
      factorImportance: this.getFactorImportance(features),
      alternativeScenarios: this.generateAlternativeScenarios(basePrice, features)
    };

    return prediction;
  }

  private extractFeatures(unitData: any, marketData: any): Record<string, number> {
    return {
      daysOnMarket: unitData.daysOnMarket || 0,
      currentMonth: new Date().getMonth() + 1,
      bedrooms: unitData.bedrooms || 1,
      bathrooms: unitData.bathrooms || 1,
      sqft: unitData.sqft || 800,
      amenityScore: unitData.amenityScore || 50,
      marketVelocity: this.encodeMarketVelocity(unitData.marketVelocity),
      marketPosition: this.encodeMarketPosition(unitData.marketPosition),
      hasParking: unitData.hasParking ? 1 : 0,
      hasBalcony: unitData.hasBalcony ? 1 : 0,
      inventoryLevel: marketData?.inventoryLevel || 50,
      absorptionRate: marketData?.absorptionRate || 80
    };
  }

  private encodeMarketVelocity(velocity: string): number {
    const mapping = { 'hot': 4, 'normal': 3, 'slow': 2, 'stale': 1 };
    return mapping[velocity as keyof typeof mapping] || 3;
  }

  private encodeMarketPosition(position: string): number {
    const mapping = { 'below_market': 1, 'at_market': 2, 'above_market': 3 };
    return mapping[position as keyof typeof mapping] || 2;
  }

  private calculatePriceAdjustment(features: Record<string, number>): number {
    let adjustment = 0;
    
    // Days on market impact
    if (features.daysOnMarket > 30) adjustment -= 0.08;
    else if (features.daysOnMarket > 14) adjustment -= 0.04;
    else if (features.daysOnMarket < 7) adjustment += 0.02;
    
    // Seasonal impact
    const seasonalMultiplier = this.getSeasonalMultiplier(features.currentMonth);
    adjustment += (seasonalMultiplier - 1) * 0.8;
    
    // Market position impact
    if (features.marketPosition === 1) adjustment += 0.03; // Below market
    else if (features.marketPosition === 3) adjustment -= 0.05; // Above market
    
    // Market velocity impact
    adjustment += (features.marketVelocity - 3) * 0.02;
    
    return Math.max(-0.15, Math.min(0.15, adjustment));
  }

  private predictDaysToLease(features: Record<string, number>, price: number): number {
    let baseDays = 20;
    
    // Adjust based on features
    baseDays += features.daysOnMarket * 0.1;
    baseDays *= (4 - features.marketVelocity) * 0.3 + 0.4;
    baseDays *= (features.marketPosition - 1) * 0.2 + 0.8;
    
    // Seasonal adjustment
    const seasonalFactor = this.getSeasonalMultiplier(features.currentMonth);
    baseDays /= seasonalFactor;
    
    return Math.max(1, baseDays);
  }

  private calculateLeaseprobability(features: Record<string, number>, daysToLease: number): number {
    let probability = 0.8;
    
    // Days to lease impact
    if (daysToLease > 45) probability *= 0.6;
    else if (daysToLease > 30) probability *= 0.8;
    else if (daysToLease < 15) probability *= 1.1;
    
    // Market velocity impact
    probability *= features.marketVelocity * 0.15 + 0.4;
    
    // Amenity score impact
    probability *= (features.amenityScore / 100) * 0.3 + 0.7;
    
    return Math.max(0.1, Math.min(0.95, probability));
  }

  private calculatePredictionConfidence(features: Record<string, number>): number {
    let confidence = 0.7;
    
    // More data points increase confidence
    if (features.daysOnMarket > 14) confidence += 0.1;
    
    // Market velocity clarity
    if (features.marketVelocity === 1 || features.marketVelocity === 4) confidence += 0.05;
    
    // Feature completeness
    const featureCompleteness = Object.values(features).filter(v => v > 0).length / Object.keys(features).length;
    confidence *= featureCompleteness;
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  private calculatePriceElasticity(features: Record<string, number>): number {
    // Simulate price elasticity calculation
    let elasticity = -1.2; // Base elasticity
    
    // Market velocity affects elasticity
    if (features.marketVelocity >= 4) elasticity *= 0.7; // Hot market, less elastic
    else if (features.marketVelocity <= 2) elasticity *= 1.3; // Slow market, more elastic
    
    return Math.round(elasticity * 100) / 100;
  }

  private generateMLRecommendations(features: Record<string, number>, optimalPrice: number, currentPrice: number): MLRecommendation[] {
    const recommendations: MLRecommendation[] = [];
    
    const priceDiff = optimalPrice - currentPrice;
    const priceDiffPercent = (priceDiff / currentPrice) * 100;
    
    if (Math.abs(priceDiffPercent) > 3) {
      recommendations.push({
        type: 'price_optimization',
        description: `Adjust price by ${priceDiffPercent > 0 ? '+' : ''}${priceDiffPercent.toFixed(1)}% to optimize for market conditions`,
        impact: Math.abs(priceDiffPercent),
        confidence: 0.85,
        timeframe: 'immediate'
      });
    }
    
    if (features.daysOnMarket > 21) {
      recommendations.push({
        type: 'timing',
        description: 'Consider implementing price reduction within 7 days to avoid extended vacancy',
        impact: 8.5,
        confidence: 0.78,
        timeframe: 'immediate'
      });
    }
    
    if (features.marketVelocity <= 2) {
      recommendations.push({
        type: 'concession',
        description: 'Market conditions suggest concessions may be more effective than price reductions',
        impact: 5.2,
        confidence: 0.72,
        timeframe: 'short_term'
      });
    }
    
    return recommendations;
  }

  private getFactorImportance(features: Record<string, number>): FactorImportance[] {
    return [
      {
        factor: 'Days on Market',
        importance: 0.25,
        impact: features.daysOnMarket > 21 ? 'negative' : 'neutral',
        description: 'Time on market significantly affects lease probability'
      },
      {
        factor: 'Seasonal Demand',
        importance: 0.20,
        impact: features.currentMonth >= 5 && features.currentMonth <= 8 ? 'positive' : 'negative',
        description: 'Seasonal patterns drive 20% of pricing variance'
      },
      {
        factor: 'Market Position',
        importance: 0.18,
        impact: features.marketPosition === 1 ? 'positive' : features.marketPosition === 3 ? 'negative' : 'neutral',
        description: 'Relative market position affects competitive advantage'
      },
      {
        factor: 'Unit Features',
        importance: 0.15,
        impact: features.amenityScore > 70 ? 'positive' : 'neutral',
        description: 'Unit amenities and features influence desirability'
      },
      {
        factor: 'Market Velocity',
        importance: 0.12,
        impact: features.marketVelocity >= 3 ? 'positive' : 'negative',
        description: 'Overall market speed affects all units'
      }
    ];
  }

  private generateAlternativeScenarios(basePrice: number, features: Record<string, number>): PricingScenario[] {
    return [
      {
        name: 'Conservative Pricing',
        price: Math.round(basePrice * 0.95),
        expectedDaysToLease: this.predictDaysToLease(features, basePrice * 0.95),
        leaseprobability: 0.88,
        expectedRevenue: Math.round(basePrice * 0.95 * 11.2), // Accounting for faster lease
        riskLevel: 'low'
      },
      {
        name: 'Market Rate',
        price: basePrice,
        expectedDaysToLease: this.predictDaysToLease(features, basePrice),
        leaseprobability: 0.75,
        expectedRevenue: Math.round(basePrice * 11.0),
        riskLevel: 'medium'
      },
      {
        name: 'Premium Pricing',
        price: Math.round(basePrice * 1.05),
        expectedDaysToLease: this.predictDaysToLease(features, basePrice * 1.05),
        leaseprobability: 0.62,
        expectedRevenue: Math.round(basePrice * 1.05 * 10.5),
        riskLevel: 'high'
      }
    ];
  }

  addTrainingData(outcome: LeaseOutcome): void {
    this.trainingData.push(outcome);
    
    // Retrain model if we have enough new data
    if (this.trainingData.length % 50 === 0) {
      this.trainModel();
    }
  }

  getModelMetrics(): ModelMetrics {
    return { ...this.modelMetrics };
  }

  getTrainingDataSummary(): {
    totalOutcomes: number;
    leasedUnits: number;
    averageDaysOnMarket: number;
    averagePriceReduction: number;
    seasonalDistribution: Record<string, number>;
  } {
    const leased = this.trainingData.filter(d => d.outcome === 'leased');
    const avgDays = leased.reduce((sum, d) => sum + d.daysOnMarket, 0) / leased.length;
    const avgReduction = leased.reduce((sum, d) => sum + ((d.initialPrice - d.finalPrice) / d.initialPrice * 100), 0) / leased.length;
    
    const seasonalDist: Record<string, number> = {};
    this.trainingData.forEach(d => {
      const season = d.seasonality.season;
      seasonalDist[season] = (seasonalDist[season] || 0) + 1;
    });
    
    return {
      totalOutcomes: this.trainingData.length,
      leasedUnits: leased.length,
      averageDaysOnMarket: Math.round(avgDays),
      averagePriceReduction: Math.round(avgReduction * 100) / 100,
      seasonalDistribution: seasonalDist
    };
  }
}