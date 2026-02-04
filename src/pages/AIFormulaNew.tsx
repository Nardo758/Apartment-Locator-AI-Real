// ============================================
// AI FORMULA PAGE - NEW
// Explains the Smart Score formula
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, MapPin, CheckCircle2, TrendingUp, DollarSign,
  Navigation, Car, Gift, Calculator, Target, ArrowRight,
  Zap, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';

export default function AIFormulaNew() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-4" style={{ letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            Our AI Formula
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto" style={{ lineHeight: '1.6' }}>
            Discover how we calculate your <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Smart Score</span> - 
            combining location intelligence, your preferences, market data, and concessions into one powerful ranking.
          </p>
        </div>

        {/* Smart Score Overview */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center" style={{ letterSpacing: '-0.015em', lineHeight: '1.2' }}>
            Smart Score = 4 Components
          </h2>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <MapPin className="w-8 h-8 text-blue-600 mb-3" />
              <div className="text-5xl font-bold text-blue-600 mb-1" style={{ fontFamily: 'Inter' }}>85</div>
              <div className="text-base font-semibold text-gray-900">Location Score</div>
              <div className="text-sm text-gray-600 mt-1">Commute & True Cost</div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <CheckCircle2 className="w-8 h-8 text-purple-600 mb-3" />
              <div className="text-5xl font-bold text-purple-600 mb-1" style={{ fontFamily: 'Inter' }}>90</div>
              <div className="text-base font-semibold text-gray-900">Preference Match</div>
              <div className="text-sm text-gray-600 mt-1">Amenities & Budget</div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
              <TrendingUp className="w-8 h-8 text-indigo-600 mb-3" />
              <div className="text-5xl font-bold text-indigo-600 mb-1" style={{ fontFamily: 'Inter' }}>72</div>
              <div className="text-base font-semibold text-gray-900">Market Intel</div>
              <div className="text-sm text-gray-600 mt-1">Leverage & Timing</div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <DollarSign className="w-8 h-8 text-green-600 mb-3" />
              <div className="text-5xl font-bold text-green-600 mb-1" style={{ fontFamily: 'Inter' }}>95</div>
              <div className="text-base font-semibold text-gray-900">Value Score</div>
              <div className="text-sm text-gray-600 mt-1">Concessions & Deals</div>
            </div>
          </div>

          <div className="text-center p-6 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200">
            <div className="text-base text-gray-600 mb-2">Combined Smart Score</div>
            <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2" style={{ fontFamily: 'Inter' }}>
              92
            </div>
            <div className="text-base text-gray-600">out of 100</div>
          </div>
        </div>

        {/* Section 1: Location Score */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.01em' }}>1. Location Score</h3>
              <p className="text-lg text-gray-600" style={{ lineHeight: '1.5' }}>How well does this apartment fit your commute and lifestyle?</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="font-mono text-base text-blue-900 mb-3">
                <strong>Location Score =</strong> (Commute Quality × 40%) + (POI Proximity × 30%) + (True Cost Savings × 30%)
              </div>
              
              <div className="space-y-2 text-base text-gray-700">
                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Commute Quality:</strong> Distance and time to your work location. 
                    Shorter commutes = higher score.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>POI Proximity:</strong> Distance to gym, grocery, daycare, etc. 
                    Weighted by priority (high/medium/low).
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>True Cost Savings:</strong> How much you save vs the market average.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-lg font-semibold text-gray-900 mb-2">True Cost Calculation:</div>
              <div className="font-mono text-base space-y-1 text-gray-700">
                <div>Base Rent: <span className="text-gray-500">$2,000/mo</span></div>
                <div>− Concessions: <span className="text-green-600">−$77/mo</span> (2 weeks free)</div>
                <div className="border-t border-gray-300 pt-1">= Effective Rent: <span className="font-bold">$1,923/mo</span></div>
                <div className="mt-2">+ Commute Cost: <span className="text-orange-600">+$17/mo</span> (gas)</div>
                <div>+ Time Value: <span className="text-orange-600">+$144/mo</span> (346 min/mo)</div>
                <div className="border-t border-gray-300 pt-1 mt-1">
                  <strong>= TRUE COST: <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">$2,084/mo</span></strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Preference Match */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.01em' }}>2. Preference Match</h3>
              <p className="text-lg text-gray-600" style={{ lineHeight: '1.5' }}>Does this apartment have what you need?</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <div className="font-mono text-base text-purple-900 mb-3">
              <strong>Preference Score =</strong> (Budget Match × 30%) + (Amenity Match × 35%) + (Deal Breaker Avoid × 35%)
            </div>
            
            <div className="space-y-3 text-base">
              <div>
                <strong className="text-gray-900">Budget Match:</strong>
                <div className="font-mono text-base text-gray-700 mt-1 ml-4">
                  IF True Cost ≤ Budget: <span className="text-green-600">+30 points</span><br/>
                  IF True Cost &gt; Budget: <span className="text-red-600">0 points</span>
                </div>
              </div>

              <div>
                <strong className="text-gray-900">Amenity Match:</strong>
                <div className="font-mono text-base text-gray-700 mt-1 ml-4">
                  Score = (Matched Amenities ÷ Total Wanted) × 35<br/>
                  Example: 3 of 4 amenities = (3÷4) × 35 = <span className="text-green-600">26.25 points</span>
                </div>
              </div>

              <div>
                <strong className="text-gray-900">Deal Breaker Avoidance:</strong>
                <div className="font-mono text-base text-gray-700 mt-1 ml-4">
                  IF has any deal breaker: <span className="text-red-600">0 points (disqualified)</span><br/>
                  IF no deal breakers: <span className="text-green-600">+35 points</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Market Intelligence */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.01em' }}>3. Market Intelligence</h3>
              <p className="text-lg text-gray-600" style={{ lineHeight: '1.5' }}>When to move and how much to negotiate</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
            <div className="font-mono text-base text-indigo-900 mb-3">
              <strong>Market Score =</strong> Leverage Score (0-100)
            </div>
            
            <div className="space-y-3 text-base">
              <div>
                <strong className="text-gray-900">Leverage Factors:</strong>
                <div className="grid md:grid-cols-2 gap-2 mt-2 text-sm">
                  <div className="p-2 rounded bg-white border border-indigo-200">
                    <div className="text-base font-semibold">Days on Market</div>
                    <div className="font-mono text-base text-gray-700">
                      &gt;30 days = <span className="text-green-600">Strong leverage</span><br/>
                      15-30 days = <span className="text-yellow-600">Moderate</span><br/>
                      &lt;15 days = <span className="text-red-600">Weak</span>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-white border border-indigo-200">
                    <div className="text-base font-semibold">Inventory Level</div>
                    <div className="font-mono text-base text-gray-700">
                      &gt;2.5 mo supply = <span className="text-green-600">High inventory</span><br/>
                      1.5-2.5 mo = <span className="text-yellow-600">Balanced</span><br/>
                      &lt;1.5 mo = <span className="text-red-600">Low inventory</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-indigo-200">
                <strong className="text-gray-900">Negotiation Tip Generator:</strong>
                <div className="mt-2 text-base text-gray-700">
                  <div className="font-mono">
                    IF Days on Market &gt; 35 AND Inventory &gt; 2.5:<br/>
                    <span className="ml-4 text-indigo-600">💡 "Ask for $100-150/mo discount - landlord is motivated"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Value Score */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.01em' }}>4. Value Score (Concessions)</h3>
              <p className="text-lg text-gray-600" style={{ lineHeight: '1.5' }}>How much money are you actually saving?</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="font-mono text-base text-green-900 mb-3">
                <strong>Value Score =</strong> (Concession Value ÷ Base Rent) × 100
              </div>
              
              <div className="text-base text-gray-700">
                <strong>Example:</strong> 2 weeks free on $2,000/mo apartment
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-lg font-semibold text-gray-900 mb-3">Concession Math:</div>
              <div className="font-mono text-base space-y-1 text-gray-700">
                <div><strong>Step 1:</strong> Calculate annual value</div>
                <div className="ml-4">Annual rent = $2,000 × 12 = $24,000</div>
                <div className="ml-4">2 weeks = 14 days ÷ 365 days = 0.0384 of year</div>
                <div className="ml-4">Concession value = $24,000 × 0.0384 = <span className="text-green-600">$922</span></div>
                
                <div className="mt-3"><strong>Step 2:</strong> Spread over 12 months</div>
                <div className="ml-4">Monthly savings = $922 ÷ 12 = <span className="text-green-600 font-bold">$77/mo</span></div>
                
                <div className="mt-3"><strong>Step 3:</strong> Calculate value score</div>
                <div className="ml-4">Value Score = ($77 ÷ $2,000) × 100 = <span className="text-green-600 font-bold">3.85 points</span></div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-green-100 border border-green-300">
              <div className="text-base">
                <strong className="text-green-900">Other Concession Types:</strong>
                <div className="grid md:grid-cols-2 gap-2 mt-2 text-base text-gray-700">
                  <div>• <strong>1 month free:</strong> $2,000 ÷ 12 = $167/mo</div>
                  <div>• <strong>$500 off:</strong> $500 ÷ 12 = $42/mo</div>
                  <div>• <strong>50% off first month:</strong> ($1,000 × 1mo) ÷ 12 = $83/mo</div>
                  <div>• <strong>6 weeks free:</strong> Calculate same way = $231/mo</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Formula */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
          <h3 className="text-4xl font-bold mb-6 text-center" style={{ letterSpacing: '-0.01em' }}>Putting It All Together</h3>
          
          <div className="font-mono text-xl mb-6 p-6 rounded-lg bg-white/10 backdrop-blur">
            <div className="text-center">
              <strong>Smart Score =</strong> (Location × 0.25) + (Preferences × 0.25) + (Market × 0.25) + (Value × 0.25)
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-base">
            <div className="p-4 rounded-lg bg-white/10">
              <strong>Example Calculation:</strong>
              <div className="mt-2 space-y-1 font-mono">
                <div>Location: 85 × 0.25 = 21.25</div>
                <div>Preferences: 90 × 0.25 = 22.50</div>
                <div>Market: 72 × 0.25 = 18.00</div>
                <div>Value: 95 × 0.25 = 23.75</div>
                <div className="border-t border-white/30 pt-1 mt-2">
                  <strong>Smart Score = 85.5 / 100</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/10">
              <strong>What This Means:</strong>
              <div className="mt-2 space-y-1">
                <div>• Great location fit (short commute)</div>
                <div>• Matches your preferences</div>
                <div>• Good negotiation leverage</div>
                <div>• Excellent concession value</div>
                <div className="mt-2 pt-2 border-t border-white/30">
                  <strong className="text-yellow-300">→ This is a TOP PICK! ⭐</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/program-ai">
            <Button size="xl" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-10">
              <Brain className="w-5 h-5 mr-2" />
              Program Your AI Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-lg text-gray-600 mt-4">
            Set your preferences and let our AI find your perfect apartment
          </p>
        </div>
      </div>
    </div>
  );
}
