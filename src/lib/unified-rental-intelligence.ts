// Unified Rental Intelligence System - Combines Market Data + Ownership Analysis
// Complete negotiation leverage and rent vs buy intelligence for renters

import { createScraperInstance, type RenterInsight, type RentalMarketMetrics } from './redfin-scraper';

export interface OwnershipAnalysis {
  propertyValue: number;
  currentRent: number;
  estimatedOwnershipCost: number;
  landlordProfitMargin: number;
  landlordMonthlyProfit: number;
  rentToValueRatio: number;
  breakEvenRent: number;
  negotiationLeverage: number;
  recommendation: 'rent' | 'buy' | 'negotiate';
  leverageInsights: string[];
}

export interface UnifiedRentalIntelligence {
  location: string;
  marketData: RentalMarketMetrics[];
  ownershipAnalysis: OwnershipAnalysis | null;
  combinedInsights: RenterInsight[];
  overallLeverageScore: number;
  recommendation: {
    action: 'rent_and_negotiate' | 'buy_immediately' | 'negotiate_aggressively' | 'stay_flexible';
    reasoning: string;
    keyTactics: string[];
    expectedSavings: number;
  };
  dataStatus: {
    marketDataReliability: 'high' | 'medium' | 'low';
    ownershipDataReliability: 'high' | 'medium' | 'low';
    overallConfidence: number;
  };
}

export class UnifiedRentalIntelligenceEngine {
  private scraper = createScraperInstance();
  private cache: Map<string, UnifiedRentalIntelligence> = new Map();
  private cacheExpiry: Map<string, Date> = new Map();

  // Main method - get complete rental intelligence
  async getCompleteRentalIntelligence(
    location: string,
    currentRent: number,
    propertyValue: number
  ): Promise<UnifiedRentalIntelligence> {
    const cacheKey = `unified_${location}_${currentRent}_${propertyValue}`;

    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {

      // Fetch market data
      const marketData = await this.getMarketDataWithFallback(location);
      
      // Perform ownership analysis
      const ownershipAnalysis = await this.performOwnershipAnalysis(
        location, currentRent, propertyValue
      );

      // Combine insights from both sources
      const combinedInsights = await this.generateCombinedInsights(
        marketData, ownershipAnalysis, location
      );

      // Calculate overall leverage score
      const overallLeverageScore = this.calculateOverallLeverageScore(
        marketData, ownershipAnalysis
      );

      // Generate unified recommendation
      const recommendation = this.generateUnifiedRecommendation(
        marketData, ownershipAnalysis, overallLeverageScore
      );

      // Assess data reliability
      const dataStatus = this.assessDataReliability(marketData, ownershipAnalysis);

      const intelligence: UnifiedRentalIntelligence = {
        location,
        marketData,
        ownershipAnalysis,
        combinedInsights,
        overallLeverageScore,
        recommendation,
        dataStatus
      };

      // Cache results
      this.cache.set(cacheKey, intelligence);
      this.cacheExpiry.set(cacheKey, new Date(Date.now() + 2 * 60 * 60 * 1000)); // 2 hour cache

      return intelligence;

    } catch (error) {
      console.error('Error generating unified intelligence:', error);
      return this.generateFallbackIntelligence(location, currentRent, propertyValue);
    }
  }

  private async getMarketDataWithFallback(location: string): Promise<RentalMarketMetrics[]> {
    try {
      return await this.scraper.fetchRentalData(location);
    } catch (error) {
      console.warn('Market data fetch failed, using realistic estimates');
      return this.generateRealisticMarketData(location);
    }
  }

  private async performOwnershipAnalysis(
    location: string,
    currentRent: number,
    propertyValue: number
  ): Promise<OwnershipAnalysis> {
    // Simulate ownership calculation
    const monthlyMortgage = propertyValue * 0.8 * 0.0075; // 7.5% rate, 80% LTV
    const monthlyTaxes = propertyValue * 0.012 / 12; // 1.2% annual
    const monthlyInsurance = 150;
    const monthlyMaintenance = propertyValue * 0.015 / 12; // 1.5% annual
    const monthlyVacancy = currentRent * 0.05; // 5% vacancy rate
    
    const totalMonthlyCost = monthlyMortgage + monthlyTaxes + monthlyInsurance + 
                            monthlyMaintenance + monthlyVacancy;
    
    const landlordProfit = currentRent - totalMonthlyCost;
    const profitMargin = landlordProfit / currentRent;

    return {
      propertyValue,
      currentRent,
      estimatedOwnershipCost: totalMonthlyCost,
      landlordProfitMargin: profitMargin,
      landlordMonthlyProfit: landlordProfit,
      rentToValueRatio: (currentRent * 12) / propertyValue,
      breakEvenRent: totalMonthlyCost,
      negotiationLeverage: Math.min(100, Math.max(0, profitMargin * 200)),
      recommendation: totalMonthlyCost < currentRent * 0.8 ? 'buy' : 
                     profitMargin > 0.2 ? 'negotiate' : 'rent',
      leverageInsights: [
        `Landlord making $${landlordProfit.toFixed(0)}/month profit`,
        `${(profitMargin * 100).toFixed(1)}% profit margin`,
        profitMargin > 0.25 ? 'High profit margin = strong negotiation position' :
        profitMargin < 0.1 ? 'Thin margins = limited flexibility' : 'Moderate negotiation room'
      ]
    };
  }

  private async generateCombinedInsights(
    marketData: RentalMarketMetrics[],
    ownershipAnalysis: OwnershipAnalysis | null,
    location: string
  ): Promise<RenterInsight[]> {
    const insights: RenterInsight[] = [];
    const latest = marketData[0];

    // Market-based insights
    if (latest) {
      // High inventory leverage
      if (latest.inventoryLevel > 1000) {
        insights.push({
          insightType: 'leverage',
          severity: 'high',
          title: 'High Inventory Advantage',
          description: `${latest.inventoryLevel} units available in ${latest.location}`,
          actionable: 'Landlords are competing for tenants. Negotiate for 10-15% rent reduction plus concessions.',
          confidence: 0.85,
          savingsPotential: latest.medianRent * 0.12
        });
      }

      // Seasonal timing
      if (latest.seasonalIndex > 75) {
        insights.push({
          insightType: 'seasonal',
          severity: 'medium',
          title: 'Peak Negotiation Season',
          description: 'Winter period provides maximum leverage',
          actionable: 'Request 2-3 months free rent, waived fees, and flexible lease terms.',
          confidence: 0.80,
          savingsPotential: latest.medianRent * 2.5
        });
      }

      // Price dropping market
      if (latest.rentYoYChange < -3) {
        insights.push({
          insightType: 'leverage',
          severity: 'high',
          title: 'Declining Rent Market',
          description: `Rents down ${Math.abs(latest.rentYoYChange).toFixed(1)}% year-over-year`,
          actionable: 'Market momentum is in your favor. Demand below-market pricing.',
          confidence: 0.90,
          savingsPotential: latest.medianRent * Math.abs(latest.rentYoYChange) / 100
        });
      }
    }

    // Ownership-based insights
    if (ownershipAnalysis) {
      // Major ownership cost advantage
      if (ownershipAnalysis.currentRent > ownershipAnalysis.estimatedOwnershipCost * 1.3) {
        insights.push({
          insightType: 'ownership',
          severity: 'high',
          title: 'MAJOR LEVERAGE: Consider Buying',
          description: `Ownership would cost $${ownershipAnalysis.estimatedOwnershipCost.toFixed(0)}/month vs $${ownershipAnalysis.currentRent} rent`,
          actionable: 'Either negotiate 25%+ rent reduction or seriously consider purchasing.',
          confidence: 0.95,
          savingsPotential: ownershipAnalysis.landlordMonthlyProfit
        });
      }

      // High landlord profit margin
      if (ownershipAnalysis.landlordProfitMargin > 0.25) {
        insights.push({
          insightType: 'leverage',
          severity: 'high',
          title: 'High Landlord Profit Margin',
          description: `Landlord making ${(ownershipAnalysis.landlordProfitMargin * 100).toFixed(1)}% profit ($${ownershipAnalysis.landlordMonthlyProfit.toFixed(0)}/month)`,
          actionable: 'Significant room for rent reduction. Start negotiations at 15-20% below current rent.',
          confidence: 0.88,
          savingsPotential: ownershipAnalysis.landlordMonthlyProfit * 0.6
        });
      }

      // Cash flow analysis
      if (ownershipAnalysis.landlordProfitMargin < 0.1) {
        insights.push({
          insightType: 'leverage',
          severity: 'medium',
          title: 'Landlord Cash Flow Pressure',
          description: `Thin profit margin (${(ownershipAnalysis.landlordProfitMargin * 100).toFixed(1)}%)`,
          actionable: 'Focus on tenant retention value rather than rent reduction. Negotiate longer lease for concessions.',
          confidence: 0.75,
          savingsPotential: ownershipAnalysis.currentRent * 0.05
        });
      }
    }

    // Quarter/month end timing
    const now = new Date();
    if (this.isQuarterEnd(now)) {
      insights.push({
        insightType: 'timing',
        severity: 'high',
        title: 'Quarter-End Pressure Window',
        description: 'Property managers under quarterly leasing pressure',
        actionable: 'Act within 2 weeks for maximum leverage on concessions.',
        confidence: 0.80,
        expiresAt: this.getNextQuarterEnd(),
        savingsPotential: (latest?.medianRent || 2000) * 0.08
      });
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateOverallLeverageScore(
    marketData: RentalMarketMetrics[],
    ownershipAnalysis: OwnershipAnalysis | null
  ): number {
    let score = 50; // Base score
    const latest = marketData[0];

    // Market factors (40% weight)
    if (latest) {
      if (latest.inventoryLevel > 1000) score += 15;
      if (latest.daysOnMarket > 45) score += 10;
      if (latest.rentYoYChange < -2) score += 15;
      if (latest.seasonalIndex > 75) score += 10;
    }

    // Ownership factors (60% weight)
    if (ownershipAnalysis) {
      score += ownershipAnalysis.negotiationLeverage * 0.6;
      
      // Bonus for extreme ownership advantage
      if (ownershipAnalysis.currentRent > ownershipAnalysis.estimatedOwnershipCost * 1.4) {
        score += 20;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  private generateUnifiedRecommendation(
    marketData: RentalMarketMetrics[],
    ownershipAnalysis: OwnershipAnalysis | null,
    leverageScore: number
  ): {
    action: 'rent_and_negotiate' | 'buy_immediately' | 'negotiate_aggressively' | 'stay_flexible';
    reasoning: string;
    keyTactics: string[];
    expectedSavings: number;
  } {
    const latest = marketData[0];
    let expectedSavings = 0;
    let keyTactics: string[] = [];

    // Determine primary recommendation
    if (ownershipAnalysis && ownershipAnalysis.recommendation === 'buy') {
      return {
        action: 'buy_immediately',
        reasoning: `Ownership costs ($${ownershipAnalysis.estimatedOwnershipCost.toFixed(0)}) are significantly below rent ($${ownershipAnalysis.currentRent}). This is a financial no-brainer.`,
        keyTactics: [
          'Get pre-approved for mortgage immediately',
          'Use ownership analysis as negotiation leverage',
          'If buying isn\'t possible, demand 20%+ rent reduction'
        ],
        expectedSavings: ownershipAnalysis.landlordMonthlyProfit
      };
    }

    if (leverageScore > 80) {
      expectedSavings = (latest?.medianRent || 2000) * 0.15;
      keyTactics = [
        'Start with 20% below asking rent',
        'Demand 2-3 months free rent',
        'Negotiate waived fees and deposits',
        'Request lease flexibility terms'
      ];
      
      return {
        action: 'negotiate_aggressively',
        reasoning: `Exceptional leverage (${leverageScore}/100). Market conditions and ownership analysis both favor aggressive negotiation.`,
        keyTactics,
        expectedSavings
      };
    }

    if (leverageScore > 60) {
      expectedSavings = (latest?.medianRent || 2000) * 0.10;
      keyTactics = [
        'Request 10-15% rent reduction',
        'Negotiate one month free rent',
        'Ask for waived application/admin fees',
        'Time application for month/quarter end'
      ];

      return {
        action: 'rent_and_negotiate',
        reasoning: `Good leverage (${leverageScore}/100). Solid negotiation position with moderate expectations.`,
        keyTactics,
        expectedSavings
      };
    }

    // Lower leverage
    expectedSavings = (latest?.medianRent || 2000) * 0.05;
    keyTactics = [
      'Focus on lease length for concessions',
      'Negotiate minor fee waivers',
      'Timing-based leverage (month/quarter end)',
      'Emphasize tenant quality and stability'
    ];

    return {
      action: 'stay_flexible',
      reasoning: `Moderate leverage (${leverageScore}/100). Focus on timing and relationship-building for best results.`,
      keyTactics,
      expectedSavings
    };
  }

  private assessDataReliability(
    marketData: RentalMarketMetrics[],
    ownershipAnalysis: OwnershipAnalysis | null
  ): {
    marketDataReliability: 'high' | 'medium' | 'low';
    ownershipDataReliability: 'high' | 'medium' | 'low';
    overallConfidence: number;
  } {
    const latest = marketData[0];
    
    const marketReliability: 'high' | 'medium' | 'low' = 
      latest?.isRealData ? 'high' : 
      latest?.dataSource === 'fallback_realistic' ? 'medium' : 'low';

    const ownershipReliability: 'high' | 'medium' | 'low' = 
      ownershipAnalysis ? 'high' : 'medium';

    const reliabilityScore = {
      'high': 1.0,
      'medium': 0.7,
      'low': 0.4
    };

    const overallConfidence = (
      reliabilityScore[marketReliability] * 0.4 +
      reliabilityScore[ownershipReliability] * 0.6
    );

    return {
      marketDataReliability: marketReliability,
      ownershipDataReliability: ownershipReliability,
      overallConfidence: Math.round(overallConfidence * 100)
    };
  }

  private generateRealisticMarketData(location: string): RentalMarketMetrics[] {
    const locationData = this.getLocationMarketData(location);

    if (!locationData) {
      // Fallback generic metric
      return [{
        location,
        locationLevel: 'metro' as const,
        timestamp: new Date(),
        medianRent: 1800,
        rentYoYChange: 0,
        rentMoMChange: 0,
        inventoryLevel: 800,
        daysOnMarket: 45,
        newListings: 120,
        priceDropPercentage: 5,
        aboveListPricePercentage: 10,
        listToSoldRatio: 1.1,
        tourDemand: 1.5,
      seasonalIndex: this.calculateSeasonalIndex(new Date()),
      quarterEndPressure: this.isQuarterEnd(new Date()),
      monthEndPressure: this.isMonthEnd(new Date()),
      dataQuality: 'high' as const,
      sampleSize: 500,
      dataSource: 'fallback_realistic' as const,
      lastUpdated: new Date(),
      isRealData: false
      }];
    }

    return [{
      location: locationData.location,
      locationLevel: locationData.locationLevel,
      timestamp: new Date(),
      medianRent: locationData.medianRent,
      rentYoYChange: locationData.rentYoYChange,
      rentMoMChange: locationData.rentMoMChange,
      inventoryLevel: locationData.inventoryLevel,
      daysOnMarket: locationData.daysOnMarket,
      newListings: locationData.newListings,
      priceDropPercentage: locationData.priceDropPercentage,
      aboveListPricePercentage: locationData.aboveListPricePercentage,
      listToSoldRatio: locationData.listToSoldRatio ?? 1.0,
      tourDemand: locationData.tourDemand ?? 1.0,
      seasonalIndex: locationData.seasonalIndex ?? 50,
      quarterEndPressure: !!locationData.quarterEndPressure,
      monthEndPressure: !!locationData.monthEndPressure,
      dataQuality: locationData.dataQuality ?? 'medium',
      sampleSize: locationData.sampleSize ?? 100,
      lastUpdated: locationData.lastUpdated ?? new Date(),
      dataSource: locationData.dataSource ?? 'fallback_realistic',
      isRealData: false
    }];
  }

  private generateFallbackIntelligence(
    location: string,
    currentRent: number,
    propertyValue: number
  ): UnifiedRentalIntelligence {
    return {
      location,
      marketData: [],
      ownershipAnalysis: null,
      combinedInsights: [{
        insightType: 'leverage',
        severity: 'medium',
        title: 'General Negotiation Advice',
        description: 'Data temporarily unavailable',
        actionable: 'Focus on seasonal timing (winter months) and end-of-month/quarter pressure for negotiation leverage.',
        confidence: 0.5
      }],
      overallLeverageScore: 50,
      recommendation: {
        action: 'stay_flexible',
        reasoning: 'Limited data available for detailed analysis',
        keyTactics: ['Time negotiations for month/quarter end', 'Emphasize tenant quality'],
        expectedSavings: currentRent * 0.05
      },
      dataStatus: {
        marketDataReliability: 'low',
        ownershipDataReliability: 'low',
        overallConfidence: 40
      }
    };
  }

  private getLocationMarketData(location: string): RentalMarketMetrics | null {
    const locationLower = location.toLowerCase();
    
    const now = new Date();
    const locationMap: Record<string, RentalMarketMetrics> = {
      'austin': {
        location: 'Austin, TX',
        locationLevel: 'metro',
        timestamp: now,
        medianRent: 2200,
        rentYoYChange: -8.5,
        rentMoMChange: -2.1,
        inventoryLevel: 950,
        daysOnMarket: 55,
        newListings: 165,
        priceDropPercentage: 32,
        aboveListPricePercentage: 15,
        listToSoldRatio: 1.05,
        tourDemand: 2.0,
        seasonalIndex: 40,
        quarterEndPressure: false,
        monthEndPressure: false,
        dataQuality: 'medium',
        sampleSize: 200,
        lastUpdated: now,
        dataSource: 'fallback_realistic',
        isRealData: false
      },
      'dallas': {
        location: 'Dallas, TX',
        locationLevel: 'metro',
        timestamp: now,
        medianRent: 1800,
        rentYoYChange: -3.2,
        rentMoMChange: -0.8,
        inventoryLevel: 1100,
        daysOnMarket: 42,
        newListings: 200,
        priceDropPercentage: 18,
        aboveListPricePercentage: 22,
        listToSoldRatio: 1.08,
        tourDemand: 1.8,
        seasonalIndex: 50,
        quarterEndPressure: false,
        monthEndPressure: false,
        dataQuality: 'medium',
        sampleSize: 180,
        lastUpdated: now,
        dataSource: 'fallback_realistic',
        isRealData: false
      },
      'houston': {
        location: 'Houston, TX',
        locationLevel: 'metro',
        timestamp: now,
        medianRent: 1600,
        rentYoYChange: -1.8,
        rentMoMChange: -0.3,
        inventoryLevel: 1300,
        daysOnMarket: 38,
        newListings: 250,
        priceDropPercentage: 15,
        aboveListPricePercentage: 28,
        listToSoldRatio: 1.1,
        tourDemand: 1.6,
        seasonalIndex: 55,
        quarterEndPressure: false,
        monthEndPressure: false,
        dataQuality: 'medium',
        sampleSize: 210,
        lastUpdated: now,
        dataSource: 'fallback_realistic',
        isRealData: false
      }
    };

    for (const [key, data] of Object.entries(locationMap)) {
      if (locationLower.includes(key)) {
        return data;
      }
    }

    // Default data
    return {
      location,
      locationLevel: 'metro',
      timestamp: now,
      medianRent: 1800,
      rentYoYChange: 0,
      rentMoMChange: 0,
      inventoryLevel: 600,
      daysOnMarket: 40,
      newListings: 100,
      priceDropPercentage: 18,
      aboveListPricePercentage: 25,
      listToSoldRatio: 1.0,
      tourDemand: 1.0,
      seasonalIndex: 50,
      quarterEndPressure: false,
      monthEndPressure: false,
      dataQuality: 'medium',
      sampleSize: 100,
      lastUpdated: now,
      dataSource: 'fallback_realistic',
      isRealData: false
    };
  }

  private calculateSeasonalIndex(date: Date): number {
    const month = date.getMonth() + 1;
    const seasonalMap: Record<number, number> = {
      1: 90, 2: 85, 3: 70, 4: 55, 5: 40, 6: 25,
      7: 20, 8: 15, 9: 30, 10: 50, 11: 70, 12: 85
    };
    return seasonalMap[month] || 50;
  }

  private isQuarterEnd(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return [3, 6, 9, 12].includes(month) && day > endOfMonth - 14;
  }

  private isMonthEnd(date: Date): boolean {
    const day = date.getDate();
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return day > endOfMonth - 7;
  }

  private getNextQuarterEnd(): Date {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    let quarterEndMonth: number;
    if (currentMonth <= 3) quarterEndMonth = 3;
    else if (currentMonth <= 6) quarterEndMonth = 6;
    else if (currentMonth <= 9) quarterEndMonth = 9;
    else quarterEndMonth = 12;
    
    const year = quarterEndMonth < currentMonth ? currentYear + 1 : currentYear;
    return new Date(year, quarterEndMonth - 1, new Date(year, quarterEndMonth, 0).getDate());
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? expiry > new Date() : false;
  }
}