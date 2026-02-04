// ============================================
// PROFILE SUMMARY CARD
// Shows user's search criteria on Dashboard
// ============================================

import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Home,
  Navigation,
  Settings,
  AlertCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';

const POI_ICONS = {
  work: '🟥',
  gym: '🔵',
  grocery: '🟩',
  daycare: '🟪',
  school: '🟨',
  medical: '🟦',
  pet: '🟧',
  religious: '🟫',
  dining: '🟥',
  nightlife: '🟪',
  entertainment: '🟨',
  library: '🟦',
  coworking: '⬛',
  park: '🟩',
  beach: '🟦',
  coffee: '🟤',
  custom: '📍',
};

export default function ProfileSummaryCard() {
  const {
    budget,
    location,
    zipCode,
    pointsOfInterest,
    aiPreferences,
    hasCompletedSetup,
    setupProgress,
  } = useUnifiedAI();
  const navigate = useNavigate();

  return (
    <Card className="bg-white rounded-2xl shadow-2xl border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-500">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Your Search Profile</CardTitle>
              <p className="text-sm text-gray-600">
                {hasCompletedSetup ? 'Active' : `${setupProgress}% complete`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/program-ai')}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Search Criteria */}
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">Location</div>
              <div className="text-sm text-gray-600">
                {location || zipCode || (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Not set
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">Budget</div>
              <div className="text-sm text-gray-600">
                {budget > 0 ? (
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    ${budget.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Not set
                  </span>
                )}
                <span className="text-xs text-gray-500 ml-1">/month</span>
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="flex items-start gap-3">
            <Home className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">Bedrooms</div>
              <div className="text-sm text-gray-600">
                {aiPreferences.bedrooms || '1'} BR
              </div>
            </div>
          </div>
        </div>

        {/* Points of Interest */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">Important Locations</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {pointsOfInterest.length}
            </Badge>
          </div>

          {pointsOfInterest.length > 0 ? (
            <div className="space-y-2">
              {pointsOfInterest.slice(0, 3).map((poi) => (
                <div
                  key={poi.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <span className="text-lg">
                    {POI_ICONS[poi.category as keyof typeof POI_ICONS] || '📍'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {poi.name}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {poi.category} • {poi.priority} priority
                    </div>
                  </div>
                </div>
              ))}
              {pointsOfInterest.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{pointsOfInterest.length - 3} more
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
              <AlertCircle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-amber-800">
                Add locations for True Cost analysis
              </p>
            </div>
          )}
        </div>

        {/* Amenities */}
        {aiPreferences.amenities && aiPreferences.amenities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">Must-Have Amenities</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {aiPreferences.amenities.slice(0, 4).map((amenity, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  {amenity}
                </Badge>
              ))}
              {aiPreferences.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{aiPreferences.amenities.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Setup Status */}
        {!hasCompletedSetup && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Complete Your Profile
                </p>
                <p className="text-xs text-blue-800 mb-2">
                  Add more details for smarter recommendations
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/program-ai')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
                >
                  Continue Setup ({setupProgress}%)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Button */}
        <Button
          variant="outline"
          className="w-full border-green-300 text-green-700 hover:bg-green-50"
          onClick={() => navigate('/program-ai')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Edit Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
