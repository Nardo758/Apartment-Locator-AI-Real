export interface RenterLeaseIntelData {
  propertyId: string;
  rolloverRiskScore: number;
  expiringNext30Days: number;
  expiringNext90Days: number;
  avgCurrentLease: number;
  marketRate: number;
  renewalRate: number;
  totalUnits?: number;
}

export type NegotiationPowerLevel = 'high' | 'medium' | 'low';
export type IncentiveProbability = 'high' | 'medium' | 'low';
export type RentTrendDirection = 'up' | 'down' | 'stable';
export type MoveTimingAdvice = 'move_now' | 'wait' | 'standard';
export type UrgencyLevel = 'high' | 'medium' | 'low';

export interface NegotiationPower {
  level: NegotiationPowerLevel;
  message: string;
}

export interface IncentiveInfo {
  probability: IncentiveProbability;
  percentChance: number;
  expectedIncentives: string[];
}

export interface RentTrend {
  direction: RentTrendDirection;
  reason: string;
}

export interface MoveTiming {
  advice: MoveTimingAdvice;
  message: string;
}

export interface UrgencyInfo {
  level: UrgencyLevel;
  message: string;
  show: boolean;
}

export function getNegotiationPower(data: RenterLeaseIntelData): NegotiationPower {
  if (data.rolloverRiskScore > 40) {
    return {
      level: 'high',
      message: `${data.expiringNext30Days} units available soon - landlord motivated to negotiate`,
    };
  }
  if (data.rolloverRiskScore > 20) {
    return {
      level: 'medium',
      message: 'Multiple units turning over - some flexibility expected',
    };
  }
  return {
    level: 'low',
    message: 'Low turnover - limited negotiation leverage',
  };
}

export function getBestMoveInWindow(data: RenterLeaseIntelData): MoveTiming {
  if (data.expiringNext30Days > 5) {
    return {
      advice: 'move_now',
      message: 'Multiple units available, landlord eager to fill',
    };
  }
  if (data.expiringNext90Days > 10) {
    return {
      advice: 'wait',
      message: 'Big wave of availability coming, prices may drop',
    };
  }
  return {
    advice: 'standard',
    message: 'Normal availability - standard timing',
  };
}

export function getBelowMarketGap(data: RenterLeaseIntelData): number {
  if (!data.avgCurrentLease || !data.marketRate) return 0;
  return Math.max(0, data.marketRate - data.avgCurrentLease);
}

export function getIncentiveProbability(data: RenterLeaseIntelData): IncentiveInfo {
  if (data.rolloverRiskScore > 40) {
    return {
      probability: 'high',
      percentChance: 85,
      expectedIncentives: [
        '1-2 months free rent',
        'Waived application/admin fees',
        'Reduced security deposit',
        'Free parking for 6 months',
      ],
    };
  }
  if (data.rolloverRiskScore > 20) {
    return {
      probability: 'medium',
      percentChance: 55,
      expectedIncentives: [
        '1 month free rent',
        'Waived admin fees',
        '50% off first month',
      ],
    };
  }
  return {
    probability: 'low',
    percentChance: 15,
    expectedIncentives: ['Standard lease terms'],
  };
}

export function getUrgencyIndicator(data: RenterLeaseIntelData): UrgencyInfo {
  if (data.expiringNext30Days < 3 && data.expiringNext90Days < 5) {
    return {
      level: 'high',
      message: 'Limited units available. Competition is high.',
      show: true,
    };
  }
  if (data.expiringNext30Days < 5) {
    return {
      level: 'medium',
      message: 'Moderate availability - don\'t wait too long.',
      show: true,
    };
  }
  return {
    level: 'low',
    message: '',
    show: false,
  };
}

export function predictRentTrend(data: RenterLeaseIntelData): RentTrend {
  const totalUnits = data.totalUnits || 1;

  if (data.renewalRate < 60 && (data.expiringNext90Days / totalUnits) > 0.3) {
    return {
      direction: 'down',
      reason: 'High turnover suggests landlord may lower prices to attract tenants',
    };
  }

  if (data.renewalRate > 80) {
    return {
      direction: 'up',
      reason: 'High retention - residents are happy, prices may increase',
    };
  }

  return {
    direction: 'stable',
    reason: 'Normal market conditions',
  };
}

export function calculateDealScore(data: RenterLeaseIntelData): number {
  let score = 50;

  if (data.rolloverRiskScore > 40) score += 25;
  else if (data.rolloverRiskScore > 20) score += 15;

  const gap = getBelowMarketGap(data);
  if (gap > 0) {
    score += Math.min(gap / 50, 20);
  }

  if (data.renewalRate < 60) score += 10;

  return Math.min(Math.round(score), 100);
}
