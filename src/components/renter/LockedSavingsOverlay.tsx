import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LockedSavingsOverlayProps {
  onUnlockSingle: () => void;
  onGetPlan: () => void;
  savingsHint?: string;
}

export const LockedSavingsOverlay: React.FC<LockedSavingsOverlayProps> = ({
  onUnlockSingle,
  onGetPlan,
  savingsHint,
}) => {
  return (
    <div
      data-testid="locked-savings-overlay"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/60 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <p data-testid="text-locked-message" className="text-sm font-medium">
          Unlock to see potential savings
        </p>
        {savingsHint && (
          <Badge variant="secondary" data-testid="badge-savings-hint">
            <Sparkles className="w-3 h-3 mr-1" />
            {savingsHint}
          </Badge>
        )}
        <div className="flex flex-col gap-2 w-full max-w-[220px]">
          <Button
            size="sm"
            onClick={onUnlockSingle}
            data-testid="button-unlock-single"
          >
            Unlock This Property - $1.99
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onGetPlan}
            data-testid="button-get-plan"
          >
            Get Full Access
          </Button>
        </div>
      </div>
    </div>
  );
};
