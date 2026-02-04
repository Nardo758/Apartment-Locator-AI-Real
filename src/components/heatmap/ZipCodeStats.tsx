import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ZipCodeData, getSuccessRateColor } from '@/data/mockHeatmapData';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Home, 
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ZipCodeStatsProps {
  zipData: ZipCodeData | null;
  viewMode: 'renter' | 'landlord';
}

export const ZipCodeStats: React.FC<ZipCodeStatsProps> = ({ zipData, viewMode }) => {
  if (!zipData) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full pt-6">
          <div className="text-center text-slate-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a ZIP code on the map</p>
            <p className="text-xs mt-1">to view detailed statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const successColor = getSuccessRateColor(zipData.successRate);
  const getSuccessLabel = () => {
    if (zipData.successRate >= 80) return 'Excellent';
    if (zipData.successRate >= 70) return 'Very Good';
    if (zipData.successRate >= 60) return 'Good';
    if (zipData.successRate >= 50) return 'Fair';
    return 'Challenging';
  };

  const getRecommendation = () => {
    if (viewMode === 'renter') {
      if (zipData.successRate >= 75) {
        return 'This is a great area for negotiating! Landlords are typically flexible here.';
      } else if (zipData.successRate >= 60) {
        return 'Moderate success rate. Consider highlighting your strengths as a tenant.';
      } else {
        return 'Lower success rate. Be prepared with strong references and offer terms.';
      }
    } else {
      if (zipData.successRate >= 75) {
        return 'High competition. Renters have strong negotiating position here.';
      } else if (zipData.successRate >= 60) {
        return 'Balanced market. Good opportunity for fair negotiations.';
      } else {
        return 'Lower acceptance of offers. You may have stronger negotiating position.';
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{zipData.zip}</CardTitle>
              <p className="text-sm text-slate-500 mt-1">{zipData.city}, TX</p>
            </div>
            <Badge 
              className="text-white"
              style={{ backgroundColor: successColor }}
            >
              {getSuccessLabel()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {viewMode === 'renter' ? 'Success Rate' : 'Acceptance Rate'}
                </span>
              </div>
              <span className="text-2xl font-bold" style={{ color: successColor }}>
                {zipData.successRate}%
              </span>
            </div>
            <Progress value={zipData.successRate} className="h-2" />
            <p className="text-xs text-slate-500 mt-1">
              Based on {zipData.offerCount} offers
            </p>
          </div>

          {/* Average Savings */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Avg. Savings per Offer</p>
                <p className="text-2xl font-bold text-green-700">
                  ${zipData.avgSavings}
                </p>
              </div>
            </div>
          </div>

          {/* Offer Count */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Offers Made</p>
                <p className="text-2xl font-bold text-blue-700">
                  {zipData.offerCount}
                </p>
              </div>
            </div>
          </div>

          {/* Average Rent */}
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Home className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Average Rent</p>
                <p className="text-2xl font-bold text-purple-700">
                  ${zipData.avgRent}/mo
                </p>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`p-4 rounded-lg border ${
            zipData.successRate >= 70 
              ? 'bg-green-50 border-green-200' 
              : zipData.successRate >= 50
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex gap-3">
              {zipData.successRate >= 70 ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {viewMode === 'renter' ? 'Negotiation Insight' : 'Market Position'}
                </p>
                <p className="text-xs text-slate-600">
                  {getRecommendation()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <div>
              <p className="text-xs text-slate-500">Potential Annual Savings</p>
              <p className="text-lg font-bold text-slate-800">
                ${(zipData.avgSavings * 12).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Market Activity</p>
              <p className="text-lg font-bold text-slate-800">
                {zipData.offerCount >= 100 ? 'Very High' : 
                 zipData.offerCount >= 75 ? 'High' : 
                 zipData.offerCount >= 50 ? 'Moderate' : 'Low'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            💡 Pro Tips for {zipData.zip}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {viewMode === 'renter' ? (
            <>
              <div className="flex gap-2 text-xs">
                <span className="text-slate-400">•</span>
                <p className="text-slate-600">
                  {zipData.successRate >= 75 
                    ? "Request concessions like waived fees or flexible lease terms"
                    : "Focus on your tenant strengths and provide solid references"}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-slate-400">•</span>
                <p className="text-slate-600">
                  {zipData.successRate >= 75
                    ? "Consider negotiating move-in dates or parking"
                    : "Be ready to compromise on some terms to improve chances"}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-slate-400">•</span>
                <p className="text-slate-600">
                  Best time: Apply during off-peak months (Nov-Feb)
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2 text-xs">
                <span className="text-slate-400">•</span>
                <p className="text-slate-600">
                  {zipData.successRate >= 75
                    ? "Expect renters to negotiate - consider your bottom line"
                    : "You have stronger position - stick to your terms"}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-slate-400">•</span>
                <p className="text-slate-600">
                  {zipData.successRate >= 75
                    ? "Offering small concessions can close deals faster"
                    : "Focus on quality tenants over quick negotiation wins"}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-slate-400">•</span>
                <p className="text-slate-600">
                  Consider market timing and seasonal demand patterns
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
