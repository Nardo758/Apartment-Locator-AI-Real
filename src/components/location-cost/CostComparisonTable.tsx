// ============================================
// COST COMPARISON TABLE
// Side-by-side comparison of all apartments
// ============================================

import { useState, useMemo, Fragment } from 'react';
import { 
  ArrowUpDown, 
  TrendingDown, 
  TrendingUp,
  Medal,
  Car,
  ParkingCircle,
  ShoppingCart,
  Dumbbell,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { ApartmentLocationCost } from '@/types/locationCost.types';

interface CostComparisonTableProps {
  data: ApartmentLocationCost[];
  apartmentNames?: Record<string, string>; // apartmentId -> name
  onSelectApartment?: (apartmentId: string) => void;
}

type SortField = 'baseRent' | 'trueMonthlyCost' | 'commute' | 'totalLocationCosts';
type SortDirection = 'asc' | 'desc';

export function CostComparisonTable({ 
  data, 
  apartmentNames = {},
  onSelectApartment 
}: CostComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('trueMonthlyCost');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDelta = (amount: number) => {
    const prefix = amount >= 0 ? '+' : '';
    return `${prefix}${formatCurrency(amount)}`;
  };
  
  // Sort data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortField) {
        case 'baseRent':
          aVal = a.baseRent;
          bVal = b.baseRent;
          break;
        case 'trueMonthlyCost':
          aVal = a.trueMonthlyCost;
          bVal = b.trueMonthlyCost;
          break;
        case 'commute':
          aVal = a.commuteCost.durationMinutes;
          bVal = b.commuteCost.durationMinutes;
          break;
        case 'totalLocationCosts':
          aVal = a.totalLocationCosts;
          bVal = b.totalLocationCosts;
          break;
        default:
          aVal = a.trueMonthlyCost;
          bVal = b.trueMonthlyCost;
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortField, sortDirection]);
  
  // Calculate stats
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    
    const avgRent = data.reduce((sum, d) => sum + d.baseRent, 0) / data.length;
    const avgTrue = data.reduce((sum, d) => sum + d.trueMonthlyCost, 0) / data.length;
    const minTrue = Math.min(...data.map(d => d.trueMonthlyCost));
    const maxTrue = Math.max(...data.map(d => d.trueMonthlyCost));
    
    return { avgRent, avgTrue, minTrue, maxTrue, spread: maxTrue - minTrue };
  }, [data]);
  
  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort header component
  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider hover:text-white transition-colors ${
        sortField === field ? 'text-white' : 'text-slate-400'
      }`}
    >
      {children}
      <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-blue-400' : ''}`} />
    </button>
  );
  
  if (data.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-slate-400">No apartments to compare yet.</p>
      </div>
    );
  }
  
  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Stats Header */}
      {stats && (
        <div className="p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/10">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400">Apartments</p>
              <p className="text-lg font-bold text-white">{data.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Avg. Rent</p>
              <p className="text-lg font-bold text-white">{formatCurrency(stats.avgRent)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Avg. True Cost</p>
              <p className="text-lg font-bold gradient-text">{formatCurrency(stats.avgTrue)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Potential Savings</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(stats.spread)}/mo</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Apartment
                </span>
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader field="baseRent">Rent</SortHeader>
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader field="commute">Commute</SortHeader>
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader field="totalLocationCosts">Location +/-</SortHeader>
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader field="trueMonthlyCost">True Cost</SortHeader>
              </th>
              <th className="px-4 py-3 text-right">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  vs Avg
                </span>
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((apt, index) => {
              const name = apartmentNames[apt.apartmentId] || apt.apartmentAddress;
              const isExpanded = expandedRow === apt.apartmentId;
              const isBest = apt.savingsRank === 1;
              
              return (
                <Fragment key={apt.apartmentId}>
                  <tr 
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                      isBest ? 'bg-emerald-500/5' : ''
                    }`}
                    onClick={() => setExpandedRow(isExpanded ? null : apt.apartmentId)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 && sortField === 'trueMonthlyCost' && sortDirection === 'asc'
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-900'
                            : 'bg-white/10 text-slate-400'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div>
                          <p className="font-medium text-white text-sm">{name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">
                            {apt.apartmentAddress}
                          </p>
                        </div>
                        
                        {isBest && (
                          <Medal className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 text-right">
                      <span className="text-white font-medium">{formatCurrency(apt.baseRent)}</span>
                    </td>
                    
                    <td className="px-4 py-4 text-right">
                      <div>
                        <span className="text-white">{apt.commuteCost.durationMinutes} min</span>
                        <p className="text-xs text-slate-500">{apt.commuteCost.distanceMiles} mi</p>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 text-right">
                      <span className={`font-medium ${
                        apt.totalLocationCosts <= 100 ? 'text-emerald-400' :
                        apt.totalLocationCosts <= 200 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {formatDelta(apt.totalLocationCosts)}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 text-right">
                      <span className="text-lg font-bold gradient-text">
                        {formatCurrency(apt.trueMonthlyCost)}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 text-right">
                      {apt.vsAverageTrue !== 0 && (
                        <div className={`flex items-center justify-end gap-1 ${
                          apt.vsAverageTrue < 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {apt.vsAverageTrue < 0 ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <TrendingUp className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {formatDelta(apt.vsAverageTrue)}
                          </span>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-4 py-4">
                      <button className="p-1 text-slate-400 hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-white/5">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Car className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Commute</p>
                              <p className="text-sm text-white font-medium">
                                {formatCurrency(apt.commuteCost.totalMonthly)}/mo
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                              <ParkingCircle className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Parking</p>
                              <p className="text-sm text-white font-medium">
                                {apt.parkingCost.parkingIncluded 
                                  ? 'Included' 
                                  : `${formatCurrency(apt.parkingCost.estimatedMonthly)}/mo`
                                }
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                              <ShoppingCart className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Groceries</p>
                              <p className="text-sm text-white font-medium">
                                {formatCurrency(apt.groceryCost.additionalGasCost)}/mo
                              </p>
                              <p className="text-xs text-slate-500">
                                {apt.groceryCost.nearestGroceryStore.name}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                              <Dumbbell className="w-4 h-4 text-orange-400" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Gym</p>
                              <p className="text-sm text-white font-medium">
                                {apt.gymCost.additionalGasCost > 0 
                                  ? `${formatCurrency(apt.gymCost.additionalGasCost)}/mo`
                                  : '—'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {onSelectApartment && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectApartment(apt.apartmentId);
                            }}
                            className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            View full details
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CostComparisonTable;
