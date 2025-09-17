import { ApartmentIQData, PricingRecommendation } from './pricing-engine';

export interface RenterDealIntelligence {
  unitId: string;
  dealScore: number; // 0-100, higher is better deal
  dealLevel: 'great_deal' | 'good_deal' | 'fair_deal' | 'hot_market';
  negotiationPotential: 'high' | 'medium' | 'low';
  landlordDesperation: 'desperate' | 'motivated' | 'standard' | 'stubborn';
  potentialSavings: {
    monthlyRange: [number, number]; // [min, max] potential monthly savings
    annualSavings: number;
    oneTimeConcessions: number;
  };
  timing: {
    advice: 'wait' | 'negotiate_now' | 'apply_immediately';
    reasoning: string;
    optimalActionWindow: string;
  };
  negotiationTips: string[];
  marketPosition: 'renter_advantage' | 'balanced' | 'landlord_advantage';
  competitionLevel: 'low' | 'medium' | 'high';
  vacancyWeakness: number; // 1-10, higher means more leverage for renter
}

export interface RenterMarketSummary {
  totalUnits: number;
  greatDeals: number;
  negotiableUnits: number;
  averageSavings: number;
  bestDealUnit: string;
  marketTrend: 'renter_friendly' | 'balanced' | 'competitive';
  dealDistribution: {
    great_deal: number;
    good_deal: number;
    fair_deal: number;
    hot_market: number;
  };
}

export class RenterIntelligenceEngine {
  
  transformToRenterIntelligence(apartmentData: ApartmentIQData, pricingRec?: PricingRecommendation): RenterDealIntelligence {
    // Calculate deal score (0-100, higher is better for renters)
    const dealScore = this.calculateDealScore(apartmentData, pricingRec);
    
    // Determine deal level
    const dealLevel = this.getDealLevel(dealScore, apartmentData.daysOnMarket);
    
    // Assess negotiation potential
    const negotiationPotential = this.assessNegotiationPotential(apartmentData);
    
    // Determine landlord desperation
    const landlordDesperation = this.assessLandlordDesperation(apartmentData);
    
    // Calculate potential savings
    const potentialSavings = this.calculatePotentialSavings(apartmentData, pricingRec);
    
    // Generate timing advice
    const timing = this.generateTimingAdvice(apartmentData, dealLevel);
    
    // Generate negotiation tips
    const negotiationTips = this.generateNegotiationTips(apartmentData, landlordDesperation);
    
    // Assess market position from renter perspective
    const marketPosition = this.assessRenterMarketPosition(apartmentData);
    
    // Determine competition level
    const competitionLevel = this.getCompetitionLevel(apartmentData.marketVelocity);
    
    // Calculate vacancy weakness (how much leverage renter has)
    const vacancyWeakness = this.calculateVacancyWeakness(apartmentData);

    return {
      unitId: apartmentData.unitId,
      dealScore,
      dealLevel,
      negotiationPotential,
      landlordDesperation,
      potentialSavings,
      timing,
      negotiationTips,
      marketPosition,
      competitionLevel,
      vacancyWeakness
    };
  }

  private calculateDealScore(data: ApartmentIQData, pricingRec?: PricingRecommendation): number {
    let score = 50; // Base score

    // Days on market bonus (more days = better for renter)
    if (data.daysOnMarket >= 45) score += 25;
    else if (data.daysOnMarket >= 30) score += 20;
    else if (data.daysOnMarket >= 14) score += 15;
    else if (data.daysOnMarket >= 7) score += 10;

    // Concession value bonus
    const concessionPercent = (data.concessionValue / data.currentRent) * 100;
    if (concessionPercent >= 10) score += 20;
    else if (concessionPercent >= 5) score += 15;
    else if (concessionPercent > 0) score += 10;

    // Market velocity adjustment (slower = better for renter)
    switch (data.marketVelocity) {
      case 'stale': score += 20; break;
      case 'slow': score += 15; break;
      case 'normal': score += 5; break;
      case 'hot': score -= 15; break;
    }

    // Pricing recommendation adjustment
    if (pricingRec && pricingRec.adjustmentPercent < -5) {
      score += 15; // Landlord should reduce price significantly
    }

    // Market position adjustment
    if (data.marketPosition === 'above_market') score += 15;
    else if (data.marketPosition === 'at_market') score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private getDealLevel(score: number, daysOnMarket: number): RenterDealIntelligence['dealLevel'] {
    if (score >= 80 || daysOnMarket >= 45) return 'great_deal';
    if (score >= 65 || daysOnMarket >= 21) return 'good_deal';
    if (score >= 45) return 'fair_deal';
    return 'hot_market';
  }

  private assessNegotiationPotential(data: ApartmentIQData): RenterDealIntelligence['negotiationPotential'] {
    if (data.daysOnMarket >= 30 || data.concessionUrgency === 'desperate') return 'high';
    if (data.daysOnMarket >= 14 || data.concessionUrgency === 'aggressive') return 'medium';
    return 'low';
  }

  private assessLandlordDesperation(data: ApartmentIQData): RenterDealIntelligence['landlordDesperation'] {
    if (data.daysOnMarket >= 45 || data.concessionUrgency === 'desperate') return 'desperate';
    if (data.daysOnMarket >= 21 || data.concessionUrgency === 'aggressive') return 'motivated';
    if (data.daysOnMarket >= 7 || data.concessionUrgency === 'standard') return 'standard';
    return 'stubborn';
  }

  private calculatePotentialSavings(data: ApartmentIQData, pricingRec?: PricingRecommendation): RenterDealIntelligence['potentialSavings'] {
    const baseRent = data.currentRent;
    let minSavings = 0;
    let maxSavings = 0;

    // Base negotiation range based on market conditions
    if (data.daysOnMarket >= 45) {
      minSavings = baseRent * 0.05; // 5% minimum
      maxSavings = baseRent * 0.15; // 15% maximum
    } else if (data.daysOnMarket >= 21) {
      minSavings = baseRent * 0.03;
      maxSavings = baseRent * 0.10;
    } else if (data.daysOnMarket >= 7) {
      minSavings = baseRent * 0.01;
      maxSavings = baseRent * 0.05;
    }

    // Additional savings from existing concessions
    const existingConcessions = data.concessionValue || 0;

    return {
      monthlyRange: [minSavings, maxSavings],
      annualSavings: (minSavings + maxSavings) / 2 * 12,
      oneTimeConcessions: existingConcessions
    };
  }

  private generateTimingAdvice(data: ApartmentIQData, dealLevel: RenterDealIntelligence['dealLevel']): RenterDealIntelligence['timing'] {
    if (data.marketVelocity === 'hot' || data.daysOnMarket < 3) {
      return {
        advice: 'apply_immediately',
        reasoning: 'High demand market - units lease quickly',
        optimalActionWindow: 'Within 24 hours'
      };
    }

    if (dealLevel === 'great_deal' && data.daysOnMarket >= 30) {
      return {
        advice: 'negotiate_now',
        reasoning: 'Landlord is motivated after long vacancy',
        optimalActionWindow: 'This week'
      };
    }

    if (data.daysOnMarket < 14 && data.marketVelocity === 'normal') {
      return {
        advice: 'wait',
        reasoning: 'Unit may get more desperate in 1-2 weeks',
        optimalActionWindow: '7-14 days'
      };
    }

    return {
      advice: 'negotiate_now',
      reasoning: 'Good balance of leverage and risk',
      optimalActionWindow: 'Within 3-5 days'
    };
  }

  private generateNegotiationTips(data: ApartmentIQData, desperation: RenterDealIntelligence['landlordDesperation']): string[] {
    const tips: string[] = [];

    if (data.daysOnMarket >= 30) {
      tips.push(`Mention the ${data.daysOnMarket}-day vacancy to justify lower rent`);
    }

    if (data.concessionValue > 0) {
      tips.push('Ask to convert concessions to permanent rent reduction');
    }

    if (desperation === 'desperate') {
      tips.push('Be bold - desperate landlords need to fill units');
      tips.push('Request multiple concessions (lower rent + waived fees)');
    }

    if (data.marketVelocity === 'slow' || data.marketVelocity === 'stale') {
      tips.push('Reference slow market conditions in your negotiation');
    }

    if (data.marketPosition === 'above_market') {
      tips.push('Point out that rent is above market average');
    }

    if (tips.length === 0) {
      tips.push('Professional approach - landlord has less pressure');
    }

    return tips;
  }

  private assessRenterMarketPosition(data: ApartmentIQData): RenterDealIntelligence['marketPosition'] {
    if (data.daysOnMarket >= 30 || data.marketVelocity === 'stale') {
      return 'renter_advantage';
    }
    if (data.marketVelocity === 'hot' || data.daysOnMarket < 5) {
      return 'landlord_advantage';
    }
    return 'balanced';
  }

  private getCompetitionLevel(velocity: ApartmentIQData['marketVelocity']): RenterDealIntelligence['competitionLevel'] {
    switch (velocity) {
      case 'hot': return 'high';
      case 'normal': return 'medium';
      case 'slow':
      case 'stale': return 'low';
      default: return 'medium';
    }
  }

  private calculateVacancyWeakness(data: ApartmentIQData): number {
    let weakness = 1;

    // Days on market factor
    weakness += Math.min(data.daysOnMarket / 7, 5); // Max 5 points for 35+ days

    // Concession urgency factor
    switch (data.concessionUrgency) {
      case 'desperate': weakness += 3; break;
      case 'aggressive': weakness += 2; break;
      case 'standard': weakness += 1; break;
    }

    // Market velocity factor
    switch (data.marketVelocity) {
      case 'stale': weakness += 2; break;
      case 'slow': weakness += 1; break;
      case 'hot': weakness -= 1; break;
    }

    return Math.max(1, Math.min(10, Math.round(weakness)));
  }

  generateMarketSummary(dealIntelligence: RenterDealIntelligence[]): RenterMarketSummary {
    const total = dealIntelligence.length;
    const distribution = {
      great_deal: 0,
      good_deal: 0,
      fair_deal: 0,
      hot_market: 0
    };

    let totalSavings = 0;
    let bestDeal = dealIntelligence[0];

    dealIntelligence.forEach(deal => {
      distribution[deal.dealLevel]++;
      
      const avgSavings = (deal.potentialSavings.monthlyRange[0] + deal.potentialSavings.monthlyRange[1]) / 2;
      totalSavings += avgSavings;

      if (deal.dealScore > bestDeal.dealScore) {
        bestDeal = deal;
      }
    });

    const greatDeals = distribution.great_deal;
    const negotiableUnits = distribution.great_deal + distribution.good_deal;
    
    let marketTrend: RenterMarketSummary['marketTrend'] = 'balanced';
    if (greatDeals / total > 0.3) marketTrend = 'renter_friendly';
    else if (distribution.hot_market / total > 0.4) marketTrend = 'competitive';

    return {
      totalUnits: total,
      greatDeals,
      negotiableUnits,
      averageSavings: totalSavings / total,
      bestDealUnit: bestDeal.unitId,
      marketTrend,
      dealDistribution: distribution
    };
  }
}