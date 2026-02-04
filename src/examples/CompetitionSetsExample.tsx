/**
 * Competition Sets Integration Example
 * 
 * This example shows how to integrate the CompetitionSetManager
 * into a landlord dashboard page.
 */

import { useState, useEffect } from 'react';
import { CompetitionSetManager } from '@/components/landlord/CompetitionSetManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Example 1: Basic Integration
 * 
 * Simple integration assuming you have auth context
 */
export function BasicCompetitionSetsPage() {
  // In a real app, get these from your auth context/hook
  const userId = 'user-id-from-auth';
  const authToken = 'jwt-token-from-auth';

  return (
    <div className="container mx-auto p-6">
      <CompetitionSetManager userId={userId} authToken={authToken} />
    </div>
  );
}

/**
 * Example 2: With Auth Hook Integration
 * 
 * More realistic example with authentication
 */
export function AuthenticatedCompetitionSetsPage() {
  // Replace with your actual auth hook
  // const { user, token, isLoading } = useAuth();
  
  const user = { id: 'user-123', email: 'landlord@example.com' };
  const token = 'mock-jwt-token';
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card variant="elevated">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card variant="elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-white text-lg">Please sign in to access this page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <CompetitionSetManager userId={user.id} authToken={token} />
    </div>
  );
}

/**
 * Example 3: Embedded in Dashboard
 * 
 * Shows how to embed competition sets as part of a larger dashboard
 */
export function LandlordDashboardWithCompetitionSets() {
  const userId = 'user-123';
  const authToken = 'mock-jwt-token';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Landlord Dashboard
        </h1>
        <p className="text-white/60">
          Manage your properties and track competitor activity
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">12</div>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-400">92%</div>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Avg. Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">$2,100</div>
          </CardContent>
        </Card>
      </div>

      {/* Competition Sets Section */}
      <div className="pt-6">
        <CompetitionSetManager userId={userId} authToken={authToken} />
      </div>
    </div>
  );
}

/**
 * Example 4: With Permission Check
 * 
 * Shows how to check if user has permission to access competition sets
 */
export function PermissionGuardedCompetitionSets() {
  const user = {
    id: 'user-123',
    email: 'landlord@example.com',
    userType: 'landlord',
    subscriptionTier: 'premium',
  };
  const authToken = 'mock-jwt-token';

  // Check if user has access to competition sets
  const hasAccess = user.userType === 'landlord' && 
                    (user.subscriptionTier === 'premium' || user.subscriptionTier === 'pro');

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              Upgrade Required
            </CardTitle>
            <CardDescription>
              Competition Sets is a premium feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 mb-4">
              Track competitor pricing and activity with Competition Sets. 
              Upgrade to Premium to unlock this feature.
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <CompetitionSetManager userId={user.id} authToken={authToken} />
    </div>
  );
}

/**
 * Example 5: With Custom Header Actions
 * 
 * Shows how to add custom actions/controls alongside the competition sets
 */
export function CompetitionSetsWithCustomActions() {
  const userId = 'user-123';
  const authToken = 'mock-jwt-token';
  const [showArchived, setShowArchived] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Custom Header with Actions */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Competition Intelligence</CardTitle>
              <CardDescription className="mt-2">
                Monitor competitor activity and pricing across your portfolio
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? 'Hide' : 'Show'} Archived
              </Button>
              <Button variant="secondary">
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Competition Sets Manager */}
      <CompetitionSetManager userId={userId} authToken={authToken} />
    </div>
  );
}

/**
 * Example 6: API Integration Pattern
 * 
 * Shows the recommended pattern for API calls with proper error handling
 */
export function CompetitionSetsWithAPIPattern() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch auth data from your auth provider
    const loadAuth = async () => {
      try {
        // Replace with your actual auth logic
        // const response = await fetch('/api/auth/me');
        // const data = await response.json();
        
        // Mock data for example
        setUserId('user-123');
        setAuthToken('mock-jwt-token');
      } catch (error) {
        console.error('Auth error:', error);
        setAuthError('Failed to authenticate');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    loadAuth();
  }, []);

  if (isLoadingAuth) {
    return (
      <div className="container mx-auto p-6">
        <Card variant="elevated">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-white/60">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authError || !userId || !authToken) {
    return (
      <div className="container mx-auto p-6">
        <Card variant="elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-white text-lg mb-2">Authentication Error</p>
            <p className="text-white/60">{authError || 'Please sign in to continue'}</p>
            <Button className="mt-6">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <CompetitionSetManager userId={userId} authToken={authToken} />
    </div>
  );
}

/**
 * Usage in your app:
 * 
 * // In your router/pages
 * import { AuthenticatedCompetitionSetsPage } from '@/examples/CompetitionSetsExample';
 * 
 * // Add to your routes
 * <Route path="/landlord/competition-sets" element={<AuthenticatedCompetitionSetsPage />} />
 */
