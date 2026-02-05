export interface RetentionUnit {
  id: string;
  address: string;
  unit: string;
  beds: number;
  baths: number;
  sqft: number;
  rent: number;
  marketRent: number;
  status: 'occupied' | 'vacant';
  risk: number;
  leaseExpiry: number;
  daysVacant: number;
  lat: number;
  lng: number;
  tenant: string | null;
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  score: number;
  detail: string;
  impact?: 'low' | 'medium' | 'high';
}

export interface NearbyComparable {
  id: string;
  name: string;
  rent: number;
  beds: number;
  concession: string | null;
  lat: number;
  lng: number;
}

export interface RetentionAlert {
  id: string;
  type: 'renewal' | 'vacancy' | 'market' | 'win';
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  propertyId?: string;
}

export interface PortfolioHealth {
  retentionRate: number;
  marketRetentionRate: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  atRiskUnits: number;
  vacancyCostThisMonth: number;
  avgTurnoverCost: number;
  renewalsDue90Days: number;
}

export interface RetentionMetrics {
  portfolioRetention: number;
  marketRetention: number;
  unitsAtRisk: number;
  totalUnits: number;
  vacancyCostPerMonth: number;
  vacantUnits: number;
  renewalsDue: number;
  aiInsight: string;
}

export type RiskLevel = 'healthy' | 'at_risk' | 'critical' | 'vacant';

export function getRiskLevel(unit: RetentionUnit): RiskLevel {
  if (unit.status === 'vacant') return 'vacant';
  if (unit.risk >= 70) return 'critical';
  if (unit.risk >= 40) return 'at_risk';
  return 'healthy';
}

export function getRiskColors(risk: number, status: 'occupied' | 'vacant') {
  if (status === 'vacant') {
    return { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Vacant' };
  }
  if (risk >= 70) {
    return { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', dot: 'bg-red-500', label: 'Critical' };
  }
  if (risk >= 40) {
    return { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', dot: 'bg-amber-500', label: 'At Risk' };
  }
  return { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', dot: 'bg-green-500', label: 'Healthy' };
}

export function formatCurrency(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return `$${n.toLocaleString()}`;
}

export function getSeverityStyles(severity: RetentionAlert['severity']) {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-50', border: 'border-red-300', iconType: 'alert-triangle' as const, color: 'text-red-700' };
    case 'warning':
      return { bg: 'bg-amber-50', border: 'border-amber-300', iconType: 'dollar-sign' as const, color: 'text-amber-700' };
    case 'info':
      return { bg: 'bg-blue-50', border: 'border-blue-300', iconType: 'bar-chart' as const, color: 'text-blue-700' };
    case 'success':
      return { bg: 'bg-green-50', border: 'border-green-300', iconType: 'check-circle' as const, color: 'text-green-700' };
  }
}
