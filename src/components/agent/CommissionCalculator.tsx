import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authFetchJson } from '@/lib/authHelpers';
import { 
  DollarSign, 
  TrendingUp,
  Calculator,
  Download,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface CommissionResult {
  monthlyRent: number;
  commission: number;
  agentFee: number;
  brokerageFee: number;
  netCommission: number;
}

interface CommissionApiResult {
  summary: {
    grossCommission: number;
    netToAgent: number;
  };
  splits: Array<{
    agentName: string;
    percentage: number;
    role: string;
    amount: number;
  }>;
  calculation: {
    propertyValue: number;
    commissionRate: number;
  };
}

export function CommissionCalculator() {
  const [monthlyRent, setMonthlyRent] = useState('');
  const [commissionRate, setCommissionRate] = useState('15');
  const [brokerageSplit, setBrokerageSplit] = useState('50');
  const [result, setResult] = useState<CommissionResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const calculateLocalCommission = (rent: number, rate: number, split: number) => {
    const commission = rent * (rate / 100);
    const brokerageFee = commission * (split / 100);
    const agentFee = commission - brokerageFee;
    return {
      monthlyRent: rent,
      commission,
      agentFee,
      brokerageFee,
      netCommission: agentFee,
    };
  };

  const calculateCommission = async () => {
    const rent = parseFloat(monthlyRent);
    const rate = parseFloat(commissionRate);
    const split = parseFloat(brokerageSplit);

    if (isNaN(rent) || isNaN(rate) || isNaN(split)) {
      return;
    }
    setApiError(null);

    const agentPercentage = Math.max(0, 100 - split);

    const payload = {
      transactionType: 'rental',
      propertyValue: rent,
      rentalMonths: 1,
      commissionRate: rate,
      commissionType: 'percentage',
      splits: [
        { agentName: 'Agent', percentage: agentPercentage, role: 'listing_agent' },
        { agentName: 'Brokerage', percentage: split, role: 'brokerage' },
      ],
    };

    const response = await authFetchJson<CommissionApiResult>('/api/agent/commission/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.success) {
      setApiError(response.error);
      setResult(calculateLocalCommission(rent, rate, split));
      return;
    }

    const brokerageSplitResult = response.data.splits.find(splitItem => splitItem.role === 'brokerage');
    const agentSplitResult = response.data.splits.find(splitItem => splitItem.role !== 'brokerage');

    setResult({
      monthlyRent: rent,
      commission: response.data.summary.grossCommission,
      agentFee: agentSplitResult?.amount ?? response.data.summary.netToAgent,
      brokerageFee: brokerageSplitResult?.amount ?? 0,
      netCommission: agentSplitResult?.amount ?? response.data.summary.netToAgent,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const exportResults = () => {
    if (!result) return;
    
    const data = `
Commission Calculation Report
=============================
Monthly Rent: ${formatCurrency(result.monthlyRent)}
Commission Rate: ${commissionRate}%
Total Commission: ${formatCurrency(result.commission)}

Brokerage Split: ${brokerageSplit}%
Brokerage Fee: ${formatCurrency(result.brokerageFee)}
Agent Commission: ${formatCurrency(result.agentFee)}

Net Commission: ${formatCurrency(result.netCommission)}
    `;
    
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-calculation-${Date.now()}.txt`;
    a.click();
  };

  const presets = [
    { label: '10%', value: '10' },
    { label: '12%', value: '12' },
    { label: '15%', value: '15' },
    { label: '20%', value: '20' }
  ];

  return (
    <Card variant="elevated" className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calculator className="w-6 h-6 text-purple-400" />
              Commission Calculator
            </CardTitle>
            <CardDescription>Calculate your earnings from lease agreements</CardDescription>
          </div>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            Earnings
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Monthly Rent */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Monthly Rent
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                placeholder="2,500"
              />
            </div>
          </div>

          {/* Commission Rate */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              placeholder="15"
              min="0"
              max="100"
              step="0.5"
            />
            
            {/* Quick Presets */}
            <div className="flex gap-2 mt-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setCommissionRate(preset.value)}
                  className={`text-xs px-2 py-1 rounded ${
                    commissionRate === preset.value
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brokerage Split */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Brokerage Split (%)
            </label>
            <input
              type="number"
              value={brokerageSplit}
              onChange={(e) => setBrokerageSplit(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              placeholder="50"
              min="0"
              max="100"
              step="5"
            />
            <p className="text-xs text-white/50 mt-1">
              Brokerage takes {brokerageSplit}%, you get {100 - parseFloat(brokerageSplit || '0')}%
            </p>
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculateCommission}
          disabled={!monthlyRent || !commissionRate}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Commission
        </Button>

        {apiError && (
          <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
            <AlertCircle className="w-4 h-4" />
            <span>Using local estimate: {apiError}</span>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Commission */}
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Total Commission</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(result.commission)}
                    </p>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                  <AlertCircle className="w-3 h-3" />
                  {commissionRate}% of {formatCurrency(result.monthlyRent)}
                </div>
              </div>

              {/* Brokerage Fee */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Brokerage Fee</p>
                    <p className="text-2xl font-bold text-red-400">
                      -{formatCurrency(result.brokerageFee)}
                    </p>
                  </div>
                  <div className="bg-red-500/20 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-red-400 rotate-180" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-white/50">
                  {brokerageSplit}% split to brokerage
                </div>
              </div>

              {/* Your Commission */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Your Commission</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(result.agentFee)}
                    </p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-white/50">
                  {100 - parseFloat(brokerageSplit)}% of total commission
                </div>
              </div>

              {/* Net Earnings */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Net Earnings</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {formatCurrency(result.netCommission)}
                    </p>
                  </div>
                  <div className="bg-yellow-500/20 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-white/50">
                  After brokerage split
                </div>
              </div>
            </div>

            {/* Annual Projection */}
            <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Annual Projection
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '5 deals/year', value: result.netCommission * 5 },
                  { label: '10 deals/year', value: result.netCommission * 10 },
                  { label: '20 deals/year', value: result.netCommission * 20 },
                  { label: '50 deals/year', value: result.netCommission * 50 }
                ].map((projection, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-sm text-white/60 mb-1">{projection.label}</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(projection.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <Button
              onClick={exportResults}
              variant="outline"
              className="w-full border-white/20 hover:bg-white/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Calculation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
