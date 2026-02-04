// ============================================
// SMART SCORE CARD
// Visual breakdown of 4-part AI scoring
// Location + Preferences + Market + Value
// ============================================

import { useState } from 'react';
import {
  Star,
  MapPin,
  Brain,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { SmartScore } from '@/types/unifiedAI.types';

interface SmartScoreCardProps {
  score: SmartScore;
  isTopPick?: boolean;
  showDetails?: boolean;
}

export default function SmartScoreCard({ score, isTopPick = false, showDetails = false }: SmartScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 80) return 'text-yellow-600';
    if (value >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (value: number) => {
    if (value >= 90) return 'from-green-50 to-emerald-50';
    if (value >= 80) return 'from-yellow-50 to-amber-50';
    if (value >= 70) return 'from-orange-50 to-red-50';
    return 'from-red-50 to-rose-50';
  };

  return (
    <div className={`p-4 rounded-2xl border ${
      isTopPick 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500' 
        : 'bg-white border-gray-200'
    } shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isTopPick && <Sparkles className="w-5 h-5 text-green-600" />}
          <span className="text-sm font-semibold text-gray-700">Smart Score</span>
        </div>
        {isTopPick && (
          <Badge className="bg-green-500 text-white">
            <Star className="w-3 h-3 mr-1" fill="currentColor" />
            TOP PICK
          </Badge>
        )}
      </div>

      {/* Overall Score */}
      <div className="mb-4">
        <div className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${
          score.overall >= 90 ? 'from-green-600 to-emerald-600' :
          score.overall >= 80 ? 'from-yellow-600 to-amber-600' :
          score.overall >= 70 ? 'from-orange-600 to-red-600' :
          'from-red-600 to-rose-600'
        }`}>
          {score.overall}
        </div>
        <div className="text-sm text-gray-600">out of 100</div>
      </div>

      {/* Component Scores Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Location Score */}
        <div className={`p-3 rounded-lg bg-gradient-to-br ${getScoreBg(score.locationScore)} border border-blue-200`}>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">Location</span>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(score.locationScore)}`}>
            {score.locationScore}
          </div>
        </div>

        {/* Preference Score */}
        <div className={`p-3 rounded-lg bg-gradient-to-br ${getScoreBg(score.preferenceScore)} border border-purple-200`}>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-700">Match</span>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(score.preferenceScore)}`}>
            {score.preferenceScore}
          </div>
        </div>

        {/* Market Score */}
        <div className={`p-3 rounded-lg bg-gradient-to-br ${getScoreBg(score.marketScore)} border border-indigo-200`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-gray-700">Market</span>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(score.marketScore)}`}>
            {score.marketScore}
          </div>
        </div>

        {/* Value Score */}
        <div className={`p-3 rounded-lg bg-gradient-to-br ${getScoreBg(score.valueScore)} border border-green-200`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-700">Value</span>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(score.valueScore)}`}>
            {score.valueScore}
          </div>
        </div>
      </div>

      {/* Why This Ranks */}
      {score.reasoning && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mb-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-1">Why This Ranks #{score.rank || 1}:</p>
              <p className="text-xs text-blue-800">{score.reasoning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Expand/Collapse Details */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-xs"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3 mr-1" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3 mr-1" />
            Show Details
          </>
        )}
      </Button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3 text-xs">
          {/* Top Reasons */}
          {score.topReasons && score.topReasons.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Top Reasons:</p>
              <ul className="space-y-1">
                {score.topReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-600">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {score.warnings && score.warnings.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Consider:</p>
              <ul className="space-y-1">
                {score.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-amber-600">
                    <span>⚠</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Negotiation Tips */}
          {score.negotiationTips && score.negotiationTips.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Negotiation Tips:</p>
              <ul className="space-y-1">
                {score.negotiationTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-blue-600">
                    <span>💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for list views
export function SmartScoreBadge({ score, isTopPick = false }: { score: number; isTopPick?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
      isTopPick 
        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
    } shadow-md`}>
      {isTopPick && <Star className="w-3 h-3" fill="currentColor" />}
      <span className="text-sm font-bold">{score}</span>
      <span className="text-xs opacity-90">/100</span>
    </div>
  );
}
