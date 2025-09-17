import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle } from 'lucide-react';
import { SignupFormData } from '@/pages/Signup';

interface BudgetAndIncomeProps {
  data: SignupFormData;
  onUpdate: (data: Partial<SignupFormData>) => void;
}

const BudgetAndIncome = ({ data, onUpdate }: BudgetAndIncomeProps) => {
  const [plaidConnected, setPlaidConnected] = useState(data.incomeVerified);

  const handlePlaidConnect = () => {
    // In a real implementation, this would open Plaid Link
    console.log('Opening Plaid Link...');
    setPlaidConnected(true);
    onUpdate({ incomeVerified: true });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="grossIncome" className="text-sm font-medium text-foreground mb-2 block">
            Gross Monthly Income
          </Label>
          <Input
            id="grossIncome"
            type="number"
            value={data.grossIncome || ''}
            onChange={(e) => onUpdate({ grossIncome: Number(e.target.value) })}
            placeholder="8500"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <Label htmlFor="maxBudget" className="text-sm font-medium text-foreground mb-2 block">
            Maximum Monthly Budget
          </Label>
          <Input
            id="maxBudget"
            type="number"
            value={data.maxBudget || ''}
            onChange={(e) => onUpdate({ maxBudget: Number(e.target.value) })}
            placeholder="2800"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="creditScore" className="text-sm font-medium text-foreground mb-2 block">
          Credit Score Range
        </Label>
        <Select value={data.creditScore} onValueChange={(value) => onUpdate({ creditScore: value })}>
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="excellent">Excellent (750+)</SelectItem>
            <SelectItem value="good">Good (700-749)</SelectItem>
            <SelectItem value="fair">Fair (650-699)</SelectItem>
            <SelectItem value="poor">Poor (600-649)</SelectItem>
            <SelectItem value="bad">Bad (&lt;600)</SelectItem>
            <SelectItem value="no-credit">No Credit History</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plaid Income Verification */}
      <div className="glass rounded-lg p-6 bg-muted/5 border border-border/20">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            {plaidConnected ? (
              <CheckCircle size={24} className="text-secondary" />
            ) : (
              <Lock size={24} className="text-primary" />
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-center text-foreground mb-2">
          {plaidConnected ? 'Income Verified!' : 'Verify Income with Plaid'}
        </h3>
        
        <p className="text-sm text-center text-muted-foreground mb-6">
          {plaidConnected 
            ? 'Your income has been verified. This gives you a competitive edge with landlords!'
            : 'Securely connect your bank account to verify income and improve your negotiation success rate by 23%'
          }
        </p>

        {!plaidConnected && (
          <Button 
            onClick={handlePlaidConnect}
            className="w-full btn-primary"
          >
            Connect Bank Account
          </Button>
        )}

        {plaidConnected && (
          <div className="text-center">
            <span className="text-sm text-secondary font-medium">✓ Verified with Plaid</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetAndIncome;