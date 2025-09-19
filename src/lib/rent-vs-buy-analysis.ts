export interface RentVsBuyInputs {
  // Rental Information
  monthlyRent: number;
  rentalDeposit: number;
  rentalFees: number; // broker fees, application fees, etc.
  expectedRentIncrease: number; // annual percentage
  
  // Purchase Information
  homePrice: number;
  downPaymentPercent: number;
  mortgageRate: number;
  loanTermYears: number;
  
  // Additional Costs
  propertyTaxRate: number; // annual percentage
  homeInsurance: number; // annual cost
  hoaFees: number; // monthly
  maintenancePercent: number; // annual percentage of home value
  closingCosts: number; // one-time
  
  // Personal Situation
  currentSavings: number;
  monthlyIncome: number;
  timeHorizon: number; // years planning to stay
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  
  // Market Assumptions
  homeAppreciationRate: number; // annual percentage
  investmentReturn: number; // what they could earn investing down payment
  taxBracket: number; // for mortgage interest deduction
}

export interface RentVsBuyAnalysis {
  recommendation: 'rent' | 'buy' | 'neutral';
  confidence: number; // 0-1
  reasoning: string[];
  
  // Financial Analysis
  totalCostComparison: {
    rentingCosts: CostBreakdown;
    buyingCosts: CostBreakdown;
    netDifference: number;
    breakEvenPoint: number; // years
  };
  
  // Opportunity Cost Analysis
  opportunityCost: {
    downPaymentInvestment: number;
    rentingInvestmentGain: number;
    buyingEquityGain: number;
    netOpportunityCost: number;
  };
  
  // Flexibility Analysis
  flexibilityScore: {
    rentingFlexibility: number; // 1-10
    buyingFlexibility: number; // 1-10
    mobilityImpact: string;
    commitmentLevel: string;
  };
  
  // Risk Analysis
  riskAssessment: {
    rentingRisks: RiskFactor[];
    buyingRisks: RiskFactor[];
    marketRisks: MarketRiskFactor[];
    overallRiskLevel: 'low' | 'medium' | 'high';
  };
  
  // Scenario Analysis
  scenarios: RentVsBuyScenario[];
  
  // Timeline Analysis
  timeline: TimelineAnalysis[];
  
  // Personalized Insights
  personalizedInsights: PersonalizedInsight[];
}

export interface CostBreakdown {
  monthlyPayment: number;
  upfrontCosts: number;
  yearlyMaintenance: number;
  taxes: number;
  insurance: number;
  totalYearOne: number;
  totalOverTimeHorizon: number;
  equityBuilt?: number; // for buying only
  taxBenefits?: number; // for buying only
}

export interface RiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export interface MarketRiskFactor {
  factor: string;
  probability: number; // 0-1
  impact: number; // potential cost impact
  timeframe: 'short' | 'medium' | 'long';
  description: string;
}

export interface RentVsBuyScenario {
  name: string;
  assumptions: string[];
  rentingOutcome: {
    totalCost: number;
    flexibility: number;
    investmentGains: number;
  };
  buyingOutcome: {
    totalCost: number;
    equityGained: number;
    netWorth: number;
  };
  recommendation: 'rent' | 'buy';
  probability: number;
}

export interface TimelineAnalysis {
  year: number;
  rentingCosts: {
    monthlyRent: number;
    annualCost: number;
    cumulativeCost: number;
    investmentValue: number;
  };
  buyingCosts: {
    monthlyPayment: number;
    annualCost: number;
    cumulativeCost: number;
    homeValue: number;
    equityBuilt: number;
    netWorth: number;
  };
  netDifference: number;
  recommendation: 'rent' | 'buy' | 'neutral';
}

export interface PersonalizedInsight {
  category: 'financial' | 'lifestyle' | 'market' | 'risk';
  insight: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number; // importance 1-10
  actionable: boolean;
  recommendation?: string;
}

export class RentVsBuyAnalyzer {
  calculateAnalysis(inputs: RentVsBuyInputs): RentVsBuyAnalysis {
    // Calculate cost breakdowns
    const rentingCosts = this.calculateRentingCosts(inputs);
    const buyingCosts = this.calculateBuyingCosts(inputs);
    
    // Calculate opportunity costs
    const opportunityCost = this.calculateOpportunityCost(inputs, rentingCosts, buyingCosts);
    
    // Assess flexibility
    const flexibilityScore = this.assessFlexibility(inputs);
    
    // Assess risks
    const riskAssessment = this.assessRisks(inputs);
    
    // Generate scenarios
    const scenarios = this.generateScenarios(inputs);
    
    // Create timeline analysis
    const timeline = this.createTimelineAnalysis(inputs);
    
    // Generate personalized insights
    const personalizedInsights = this.generatePersonalizedInsights(inputs, rentingCosts, buyingCosts);
    
    // Make recommendation
    const recommendation = this.makeRecommendation(inputs, rentingCosts, buyingCosts, riskAssessment, flexibilityScore);
    
    return {
      recommendation: recommendation.choice,
      confidence: recommendation.confidence,
      reasoning: recommendation.reasoning,
      totalCostComparison: {
        rentingCosts,
        buyingCosts,
        netDifference: buyingCosts.totalOverTimeHorizon - rentingCosts.totalOverTimeHorizon,
        breakEvenPoint: this.calculateBreakEvenPoint(inputs, rentingCosts, buyingCosts)
      },
      opportunityCost,
      flexibilityScore,
      riskAssessment,
      scenarios,
      timeline,
      personalizedInsights
    };
  }

  private calculateRentingCosts(inputs: RentVsBuyInputs): CostBreakdown {
    const monthlyPayment = inputs.monthlyRent;
    const upfrontCosts = inputs.rentalDeposit + inputs.rentalFees;
    
    // Calculate costs over time horizon with rent increases
    let totalCost = upfrontCosts;
    let currentRent = inputs.monthlyRent;
    
    for (let year = 1; year <= inputs.timeHorizon; year++) {
      totalCost += currentRent * 12;
      currentRent *= (1 + inputs.expectedRentIncrease / 100);
    }
    
    return {
      monthlyPayment,
      upfrontCosts,
      yearlyMaintenance: 0, // Renter doesn't pay maintenance
      taxes: 0, // No property taxes for renters
      insurance: 300, // Renter's insurance (annual)
      totalYearOne: monthlyPayment * 12 + upfrontCosts + 300,
      totalOverTimeHorizon: totalCost + (300 * inputs.timeHorizon)
    };
  }

  private calculateBuyingCosts(inputs: RentVsBuyInputs): CostBreakdown {
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
    const loanAmount = inputs.homePrice - downPayment;
    
    // Calculate monthly mortgage payment
    const monthlyRate = inputs.mortgageRate / 100 / 12;
    const numPayments = inputs.loanTermYears * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Annual costs
    const propertyTaxes = inputs.homePrice * (inputs.propertyTaxRate / 100);
    const homeInsurance = inputs.homeInsurance;
    const hoaAnnual = inputs.hoaFees * 12;
    const maintenance = inputs.homePrice * (inputs.maintenancePercent / 100);
    
    const upfrontCosts = downPayment + inputs.closingCosts;
    const yearlyMaintenance = maintenance;
    
    // Calculate total costs over time horizon
    let totalCost = upfrontCosts;
    let currentHomeValue = inputs.homePrice;
    let totalEquityBuilt = downPayment;
    
    for (let year = 1; year <= inputs.timeHorizon; year++) {
      // Annual payments
      totalCost += monthlyPayment * 12 + propertyTaxes + homeInsurance + hoaAnnual + maintenance;
      
      // Home appreciation
      currentHomeValue *= (1 + inputs.homeAppreciationRate / 100);
      
      // Equity building (simplified - principal payments increase over time)
      const principalPayment = monthlyPayment * 12 * (0.3 + (year / inputs.timeHorizon) * 0.4); // 30-70% principal
      totalEquityBuilt += principalPayment;
    }
    
    // Tax benefits (mortgage interest deduction)
    const averageInterestPayment = monthlyPayment * 12 * 0.8; // Assume 80% interest initially
    const taxBenefits = averageInterestPayment * (inputs.taxBracket / 100) * inputs.timeHorizon;
    
    return {
      monthlyPayment: Math.round(monthlyPayment),
      upfrontCosts: Math.round(upfrontCosts),
      yearlyMaintenance: Math.round(yearlyMaintenance),
      taxes: Math.round(propertyTaxes),
      insurance: Math.round(homeInsurance),
      totalYearOne: Math.round(monthlyPayment * 12 + propertyTaxes + homeInsurance + hoaAnnual + maintenance + upfrontCosts),
      totalOverTimeHorizon: Math.round(totalCost - taxBenefits),
      equityBuilt: Math.round(totalEquityBuilt + (currentHomeValue - inputs.homePrice)),
      taxBenefits: Math.round(taxBenefits)
    };
  }

  private calculateOpportunityCost(inputs: RentVsBuyInputs, rentingCosts: CostBreakdown, buyingCosts: CostBreakdown) {
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
    const investmentReturn = inputs.investmentReturn / 100;
    
    // What the down payment could earn if invested
    const downPaymentInvestment = downPayment * Math.pow(1 + investmentReturn, inputs.timeHorizon);
    
    // Additional monthly savings from renting (if any) invested
    const monthlySavings = Math.max(0, buyingCosts.monthlyPayment - rentingCosts.monthlyPayment);
    const monthlyInvestmentGain = this.calculateAnnuityFutureValue(
      monthlySavings, investmentReturn / 12, inputs.timeHorizon * 12
    );
    
    const rentingInvestmentGain = downPaymentInvestment + monthlyInvestmentGain;
    const buyingEquityGain = buyingCosts.equityBuilt || 0;
    
    return {
      downPaymentInvestment: Math.round(downPaymentInvestment),
      rentingInvestmentGain: Math.round(rentingInvestmentGain),
      buyingEquityGain: Math.round(buyingEquityGain),
      netOpportunityCost: Math.round(buyingEquityGain - rentingInvestmentGain)
    };
  }

  private calculateAnnuityFutureValue(payment: number, rate: number, periods: number): number {
    if (rate === 0) return payment * periods;
    return payment * ((Math.pow(1 + rate, periods) - 1) / rate);
  }

  private assessFlexibility(inputs: RentVsBuyInputs) {
    let rentingFlexibility = 8; // Base high flexibility for renting
    let buyingFlexibility = 3; // Base low flexibility for buying
    
    // Adjust based on time horizon
    if (inputs.timeHorizon < 3) {
      rentingFlexibility += 1;
      buyingFlexibility -= 1;
    } else if (inputs.timeHorizon > 7) {
      rentingFlexibility -= 1;
      buyingFlexibility += 2;
    }
    
    // Adjust based on financial situation
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100);
    const savingsRatio = inputs.currentSavings / downPayment;
    
    if (savingsRatio < 1.2) { // Less than 20% buffer
      buyingFlexibility -= 2;
    }
    
    return {
      rentingFlexibility: Math.max(1, Math.min(10, rentingFlexibility)),
      buyingFlexibility: Math.max(1, Math.min(10, buyingFlexibility)),
      mobilityImpact: inputs.timeHorizon < 5 
        ? 'High mobility advantage for renting'
        : 'Mobility considerations favor buying for longer stays',
      commitmentLevel: inputs.timeHorizon < 3
        ? 'Short-term: Renting provides flexibility'
        : inputs.timeHorizon < 7
        ? 'Medium-term: Both options viable'
        : 'Long-term: Buying builds wealth'
    };
  }

  private assessRisks(inputs: RentVsBuyInputs) {
    const rentingRisks: RiskFactor[] = [
      {
        factor: 'Rent Increases',
        impact: inputs.expectedRentIncrease > 5 ? 'high' : inputs.expectedRentIncrease > 3 ? 'medium' : 'low',
        description: `Annual rent increases of ${inputs.expectedRentIncrease}% compound over time`,
        mitigation: 'Consider longer-term leases or rent-controlled properties'
      },
      {
        factor: 'No Equity Building',
        impact: inputs.timeHorizon > 5 ? 'high' : 'medium',
        description: 'Rent payments don\'t build ownership or wealth',
        mitigation: 'Invest rent savings in diversified portfolio'
      },
      {
        factor: 'Displacement Risk',
        impact: 'medium',
        description: 'Landlord could sell, renovate, or not renew lease',
        mitigation: 'Maintain emergency fund and backup housing options'
      }
    ];

    const buyingRisks: RiskFactor[] = [
      {
        factor: 'Market Volatility',
        impact: 'high',
        description: 'Home values can decline, affecting equity and net worth',
        mitigation: 'Buy in stable neighborhoods with long-term growth potential'
      },
      {
        factor: 'Maintenance Costs',
        impact: inputs.maintenancePercent > 2 ? 'high' : 'medium',
        description: 'Unexpected repairs and maintenance can be expensive',
        mitigation: 'Budget 1-3% of home value annually for maintenance'
      },
      {
        factor: 'Liquidity Risk',
        impact: inputs.currentSavings < inputs.homePrice * 0.25 ? 'high' : 'medium',
        description: 'Home equity is illiquid and hard to access quickly',
        mitigation: 'Maintain emergency fund separate from down payment'
      },
      {
        factor: 'Interest Rate Risk',
        impact: inputs.mortgageRate > 6 ? 'high' : 'medium',
        description: 'Rising rates increase borrowing costs and reduce affordability',
        mitigation: 'Consider rate locks or adjustable-rate mortgages'
      }
    ];

    const marketRisks: MarketRiskFactor[] = [
      {
        factor: 'Housing Market Correction',
        probability: 0.3,
        impact: inputs.homePrice * 0.15, // 15% potential decline
        timeframe: 'medium',
        description: 'Potential 10-20% home price decline in economic downturn'
      },
      {
        factor: 'Interest Rate Spike',
        probability: 0.4,
        impact: (inputs.monthlyRent * 12) * 0.2, // 20% payment increase
        timeframe: 'short',
        description: 'Rapid rate increases could price out buyers'
      }
    ];

    return {
      rentingRisks,
      buyingRisks,
      marketRisks,
      overallRiskLevel: this.calculateOverallRisk(inputs, rentingRisks, buyingRisks) as 'low' | 'medium' | 'high'
    };
  }

  private calculateOverallRisk(inputs: RentVsBuyInputs, rentingRisks: RiskFactor[], buyingRisks: RiskFactor[]): string {
    const downPaymentRatio = (inputs.homePrice * inputs.downPaymentPercent / 100) / inputs.currentSavings;
    const debtToIncomeRatio = (inputs.homePrice * inputs.mortgageRate / 100 / 12) / inputs.monthlyIncome;
    
    if (downPaymentRatio > 0.8 || debtToIncomeRatio > 0.35 || inputs.mortgageRate > 7) {
      return 'high';
    } else if (downPaymentRatio > 0.6 || debtToIncomeRatio > 0.28 || inputs.timeHorizon < 3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private generateScenarios(inputs: RentVsBuyInputs): RentVsBuyScenario[] {
    return [
      {
        name: 'Optimistic Market',
        assumptions: [
          `Home appreciation: ${inputs.homeAppreciationRate + 2}%`,
          `Rent increases: ${inputs.expectedRentIncrease - 1}%`,
          'Stable economy, low interest rates'
        ],
        rentingOutcome: {
          totalCost: inputs.monthlyRent * 12 * inputs.timeHorizon * 1.1,
          flexibility: 9,
          investmentGains: inputs.currentSavings * Math.pow(1.08, inputs.timeHorizon)
        },
        buyingOutcome: {
          totalCost: this.calculateBuyingCosts(inputs).totalOverTimeHorizon * 0.9,
          equityGained: inputs.homePrice * Math.pow(1 + (inputs.homeAppreciationRate + 2) / 100, inputs.timeHorizon),
          netWorth: inputs.homePrice * 1.4
        },
        recommendation: 'buy',
        probability: 0.3
      },
      {
        name: 'Base Case',
        assumptions: [
          `Home appreciation: ${inputs.homeAppreciationRate}%`,
          `Rent increases: ${inputs.expectedRentIncrease}%`,
          'Normal market conditions'
        ],
        rentingOutcome: {
          totalCost: this.calculateRentingCosts(inputs).totalOverTimeHorizon,
          flexibility: 8,
          investmentGains: inputs.currentSavings * Math.pow(1 + inputs.investmentReturn / 100, inputs.timeHorizon)
        },
        buyingOutcome: {
          totalCost: this.calculateBuyingCosts(inputs).totalOverTimeHorizon,
          equityGained: this.calculateBuyingCosts(inputs).equityBuilt || 0,
          netWorth: inputs.homePrice * Math.pow(1 + inputs.homeAppreciationRate / 100, inputs.timeHorizon)
        },
        recommendation: this.makeRecommendation(
          inputs, 
          this.calculateRentingCosts(inputs), 
          this.calculateBuyingCosts(inputs),
          this.assessRisks(inputs),
          this.assessFlexibility(inputs)
        ).choice,
        probability: 0.5
      },
      {
        name: 'Market Downturn',
        assumptions: [
          `Home appreciation: ${inputs.homeAppreciationRate - 3}%`,
          `Rent increases: ${inputs.expectedRentIncrease + 2}%`,
          'Economic recession, higher unemployment'
        ],
        rentingOutcome: {
          totalCost: inputs.monthlyRent * 12 * inputs.timeHorizon * 1.2,
          flexibility: 10,
          investmentGains: inputs.currentSavings * Math.pow(1.04, inputs.timeHorizon) // Lower returns
        },
        buyingOutcome: {
          totalCost: this.calculateBuyingCosts(inputs).totalOverTimeHorizon * 1.1,
          equityGained: inputs.homePrice * Math.pow(1 + Math.max(-2, inputs.homeAppreciationRate - 3) / 100, inputs.timeHorizon),
          netWorth: inputs.homePrice * 0.85 // Potential decline
        },
        recommendation: 'rent',
        probability: 0.2
      }
    ];
  }

  private createTimelineAnalysis(inputs: RentVsBuyInputs): TimelineAnalysis[] {
    const timeline: TimelineAnalysis[] = [];
    const rentingCosts = this.calculateRentingCosts(inputs);
    const buyingCosts = this.calculateBuyingCosts(inputs);
    
    let cumulativeRentCost = rentingCosts.upfrontCosts;
    let cumulativeBuyCost = buyingCosts.upfrontCosts;
    let currentRent = inputs.monthlyRent;
    let currentHomeValue = inputs.homePrice;
    let equityBuilt = inputs.homePrice * (inputs.downPaymentPercent / 100);
    let investmentValue = inputs.currentSavings;
    
    for (let year = 1; year <= Math.min(inputs.timeHorizon, 10); year++) {
      // Renting costs
      cumulativeRentCost += currentRent * 12 + 300; // Add renter's insurance
      currentRent *= (1 + inputs.expectedRentIncrease / 100);
      investmentValue *= (1 + inputs.investmentReturn / 100);
      
      // Buying costs
      cumulativeBuyCost += buyingCosts.monthlyPayment * 12 + buyingCosts.taxes + 
                          buyingCosts.insurance + buyingCosts.yearlyMaintenance;
      currentHomeValue *= (1 + inputs.homeAppreciationRate / 100);
      equityBuilt += buyingCosts.monthlyPayment * 12 * (0.3 + (year / 10) * 0.4); // Principal payments
      
      const netWorth = currentHomeValue - (inputs.homePrice - equityBuilt);
      const netDifference = (cumulativeBuyCost - equityBuilt) - (cumulativeRentCost - investmentValue);
      
      timeline.push({
        year,
        rentingCosts: {
          monthlyRent: Math.round(currentRent),
          annualCost: Math.round(currentRent * 12 + 300),
          cumulativeCost: Math.round(cumulativeRentCost),
          investmentValue: Math.round(investmentValue)
        },
        buyingCosts: {
          monthlyPayment: buyingCosts.monthlyPayment,
          annualCost: Math.round(buyingCosts.monthlyPayment * 12 + buyingCosts.taxes + buyingCosts.insurance + buyingCosts.yearlyMaintenance),
          cumulativeCost: Math.round(cumulativeBuyCost),
          homeValue: Math.round(currentHomeValue),
          equityBuilt: Math.round(equityBuilt),
          netWorth: Math.round(netWorth)
        },
        netDifference: Math.round(netDifference),
        recommendation: netDifference < 0 ? 'rent' : year < 3 ? 'rent' : 'buy'
      });
    }
    
    return timeline;
  }

  private calculateBreakEvenPoint(inputs: RentVsBuyInputs, rentingCosts: CostBreakdown, buyingCosts: CostBreakdown): number {
    // Simplified break-even calculation
    const monthlyCostDifference = buyingCosts.monthlyPayment - rentingCosts.monthlyPayment;
    const upfrontDifference = buyingCosts.upfrontCosts - rentingCosts.upfrontCosts;
    
    if (monthlyCostDifference <= 0) return 0; // Buying is immediately cheaper monthly
    
    return Math.round((upfrontDifference / (monthlyCostDifference * 12)) * 10) / 10;
  }

  private generatePersonalizedInsights(inputs: RentVsBuyInputs, rentingCosts: CostBreakdown, buyingCosts: CostBreakdown): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];
    
    // Financial insights
    const downPaymentRatio = (inputs.homePrice * inputs.downPaymentPercent / 100) / inputs.currentSavings;
    if (downPaymentRatio > 0.8) {
      insights.push({
        category: 'financial',
        insight: 'Your down payment would use most of your savings, leaving little emergency fund',
        impact: 'negative',
        weight: 9,
        actionable: true,
        recommendation: 'Consider renting until you build a larger savings buffer'
      });
    }
    
    // Market timing insights
    if (inputs.mortgageRate > 6.5) {
      insights.push({
        category: 'market',
        insight: 'Current mortgage rates are historically high, increasing buying costs significantly',
        impact: 'negative',
        weight: 8,
        actionable: true,
        recommendation: 'Consider waiting for rates to decline or look at adjustable-rate mortgages'
      });
    }
    
    // Lifestyle insights
    if (inputs.timeHorizon < 3) {
      insights.push({
        category: 'lifestyle',
        insight: 'Short time horizon strongly favors renting due to transaction costs',
        impact: 'positive',
        weight: 9,
        actionable: false
      });
    }
    
    // Investment insights
    if (inputs.investmentReturn > inputs.homeAppreciationRate + 2) {
      insights.push({
        category: 'financial',
        insight: 'Your investment returns significantly exceed expected home appreciation',
        impact: 'positive',
        weight: 7,
        actionable: true,
        recommendation: 'Consider renting and investing the down payment for higher returns'
      });
    }
    
    // Risk insights
    const monthlyPaymentRatio = buyingCosts.monthlyPayment / inputs.monthlyIncome;
    if (monthlyPaymentRatio > 0.35) {
      insights.push({
        category: 'risk',
        insight: 'Monthly housing payment would exceed 35% of income, creating financial stress',
        impact: 'negative',
        weight: 10,
        actionable: true,
        recommendation: 'Consider a less expensive home or continue renting'
      });
    }
    
    return insights.sort((a, b) => b.weight - a.weight);
  }

  private makeRecommendation(
    inputs: RentVsBuyInputs, 
    rentingCosts: CostBreakdown, 
    buyingCosts: CostBreakdown,
    riskAssessment: any,
    flexibilityScore: any
  ): { choice: 'rent' | 'buy' | 'neutral'; confidence: number; reasoning: string[] } {
    const reasoning: string[] = [];
    let buyScore = 0;
    let rentScore = 0;
    
    // Financial analysis
    const totalCostDifference = buyingCosts.totalOverTimeHorizon - rentingCosts.totalOverTimeHorizon;
    if (totalCostDifference < 0) {
      buyScore += 3;
      reasoning.push('Buying has lower total cost over your time horizon');
    } else {
      rentScore += 2;
      reasoning.push('Renting has lower total cost over your time horizon');
    }
    
    // Time horizon
    if (inputs.timeHorizon < 3) {
      rentScore += 4;
      reasoning.push('Short time horizon strongly favors renting');
    } else if (inputs.timeHorizon > 7) {
      buyScore += 3;
      reasoning.push('Long time horizon supports building equity through ownership');
    }
    
    // Financial readiness
    const downPaymentRatio = (inputs.homePrice * inputs.downPaymentPercent / 100) / inputs.currentSavings;
    if (downPaymentRatio > 0.8) {
      rentScore += 3;
      reasoning.push('Insufficient savings buffer for safe home purchase');
    } else if (downPaymentRatio < 0.5) {
      buyScore += 2;
      reasoning.push('Strong financial position supports home purchase');
    }
    
    // Market conditions
    if (inputs.mortgageRate > 7) {
      rentScore += 2;
      reasoning.push('High mortgage rates make buying expensive');
    } else if (inputs.mortgageRate < 5) {
      buyScore += 2;
      reasoning.push('Favorable mortgage rates support buying');
    }
    
    // Risk tolerance
    if (inputs.riskTolerance === 'conservative') {
      if (riskAssessment.overallRiskLevel === 'high') {
        rentScore += 2;
        reasoning.push('Conservative approach suggests renting in current market');
      }
    } else if (inputs.riskTolerance === 'aggressive') {
      buyScore += 1;
      reasoning.push('Risk tolerance supports home ownership');
    }
    
    // Determine recommendation
    let choice: 'rent' | 'buy' | 'neutral';
    let confidence: number;
    
    if (Math.abs(buyScore - rentScore) <= 1) {
      choice = 'neutral';
      confidence = 0.6;
      reasoning.push('Both options are viable - consider personal preferences');
    } else if (buyScore > rentScore) {
      choice = 'buy';
      confidence = Math.min(0.9, 0.6 + (buyScore - rentScore) * 0.1);
    } else {
      choice = 'rent';
      confidence = Math.min(0.9, 0.6 + (rentScore - buyScore) * 0.1);
    }
    
    return { choice, confidence, reasoning };
  }

  // Utility methods for UI
  getAffordabilityAnalysis(inputs: RentVsBuyInputs): {
    rentAffordability: number;
    buyAffordability: number;
    recommendedBudget: number;
    budgetStrain: 'comfortable' | 'stretched' | 'strained';
  } {
    const rentRatio = inputs.monthlyRent / inputs.monthlyIncome;
    const buyRatio = this.calculateBuyingCosts(inputs).monthlyPayment / inputs.monthlyIncome;
    
    let budgetStrain: 'comfortable' | 'stretched' | 'strained';
    if (Math.max(rentRatio, buyRatio) < 0.28) budgetStrain = 'comfortable';
    else if (Math.max(rentRatio, buyRatio) < 0.35) budgetStrain = 'stretched';
    else budgetStrain = 'strained';
    
    return {
      rentAffordability: Math.round((1 - rentRatio) * 100),
      buyAffordability: Math.round((1 - buyRatio) * 100),
      recommendedBudget: Math.round(inputs.monthlyIncome * 0.3),
      budgetStrain
    };
  }

  getMarketTiming(inputs: RentVsBuyInputs): {
    buyerMarket: boolean;
    rentalMarket: 'tight' | 'balanced' | 'favorable';
    timingRecommendation: string;
    confidence: number;
  } {
    const isBuyerMarket = inputs.homeAppreciationRate < 3 && inputs.mortgageRate < 6;
    const rentalMarket = inputs.expectedRentIncrease > 5 ? 'tight' : 
                        inputs.expectedRentIncrease < 2 ? 'favorable' : 'balanced';
    
    let timingRecommendation: string;
    if (isBuyerMarket && rentalMarket === 'tight') {
      timingRecommendation = 'Good time to buy - buyer\'s market with rising rents';
    } else if (!isBuyerMarket && rentalMarket === 'favorable') {
      timingRecommendation = 'Good time to rent - seller\'s market with stable rents';
    } else {
      timingRecommendation = 'Mixed market signals - focus on personal factors';
    }
    
    return {
      buyerMarket: isBuyerMarket,
      rentalMarket,
      timingRecommendation,
      confidence: 0.75
    };
  }
}