import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, MapPin, Home, Calendar, TrendingUp, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { PaywallModal } from './PaywallModal';
import { useNavigate } from 'react-router-dom';

interface SavingsResult {
  potentialSavings: number;
  negotiableProperties: number;
  avgVacancyDays: number;
  successRate: number;
  bestDeal: {
    property: string;
    savings: number;
  };
}

export function FreeSavingsCalculator() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'results' | 'email'>('input');
  const [formData, setFormData] = useState({
    zipCodes: '',
    budget: '',
    bedrooms: '1',
    moveInDate: '',
    currentLeaseExpires: '',
    email: '',
    name: ''
  });
  const [results, setResults] = useState<SavingsResult | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const calculateSavings = () => {
    // Simulated calculation - in production, this would call your AI API
    const budget = parseInt(formData.budget) || 2000;
    const avgSavings = Math.floor(budget * 0.12); // 12% average savings
    const monthlySavings = Math.floor(avgSavings * 0.7 + Math.random() * avgSavings * 0.6);
    
    const savingsResult: SavingsResult = {
      potentialSavings: monthlySavings * 12, // Annual savings
      negotiableProperties: Math.floor(Math.random() * 15) + 8, // 8-22 properties
      avgVacancyDays: Math.floor(Math.random() * 40) + 45, // 45-85 days
      successRate: Math.floor(Math.random() * 20) + 75, // 75-95%
      bestDeal: {
        property: 'Mueller District',
        savings: Math.floor(monthlySavings * 1.4)
      }
    };

    setResults(savingsResult);
    setStep('results');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateSavings();
  };

  if (step === 'results' && results) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Card variant="highlighted" className="overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-b border-purple-500/30 pb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] mb-4 mx-auto shadow-lg shadow-purple-500/50">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold text-white mb-2">
              Your AI Analysis Results
            </CardTitle>
            <CardDescription className="text-lg text-white/80">
              Based on current market conditions in your area
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {/* Main Savings Display */}
            <div className="text-center mb-8 p-8 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border border-emerald-500/30">
              <div className="text-sm uppercase tracking-wide text-emerald-400 font-semibold mb-2">
                Total Potential Savings
              </div>
              <div className="text-6xl font-bold gradient-text mb-2">
                ${results.potentialSavings.toLocaleString()}
              </div>
              <div className="text-white/70">per year</div>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">
                  That's ${Math.floor(results.potentialSavings / 12)}/month in your pocket
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card variant="glass" className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {results.negotiableProperties}
                </div>
                <div className="text-sm text-white/70">Properties Found</div>
                <div className="text-xs text-white/50 mt-1">Ready to negotiate</div>
              </Card>

              <Card variant="glass" className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {results.avgVacancyDays} days
                </div>
                <div className="text-sm text-white/70">Avg. Vacant</div>
                <div className="text-xs text-white/50 mt-1">High leverage for you</div>
              </Card>

              <Card variant="glass" className="p-6 text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  {results.successRate}%
                </div>
                <div className="text-sm text-white/70">Success Rate</div>
                <div className="text-xs text-white/50 mt-1">Based on similar searches</div>
              </Card>
            </div>

            {/* Best Deal Highlight */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="primary" size="sm" className="mb-3">
                    Best Opportunity
                  </Badge>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {results.bestDeal.property}
                  </h3>
                  <p className="text-white/70 mb-4">
                    Estimated savings: <span className="text-emerald-400 font-bold">${results.bestDeal.savings}/month</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-3 h-3" />
                      High Success Rate
                    </Badge>
                    <Badge variant="warning" size="sm">
                      {results.avgVacancyDays}+ days vacant
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-emerald-400">
                    ${results.bestDeal.savings}
                  </div>
                  <div className="text-sm text-white/60">per month</div>
                </div>
              </div>
            </div>

            {/* Paywall CTA */}
            <div className="text-center border-t border-white/10 pt-8">
              <h3 className="text-2xl font-bold text-white mb-3">
                Want to see which apartments and get negotiation scripts?
              </h3>
              <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                Unlock full property details, AI-generated negotiation scripts, market intel, 
                and email templates. One-time payment, lifetime access to your results.
              </p>

              {step !== 'email' ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                  <Button 
                    size="xl" 
                    className="w-full sm:w-auto"
                    onClick={() => setStep('email')}
                  >
                    Unlock Full Results - $49
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto"
                    onClick={() => navigate('/pricing')}
                  >
                    See Pricing Plans
                  </Button>
                </div>
              ) : (
                <div className="max-w-md mx-auto mb-6">
                  <p className="text-white/80 mb-4 text-sm">Enter your email to continue to payment:</p>
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Your name (optional)"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={() => setShowPaywall(true)}
                      disabled={!formData.email}
                    >
                      Continue to Payment
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>One-time payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Instant access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>No subscription</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back button */}
        <div className="text-center mt-6">
          <button
            onClick={() => setStep('input')}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            ← Try different search criteria
          </button>
        </div>

        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          potentialSavings={results?.potentialSavings || 0}
          propertiesCount={results?.negotiableProperties || 0}
          guestEmail={formData.email}
          guestName={formData.name}
          searchCriteria={{
            zipCodes: formData.zipCodes,
            budget: formData.budget,
            bedrooms: formData.bedrooms,
            moveInDate: formData.moveInDate,
            currentLeaseExpires: formData.currentLeaseExpires,
          }}
          onPaymentSuccess={() => {
            setShowPaywall(false);
            navigate('/dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <Card variant="highlighted" className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] mb-4 mx-auto shadow-lg shadow-purple-500/25">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold text-white">
          See How Much You Can Save
        </CardTitle>
        <CardDescription className="text-lg text-white/70">
          Free analysis. No credit card required.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Zip Codes */}
          <div>
            <label className="label mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Where are you looking?
            </label>
            <Input
              type="text"
              placeholder="Austin, TX or 78701, 78702"
              value={formData.zipCodes}
              onChange={(e) => setFormData({ ...formData, zipCodes: e.target.value })}
              required
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
            <p className="text-xs text-white/50 mt-1">Enter city or zip codes</p>
          </div>

          {/* Budget */}
          <div>
            <label className="label mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              What's your budget?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
              <Input
                type="number"
                placeholder="2000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
                className="pl-8 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <p className="text-xs text-white/50 mt-1">Monthly rent budget</p>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="label mb-2 flex items-center gap-2">
              <Home className="w-4 h-4" />
              How many bedrooms?
            </label>
            <select
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/20 text-white"
            >
              <option value="studio">Studio</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4+">4+ Bedrooms</option>
            </select>
          </div>

          {/* Move-in Date */}
          <div>
            <label className="label mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              When do you want to move in?
            </label>
            <Input
              type="date"
              value={formData.moveInDate}
              onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
              className="bg-white/5 border-white/20 text-white"
            />
            <p className="text-xs text-white/50 mt-1">Approximate date (optional)</p>
          </div>

          {/* Current Lease Expiration */}
          <div>
            <label className="label mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              When does your current lease expire?
            </label>
            <Input
              type="date"
              value={formData.currentLeaseExpires}
              onChange={(e) => setFormData({ ...formData, currentLeaseExpires: e.target.value })}
              className="bg-white/5 border-white/20 text-white"
            />
            <p className="text-xs text-white/50 mt-1">Helps us forecast demand & time your search (optional)</p>
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full">
            <Zap className="w-5 h-5 mr-2" />
            Calculate My Savings
          </Button>

          <p className="text-xs text-center text-white/50">
            100% free. See your results instantly.
          </p>
        </form>
      </CardContent>
      
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        potentialSavings={results?.potentialSavings || 0}
        propertiesCount={results?.negotiableProperties || 0}
        guestEmail={formData.email}
        guestName={formData.name}
        searchCriteria={{
          zipCodes: formData.zipCodes,
          budget: formData.budget,
          bedrooms: formData.bedrooms,
          moveInDate: formData.moveInDate,
        }}
        onPaymentSuccess={() => {
          setShowPaywall(false);
          navigate('/dashboard');
        }}
      />
    </Card>
  );
}
