import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { Loader2 } from 'lucide-react';

export type UserType = 'renter' | 'landlord' | 'agent' | 'admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * If provided, user must have one of these types to access the route
   */
  allowedUserTypes?: UserType[];
  /**
   * If true, only authenticated users can access (no user type check)
   */
  requireAuth?: boolean;
  /**
   * Custom redirect path (defaults to /auth)
   */
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication and/or specific user types.
 * 
 * Features:
 * - Authentication checking
 * - User type verification (role-based access)
 * - Automatic redirects for unauthorized access
 * - Loading states during auth checks
 * - Preserves intended destination for post-login redirect
 * 
 * @example
 * // Require authentication only
 * <ProtectedRoute requireAuth>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Require specific user type
 * <ProtectedRoute allowedUserTypes={['landlord']}>
 *   <PortfolioDashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Multiple allowed types
 * <ProtectedRoute allowedUserTypes={['landlord', 'agent']}>
 *   <PremiumFeature />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  allowedUserTypes,
  requireAuth = true,
  redirectTo = '/auth',
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, userType: contextUserType } = useUser();
  const location = useLocation();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [checkingUserType, setCheckingUserType] = useState(true);

  useEffect(() => {
    // Get user type from server (via useUser) or fallback to localStorage
    const serverUserType = user?.userType as UserType | null;
    const storedUserType = localStorage.getItem('userType') as UserType | null;
    setUserType(serverUserType || contextUserType || storedUserType);
    setCheckingUserType(false);
  }, [user, contextUserType]);

  // Show loading state while checking authentication
  if (loading || checkingUserType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If specific user types are required, check if user has the right type
  if (allowedUserTypes && allowedUserTypes.length > 0) {
    // If not authenticated, redirect to auth
    if (!isAuthenticated) {
      return (
        <Navigate
          to={redirectTo}
          state={{ from: location.pathname }}
          replace
        />
      );
    }

    // Admin users have access to all routes
    if (userType === 'admin') {
      return <>{children}</>;
    }

    // If user type doesn't match, redirect to user type selection or appropriate dashboard
    if (!userType || !allowedUserTypes.includes(userType)) {
      // If no user type is set, send to user type selection
      if (!userType) {
        return (
          <Navigate
            to="/user-type"
            state={{ from: location.pathname }}
            replace
          />
        );
      }

      // User has wrong type - redirect to their appropriate dashboard
      return (
        <Navigate
          to={getUserDashboard(userType)}
          replace
        />
      );
    }
  }

  // All checks passed - render the protected content
  return <>{children}</>;
}

/**
 * Helper function to get the default dashboard for a user type
 */
function getUserDashboard(userType: UserType): string {
  switch (userType) {
    case 'landlord':
      return '/portfolio-dashboard';
    case 'agent':
      return '/agent-dashboard';
    case 'admin':
      return '/admin';
    case 'renter':
    default:
      return '/dashboard';
  }
}

/**
 * UnauthorizedAccess Component
 * 
 * Displays when user tries to access a route they don't have permission for.
 * Can be used as a fallback or error state.
 */
export function UnauthorizedAccess() {
  const location = useLocation();
  const userType = localStorage.getItem('userType') as UserType | null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>

          {userType && (
            <p className="text-sm text-gray-500 mb-6">
              This page is not available for your account type.
            </p>
          )}

          <div className="space-y-3">
            <a
              href={userType ? getUserDashboard(userType) : '/dashboard'}
              className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Go to Dashboard
            </a>
            
            <a
              href="/"
              className="block w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Go to Home
            </a>
          </div>

          {location.state?.from && (
            <p className="text-xs text-gray-400 mt-6">
              Attempted to access: {location.state.from}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
