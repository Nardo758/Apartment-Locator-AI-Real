import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SavingsDataGateProps {
  /** Whether the user can see the real data */
  isUnlocked: boolean;
  /** The real content to show when unlocked */
  children: React.ReactNode;
  /** Called when user clicks unlock — opens paywall */
  onUnlockClick: () => void;
  /** Optional property ID for per-property unlock labeling */
  propertyId?: string;
  /** Hint text shown on the locked overlay (no real dollar amounts!) */
  hint?: string;
  /** Compact mode for inline usage in tables/cards */
  compact?: boolean;
}

/**
 * SavingsDataGate
 *
 * Wraps savings data (deal scores, potential savings, negotiation tips, timing advice)
 * with a blur overlay for free users. When locked, shows a teaser with an unlock CTA.
 *
 * Two unlock paths:
 * - Per-property unlock ($1.99)
 * - Time-based plans (Basic/Pro/Premium)
 */
export function SavingsDataGate({
  isUnlocked,
  children,
  onUnlockClick,
  hint = 'Savings data available',
  compact = false,
}: SavingsDataGateProps) {
  if (isUnlocked) {
    return <>{children}</>;
  }

  if (compact) {
    return (
      <div className="relative inline-flex items-center gap-1.5">
        <div className="blur-sm select-none pointer-events-none" aria-hidden="true">
          {children}
        </div>
        <button
          onClick={onUnlockClick}
          className="absolute inset-0 flex items-center justify-center"
          title="Unlock savings data"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 text-white text-xs font-medium px-2 py-0.5">
            <Lock className="w-3 h-3" />
            Unlock
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Blurred content */}
      <div className="blur-md select-none pointer-events-none" aria-hidden="true">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {hint}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs">
          Unlock deal scores, potential savings, negotiation tips and timing advice
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onUnlockClick}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Unlock for $1.99
          </Button>
          <Button
            onClick={onUnlockClick}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            View Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
