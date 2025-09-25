// ApartmentIQ AI Algorithm - JavaScript/TypeScript Implementation
// Compatible with Lovable and web applications

// Enums and Types
enum OpportunityTier {
  HOT_DEAL = "Hot Deal",           // 90%+ success rate
  STRONG_OPPORTUNITY = "Strong Opportunity", // 70-89% success rate
  WORTH_TRYING = "Worth Trying"    // 50-69% success rate
}

enum ConfidenceLevel {
  HIGH = "High",                   // >85%
  MODERATE = "Moderate",           // 65-85%
  EXPERIMENTAL = "Experimental"    // <65%
}

// Data Interfaces
interface PropertyData {
  propertyId: string;
  rent: number;
  vacancyDuration: number;         // days on market
  relistingFrequency: number;
  priceChangeHistory: number[];
  currentOccupancy: number;        // percentage (0-1)
  seasonalPatterns: Record<string, number>;
  competitorComparison: number;
  debtRatio: number;
  quarterlyTargets: Record<string, number>;
  listingDescription: string;
  descriptionChanges: string[];
  urgencyIndicators: string[];
  concessionHints: string[];
}

interface MarketData {
  location: string;
  seasonalTrends: Record<string, Record<string, number>>;
  competitorPricing: number[];
  competitorIncentives: string[];
  competitorVacancyRates: number[];
  jobMarketScore: number;
  populationGrowth: number;
  newConstructionPipeline: number;
  averageTenantTenure: number;
  renewalRates: number;
  rentToIncomeRatio: number;
}

interface BehavioralData {
  landlordId: string;
  historicalAcceptanceRate: number;
  preferredConcessions: string[];
  propertyManagerId: string;
  agentSuccessRate: number;
  decisionAuthority: number;
  avgResponseTime: number;
  communicationPatterns: Record<string, any>;
  previousNegotiations: Array<Record<string, any>>;
}

interface TenantProfile {
  income: number;
  creditScore: number;
  employmentStability: number;
  locationPreferences: string[];
  commuteRequirements: Record<string, any>;
  amenityPriorities: Record<string, number>;
  budgetFlexibility: number;
  riskTolerance: number;
}

interface ConcessionPrediction {
  concessionType: string;
  probability: number;
  value: number;
  impactScore: number;
}

interface OpportunityResult {
  propertyId: string;
  opportunityScore: number;
  tier: OpportunityTier;
  confidence: ConfidenceLevel;
  predictedConcessions: ConcessionPrediction[];
  expectedSavings: number;
  effectiveMonthlyRate: number;
  successRate: number;
  recommendation: string;
}

// Simple ML Utilities for web compatibility
class MLUtils {
  // Simple linear regression for basic predictions
  static linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  // Sigmoid function
  static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  // Normalize array to 0-1 range
  static normalize(arr: number[]): number[] {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min;
    return range === 0 ? arr.map(() => 0.5) : arr.map(x => (x - min) / range);
  }

  // Calculate weighted average
  static weightedAverage(values: number[], weights: number[]): number {
    const weightedSum = values.reduce((sum, val, i) => sum + val * weights[i], 0);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    return weightedSum / totalWeight;
  }

  // Simple ensemble prediction (average of multiple models)
  static ensemblePredict(predictions: number[]): number {
    return predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
  }
}

// Main ApartmentIQ AI Engine
class ApartmentIQAI {
  private historicalData: any[] = [];
  private marketTrends: Record<string, any> = {};

  constructor() {
    this.initializeModels();
  }

  private initializeModels(): void {
    // Initialize any required model parameters or configurations
    console.log('ApartmentIQ AI Engine initialized');
  }

  /**
   * Calculate opportunity score using the formula:
   * Opportunity_Score = Σ(
   *   Vacancy_Pressure * 0.25 +
   *   Seasonal_Leverage * 0.20 +
   *   Financial_Stress * 0.18 +
   *   Market_Competition * 0.15 +
   *   Landlord_Flexibility * 0.12 +
   *   Timing_Advantage * 0.10
   * )
   */
  calculateOpportunityScore(
    propertyData: PropertyData,
    marketData: MarketData,
    behavioralData: BehavioralData
  ): number {
    const vacancyPressure = this.calculateVacancyPressure(propertyData);
    const seasonalLeverage = this.calculateSeasonalLeverage(marketData);
    const financialStress = this.calculateFinancialStress(propertyData);
    const marketCompetition = this.calculateMarketCompetition(marketData);
    const landlordFlexibility = this.calculateLandlordFlexibility(behavioralData);
    const timingAdvantage = this.calculateTimingAdvantage(propertyData, marketData);

    const opportunityScore = (
      vacancyPressure * 0.25 +
      seasonalLeverage * 0.20 +
      financialStress * 0.18 +
      marketCompetition * 0.15 +
      landlordFlexibility * 0.12 +
      timingAdvantage * 0.10
    );

    return Math.min(100, Math.max(0, opportunityScore));
  }

  private calculateVacancyPressure(propertyData: PropertyData): number {
    let baseScore = 0;

    // Days on market factor
    if (propertyData.vacancyDuration > 45) {
      baseScore += 40; // High pressure
    } else if (propertyData.vacancyDuration > 30) {
      baseScore += 25; // Moderate pressure
    } else if (propertyData.vacancyDuration > 15) {
      baseScore += 10; // Some pressure
    }

    // Re-listing frequency
    baseScore += Math.min(30, propertyData.relistingFrequency * 10);

    // Price change history (recent reductions)
    if (propertyData.priceChangeHistory.length > 0) {
      const recentChanges = propertyData.priceChangeHistory.slice(-3);
      const negativeChanges = recentChanges.filter(x => x < 0);
      if (negativeChanges.length > 0) {
        baseScore += 20;
      }
    }

    // Occupancy rate
    if (propertyData.currentOccupancy < 0.85) {
      baseScore += 15;
    } else if (propertyData.currentOccupancy < 0.90) {
      baseScore += 8;
    }

    return Math.min(100, baseScore);
  }

  private calculateSeasonalLeverage(marketData: MarketData): number {
    const currentMonth = new Date().getMonth() + 1;
    
    const seasonalMap: Record<number, number> = {
      12: 85, 1: 90, 2: 85,  // Winter - high leverage
      3: 60, 4: 45, 5: 30,   // Spring - decreasing leverage
      6: 20, 7: 15, 8: 20,   // Summer - low leverage
      9: 40, 10: 55, 11: 70  // Fall - increasing leverage
    };

    let baseScore = seasonalMap[currentMonth] || 50;

    // Adjust based on local patterns
    if (marketData.seasonalTrends[currentMonth.toString()]) {
      const localFactor = marketData.seasonalTrends[currentMonth.toString()].leverageMultiplier || 1.0;
      baseScore *= localFactor;
    }

    return Math.min(100, Math.max(0, baseScore));
  }

  private calculateFinancialStress(propertyData: PropertyData): number {
    let stressScore = 0;

    // Debt ratio impact
    if (propertyData.debtRatio > 0.8) {
      stressScore += 40;
    } else if (propertyData.debtRatio > 0.6) {
      stressScore += 25;
    } else if (propertyData.debtRatio > 0.4) {
      stressScore += 10;
    }

    // Quarterly targets pressure
    const currentQuarter = `Q${Math.floor((new Date().getMonth()) / 3) + 1}`;
    if (propertyData.quarterlyTargets[currentQuarter]) {
      const targetPressure = propertyData.quarterlyTargets[currentQuarter];
      stressScore += targetPressure * 30;
    }

    // End of quarter bonus (last month of quarter)
    const currentMonth = new Date().getMonth() + 1;
    if ([3, 6, 9, 12].includes(currentMonth)) {
      stressScore += 15;
    }

    return Math.min(100, stressScore);
  }

  private calculateMarketCompetition(marketData: MarketData): number {
    let competitionScore = 0;

    // Competitor vacancy rates
    if (marketData.competitorVacancyRates && marketData.competitorVacancyRates.length > 0) {
      const avgCompetitorVacancy = marketData.competitorVacancyRates.reduce((a, b) => a + b, 0) / marketData.competitorVacancyRates.length;
      
      if (avgCompetitorVacancy > 0.15) {
        competitionScore += 30;
      } else if (avgCompetitorVacancy > 0.10) {
        competitionScore += 20;
      } else if (avgCompetitorVacancy > 0.05) {
        competitionScore += 10;
      }
    }

    // Incentive competition
    if (marketData.competitorIncentives.length > 2) {
      competitionScore += 25;
    } else if (marketData.competitorIncentives.length > 0) {
      competitionScore += 15;
    }

    // New construction pressure
    if (marketData.newConstructionPipeline > 100) {
      competitionScore += 15;
    }

    return Math.min(100, competitionScore);
  }

  private calculateLandlordFlexibility(behavioralData: BehavioralData): number {
    let flexibilityScore = behavioralData.historicalAcceptanceRate * 100;

    // Agent authority adjustment
    flexibilityScore *= behavioralData.decisionAuthority;

    // Response time factor (faster response = more motivated)
    if (behavioralData.avgResponseTime < 2) { // hours
      flexibilityScore += 10;
    } else if (behavioralData.avgResponseTime < 8) {
      flexibilityScore += 5;
    }

    return Math.min(100, flexibilityScore);
  }

  private calculateTimingAdvantage(propertyData: PropertyData, marketData: MarketData): number {
    let timingScore = 0;

    // End of month pressure
    const currentDay = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    if (currentDay > daysInMonth - 5) { // Last 5 days of month
      timingScore += 30;
    } else if (currentDay > daysInMonth - 10) { // Last 10 days
      timingScore += 15;
    }

    // Market conditions
    if (marketData.newConstructionPipeline > 100) { // Many new units coming
      timingScore += 20;
    }

    // Urgency indicators in listing
    const urgencyKeywords = ['must rent', 'immediate', 'flexible', 'motivated'];
    const urgencyCount = urgencyKeywords.reduce((count, keyword) => {
      return count + propertyData.urgencyIndicators.filter(hint => 
        hint.toLowerCase().includes(keyword)
      ).length;
    }, 0);
    timingScore += urgencyCount * 10;

    return Math.min(100, timingScore);
  }

  /**
   * Predict available concessions and their probabilities
   */
  predictConcessions(
    propertyData: PropertyData,
    marketData: MarketData,
    behavioralData: BehavioralData
  ): ConcessionPrediction[] {
    const concessions: ConcessionPrediction[] = [];

    // Base concession types with historical success rates
    const baseConcessions = {
      waived_fees: { baseProb: 0.85, valueFactor: 0.1 },
      first_month_free: { baseProb: 0.72, valueFactor: 1.0 },
      reduced_deposit: { baseProb: 0.68, valueFactor: 0.15 },
      parking_storage: { baseProb: 0.61, valueFactor: 0.3 },
      early_move_in: { baseProb: 0.58, valueFactor: 0.2 }
    };

    const opportunityScore = this.calculateOpportunityScore(propertyData, marketData, behavioralData);
    const leverageMultiplier = opportunityScore / 100;

    Object.entries(baseConcessions).forEach(([concessionType, params]) => {
      // Adjust probability based on opportunity score
      let adjustedProb = params.baseProb * (0.7 + 0.6 * leverageMultiplier);
      adjustedProb = Math.min(0.95, adjustedProb); // Cap at 95%

      // Calculate value based on rent and type
      let value: number;
      switch (concessionType) {
        case 'first_month_free':
          value = propertyData.rent;
          break;
        case 'waived_fees':
          value = propertyData.rent * 0.08; // Typical fees are ~8% of rent
          break;
        case 'reduced_deposit':
          value = propertyData.rent * 0.5; // Reduction of half month's rent
          break;
        case 'parking_storage':
          value = 150; // Typical monthly value
          break;
        case 'early_move_in':
          value = propertyData.rent * 0.1; // Flexibility value
          break;
        default:
          value = propertyData.rent * params.valueFactor;
      }

      // Adjust based on landlord preferences
      if (behavioralData.preferredConcessions.includes(concessionType)) {
        adjustedProb *= 1.2;
        adjustedProb = Math.min(0.95, adjustedProb);
      }

      const impactScore = adjustedProb * value / propertyData.rent;

      concessions.push({
        concessionType,
        probability: adjustedProb,
        value,
        impactScore
      });
    });

    return concessions.sort((a, b) => b.impactScore - a.impactScore);
  }

  /**
   * Calculate expected savings and effective monthly rate
   */
  calculateSavings(
    propertyData: PropertyData,
    concessions: ConcessionPrediction[],
    leaseTermMonths: number = 12
  ): { expectedSavings: number; effectiveMonthlyRate: number } {
    let totalConcessionValue = 0;
    let monthlyConcessions = 0;

    concessions.forEach(concession => {
      const expectedValue = concession.value * concession.probability;

      if (['first_month_free', 'waived_fees', 'reduced_deposit'].includes(concession.concessionType)) {
        // One-time concessions
        totalConcessionValue += expectedValue;
      } else {
        // Monthly concessions
        monthlyConcessions += expectedValue;
      }
    });

    // Calculate effective monthly rate
    const totalLeaseCost = (propertyData.rent * leaseTermMonths) - totalConcessionValue;
    let effectiveMonthlyRate = totalLeaseCost / leaseTermMonths;
    effectiveMonthlyRate -= monthlyConcessions;

    // Calculate total expected savings
    const originalMonthlyCost = propertyData.rent;
    const monthlySavings = originalMonthlyCost - effectiveMonthlyRate;
    const expectedSavings = (totalConcessionValue / leaseTermMonths) + monthlySavings;

    return { expectedSavings, effectiveMonthlyRate };
  }

  /**
   * Predict negotiation success rate
   */
  predictSuccessRate(
    propertyData: PropertyData,
    marketData: MarketData,
    behavioralData: BehavioralData,
    tenantProfile: TenantProfile,
    opportunityScore: number
  ): number {
    // Calculate individual factors
    const incomeRatio = tenantProfile.income / (propertyData.rent * 12);
    const tenantStrength = this.calculateTenantStrength(tenantProfile, incomeRatio);
    const marketTiming = opportunityScore * 0.25;
    const propertyPressure = Math.min(1.0, propertyData.vacancyDuration / 60.0);

    // Weighted sum (simplified sigmoid approach)
    const linearCombination = (
      tenantStrength * 0.30 +
      marketTiming * 0.25 +
      0.20 * Math.min(1.0, opportunityScore / 100) +
      propertyPressure * 0.15 +
      behavioralData.historicalAcceptanceRate * 0.10
    );

    // Apply sigmoid function
    const successRate = MLUtils.sigmoid(5 * (linearCombination - 0.5));
    return Math.min(0.95, Math.max(0.05, successRate));
  }

  private calculateTenantStrength(tenantProfile: TenantProfile, incomeRatio: number): number {
    let strength = 0;

    // Income ratio factor
    if (incomeRatio >= 3.0) {
      strength += 0.4;
    } else if (incomeRatio >= 2.5) {
      strength += 0.3;
    } else if (incomeRatio >= 2.0) {
      strength += 0.2;
    }

    // Credit score factor
    if (tenantProfile.creditScore >= 750) {
      strength += 0.3;
    } else if (tenantProfile.creditScore >= 700) {
      strength += 0.2;
    } else if (tenantProfile.creditScore >= 650) {
      strength += 0.1;
    }

    // Employment stability
    strength += tenantProfile.employmentStability * 0.3;

    return Math.min(1.0, strength);
  }

  /**
   * Determine opportunity tier based on scores
   */
  determineOpportunityTier(opportunityScore: number, successRate: number): OpportunityTier {
    const combinedScore = (opportunityScore + successRate * 100) / 2;

    if (combinedScore >= 90) {
      return OpportunityTier.HOT_DEAL;
    } else if (combinedScore >= 70) {
      return OpportunityTier.STRONG_OPPORTUNITY;
    } else {
      return OpportunityTier.WORTH_TRYING;
    }
  }

  /**
   * Calculate confidence level based on data quality
   */
  calculateConfidence(
    propertyData: PropertyData,
    behavioralData: BehavioralData,
    dataCompleteness: number
  ): ConfidenceLevel {
    let confidenceScore = 0;

    // Historical data quality
    if (behavioralData.previousNegotiations.length >= 5) {
      confidenceScore += 30;
    } else if (behavioralData.previousNegotiations.length >= 2) {
      confidenceScore += 20;
    } else if (behavioralData.previousNegotiations.length >= 1) {
      confidenceScore += 10;
    }

    // Data completeness
    confidenceScore += dataCompleteness * 40;

    // Property data quality
    if (propertyData.vacancyDuration > 0 && propertyData.priceChangeHistory.length > 0) {
      confidenceScore += 20;
    }

    // Market data availability bonus
    confidenceScore += 10;

    if (confidenceScore >= 85) {
      return ConfidenceLevel.HIGH;
    } else if (confidenceScore >= 65) {
      return ConfidenceLevel.MODERATE;
    } else {
      return ConfidenceLevel.EXPERIMENTAL;
    }
  }

  /**
   * Personalize recommendations based on tenant profile
   */
  personalizeRecommendations(
    tenantProfile: TenantProfile,
    baseOpportunities: OpportunityResult[]
  ): OpportunityResult[] {
    const scoredOpportunities = baseOpportunities.map(opportunity => {
      const personalMatch = this.calculatePersonalMatch(tenantProfile, opportunity);
      
      // Adjust opportunity score based on personal match
      const adjustedScore = opportunity.opportunityScore * (0.7 + 0.3 * personalMatch);
      
      return {
        ...opportunity,
        opportunityScore: adjustedScore
      };
    });

    // Sort by combined score
    return scoredOpportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  private calculatePersonalMatch(tenantProfile: TenantProfile, opportunity: OpportunityResult): number {
    let baseMatch = 0.5; // Base match score

    // Budget flexibility factor
    const budgetFactor = Math.min(1.0, tenantProfile.budgetFlexibility);
    baseMatch += budgetFactor * 0.3;

    // Risk tolerance factor
    const riskFactor = tenantProfile.riskTolerance;
    if (opportunity.confidence === ConfidenceLevel.HIGH) {
      baseMatch += 0.2;
    } else if (opportunity.confidence === ConfidenceLevel.MODERATE) {
      baseMatch += riskFactor * 0.2;
    } else { // EXPERIMENTAL
      baseMatch += riskFactor * 0.1;
    }

    return Math.min(1.0, baseMatch);
  }

  /**
   * Generate human-readable recommendation
   */
  generateRecommendation(opportunity: OpportunityResult): string {
    const recommendations: string[] = [];

    if (opportunity.tier === OpportunityTier.HOT_DEAL) {
      recommendations.push("🔥 Excellent opportunity! Act quickly.");
    } else if (opportunity.tier === OpportunityTier.STRONG_OPPORTUNITY) {
      recommendations.push("💪 Strong negotiation potential.");
    } else {
      recommendations.push("💡 Worth exploring - moderate potential.");
    }

    // Top concessions to focus on
    const topConcessions = opportunity.predictedConcessions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 2);

    if (topConcessions.length > 0) {
      const concessionText = topConcessions
        .map(c => c.concessionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
        .join(', ');
      recommendations.push(`Focus on: ${concessionText}`);
    }

    // Timing advice
    if (opportunity.opportunityScore > 80) {
      recommendations.push("⏰ Time-sensitive - property shows high pressure.");
    }

    // Confidence advice
    if (opportunity.confidence === ConfidenceLevel.EXPERIMENTAL) {
      recommendations.push("⚠️ Limited data - proceed with caution.");
    }

    return recommendations.join(' ');
  }

  /**
   * Main method to analyze a single opportunity
   */
  analyzeOpportunity(
    propertyData: PropertyData,
    marketData: MarketData,
    behavioralData: BehavioralData,
    tenantProfile: TenantProfile,
    leaseTermMonths: number = 12
  ): OpportunityResult {
    // Calculate core scores
    const opportunityScore = this.calculateOpportunityScore(propertyData, marketData, behavioralData);

    // Predict concessions
    const predictedConcessions = this.predictConcessions(propertyData, marketData, behavioralData);

    // Calculate savings
    const { expectedSavings, effectiveMonthlyRate } = this.calculateSavings(
      propertyData, predictedConcessions, leaseTermMonths
    );

    // Predict success rate
    const successRate = this.predictSuccessRate(
      propertyData, marketData, behavioralData, tenantProfile, opportunityScore
    );

    // Determine tier
    const tier = this.determineOpportunityTier(opportunityScore, successRate);

    // Calculate confidence
    const dataCompleteness = 0.8; // This would be calculated based on actual data availability
    const confidence = this.calculateConfidence(propertyData, behavioralData, dataCompleteness);

    // Create result
    const result: OpportunityResult = {
      propertyId: propertyData.propertyId,
      opportunityScore,
      tier,
      confidence,
      predictedConcessions,
      expectedSavings,
      effectiveMonthlyRate,
      successRate,
      recommendation: ''
    };

    // Generate recommendation
    result.recommendation = this.generateRecommendation(result);

    return result;
  }

  /**
   * Analyze multiple properties and return ranked opportunities
   */
  analyzeMultipleOpportunities(
    propertiesData: Array<[PropertyData, MarketData, BehavioralData]>,
    tenantProfile: TenantProfile,
    leaseTermMonths: number = 12
  ): OpportunityResult[] {
    const opportunities = propertiesData.map(([propertyData, marketData, behavioralData]) =>
      this.analyzeOpportunity(propertyData, marketData, behavioralData, tenantProfile, leaseTermMonths)
    );

    // Personalize recommendations
    const personalizedOpportunities = this.personalizeRecommendations(tenantProfile, opportunities);

    return personalizedOpportunities;
  }
}

// Sample Data Factory for Testing
class SampleDataFactory {
  static createPropertyData(): PropertyData {
    return {
      propertyId: "PROP_001",
      rent: 2350,
      vacancyDuration: 47,
      relistingFrequency: 2,
      priceChangeHistory: [-50, -25, 0],
      currentOccupancy: 0.82,
      seasonalPatterns: { winter: 0.8, spring: 0.9 },
      competitorComparison: 0.85,
      debtRatio: 0.65,
      quarterlyTargets: { Q4: 0.8 },
      listingDescription: "Luxury apartment with modern amenities",
      descriptionChanges: ["Added 'flexible terms'", "Reduced price"],
      urgencyIndicators: ["motivated landlord", "flexible"],
      concessionHints: ["willing to negotiate", "incentives available"]
    };
  }

  static createMarketData(): MarketData {
    return {
      location: "Downtown Seattle",
      seasonalTrends: { "12": { leverageMultiplier: 1.2 } },
      competitorPricing: [2200, 2400, 2300, 2500],
      competitorIncentives: ["first month free", "no fees"],
      competitorVacancyRates: [0.12, 0.08, 0.15],
      jobMarketScore: 0.75,
      populationGrowth: 0.02,
      newConstructionPipeline: 250,
      averageTenantTenure: 18.5,
      renewalRates: 0.78,
      rentToIncomeRatio: 0.31
    };
  }

  static createBehavioralData(): BehavioralData {
    return {
      landlordId: "LAND_001",
      historicalAcceptanceRate: 0.72,
      preferredConcessions: ["first_month_free", "waived_fees"],
      propertyManagerId: "PM_001",
      agentSuccessRate: 0.68,
      decisionAuthority: 0.85,
      avgResponseTime: 4.5,
      communicationPatterns: { responsive: true, flexible: true },
      previousNegotiations: [
        { outcome: "success", concession: "first_month_free" },
        { outcome: "success", concession: "waived_fees" },
        { outcome: "partial", concession: "reduced_deposit" }
      ]
    };
  }

  static createTenantProfile(): TenantProfile {
    return {
      income: 85000,
      creditScore: 720,
      employmentStability: 0.9,
      locationPreferences: ["downtown", "transit accessible"],
      commuteRequirements: { maxTime: 30, mode: "public_transit" },
      amenityPriorities: { gym: 0.8, parking: 0.9, pets: 0.6 },
      budgetFlexibility: 0.7,
      riskTolerance: 0.6
    };
  }
}

// Usage Example and Export
export {
  ApartmentIQAI,
  SampleDataFactory,
  OpportunityTier,
  ConfidenceLevel,
  type PropertyData,
  type MarketData,
  type BehavioralData,
  type TenantProfile,
  type ConcessionPrediction,
  type OpportunityResult
};

// Example usage for testing
function exampleUsage() {
  // Initialize the AI engine
  const aiEngine = new ApartmentIQAI();
  
  // Create sample data
  const propertyData = SampleDataFactory.createPropertyData();
  const marketData = SampleDataFactory.createMarketData();
  const behavioralData = SampleDataFactory.createBehavioralData();
  const tenantProfile = SampleDataFactory.createTenantProfile();
  
  // Analyze the opportunity
  const result = aiEngine.analyzeOpportunity(
    propertyData, marketData, behavioralData, tenantProfile
  );
  
  // Return formatted results
  return {
    propertyId: result.propertyId,
    opportunityScore: Math.round(result.opportunityScore * 10) / 10,
    tier: result.tier,
    confidence: result.confidence,
    successRate: Math.round(result.successRate * 1000) / 10, // Convert to percentage
    expectedSavings: Math.round(result.expectedSavings * 100) / 100,
    effectiveMonthlyRate: Math.round(result.effectiveMonthlyRate * 100) / 100,
    recommendation: result.recommendation,
    predictedConcessions: result.predictedConcessions.map(c => ({
      type: c.concessionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      probability: Math.round(c.probability * 1000) / 10, // Convert to percentage
      value: Math.round(c.value)
    }))
  };
}

// Run example if this is the main module
if (typeof window !== 'undefined') {
  // Browser environment - you can run the example
  console.log('ApartmentIQ AI Example Result:', exampleUsage());
}