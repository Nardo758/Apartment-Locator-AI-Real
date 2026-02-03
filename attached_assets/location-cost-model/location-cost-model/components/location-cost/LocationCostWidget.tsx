// ============================================
// LOCATION COST WIDGET
// Compact widget for Dashboard integration
// ============================================

import React, { useState } from 'react';
import { 
  MapPin, 
  Calculator,
  Sparkles,
  TrendingDown,
  DollarSign,
  ChevronRight,
  Briefcase,
  Zap
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface LocationCostWidgetProps {
  onViewFullAnalysis?: () => void;
  className?: string;
}

export const LocationCostWidget: React.FC<LocationCostWidgetProps> = ({
  onViewFullAnalysis,
  className = '',
}) => {
  const [workAddress, setWorkAddress] = useState('');
  const [hasCalculated, setHasCalculated] = useState(false);

  // Mock calculation result
  const mockResult = {
    cheapestRent: { name: 'ARIUM MetroWest', rent: 1275 },
    cheapestTrue: { name: 'Baldwin Harbor', trueCost: 1485 },
    potentialSavings: 250,
    avgLocationCost: 165,
  };

  const handleQuickCalculate = () => {
    if (workAddress.length > 3) {
      setHasCalculated(true);
    }
  };

  return (
    <Card className={`glass border-border/50 overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-secondary/20">
              <Calculator className="w-4 h-4 text-primary" />
            </div>
            True Cost Calculator
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
            <Sparkles className="w-3 h-3 mr-1" />
            New
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasCalculated ? (
          <>
            <p className="text-sm text-muted-foreground">
              See what apartments <span className="text-primary font-medium">actually cost</span> based on your commute
            </p>
            
            <div className="space-y-3">
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter work address..."
                  value={workAddress}
                  onChange={(e) => setWorkAddress(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary-dark"
                onClick={handleQuickCalculate}
                disabled={workAddress.length < 3}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Quick Calculate
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Factors in gas, parking, groceries & more</span>
            </div>
          </>
        ) : (
          <>
            {/* Quick Results */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Best True Value</span>
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="font-semibold text-emerald-500">{mockResult.cheapestTrue.name}</p>
                <p className="text-lg font-bold">${mockResult.cheapestTrue.trueCost}/mo</p>
              </div>
              
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                <DollarSign className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Potential Monthly Savings</p>
                  <p className="font-semibold text-amber-500">${mockResult.potentialSavings}</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Cheapest rent (${mockResult.cheapestRent.rent}) ≠ Cheapest to live</p>
                <Progress value={65} className="h-1.5 mt-1" />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onViewFullAnalysis}
            >
              View Full Analysis
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full text-xs"
              onClick={() => setHasCalculated(false)}
            >
              Change work address
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationCostWidget;
