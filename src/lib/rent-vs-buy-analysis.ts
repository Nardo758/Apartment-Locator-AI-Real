export interface RenterProfile {
  income: number;
  creditScore: number;
  currentRent: number;
  savings: number;
  monthlyDebt: number;
  employmentStability: 'stable' | 'moderate' | 'uncertain';
  timeHorizon: number; // years
  locationFlexibility: 'high' | 'medium' | 'low';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

export interface PropertyScenario {
  propertyValue: number;
  currentRent: number;
  location: string;
  propertyTax: number;
  hoaFees: number;
  maintenanceCosts: number;
  appreciationRate: number;
  rentGrowthRate: number;
  downPaymentOptions: number[];
}

export interface MarketConditions {
  mortgageRate: number;
  inflationRate: number;
  localMarketTrend: 'hot' | 'normal' | 'cooling' | 'cold';
  inventoryLevels: number;
  priceToRentRatio: number;
  economicOutlook: 'positive' | 'stable' | 'uncertain' | 'negative';
  seasonality: number; // -1 to 1, seasonal adjustment
}

export interface FinancialProjection {
  year: number;
  rentScenario: {
    monthlyRent: number;
    totalPaid: number;
    cumulativeCost: number;
    opportunityCost: number; // if savings were invested
  };
  buyScenario: {
    monthlyPayment: number;
    principalPaid: number;
    interestPaid: number;
    totalPaid: number;
    homeValue: number;
    equity: number;
    netWorth: number;
  };
  difference: {
    monthlyDifference: number;
    cumulativeDifference: number;
    netWorthDifference: number;
  };
}

export interface RentVsBuyResult {
  recommendation: 'rent' | 'buy' | 'neutral';
  confidence: number;
  breakEvenPoint: number; // years
  projections: FinancialProjection[];
  summary: {
    totalCostRent: number;
    totalCostBuy: number;
    finalEquity: number;
    netWorthAdvantage: number;
    monthlyDifference: number;
  };
  riskAnalysis: {
    rentRisks: string[];
    buyRisks: string[];
    overallRiskLevel: 'low' | 'medium' | 'high';
  };
  personalizedInsights: string[];
  actionItems: string[];
}

export interface AffordabilityAssessment {
  canAfford: boolean;
  maxAffordablePrice: number;
  requiredIncome: number;
  debtToIncomeRatio: number;
  recommendedDownPayment: number;
  monthlyPaymentRange: { min: number; max: number };
  emergencyFundNeeded: number;
  qualificationProbability: number;
}

export interface TaxImplications {
  mortgageInterestDeduction: number;
  propertyTaxDeduction: number;
  saltLimitation: number;
  capitalGainsExemption: number;
  totalTaxSavings: number;
  effectiveAfterTaxCost: number;
}

export class RentVsBuyAnalyzer {
  private static instance: RentVsBuyAnalyzer;

  static getInstance(): RentVsBuyAnalyzer {
    if (!RentVsBuyAnalyzer.instance) {
      RentVsBuyAnalyzer.instance = new RentVsBuyAnalyzer();
    }
    return RentVsBuyAnalyzer.instance;
  }

  // Comprehensive Analysis Engine
  analyzeRentVsBuy(
    renterProfile: RenterProfile,
    propertyScenario: PropertyScenario,
    marketConditions: MarketConditions
  ): RentVsBuyResult {
    
    // Step 1: Affordability Assessment
    const affordability = this.assessAffordability(renterProfile, propertyScenario, marketConditions);
    
    // Step 2: Generate Financial Projections
    const projections = this.generateProjections(
      renterProfile, 
      propertyScenario, 
      marketConditions,
      affordability.recommendedDownPayment
    );
    
    // Step 3: Risk Analysis
    const riskAnalysis = this.analyzeRisks(renterProfile, propertyScenario, marketConditions);
    
    // Step 4: Calculate Break-Even Point
    const breakEvenPoint = this.calculateBreakEvenPoint(projections);
    
    // Step 5: Generate Recommendation
    const recommendation = this.generateRecommendation(
      projections, 
      riskAnalysis, 
      renterProfile, 
      affordability
    );
    
    // Step 6: Create Summary
    const summary = this.createSummary(projections);
    
    // Step 7: Generate Personalized Insights
    const personalizedInsights = this.generatePersonalizedInsights(
      renterProfile, 
      propertyScenario, 
      recommendation,
      affordability
    );
    
    // Step 8: Create Action Items
    const actionItems = this.generateActionItems(
      recommendation, 
      renterProfile, 
      affordability
    );

    return {
      recommendation: recommendation.decision,
      confidence: recommendation.confidence,
      breakEvenPoint,
      projections,
      summary,
      riskAnalysis,
      personalizedInsights,
      actionItems
    };
  }

  // Affordability Assessment
  assessAffordability(
    profile: RenterProfile,
    scenario: PropertyScenario,
    market: MarketConditions
  ): AffordabilityAssessment {
    
    const monthlyIncome = profile.income / 12;
    const maxMonthlyPayment = monthlyIncome * 0.28; // 28% DTI rule
    const maxTotalDebt = monthlyIncome * 0.36; // 36% total DTI
    const availableForHousing = maxTotalDebt - profile.monthlyDebt;
    
    // Calculate maximum affordable price
    const effectiveRate = market.mortgageRate / 12;
    const termMonths = 30 * 12;
    
    // Include property tax, insurance, HOA in payment calculation
    const monthlyPropertyTax = scenario.propertyTax / 12;
    const monthlyInsurance = scenario.propertyValue * 0.005 / 12; // 0.5% annually
    const monthlyHOA = scenario.hoaFees;
    const totalNonPrincipalInterest = monthlyPropertyTax + monthlyInsurance + monthlyHOA;
    
    const availableForPI = Math.min(maxMonthlyPayment, availableForHousing) - totalNonPrincipalInterest;
    
    // Calculate max loan amount
    const maxLoanAmount = availableForPI * (1 - Math.pow(1 + effectiveRate, -termMonths)) / effectiveRate;
    
    // Determine recommended down payment based on credit score and savings
    let recommendedDownPaymentPercent = 0.20; // Default 20%
    if (profile.creditScore < 650) recommendedDownPaymentPercent = 0.25;
    else if (profile.creditScore < 700) recommendedDownPaymentPercent = 0.20;
    else if (profile.creditScore > 750) recommendedDownPaymentPercent = 0.15;
    
    const maxAffordablePrice = maxLoanAmount / (1 - recommendedDownPaymentPercent);
    const recommendedDownPayment = maxAffordablePrice * recommendedDownPaymentPercent;
    
    // Check if current property is affordable
    const requiredDownPayment = scenario.propertyValue * recommendedDownPaymentPercent;
    const requiredLoan = scenario.propertyValue - requiredDownPayment;
    const monthlyPI = requiredLoan * effectiveRate / (1 - Math.pow(1 + effectiveRate, -termMonths));
    const totalMonthlyPayment = monthlyPI + totalNonPrincipalInterest;
    
    const canAfford = (
      requiredDownPayment <= profile.savings * 0.8 && // Keep 20% of savings for emergencies
      totalMonthlyPayment <= availableForHousing &&
      profile.creditScore >= 620
    );
    
    const debtToIncomeRatio = (profile.monthlyDebt + totalMonthlyPayment) / monthlyIncome;
    const requiredIncome = totalMonthlyPayment * 12 / 0.28;
    const emergencyFundNeeded = totalMonthlyPayment * 6;
    
    // Calculate qualification probability
    let qualificationProbability = 0.5; // Base
    if (profile.creditScore > 740) qualificationProbability += 0.3;
    else if (profile.creditScore < 620) qualificationProbability -= 0.4;
    
    if (debtToIncomeRatio < 0.3) qualificationProbability += 0.2;
    else if (debtToIncomeRatio > 0.4) qualificationProbability -= 0.3;
    
    if (profile.employmentStability === 'stable') qualificationProbability += 0.1;
    else if (profile.employmentStability === 'uncertain') qualificationProbability -= 0.2;
    
    qualificationProbability = Math.max(0, Math.min(1, qualificationProbability));

    return {
      canAfford,
      maxAffordablePrice,
      requiredIncome,
      debtToIncomeRatio,
      recommendedDownPayment: requiredDownPayment,
      monthlyPaymentRange: {
        min: totalMonthlyPayment * 0.9,
        max: totalMonthlyPayment * 1.1
      },
      emergencyFundNeeded,
      qualificationProbability
    };
  }

  // Financial Projections Generator
  generateProjections(
    profile: RenterProfile,
    scenario: PropertyScenario,
    market: MarketConditions,
    downPayment: number
  ): FinancialProjection[] {
    
    const projections: FinancialProjection[] = [];
    const loanAmount = scenario.propertyValue - downPayment;
    const monthlyRate = market.mortgageRate / 12;
    const termMonths = 30 * 12;
    
    // Calculate monthly mortgage payment (P&I only)
    const monthlyPI = loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths));
    
    // Additional monthly costs
    const monthlyPropertyTax = scenario.propertyTax / 12;
    const monthlyInsurance = scenario.propertyValue * 0.005 / 12;
    const monthlyMaintenance = scenario.maintenanceCosts / 12;
    const monthlyHOA = scenario.hoaFees;
    
    const totalMonthlyBuyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + 
                                   monthlyMaintenance + monthlyHOA;
    
    // Starting values
    let currentRent = scenario.currentRent;
    let homeValue = scenario.propertyValue;
    let remainingBalance = loanAmount;
    let totalRentPaid = 0;
    let totalBuyPaid = downPayment; // Include down payment in initial cost
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    
    // Investment opportunity cost calculation
    const investmentReturn = 0.07; // 7% average stock market return
    let investmentValue = downPayment; // If renter invested down payment instead
    
    for (let year = 1; year <= profile.timeHorizon; year++) {
      // Rent scenario calculations
      const yearlyRent = currentRent * 12;
      totalRentPaid += yearlyRent;
      
      // Investment growth (opportunity cost of down payment)
      investmentValue *= (1 + investmentReturn);
      const additionalInvestment = (totalMonthlyBuyPayment - currentRent) * 12;
      if (additionalInvestment > 0) {
        // If buying costs more, renter could invest the difference
        investmentValue += additionalInvestment * (1 + investmentReturn / 2); // Mid-year investment
      }
      
      // Buy scenario calculations
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      
      // Calculate principal and interest for each month of the year
      for (let month = 1; month <= 12; month++) {
        const monthlyInterest = remainingBalance * monthlyRate;
        const monthlyPrincipal = monthlyPI - monthlyInterest;
        
        yearlyInterest += monthlyInterest;
        yearlyPrincipal += monthlyPrincipal;
        remainingBalance -= monthlyPrincipal;
      }
      
      totalPrincipalPaid += yearlyPrincipal;
      totalInterestPaid += yearlyInterest;
      totalBuyPaid += totalMonthlyBuyPayment * 12;
      
      // Home appreciation
      homeValue *= (1 + scenario.appreciationRate);
      
      // Calculate equity (home value - remaining mortgage)
      const equity = homeValue - remainingBalance;
      
      // Net worth calculation for buy scenario
      const netWorth = equity - (downPayment); // Equity minus initial investment
      
      projections.push({
        year,
        rentScenario: {
          monthlyRent: currentRent,
          totalPaid: yearlyRent,
          cumulativeCost: totalRentPaid,
          opportunityCost: investmentValue
        },
        buyScenario: {
          monthlyPayment: totalMonthlyBuyPayment,
          principalPaid: yearlyPrincipal,
          interestPaid: yearlyInterest,
          totalPaid: totalMonthlyBuyPayment * 12,
          homeValue,
          equity,
          netWorth
        },
        difference: {
          monthlyDifference: totalMonthlyBuyPayment - currentRent,
          cumulativeDifference: totalBuyPaid - totalRentPaid,
          netWorthDifference: netWorth - (investmentValue - downPayment)
        }
      });
      
      // Update rent for next year
      currentRent *= (1 + scenario.rentGrowthRate);
    }
    
    return projections;
  }

  // Risk Analysis Engine
  analyzeRisks(
    profile: RenterProfile,
    scenario: PropertyScenario,
    market: MarketConditions
  ) {
    const rentRisks: string[] = [];
    const buyRisks: string[] = [];
    
    // Rent risks
    if (scenario.rentGrowthRate > 0.05) {
      rentRisks.push('High rent growth rate (>5% annually) increases long-term costs');
    }
    if (profile.locationFlexibility === 'low') {
      rentRisks.push('Limited location flexibility may reduce rental options');
    }
    if (market.inventoryLevels < 0.05) {
      rentRisks.push('Low rental inventory may lead to limited choices and higher prices');
    }
    rentRisks.push('No equity building - rent payments provide no ownership benefit');
    rentRisks.push('Potential for sudden rent increases or lease non-renewal');
    
    // Buy risks
    if (market.localMarketTrend === 'cooling' || market.localMarketTrend === 'cold') {
      buyRisks.push('Cooling market may lead to slower appreciation or price declines');
    }
    if (scenario.appreciationRate < 0.02) {
      buyRisks.push('Low appreciation rate may not keep pace with inflation');
    }
    if (profile.employmentStability === 'uncertain') {
      buyRisks.push('Employment uncertainty increases foreclosure risk');
    }
    if (market.mortgageRate > 0.07) {
      buyRisks.push('High mortgage rates increase monthly payments and total cost');
    }
    if (profile.savings < scenario.propertyValue * 0.25) {
      buyRisks.push('Limited savings may not provide adequate emergency fund after purchase');
    }
    buyRisks.push('Maintenance and repair costs can be unpredictable and expensive');
    buyRisks.push('Reduced mobility - selling costs and time may limit relocation flexibility');
    
    // Determine overall risk level
    let riskScore = 0;
    
    // Market risk factors
    if (market.localMarketTrend === 'cold') riskScore += 2;
    else if (market.localMarketTrend === 'cooling') riskScore += 1;
    
    if (market.mortgageRate > 0.08) riskScore += 2;
    else if (market.mortgageRate > 0.07) riskScore += 1;
    
    // Personal risk factors
    if (profile.employmentStability === 'uncertain') riskScore += 2;
    else if (profile.employmentStability === 'moderate') riskScore += 1;
    
    if (profile.creditScore < 650) riskScore += 2;
    else if (profile.creditScore < 700) riskScore += 1;
    
    // Financial risk factors
    const debtToIncome = profile.monthlyDebt / (profile.income / 12);
    if (debtToIncome > 0.4) riskScore += 2;
    else if (debtToIncome > 0.3) riskScore += 1;
    
    const overallRiskLevel: 'high' | 'medium' | 'low' = riskScore >= 5 ? 'high' : riskScore >= 3 ? 'medium' : 'low';
    
    return {
      rentRisks,
      buyRisks,
      overallRiskLevel
    };
  }

  // Break-Even Point Calculator
  calculateBreakEvenPoint(projections: FinancialProjection[]): number {
    for (let i = 0; i < projections.length; i++) {
      if (projections[i].difference.netWorthDifference > 0) {
        return projections[i].year;
      }
    }
    return projections.length; // Break-even beyond time horizon
  }

  // Recommendation Engine
  generateRecommendation(
    projections: FinancialProjection[],
    riskAnalysis: unknown,
    profile: RenterProfile,
    affordability: AffordabilityAssessment
  ) {
    let score = 0;
    let confidence = 0.7; // Base confidence
    
    // Affordability check
    if (!affordability.canAfford) {
      return { decision: 'rent' as const, confidence: 0.9 };
    }
    
    // Financial advantage analysis
    const finalProjection = projections[projections.length - 1];
    const netWorthAdvantage = finalProjection.difference.netWorthDifference;
    
    if (netWorthAdvantage > 100000) {
      score += 3;
      confidence += 0.1;
    } else if (netWorthAdvantage > 50000) {
      score += 2;
    } else if (netWorthAdvantage > 0) {
      score += 1;
    } else if (netWorthAdvantage < -50000) {
      score -= 2;
    } else {
      score -= 1;
    }
    
    // Time horizon considerations
    if (profile.timeHorizon >= 10) {
      score += 2;
      confidence += 0.1;
    } else if (profile.timeHorizon >= 7) {
      score += 1;
    } else if (profile.timeHorizon <= 3) {
      score -= 2;
      confidence -= 0.1;
    }
    
    // Risk considerations (narrow unknown to usable shape)
    const riskObj = (riskAnalysis && typeof riskAnalysis === 'object') ? (riskAnalysis as Record<string, unknown>) : null;
    const overallRiskLevel = riskObj && typeof riskObj.overallRiskLevel === 'string' ? (riskObj.overallRiskLevel as 'high' | 'medium' | 'low') : null;
    if (overallRiskLevel === 'high') {
      score -= 2;
      confidence -= 0.15;
    } else if (overallRiskLevel === 'low') {
      score += 1;
      confidence += 0.1;
    }
    
    // Personal factors
    if (profile.locationFlexibility === 'high' && profile.timeHorizon < 5) {
      score -= 1; // Renting may be better for flexibility
    }
    
    if (profile.riskTolerance === 'conservative') {
      score -= 1;
      confidence -= 0.05;
    } else if (profile.riskTolerance === 'aggressive') {
      score += 1;
      confidence += 0.05;
    }
    
    // Employment stability
    if (profile.employmentStability === 'stable') {
      score += 1;
      confidence += 0.05;
    } else if (profile.employmentStability === 'uncertain') {
      score -= 2;
      confidence -= 0.1;
    }
    
    confidence = Math.max(0.3, Math.min(0.95, confidence));
    
    // Make decision
    if (score >= 3) {
      return { decision: 'buy' as const, confidence };
    } else if (score <= -2) {
      return { decision: 'rent' as const, confidence };
    } else {
      return { decision: 'neutral' as const, confidence: Math.min(confidence, 0.7) };
    }
  }

  // Summary Creator
  createSummary(projections: FinancialProjection[]) {
    const finalProjection = projections[projections.length - 1];
    
    return {
      totalCostRent: finalProjection.rentScenario.cumulativeCost,
      totalCostBuy: finalProjection.buyScenario.totalPaid,
      finalEquity: finalProjection.buyScenario.equity,
      netWorthAdvantage: finalProjection.difference.netWorthDifference,
      monthlyDifference: finalProjection.difference.monthlyDifference
    };
  }

  // Personalized Insights Generator
  generatePersonalizedInsights(
    profile: RenterProfile,
    scenario: PropertyScenario,
    recommendation: unknown,
    affordability: AffordabilityAssessment
  ): string[] {
    const insights: string[] = [];
    
    // Income-based insights
    if (profile.income < 50000) {
      insights.push('Consider building emergency savings before purchasing to ensure financial stability');
    } else if (profile.income > 100000) {
      insights.push('Your income level provides good flexibility for homeownership and investment opportunities');
    }
    
    // Credit score insights
    if (profile.creditScore < 650) {
      insights.push('Improving your credit score by 50+ points could save thousands in mortgage interest');
    } else if (profile.creditScore > 750) {
      insights.push('Excellent credit score qualifies you for the best mortgage rates available');
    }
    
    // Time horizon insights
    if (profile.timeHorizon < 5) {
      insights.push('Short time horizon favors renting due to transaction costs and market volatility');
    } else if (profile.timeHorizon > 10) {
      insights.push('Long time horizon allows you to benefit from home appreciation and mortgage paydown');
    }
    
    // Affordability insights
    if (affordability.qualificationProbability < 0.7) {
      insights.push('Consider working on debt reduction and credit improvement before applying for a mortgage');
    }
    
    if (affordability.debtToIncomeRatio > 0.4) {
      insights.push('High debt-to-income ratio may limit mortgage options and increase interest rates');
    }
    
    // Market-specific insights
    if (scenario.appreciationRate > 0.05) {
      insights.push('Strong local appreciation trends support the investment potential of homeownership');
    }
    
    // Risk tolerance insights
    if (profile.riskTolerance === 'conservative') {
      insights.push('Consider the stability benefits of homeownership, including fixed monthly payments');
    } else if (profile.riskTolerance === 'aggressive') {
      insights.push('Real estate can provide diversification to an investment portfolio');
    }
    
    return insights;
  }

  // Action Items Generator
  generateActionItems(
    recommendation: unknown,
    profile: RenterProfile,
    affordability: AffordabilityAssessment
  ): string[] {
    const actions: string[] = [];
    // Guard recommendation shape
    const rec = (recommendation && typeof recommendation === 'object') ? (recommendation as Record<string, unknown>) : null;

    if (rec && rec.decision === 'buy') {
      actions.push('Get pre-approved for a mortgage to understand exact budget and terms');
      actions.push('Start house hunting within your approved price range');
      actions.push('Research neighborhoods and compare property values');
      actions.push('Consider hiring a buyer\'s agent for professional guidance');
      
      if (affordability.qualificationProbability < 0.8) {
        actions.push('Work on improving credit score and reducing debt before purchasing');
      }
    } else if (rec && rec.decision === 'rent') {
      actions.push('Continue building savings and improving credit for future homeownership');
      actions.push('Consider investing the down payment funds in diversified portfolio');
      actions.push('Monitor local real estate market for future opportunities');
      actions.push('Negotiate rent increases and consider longer lease terms for stability');
    } else {
      actions.push('Continue monitoring both rental and purchase markets');
      actions.push('Reassess financial situation in 6-12 months');
      actions.push('Consider speaking with a financial advisor for personalized guidance');
      actions.push('Evaluate job stability and location preferences');
    }
    
    // Universal actions
    actions.push('Maintain emergency fund of 3-6 months expenses');
    actions.push('Review and optimize overall financial plan annually');
    
    return actions;
  }

  // Tax Implications Calculator
  calculateTaxImplications(
    scenario: PropertyScenario,
    profile: RenterProfile,
    market: MarketConditions
  ): TaxImplications {
    const loanAmount = scenario.propertyValue * 0.8; // Assume 20% down
    const annualInterest = loanAmount * market.mortgageRate;
    const marginalTaxRate = this.estimateMarginalTaxRate(profile.income);
    
    // Mortgage interest deduction (limited to $750K loan)
    const deductibleLoanAmount = Math.min(loanAmount, 750000);
    const mortgageInterestDeduction = deductibleLoanAmount * market.mortgageRate * marginalTaxRate;
    
    // Property tax deduction (SALT cap of $10K)
    const propertyTaxDeduction = Math.min(scenario.propertyTax, 10000) * marginalTaxRate;
    
    // SALT limitation impact
    const saltLimitation = Math.max(0, (scenario.propertyTax - 10000) * marginalTaxRate);
    
    // Capital gains exemption (up to $500K for married, $250K for single)
    const capitalGainsExemption = profile.income > 80000 ? 500000 : 250000; // Assume married if higher income
    
    const totalTaxSavings = mortgageInterestDeduction + propertyTaxDeduction;
    const effectiveAfterTaxCost = (annualInterest + scenario.propertyTax) - totalTaxSavings;
    
    return {
      mortgageInterestDeduction,
      propertyTaxDeduction,
      saltLimitation,
      capitalGainsExemption,
      totalTaxSavings,
      effectiveAfterTaxCost
    };
  }

  private estimateMarginalTaxRate(income: number): number {
    // Simplified federal + state tax rate estimation
    if (income < 40000) return 0.22; // 12% federal + ~10% state
    if (income < 85000) return 0.32; // 22% federal + ~10% state
    if (income < 165000) return 0.34; // 24% federal + ~10% state
    if (income < 210000) return 0.42; // 32% federal + ~10% state
    return 0.47; // 35% federal + ~12% state
  }

  // Market Comparison Tool
  compareMarkets(
    primaryScenario: PropertyScenario,
    alternativeScenarios: PropertyScenario[],
    profile: RenterProfile,
    baseMarketConditions: MarketConditions
  ) {
    const comparisons = alternativeScenarios.map(scenario => {
      const result = this.analyzeRentVsBuy(profile, scenario, baseMarketConditions);
      return {
        location: scenario.location,
        recommendation: result.recommendation,
        netWorthAdvantage: result.summary.netWorthAdvantage,
        monthlyDifference: result.summary.monthlyDifference,
        confidence: result.confidence
      };
    });
    
    return comparisons.sort((a, b) => b.netWorthAdvantage - a.netWorthAdvantage);
  }
}

// Utility functions for common calculations
export const RentVsBuyUtils = {
  calculateMonthlyPayment: (principal: number, rate: number, termYears: number): number => {
    const monthlyRate = rate / 12;
    const numPayments = termYears * 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  },
  
  calculateAffordablePrice: (monthlyIncome: number, dtiRatio: number, downPaymentPercent: number, 
                           rate: number, termYears: number, otherCosts: number): number => {
    const maxPayment = (monthlyIncome * dtiRatio) - otherCosts;
    const monthlyRate = rate / 12;
    const numPayments = termYears * 12;
    const maxLoan = maxPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / 
                   (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
    return maxLoan / (1 - downPaymentPercent);
  },
  
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },
  
  formatPercentage: (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  }
};