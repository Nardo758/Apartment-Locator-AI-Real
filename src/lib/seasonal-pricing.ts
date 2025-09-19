export interface SeasonalFactor {
  month: number;
  seasonName: string;
  demandMultiplier: number; // 0.8 - 1.2
  description: string;
  confidence: number;
}

export interface LocationSeasonality {
  city: string;
  state: string;
  marketType: 'university' | 'tourist' | 'business' | 'mixed' | 'residential';
  seasonalFactors: SeasonalFactor[];
  peakMonths: number[];
  lowMonths: number[];
  yearOverYearTrend: number;
}

export interface SeasonalAdjustment {
  currentMonth: number;
  currentSeason: string;
  demandFactor: number;
  adjustmentPercent: number;
  reasoning: string;
  nextSeasonChange: {
    month: number;
    expectedChange: number;
    description: string;
  };
  yearOverYearComparison: {
    sameMonthLastYear: number;
    trendDirection: 'up' | 'down' | 'stable';
    trendMagnitude: number;
  };
}

export interface HolidayImpact {
  holidayName: string;
  startDate: string;
  endDate: string;
  impactType: 'positive' | 'negative' | 'neutral';
  demandChange: number; // percentage change
  description: string;
}

export class SeasonalPricingEngine {
  private locationData: Map<string, LocationSeasonality> = new Map();
  private holidayCalendar: HolidayImpact[] = [];

  constructor() {
    this.initializeLocationData();
    this.initializeHolidayCalendar();
  }

  private initializeLocationData(): void {
    // Austin, TX - University town with tech industry
    this.locationData.set('austin-tx', {
      city: 'Austin',
      state: 'TX',
      marketType: 'university',
      seasonalFactors: [
        { month: 1, seasonName: 'Winter Low', demandMultiplier: 0.85, description: 'Post-holiday low demand', confidence: 0.9 },
        { month: 2, seasonName: 'Winter Low', demandMultiplier: 0.88, description: 'Continued low demand', confidence: 0.9 },
        { month: 3, seasonName: 'Spring Pickup', demandMultiplier: 0.95, description: 'SXSW and spring break activity', confidence: 0.85 },
        { month: 4, seasonName: 'Spring High', demandMultiplier: 1.05, description: 'University semester ending, job relocations', confidence: 0.9 },
        { month: 5, seasonName: 'Peak Season', demandMultiplier: 1.15, description: 'Peak moving season, graduation', confidence: 0.95 },
        { month: 6, seasonName: 'Peak Season', demandMultiplier: 1.18, description: 'Summer relocations, internships', confidence: 0.95 },
        { month: 7, seasonName: 'Peak Season', demandMultiplier: 1.12, description: 'Continued high demand', confidence: 0.9 },
        { month: 8, seasonName: 'University Rush', demandMultiplier: 1.20, description: 'University students returning', confidence: 0.98 },
        { month: 9, seasonName: 'Fall High', demandMultiplier: 1.08, description: 'Fall semester, job market active', confidence: 0.9 },
        { month: 10, seasonName: 'Fall Moderate', demandMultiplier: 0.98, description: 'Demand normalizing', confidence: 0.85 },
        { month: 11, seasonName: 'Winter Decline', demandMultiplier: 0.90, description: 'Holiday season slowdown', confidence: 0.9 },
        { month: 12, seasonName: 'Winter Low', demandMultiplier: 0.82, description: 'Holiday season, lowest demand', confidence: 0.95 }
      ],
      peakMonths: [5, 6, 7, 8],
      lowMonths: [12, 1, 2],
      yearOverYearTrend: 1.03 // 3% annual growth
    });

    // Default seasonal pattern for most US cities
    this.locationData.set('default', {
      city: 'Default',
      state: 'US',
      marketType: 'mixed',
      seasonalFactors: [
        { month: 1, seasonName: 'Winter Low', demandMultiplier: 0.90, description: 'Winter low demand', confidence: 0.8 },
        { month: 2, seasonName: 'Winter Low', demandMultiplier: 0.92, description: 'Late winter', confidence: 0.8 },
        { month: 3, seasonName: 'Spring Start', demandMultiplier: 0.98, description: 'Spring market pickup', confidence: 0.8 },
        { month: 4, seasonName: 'Spring High', demandMultiplier: 1.05, description: 'Spring moving season', confidence: 0.85 },
        { month: 5, seasonName: 'Peak Season', demandMultiplier: 1.10, description: 'Peak moving season', confidence: 0.9 },
        { month: 6, seasonName: 'Peak Season', demandMultiplier: 1.12, description: 'Summer relocations', confidence: 0.9 },
        { month: 7, seasonName: 'Peak Season', demandMultiplier: 1.08, description: 'Continued summer demand', confidence: 0.85 },
        { month: 8, seasonName: 'Late Summer', demandMultiplier: 1.03, description: 'Late summer moves', confidence: 0.8 },
        { month: 9, seasonName: 'Fall Moderate', demandMultiplier: 1.00, description: 'Fall stabilization', confidence: 0.8 },
        { month: 10, seasonName: 'Fall Decline', demandMultiplier: 0.95, description: 'Demand declining', confidence: 0.8 },
        { month: 11, seasonName: 'Winter Start', demandMultiplier: 0.88, description: 'Winter season begins', confidence: 0.8 },
        { month: 12, seasonName: 'Winter Low', demandMultiplier: 0.85, description: 'Holiday season low', confidence: 0.85 }
      ],
      peakMonths: [5, 6, 7],
      lowMonths: [12, 1, 2],
      yearOverYearTrend: 1.02 // 2% annual growth
    });
  }

  private initializeHolidayCalendar(): void {
    const currentYear = new Date().getFullYear();
    
    this.holidayCalendar = [
      {
        holidayName: 'New Year',
        startDate: `${currentYear}-12-25`,
        endDate: `${currentYear + 1}-01-08`,
        impactType: 'negative',
        demandChange: -15,
        description: 'Holiday season reduces apartment hunting activity'
      },
      {
        holidayName: 'Spring Break',
        startDate: `${currentYear}-03-10`,
        endDate: `${currentYear}-03-24`,
        impactType: 'neutral',
        demandChange: 0,
        description: 'Mixed impact - some markets see increased activity'
      },
      {
        holidayName: 'Memorial Day Weekend',
        startDate: `${currentYear}-05-24`,
        endDate: `${currentYear}-05-27`,
        impactType: 'positive',
        demandChange: 10,
        description: 'Traditional start of moving season'
      },
      {
        holidayName: 'Independence Day',
        startDate: `${currentYear}-07-03`,
        endDate: `${currentYear}-07-05`,
        impactType: 'negative',
        demandChange: -5,
        description: 'Brief slowdown during holiday weekend'
      },
      {
        holidayName: 'Labor Day Weekend',
        startDate: `${currentYear}-09-01`,
        endDate: `${currentYear}-09-03`,
        impactType: 'positive',
        demandChange: 8,
        description: 'Last push before school/work season'
      },
      {
        holidayName: 'Thanksgiving',
        startDate: `${currentYear}-11-21`,
        endDate: `${currentYear}-11-24`,
        impactType: 'negative',
        demandChange: -20,
        description: 'Major holiday reduces activity significantly'
      },
      {
        holidayName: 'Christmas',
        startDate: `${currentYear}-12-20`,
        endDate: `${currentYear}-12-26`,
        impactType: 'negative',
        demandChange: -25,
        description: 'Lowest activity period of the year'
      }
    ];
  }

  calculateSeasonalAdjustment(
    location: string = 'default',
    currentDate: Date = new Date(),
    unitType?: 'university' | 'family' | 'professional'
  ): SeasonalAdjustment {
    const locationKey = location.toLowerCase().replace(/[^a-z]/g, '-');
    const locationData = this.locationData.get(locationKey) || this.locationData.get('default')!;
    
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentFactor = locationData.seasonalFactors.find(f => f.month === currentMonth)!;
    
    // Calculate base seasonal adjustment
    let adjustmentPercent = (currentFactor.demandMultiplier - 1) * 100;
    
    // Apply unit type modifiers
    if (unitType === 'university' && locationData.marketType === 'university') {
      // University units get enhanced seasonal effects
      if ([8, 9].includes(currentMonth)) adjustmentPercent *= 1.5; // Back to school
      if ([12, 1].includes(currentMonth)) adjustmentPercent *= 1.3; // Winter break
    } else if (unitType === 'family') {
      // Family units less affected by extreme seasonality
      adjustmentPercent *= 0.7;
    }
    
    // Check for holiday impacts
    const currentHoliday = this.getCurrentHolidayImpact(currentDate);
    if (currentHoliday) {
      adjustmentPercent += currentHoliday.demandChange * 0.3; // Moderate holiday impact
    }
    
    // Calculate next season change
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextFactor = locationData.seasonalFactors.find(f => f.month === nextMonth)!;
    const nextSeasonChange = (nextFactor.demandMultiplier - currentFactor.demandMultiplier) * 100;
    
    // Year-over-year comparison
    const lastYearFactor = currentFactor.demandMultiplier * (locationData.yearOverYearTrend - 1);
    const trendDirection = lastYearFactor > 0.01 ? 'up' : lastYearFactor < -0.01 ? 'down' : 'stable';
    
    return {
      currentMonth,
      currentSeason: currentFactor.seasonName,
      demandFactor: currentFactor.demandMultiplier,
      adjustmentPercent: Math.round(adjustmentPercent * 100) / 100,
      reasoning: this.generateSeasonalReasoning(currentFactor, currentHoliday, adjustmentPercent),
      nextSeasonChange: {
        month: nextMonth,
        expectedChange: Math.round(nextSeasonChange * 100) / 100,
        description: nextSeasonChange > 2 ? 'Demand increasing next month' :
                    nextSeasonChange < -2 ? 'Demand declining next month' :
                    'Stable demand expected next month'
      },
      yearOverYearComparison: {
        sameMonthLastYear: Math.round((currentFactor.demandMultiplier * locationData.yearOverYearTrend - 1) * 100 * 100) / 100,
        trendDirection,
        trendMagnitude: Math.abs(Math.round(lastYearFactor * 100 * 100) / 100)
      }
    };
  }

  private getCurrentHolidayImpact(currentDate: Date): HolidayImpact | null {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    
    return this.holidayCalendar.find(holiday => 
      currentDateStr >= holiday.startDate && currentDateStr <= holiday.endDate
    ) || null;
  }

  private generateSeasonalReasoning(
    factor: SeasonalFactor, 
    holiday: HolidayImpact | null, 
    totalAdjustment: number
  ): string {
    let reasoning = factor.description;
    
    if (holiday) {
      reasoning += `. ${holiday.description}`;
    }
    
    if (Math.abs(totalAdjustment) > 5) {
      reasoning += totalAdjustment > 0 
        ? '. Strong seasonal demand supports premium pricing'
        : '. Weak seasonal demand suggests conservative pricing';
    }
    
    return reasoning;
  }

  getSeasonalForecast(location: string = 'default', monthsAhead: number = 6): SeasonalFactor[] {
    const locationKey = location.toLowerCase().replace(/[^a-z]/g, '-');
    const locationData = this.locationData.get(locationKey) || this.locationData.get('default')!;
    
    const currentMonth = new Date().getMonth() + 1;
    const forecast: SeasonalFactor[] = [];
    
    for (let i = 1; i <= monthsAhead; i++) {
      const targetMonth = ((currentMonth - 1 + i) % 12) + 1;
      const factor = locationData.seasonalFactors.find(f => f.month === targetMonth)!;
      forecast.push(factor);
    }
    
    return forecast;
  }

  getOptimalPricingWindows(location: string = 'default'): {
    bestMonths: SeasonalFactor[];
    worstMonths: SeasonalFactor[];
    recommendations: string[];
  } {
    const locationKey = location.toLowerCase().replace(/[^a-z]/g, '-');
    const locationData = this.locationData.get(locationKey) || this.locationData.get('default')!;
    
    const sortedFactors = [...locationData.seasonalFactors].sort((a, b) => b.demandMultiplier - a.demandMultiplier);
    
    const bestMonths = sortedFactors.slice(0, 3);
    const worstMonths = sortedFactors.slice(-3).reverse();
    
    const recommendations = [
      `Peak pricing opportunities: ${bestMonths.map(f => this.getMonthName(f.month)).join(', ')}`,
      `Consider concessions during: ${worstMonths.map(f => this.getMonthName(f.month)).join(', ')}`,
      `Average seasonal swing: ${Math.round((bestMonths[0].demandMultiplier - worstMonths[0].demandMultiplier) * 100)}%`
    ];
    
    return { bestMonths, worstMonths, recommendations };
  }

  private getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }
}