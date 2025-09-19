export interface CompetitorUnit {
  id: string;
  propertyName: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  currentRent: number;
  previousRent?: number;
  rentChangeDate?: string;
  rentChangePercent?: number;
  daysOnMarket: number;
  concessions: string[];
  concessionValue: number;
  amenities: string[];
  distanceFromTarget: number; // miles
  similarityScore: number; // 0-1
  lastUpdated: string;
  source: 'apartments_com' | 'zillow' | 'rentspree' | 'craigslist' | 'manual';
}

export interface MarketCompetitorAnalysis {
  targetUnit: {
    id: string;
    currentRent: number;
    marketPosition: 'below' | 'at' | 'above';
    percentileRank: number;
  };
  competitors: CompetitorUnit[];
  marketStats: {
    averageRent: number;
    medianRent: number;
    rentRange: { min: number; max: number };
    averageDaysOnMarket: number;
    concessionRate: number; // percentage of units with concessions
    averageConcessionValue: number;
  };
  pricingGaps: {
    underpriced: CompetitorUnit[];
    overpriced: CompetitorUnit[];
    opportunities: PricingOpportunity[];
  };
  trends: {
    rentTrend: 'increasing' | 'decreasing' | 'stable';
    averageRentChange: number;
    recentChanges: CompetitorUnit[];
    marketVelocity: 'accelerating' | 'stable' | 'slowing';
  };
}

export interface PricingOpportunity {
  type: 'underpriced_competitor' | 'market_gap' | 'concession_advantage' | 'amenity_premium';
  description: string;
  potentialIncrease: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short_term' | 'long_term';
}

export interface CompetitorAlert {
  id: string;
  type: 'price_drop' | 'price_increase' | 'new_concession' | 'competitor_leased' | 'new_listing';
  competitorId: string;
  propertyName: string;
  unitDetails: string;
  previousValue?: number;
  newValue: number;
  changePercent: number;
  impact: 'high' | 'medium' | 'low';
  recommendedAction: string;
  timestamp: string;
  isRead: boolean;
}

export class CompetitorIntelligence {
  private competitors: Map<string, CompetitorUnit[]> = new Map();
  private alerts: CompetitorAlert[] = [];
  private lastUpdate: Map<string, string> = new Map();

  // Simulate real-time competitor data (in production, this would connect to actual data sources)
  async fetchCompetitorData(unitId: string, radius: number = 1.0): Promise<CompetitorUnit[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockCompetitors: CompetitorUnit[] = [
      {
        id: 'comp-001',
        propertyName: 'Riverside Commons',
        address: '456 River St, Austin, TX',
        bedrooms: 2,
        bathrooms: 2,
        sqft: 900,
        currentRent: 2650,
        previousRent: 2750,
        rentChangeDate: '2024-09-15',
        rentChangePercent: -3.6,
        daysOnMarket: 28,
        concessions: ['First month free'],
        concessionValue: 2650,
        amenities: ['Pool', 'Gym', 'Parking'],
        distanceFromTarget: 0.3,
        similarityScore: 0.92,
        lastUpdated: new Date().toISOString(),
        source: 'apartments_com'
      },
      {
        id: 'comp-002',
        propertyName: 'Urban Oaks',
        address: '789 Oak Ave, Austin, TX',
        bedrooms: 2,
        bathrooms: 2,
        sqft: 850,
        currentRent: 2850,
        daysOnMarket: 12,
        concessions: [],
        concessionValue: 0,
        amenities: ['Pool', 'Gym', 'Balcony', 'In-unit laundry'],
        distanceFromTarget: 0.5,
        similarityScore: 0.88,
        lastUpdated: new Date().toISOString(),
        source: 'zillow'
      },
      {
        id: 'comp-003',
        propertyName: 'Downtown Heights',
        address: '321 Main St, Austin, TX',
        bedrooms: 2,
        bathrooms: 2,
        sqft: 950,
        currentRent: 3100,
        previousRent: 3000,
        rentChangeDate: '2024-09-10',
        rentChangePercent: 3.3,
        daysOnMarket: 8,
        concessions: [],
        concessionValue: 0,
        amenities: ['Pool', 'Gym', 'Concierge', 'Rooftop deck'],
        distanceFromTarget: 0.8,
        similarityScore: 0.85,
        lastUpdated: new Date().toISOString(),
        source: 'rentspree'
      },
      {
        id: 'comp-004',
        propertyName: 'Garden View Apartments',
        address: '654 Garden St, Austin, TX',
        bedrooms: 2,
        bathrooms: 2,
        sqft: 800,
        currentRent: 2400,
        daysOnMarket: 45,
        concessions: ['Two months free', '$500 deposit'],
        concessionValue: 5300,
        amenities: ['Pool', 'Parking'],
        distanceFromTarget: 0.4,
        similarityScore: 0.78,
        lastUpdated: new Date().toISOString(),
        source: 'craigslist'
      }
    ];

    this.competitors.set(unitId, mockCompetitors);
    this.lastUpdate.set(unitId, new Date().toISOString());
    
    // Generate alerts for significant changes
    this.generateAlerts(mockCompetitors);
    
    return mockCompetitors;
  }

  analyzeCompetition(unitId: string, targetRent: number): MarketCompetitorAnalysis {
    const competitors = this.competitors.get(unitId) || [];
    
    if (competitors.length === 0) {
      throw new Error('No competitor data available. Please fetch data first.');
    }

    // Calculate market statistics
    const rents = competitors.map(c => c.currentRent);
    const averageRent = rents.reduce((sum, rent) => sum + rent, 0) / rents.length;
    const medianRent = rents.sort((a, b) => a - b)[Math.floor(rents.length / 2)];
    const rentRange = { min: Math.min(...rents), max: Math.max(...rents) };
    
    const averageDaysOnMarket = competitors.reduce((sum, c) => sum + c.daysOnMarket, 0) / competitors.length;
    const concessionRate = (competitors.filter(c => c.concessions.length > 0).length / competitors.length) * 100;
    const averageConcessionValue = competitors
      .filter(c => c.concessionValue > 0)
      .reduce((sum, c) => sum + c.concessionValue, 0) / competitors.filter(c => c.concessionValue > 0).length || 0;

    // Determine market position
    const percentileRank = (rents.filter(rent => rent < targetRent).length / rents.length) * 100;
    let marketPosition: 'below' | 'at' | 'above';
    if (percentileRank < 40) marketPosition = 'below';
    else if (percentileRank > 60) marketPosition = 'above';
    else marketPosition = 'at';

    // Identify pricing gaps and opportunities
    const underpriced = competitors.filter(c => c.currentRent < targetRent * 0.9 && c.similarityScore > 0.8);
    const overpriced = competitors.filter(c => c.currentRent > targetRent * 1.1 && c.daysOnMarket > 30);
    
    const opportunities = this.identifyPricingOpportunities(competitors, targetRent);

    // Analyze trends
    const recentChanges = competitors.filter(c => c.rentChangeDate && 
      new Date(c.rentChangeDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const rentChanges = recentChanges.map(c => c.rentChangePercent || 0);
    const averageRentChange = rentChanges.length > 0 
      ? rentChanges.reduce((sum, change) => sum + change, 0) / rentChanges.length 
      : 0;

    let rentTrend: 'increasing' | 'decreasing' | 'stable';
    if (averageRentChange > 1) rentTrend = 'increasing';
    else if (averageRentChange < -1) rentTrend = 'decreasing';
    else rentTrend = 'stable';

    const marketVelocity = averageDaysOnMarket < 15 ? 'accelerating' : 
                          averageDaysOnMarket > 30 ? 'slowing' : 'stable';

    return {
      targetUnit: {
        id: unitId,
        currentRent: targetRent,
        marketPosition,
        percentileRank: Math.round(percentileRank)
      },
      competitors,
      marketStats: {
        averageRent: Math.round(averageRent),
        medianRent: Math.round(medianRent),
        rentRange,
        averageDaysOnMarket: Math.round(averageDaysOnMarket),
        concessionRate: Math.round(concessionRate),
        averageConcessionValue: Math.round(averageConcessionValue)
      },
      pricingGaps: {
        underpriced,
        overpriced,
        opportunities
      },
      trends: {
        rentTrend,
        averageRentChange: Math.round(averageRentChange * 100) / 100,
        recentChanges,
        marketVelocity
      }
    };
  }

  private identifyPricingOpportunities(competitors: CompetitorUnit[], targetRent: number): PricingOpportunity[] {
    const opportunities: PricingOpportunity[] = [];

    // Look for underpriced competitors
    const underpriced = competitors.filter(c => 
      c.currentRent < targetRent * 0.85 && 
      c.similarityScore > 0.85 && 
      c.daysOnMarket < 20
    );

    if (underpriced.length > 0) {
      const avgUnderpriced = underpriced.reduce((sum, c) => sum + c.currentRent, 0) / underpriced.length;
      opportunities.push({
        type: 'underpriced_competitor',
        description: `${underpriced.length} similar units priced significantly lower but leasing quickly`,
        potentialIncrease: targetRent - avgUnderpriced,
        confidence: 0.8,
        riskLevel: 'medium',
        timeframe: 'short_term'
      });
    }

    // Look for market gaps
    const sortedRents = competitors.map(c => c.currentRent).sort((a, b) => a - b);
    for (let i = 0; i < sortedRents.length - 1; i++) {
      const gap = sortedRents[i + 1] - sortedRents[i];
      if (gap > 200 && targetRent > sortedRents[i] && targetRent < sortedRents[i + 1]) {
        opportunities.push({
          type: 'market_gap',
          description: `Pricing gap of $${gap} between ${sortedRents[i]} and ${sortedRents[i + 1]}`,
          potentialIncrease: Math.min(gap * 0.5, 150),
          confidence: 0.7,
          riskLevel: 'low',
          timeframe: 'immediate'
        });
      }
    }

    // Look for concession advantages
    const concessionRate = (competitors.filter(c => c.concessions.length > 0).length / competitors.length) * 100;
    if (concessionRate > 50) {
      opportunities.push({
        type: 'concession_advantage',
        description: `${Math.round(concessionRate)}% of competitors offering concessions`,
        potentialIncrease: 100,
        confidence: 0.6,
        riskLevel: 'low',
        timeframe: 'immediate'
      });
    }

    return opportunities;
  }

  private generateAlerts(competitors: CompetitorUnit[]): void {
    // Generate alerts for significant changes
    competitors.forEach(competitor => {
      if (competitor.rentChangePercent && Math.abs(competitor.rentChangePercent) > 5) {
        const alert: CompetitorAlert = {
          id: `alert-${Date.now()}-${competitor.id}`,
          type: competitor.rentChangePercent > 0 ? 'price_increase' : 'price_drop',
          competitorId: competitor.id,
          propertyName: competitor.propertyName,
          unitDetails: `${competitor.bedrooms}BR/${competitor.bathrooms}BA - ${competitor.sqft} sqft`,
          previousValue: competitor.previousRent,
          newValue: competitor.currentRent,
          changePercent: competitor.rentChangePercent,
          impact: Math.abs(competitor.rentChangePercent) > 10 ? 'high' : 'medium',
          recommendedAction: competitor.rentChangePercent > 0 
            ? 'Consider competitive price adjustment'
            : 'Monitor for potential market shift',
          timestamp: new Date().toISOString(),
          isRead: false
        };
        this.alerts.push(alert);
      }
    });
  }

  getAlerts(unitId?: string): CompetitorAlert[] {
    return this.alerts.filter(alert => !unitId || alert.competitorId.includes(unitId));
  }

  markAlertAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  getUnreadAlertCount(): number {
    return this.alerts.filter(a => !a.isRead).length;
  }
}