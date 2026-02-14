import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SavingsDataGateProps {
  isUnlocked: boolean;
  children: React.ReactNode;
  onUnlockClick: () => void;
  propertyId?: string;
  hint?: string;
  compact?: boolean;
}

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

  return (
    <div className="relative" data-testid="savings-data-gate">
      <div className="filter blur-[8px] select-none pointer-events-none" aria-hidden="true">
        {children}
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/60 backdrop-blur-sm">
        <div className={`flex flex-col items-center gap-2 px-4 text-center ${compact ? '' : 'gap-3'}`}>
          {!compact && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <p className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`} data-testid="text-locked-message">
            Unlock to see potential savings
          </p>
          {hint && !compact && (
            <span className="inline-flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3 mr-1" />
              {hint}
            </span>
          )}
          <Button
            size={compact ? 'sm' : 'default'}
            onClick={onUnlockClick}
            data-testid="button-unlock-savings"
          >
            {compact ? 'Unlock' : 'Unlock Savings Data'}
          </Button>
        </div>
      </div>
    </div>
  );
}
