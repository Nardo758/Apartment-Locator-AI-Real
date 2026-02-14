// ============================================
// LOCATION INTELLIGENCE PAGE
// Main page combining all Location Cost components
// Route: /location-intelligence
// ============================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Sparkles,
  Calculator,
  TrendingDown,
  Lightbulb,
  RefreshCw,
  Settings,
  ChevronRight,
  Clock,
  Loader2
} from 'lucide-react';
import { useLocationCostContext } from '@/contexts/LocationCostContext';
import LifestyleInputsForm from '@/components/location-cost/LifestyleInputsForm';
import TrueCostCard from '@/components/location-cost/TrueCostCard';
import CostComparisonTable from '@/components/location-cost/CostComparisonTable';
import { calculateApartmentCosts, createComparison } from '@/services/locationCostService';
import type { ApartmentLocationCost, ApartmentComparison } from '@/types/locationCost.types';

// Mock apartments - replace with Supabase data in production
const MOCK_APARTMENTS = [
  { id: 'apt-1', name: 'The Broadstone at Midtown', address: '1015 Northside Dr NW, Atlanta, GA 30318', coordinates: { lat: 33.7866, lng: -84.4073 }, baseRent: 1850, parkingIncluded: false },
  { id: 'apt-2', name: 'Camden Buckhead Square', address: '3060 Peachtree Rd NW, Atlanta, GA 30305', coordinates: { lat: 33.8404, lng: -84.3797 }, baseRent: 1650, parkingIncluded: true },
  { id: 'apt-3', name: 'The Exchange at Vinings', address: '2800 Paces Ferry Rd SE, Atlanta, GA 30339', coordinates: { lat: 33.8627, lng: -84.4655 }, baseRent: 1450, parkingIncluded: true },
  { id: 'apt-4', name: 'Cortland at the Battery', address: '875 Battery Ave SE, Atlanta, GA 30339', coordinates: { lat: 33.8896, lng: -84.4685 }, baseRent: 1350, parkingIncluded: true },
  { id: 'apt-5', name: 'AMLI West Plano at Granite Park', address: '2175 E West Connector, Austell, GA 30106', coordinates: { lat: 33.8148, lng: -84.6327 }, baseRent: 1275, parkingIncluded: true },
];

export default function LocationIntelligence() {
  const navigate = useNavigate();
  const { inputs, hasInputs, gasPrice, isCalculating, setIsCalculating } = useLocationCostContext();
  
  const [showInputs, setShowInputs] = useState(!hasInputs);
  const [results, setResults] = useState<ApartmentLocationCost[]>([]);
  const [comparison, setComparison] = useState<ApartmentComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const apartmentNames = useMemo(() => {
    const map: Record<string, string> = {};
    MOCK_APARTMENTS.forEach(apt => { map[apt.id] = apt.name; });
    return map;
  }, []);
  
  const handleCalculate = async () => {
    if (!hasInputs) return;
    setIsCalculating(true);
    setError(null);
    
    try {
      const calculatedResults = await calculateApartmentCosts(
        inputs,
        MOCK_APARTMENTS,
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        { stateAverage: gasPrice, lastUpdated: new Date(), source: 'manual' }
      );
      setResults(calculatedResults);
      setComparison(createComparison(calculatedResults));
      setShowInputs(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setIsCalculating(false);
    }
  };
  
  const bestApartment = useMemo(() => results.find(r => r.savingsRank === 1), [results]);
  const potentialSavings = useMemo(() => {
    if (results.length < 2) return 0;
    return Math.max(...results.map(r => r.trueMonthlyCost)) - Math.min(...results.map(r => r.trueMonthlyCost));
  }, [results]);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Location Intelligence</h1>
              <p className="text-sm text-slate-400">True Monthly Cost Calculator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasInputs && (
              <button onClick={() => setShowInputs(!showInputs)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Edit Inputs</span>
              </button>
            )}
            {results.length > 0 && (
              <button onClick={handleCalculate} disabled={isCalculating} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
                {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>Recalculate</span>
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Inputs Panel */}
        {showInputs && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Your Lifestyle</h2>
            </div>
            <div className="max-w-2xl">
              <LifestyleInputsForm onComplete={handleCalculate} />
            </div>
          </div>
        )}
        
        {error && <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}
        
        {/* Results */}
        {results.length > 0 && !showInputs && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {bestApartment && (
                <div className="glass rounded-xl p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">Best Value</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{apartmentNames[bestApartment.apartmentId]}</h3>
                  <p className="text-3xl font-bold gradient-text">${bestApartment.trueMonthlyCost.toLocaleString()}/mo</p>
                </div>
              )}
              
              <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-slate-400">Potential Savings</span>
                </div>
                <p className="text-3xl font-bold text-emerald-400">${potentialSavings.toLocaleString()}/mo</p>
                <p className="text-sm text-slate-400 mt-2">${(potentialSavings * 12).toLocaleString()}/year</p>
              </div>
              
              {bestApartment && (
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-medium text-slate-400">Commute Time</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{bestApartment.commuteCost.durationMinutes} min</p>
                  <p className="text-sm text-slate-400 mt-2">{bestApartment.commuteCost.distanceMiles} mi each way</p>
                </div>
              )}
            </div>
            
            {/* Insight */}
            {bestApartment && (
              <div className="glass rounded-xl p-6 mb-8 border border-blue-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Lightbulb className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">AI Insight</h3>
                    <p className="text-slate-300">
                      <strong className="text-white">{apartmentNames[bestApartment.apartmentId]}</strong> offers the best true cost at 
                      <strong className="text-emerald-400"> ${bestApartment.trueMonthlyCost.toLocaleString()}/mo</strong>.
                      {potentialSavings > 200 && <> Save <strong className="text-emerald-400">${(potentialSavings * 12).toLocaleString()}/year</strong> vs the most expensive option.</>}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Table */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">All Apartments Compared</h2>
              <CostComparisonTable data={results} apartmentNames={apartmentNames} onSelectApartment={(id) => navigate(`/property/${id}`)} />
            </div>
            
            {/* Cards */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Detailed Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.sort((a, b) => a.trueMonthlyCost - b.trueMonthlyCost).map((result, index) => (
                  <TrueCostCard key={result.apartmentId} data={result} apartmentName={apartmentNames[result.apartmentId]} rank={index + 1} isBestValue={index === 0} />
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Empty State */}
        {!hasInputs && !showInputs && (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6">
              <MapPin className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Discover Your True Monthly Cost</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Rent is just the beginning. Tell us about your lifestyle and we'll calculate the real cost including commute, parking, groceries, and more.
            </p>
            <button onClick={() => setShowInputs(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all">
              <Calculator className="w-5 h-5" />
              Get Started
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
