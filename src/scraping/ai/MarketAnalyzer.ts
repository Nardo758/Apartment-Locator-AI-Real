/**
 * AI-powered market analysis and price prediction system
 */

import { ScrapedProperty, MarketData } from '../core/types';
import { scrapingLogger } from '../utils/Logger';

export interface MarketAnalysis {
  medianPrice: number;
  priceRange: {
    min: number;
    max: number;
    q1: number;
    q3: number;
  };
  marketVelocity: 'hot' | 'normal' | 'slow';
  competitiveness: number; // 0-100 scale
  pricePerSqft: number;
  recommendedPrice: number;
  confidence: number; // 0-1 scale
  insights: string[];
  comparables: ScrapedProperty[];
}

export interface PricePrediction {
  predictedPrice: number;
  priceRange: {
    low: number;
    high: number;
  };
  confidence: number;
  factors: Array<{
    name: string;
    impact: number; // -100 to 100
    description: string;
  }>;
  marketTrend: 'increasing' | 'stable' | 'decreasing';
  timeToRent: number; // estimated days
}

export interface ConcessionPrediction {
  type: string;
  value: string;
  probability: number;
  color: 'green' | 'yellow' | 'orange' | 'red';
  reasoning: string;
}

export class MarketAnalyzer {
  private priceHistory: Map<string, Array<{ price: number; date: Date }>> = new Map();
  private marketCache: Map<string, MarketAnalysis> = new Map();
  private logger = scrapingLogger;

  /**
   * Analyze market conditions for a specific area
   */
  analyzeMarket(properties: ScrapedProperty[], city: string, state: string): MarketAnalysis {
    const cacheKey = `${city}-${state}`;
    
    // Check cache (valid for 1 hour)
    const cached = this.marketCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    this.logger.info('Analyzing market conditions', { city, state, propertyCount: properties.length });

    const analysis = this.performMarketAnalysis(properties, city, state);
    
    // Cache the result
    this.marketCache.set(cacheKey, analysis);
    
    // Clear cache after 1 hour
    setTimeout(() => {
      this.marketCache.delete(cacheKey);
    }, 60 * 60 * 1000);

    return analysis;
  }

  /**
   * Predict optimal price for a property
   */
  predictPrice(property: ScrapedProperty, comparables: ScrapedProperty[]): PricePrediction {
    this.logger.debug('Predicting price for property', { 
      propertyId: property.externalId,
      comparablesCount: comparables.length 
    });

    const factors = this.analyzePricingFactors(property, comparables);
    const basePrediction = this.calculateBasePrediction(property, comparables);
    const adjustedPrediction = this.applyFactorAdjustments(basePrediction, factors);
    
    const prediction: PricePrediction = {
      predictedPrice: Math.round(adjustedPrediction.price),
      priceRange: {
        low: Math.round(adjustedPrediction.price * 0.9),
        high: Math.round(adjustedPrediction.price * 1.1)
      },
      confidence: adjustedPrediction.confidence,
      factors,
      marketTrend: this.determineMarketTrend(comparables),
      timeToRent: this.estimateTimeToRent(property, comparables)
    };

    return prediction;
  }

  /**
   * Predict available concessions
   */
  predictConcessions(property: ScrapedProperty, marketConditions: MarketAnalysis): ConcessionPrediction[] {
    const concessions: ConcessionPrediction[] = [];

    // Base concession probability on market conditions
    const baseProb = marketConditions.competitiveness < 50 ? 0.8 : 0.4;
    
    // Days vacant affects concession likelihood
    const daysVacant = property.daysOnMarket || 0;
    const vacancyMultiplier = Math.min(1 + (daysVacant / 30), 2);

    // Price relative to market affects concessions
    const priceRatio = property.currentPrice / marketConditions.medianPrice;
    const priceMultiplier = priceRatio > 1.1 ? 1.5 : 1.0;

    // Predict specific concessions
    if (baseProb * vacancyMultiplier > 0.6) {
      concessions.push({
        type: 'First Month Free',
        value: `$${property.currentPrice.toLocaleString()}`,
        probability: Math.min(baseProb * vacancyMultiplier * 0.8, 0.9) * 100,
        color: baseProb * vacancyMultiplier > 0.8 ? 'green' : 'yellow',
        reasoning: `Property has been vacant for ${daysVacant} days in a ${marketConditions.marketVelocity} market`
      });
    }

    if (baseProb * priceMultiplier > 0.5) {
      concessions.push({
        type: 'Reduced Deposit',
        value: `$${Math.round(property.currentPrice * 0.5).toLocaleString()}`,
        probability: Math.min(baseProb * priceMultiplier * 0.7, 0.85) * 100,
        color: baseProb * priceMultiplier > 0.7 ? 'green' : 'yellow',
        reasoning: `Property priced ${((priceRatio - 1) * 100).toFixed(1)}% above market median`
      });
    }

    if (property.amenities.some(a => a.toLowerCase().includes('pet')) || property.petPolicy) {
      concessions.push({
        type: 'Waived Pet Fee',
        value: '$200-500',
        probability: baseProb * 0.6 * 100,
        color: 'orange',
        reasoning: 'Pet-friendly property in competitive market'
      });
    }

    // Seasonal adjustments
    const month = new Date().getMonth();
    if (month >= 10 || month <= 2) { // Winter months
      concessions.forEach(c => {
        c.probability *= 1.2; // Increase winter concessions
        if (c.probability > 90) c.color = 'green';
      });
    }

    return concessions.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Calculate match score for a property based on user preferences
   */
  calculateMatchScore(
    property: ScrapedProperty, 
    userPreferences: {
      maxPrice?: number;
      minBedrooms?: number;
      maxBedrooms?: number;
      minBathrooms?: number;
      preferredAmenities?: string[];
      petFriendly?: boolean;
      maxCommute?: number;
      location?: { lat: number; lng: number };
    }
  ): number {
    let score = 100;
    const penalties: Array<{ reason: string; penalty: number }> = [];

    // Price penalty
    if (userPreferences.maxPrice && property.currentPrice > userPreferences.maxPrice) {
      const overbudget = (property.currentPrice - userPreferences.maxPrice) / userPreferences.maxPrice;
      const penalty = Math.min(overbudget * 50, 40);
      score -= penalty;
      penalties.push({ reason: 'Over budget', penalty });
    }

    // Bedroom requirements
    if (userPreferences.minBedrooms && property.bedrooms < userPreferences.minBedrooms) {
      score -= 30;
      penalties.push({ reason: 'Too few bedrooms', penalty: 30 });
    }

    if (userPreferences.maxBedrooms && property.bedrooms > userPreferences.maxBedrooms) {
      score -= 10;
      penalties.push({ reason: 'Too many bedrooms', penalty: 10 });
    }

    // Bathroom requirements
    if (userPreferences.minBathrooms && property.bathrooms < userPreferences.minBathrooms) {
      score -= 20;
      penalties.push({ reason: 'Too few bathrooms', penalty: 20 });
    }

    // Amenity preferences
    if (userPreferences.preferredAmenities?.length) {
      const matchedAmenities = userPreferences.preferredAmenities.filter(pref =>
        property.amenities.some(amenity => 
          amenity.toLowerCase().includes(pref.toLowerCase())
        )
      );
      const amenityScore = (matchedAmenities.length / userPreferences.preferredAmenities.length) * 20;
      score += amenityScore - 10; // Bonus for matches, penalty for misses
    }

    // Pet policy
    if (userPreferences.petFriendly && !this.isPetFriendly(property)) {
      score -= 25;
      penalties.push({ reason: 'Not pet friendly', penalty: 25 });
    }

    // Location/commute (if coordinates available)
    if (userPreferences.location && property.coordinates) {
      const distance = this.calculateDistance(
        userPreferences.location,
        property.coordinates
      );
      
      if (userPreferences.maxCommute && distance > userPreferences.maxCommute) {
        const penalty = Math.min((distance - userPreferences.maxCommute) / userPreferences.maxCommute * 20, 30);
        score -= penalty;
        penalties.push({ reason: 'Too far from preferred location', penalty });
      }
    }

    return Math.max(Math.round(score), 0);
  }

  private performMarketAnalysis(properties: ScrapedProperty[], city: string, state: string): MarketAnalysis {
    const prices = properties.map(p => p.currentPrice).filter(p => p > 0).sort((a, b) => a - b);
    const sqftPrices = properties
      .filter(p => p.sqft && p.sqft > 0)
      .map(p => p.currentPrice / p.sqft!)
      .sort((a, b) => a - b);

    const medianPrice = this.calculateMedian(prices);
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      q1: this.calculatePercentile(prices, 25),
      q3: this.calculatePercentile(prices, 75)
    };

    const marketVelocity = this.determineMarketVelocity(properties);
    const competitiveness = this.calculateCompetitiveness(properties);
    const pricePerSqft = this.calculateMedian(sqftPrices);

    // Find comparable properties for recommendations
    const comparables = this.findComparableProperties(properties, medianPrice);
    const recommendedPrice = this.calculateRecommendedPrice(comparables);

    const insights = this.generateMarketInsights(properties, {
      medianPrice,
      priceRange,
      marketVelocity,
      competitiveness,
      pricePerSqft
    });

    return {
      medianPrice,
      priceRange,
      marketVelocity,
      competitiveness,
      pricePerSqft,
      recommendedPrice,
      confidence: this.calculateConfidence(properties.length),
      insights,
      comparables
    };
  }

  private analyzePricingFactors(property: ScrapedProperty, comparables: ScrapedProperty[]) {
    const factors = [];

    // Square footage factor
    if (property.sqft && comparables.length > 0) {
      const avgSqft = comparables.reduce((sum, p) => sum + (p.sqft || 0), 0) / comparables.length;
      const sqftDiff = ((property.sqft - avgSqft) / avgSqft) * 100;
      factors.push({
        name: 'Square Footage',
        impact: Math.round(sqftDiff * 0.5), // 0.5% impact per 1% size difference
        description: `${property.sqft} sqft vs ${Math.round(avgSqft)} average`
      });
    }

    // Bedroom/bathroom factor
    const avgBedrooms = comparables.reduce((sum, p) => sum + p.bedrooms, 0) / comparables.length;
    const avgBathrooms = comparables.reduce((sum, p) => sum + p.bathrooms, 0) / comparables.length;
    
    const bedroomDiff = property.bedrooms - avgBedrooms;
    const bathroomDiff = property.bathrooms - avgBathrooms;
    
    if (Math.abs(bedroomDiff) > 0.1) {
      factors.push({
        name: 'Bedrooms',
        impact: Math.round(bedroomDiff * 15), // 15% impact per bedroom
        description: `${property.bedrooms} bed vs ${avgBedrooms.toFixed(1)} average`
      });
    }

    if (Math.abs(bathroomDiff) > 0.1) {
      factors.push({
        name: 'Bathrooms',
        impact: Math.round(bathroomDiff * 10), // 10% impact per bathroom
        description: `${property.bathrooms} bath vs ${avgBathrooms.toFixed(1)} average`
      });
    }

    // Amenity factor
    const avgAmenities = comparables.reduce((sum, p) => sum + p.amenities.length, 0) / comparables.length;
    const amenityDiff = property.amenities.length - avgAmenities;
    
    if (Math.abs(amenityDiff) > 1) {
      factors.push({
        name: 'Amenities',
        impact: Math.round(amenityDiff * 3), // 3% impact per amenity
        description: `${property.amenities.length} amenities vs ${Math.round(avgAmenities)} average`
      });
    }

    // Age factor (if year built is available)
    if (property.yearBuilt) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - property.yearBuilt;
      const avgAge = comparables
        .filter(p => p.yearBuilt)
        .reduce((sum, p) => sum + (currentYear - p.yearBuilt!), 0) / comparables.filter(p => p.yearBuilt).length;
      
      const ageDiff = age - avgAge;
      if (Math.abs(ageDiff) > 2) {
        factors.push({
          name: 'Building Age',
          impact: Math.round(-ageDiff * 1.5), // Newer is better
          description: `${age} years old vs ${Math.round(avgAge)} average`
        });
      }
    }

    return factors;
  }

  private calculateBasePrediction(property: ScrapedProperty, comparables: ScrapedProperty[]) {
    if (comparables.length === 0) {
      return { price: property.currentPrice, confidence: 0.3 };
    }

    // Weight comparables by similarity
    const weightedPrices = comparables.map(comp => {
      const similarity = this.calculateSimilarity(property, comp);
      return {
        price: comp.currentPrice,
        weight: similarity
      };
    });

    // Calculate weighted average
    const totalWeight = weightedPrices.reduce((sum, wp) => sum + wp.weight, 0);
    const weightedPrice = weightedPrices.reduce((sum, wp) => sum + (wp.price * wp.weight), 0) / totalWeight;

    const confidence = Math.min(comparables.length / 10, 0.9); // More comparables = higher confidence

    return { price: weightedPrice, confidence };
  }

  private applyFactorAdjustments(basePrediction: { price: number; confidence: number }, factors: any[]) {
    let adjustedPrice = basePrediction.price;
    
    for (const factor of factors) {
      const adjustment = (factor.impact / 100) * basePrediction.price;
      adjustedPrice += adjustment;
    }

    return {
      price: adjustedPrice,
      confidence: basePrediction.confidence
    };
  }

  private calculateSimilarity(prop1: ScrapedProperty, prop2: ScrapedProperty): number {
    let similarity = 1.0;

    // Bedroom similarity
    const bedroomDiff = Math.abs(prop1.bedrooms - prop2.bedrooms);
    similarity *= Math.max(0, 1 - (bedroomDiff * 0.2));

    // Bathroom similarity
    const bathroomDiff = Math.abs(prop1.bathrooms - prop2.bathrooms);
    similarity *= Math.max(0, 1 - (bathroomDiff * 0.15));

    // Square footage similarity
    if (prop1.sqft && prop2.sqft) {
      const sqftDiff = Math.abs(prop1.sqft - prop2.sqft) / Math.max(prop1.sqft, prop2.sqft);
      similarity *= Math.max(0, 1 - sqftDiff);
    }

    // Location similarity (if coordinates available)
    if (prop1.coordinates && prop2.coordinates) {
      const distance = this.calculateDistance(prop1.coordinates, prop2.coordinates);
      const locationSimilarity = Math.max(0, 1 - (distance / 10)); // 10 mile max distance
      similarity *= locationSimilarity;
    }

    return similarity;
  }

  private determineMarketVelocity(properties: ScrapedProperty[]): 'hot' | 'normal' | 'slow' {
    const avgDaysOnMarket = properties
      .filter(p => p.daysOnMarket && p.daysOnMarket > 0)
      .reduce((sum, p) => sum + p.daysOnMarket!, 0) / properties.length;

    if (avgDaysOnMarket < 15) return 'hot';
    if (avgDaysOnMarket > 45) return 'slow';
    return 'normal';
  }

  private calculateCompetitiveness(properties: ScrapedProperty[]): number {
    // Factors that indicate competitiveness:
    // - Low days on market
    // - High availability of immediate units
    // - Price variance

    const avgDaysOnMarket = properties
      .filter(p => p.daysOnMarket && p.daysOnMarket > 0)
      .reduce((sum, p) => sum + p.daysOnMarket!, 0) / properties.length || 30;

    const immediateAvailability = properties.filter(p => p.availabilityType === 'immediate').length / properties.length;

    // Lower days on market = higher competitiveness
    const velocityScore = Math.max(0, 100 - (avgDaysOnMarket * 2));
    
    // Higher immediate availability = lower competitiveness
    const availabilityScore = (1 - immediateAvailability) * 50;

    return Math.round((velocityScore + availabilityScore) / 2);
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private calculatePercentile(numbers: number[], percentile: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
  }

  private findComparableProperties(properties: ScrapedProperty[], medianPrice: number): ScrapedProperty[] {
    return properties
      .filter(p => Math.abs(p.currentPrice - medianPrice) < medianPrice * 0.3) // Within 30% of median
      .slice(0, 10); // Top 10 comparables
  }

  private calculateRecommendedPrice(comparables: ScrapedProperty[]): number {
    if (comparables.length === 0) return 0;
    
    const prices = comparables.map(p => p.currentPrice);
    return this.calculateMedian(prices);
  }

  private calculateConfidence(sampleSize: number): number {
    // Confidence increases with sample size, plateaus at ~100 samples
    return Math.min(sampleSize / 100, 0.95);
  }

  private generateMarketInsights(properties: ScrapedProperty[], analysis: any): string[] {
    const insights = [];

    if (analysis.marketVelocity === 'hot') {
      insights.push(`🔥 Hot market: Properties rent quickly (avg ${properties.filter(p => p.daysOnMarket).reduce((sum, p) => sum + p.daysOnMarket!, 0) / properties.length} days)`);
    } else if (analysis.marketVelocity === 'slow') {
      insights.push(`❄️ Slow market: Properties take longer to rent, more negotiation opportunities`);
    }

    if (analysis.competitiveness > 70) {
      insights.push(`💪 Highly competitive market: Be prepared to act quickly on good deals`);
    } else if (analysis.competitiveness < 40) {
      insights.push(`🎯 Buyer's market: Good opportunities for concessions and negotiations`);
    }

    const priceSpread = (analysis.priceRange.q3 - analysis.priceRange.q1) / analysis.medianPrice;
    if (priceSpread > 0.4) {
      insights.push(`📊 High price variance: Wide range of options from $${analysis.priceRange.q1.toLocaleString()} to $${analysis.priceRange.q3.toLocaleString()}`);
    }

    if (analysis.pricePerSqft > 2.5) {
      insights.push(`💰 Premium market: $${analysis.pricePerSqft.toFixed(2)}/sqft indicates high-end area`);
    } else if (analysis.pricePerSqft < 1.5) {
      insights.push(`💵 Value market: $${analysis.pricePerSqft.toFixed(2)}/sqft indicates affordable area`);
    }

    return insights;
  }

  private determineMarketTrend(comparables: ScrapedProperty[]): 'increasing' | 'stable' | 'decreasing' {
    // This would typically use historical data
    // For now, we'll use a simple heuristic based on current market conditions
    
    const recentProperties = comparables.filter(p => {
      const daysSinceScraped = (Date.now() - p.scrapedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceScraped < 7; // Last week
    });

    const olderProperties = comparables.filter(p => {
      const daysSinceScraped = (Date.now() - p.scrapedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceScraped >= 7 && daysSinceScraped < 30; // 1-4 weeks ago
    });

    if (recentProperties.length < 3 || olderProperties.length < 3) {
      return 'stable'; // Not enough data
    }

    const recentAvgPrice = recentProperties.reduce((sum, p) => sum + p.currentPrice, 0) / recentProperties.length;
    const olderAvgPrice = olderProperties.reduce((sum, p) => sum + p.currentPrice, 0) / olderProperties.length;

    const priceChange = (recentAvgPrice - olderAvgPrice) / olderAvgPrice;

    if (priceChange > 0.05) return 'increasing'; // 5% increase
    if (priceChange < -0.05) return 'decreasing'; // 5% decrease
    return 'stable';
  }

  private estimateTimeToRent(property: ScrapedProperty, comparables: ScrapedProperty[]): number {
    const avgDaysOnMarket = comparables
      .filter(p => p.daysOnMarket && p.daysOnMarket > 0)
      .reduce((sum, p) => sum + p.daysOnMarket!, 0) / comparables.length || 30;

    // Adjust based on property characteristics
    let adjustment = 1.0;

    // Price adjustment
    const avgPrice = comparables.reduce((sum, p) => sum + p.currentPrice, 0) / comparables.length;
    const priceRatio = property.currentPrice / avgPrice;
    if (priceRatio > 1.1) adjustment *= 1.3; // Overpriced takes longer
    if (priceRatio < 0.9) adjustment *= 0.8; // Underpriced rents faster

    return Math.round(avgDaysOnMarket * adjustment);
  }

  private isPetFriendly(property: ScrapedProperty): boolean {
    const petKeywords = ['pet friendly', 'pets allowed', 'dogs ok', 'cats ok', 'pet policy'];
    const text = `${property.petPolicy || ''} ${property.amenities.join(' ')} ${property.features.join(' ')}`.toLowerCase();
    
    return petKeywords.some(keyword => text.includes(keyword));
  }

  private calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Singleton instance
export const marketAnalyzer = new MarketAnalyzer();