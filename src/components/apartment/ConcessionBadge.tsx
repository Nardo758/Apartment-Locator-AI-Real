// ============================================
// CONCESSION BADGE
// Shows rental concessions (2 weeks free, etc.)
// ============================================

import { Gift, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Concession } from '@/types/unifiedAI.types';

interface ConcessionBadgeProps {
  concession: Concession;
  savings?: number; // monthly savings
  variant?: 'default' | 'compact';
}

export default function ConcessionBadge({ concession, savings, variant = 'default' }: ConcessionBadgeProps) {
  const formatSavings = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (variant === 'compact') {
    return (
      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
        <Gift className="w-3 h-3 mr-1" />
        {concession.description}
      </Badge>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
      <Gift className="w-5 h-5 text-green-600" />
      <div>
        <p className="text-sm font-semibold text-green-900">{concession.description}</p>
        {savings && savings > 0 && (
          <p className="text-xs text-green-700 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Save {formatSavings(savings)}/mo
          </p>
        )}
      </div>
    </div>
  );
}

// Multiple concessions display
interface ConcessionListProps {
  concessions: Concession[];
  totalSavings?: number;
}

export function ConcessionList({ concessions, totalSavings }: ConcessionListProps) {
  const formatSavings = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (concessions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Gift className="w-4 h-4 text-green-600" />
        <span className="text-sm font-semibold text-gray-900">Special Offers:</span>
      </div>
      <div className="space-y-1.5">
        {concessions.map((concession, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200"
          >
            <span className="text-xs text-green-700">{concession.description}</span>
          </div>
        ))}
      </div>
      {totalSavings && totalSavings > 0 && (
        <div className="flex items-center gap-1 text-sm text-green-700 font-semibold">
          <TrendingDown className="w-4 h-4" />
          <span>Total: {formatSavings(totalSavings)}/mo savings</span>
        </div>
      )}
    </div>
  );
}
