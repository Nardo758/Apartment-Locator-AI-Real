import type { UserType } from '@/components/routing/ProtectedRoute';

/**
 * Auth Router Utility
 * 
 * Handles post-authentication routing logic and user type-based navigation.
 * This ensures users are directed to the appropriate pages based on their role.
 */

export interface NavigationState {
  from?: string;
  returnTo?: string;
}

/**
 * Get the default dashboard route for a given user type
 */
export function getDefaultDashboard(userType: UserType | null): string {
  if (!userType) {
    return '/user-type'; // No user type set - go to selection
  }

  switch (userType) {
    case 'renter':
      return '/dashboard';
    case 'landlord':
      return '/landlord-dashboard';
    case 'agent':
      return '/agent-dashboard';
    case 'admin':
      return '/admin';
    default:
      return '/dashboard';
  }
}

/**
 * Get the appropriate onboarding route for a user type
 */
export function getOnboardingRoute(userType: UserType): string {
  switch (userType) {
    case 'landlord':
      return '/landlord-onboarding';
    case 'agent':
      return '/agent-onboarding';
    case 'renter':
      return '/program-ai'; // Renter "onboarding" is the AI program flow
    case 'admin':
      return '/admin';
    default:
      return '/dashboard';
  }
}

/**
 * Determine where to redirect after successful login
 * 
 * Priority:
 * 1. Return to the page they were trying to access (from state)
 * 2. Go to their default dashboard based on user type
 * 3. Fallback to general dashboard
 */
export function getPostLoginRoute(
  userType: UserType | null,
  navigationState?: NavigationState
): string {
  // If user was trying to access a specific page, return them there
  if (navigationState?.from && navigationState.from !== '/auth') {
    return navigationState.from;
  }

  if (navigationState?.returnTo) {
    return navigationState.returnTo;
  }

  // Otherwise, send to their default dashboard
  return getDefaultDashboard(userType);
}

/**
 * Determine where to redirect after signup
 * 
 * New users should:
 * 1. Select their user type (if not already selected)
 * 2. Complete onboarding for their type
 * 3. Land on their dashboard
 */
export function getPostSignupRoute(userType: UserType | null): string {
  if (!userType) {
    return '/user-type';
  }

  // Send to type-specific onboarding
  return getOnboardingRoute(userType);
}

/**
 * Check if a route is accessible for a given user type
 */
export function canAccessRoute(
  route: string,
  userType: UserType | null,
  isAuthenticated: boolean
): boolean {
  // Public routes (accessible without auth)
  const publicRoutes = [
    '/',
    '/about',
    '/pricing',
    '/auth',
    '/signup',
    '/trial',
    '/terms',
    '/privacy',
    '/help',
    '/contact',
    '/landlord-pricing',
    '/agent-pricing',
  ];

  if (publicRoutes.includes(route)) {
    return true;
  }

  // All other routes require authentication
  if (!isAuthenticated) {
    return false;
  }

  // Routes available to all authenticated users
  const commonRoutes = [
    '/user-type',
    '/dashboard',
    '/profile',
    '/billing',
    '/data-export',
    '/data-management',
    '/help',
    '/contact',
  ];

  if (commonRoutes.includes(route)) {
    return true;
  }

  // User type-specific routes
  if (!userType) {
    return false; // Must have user type set for specific routes
  }

  // Renter-specific routes
  const renterRoutes = [
    '/program-ai',
    '/ai-formula',
    '/market-intel',
    '/saved-properties',
    '/property',
    '/generate-offer',
    '/offers-made',
    '/payment-success',
    '/success',
  ];

  // Landlord-specific routes
  const landlordRoutes = [
    '/landlord-onboarding',
    '/landlord-dashboard',
    '/portfolio-dashboard',
    '/email-templates',
    '/renewal-optimizer',
    '/verify-lease',
  ];

  // Agent-specific routes
  const agentRoutes = [
    '/agent-onboarding',
    '/agent-dashboard',
  ];

  // Admin-specific routes
  const adminRoutes = [
    '/admin',
  ];

  switch (userType) {
    case 'renter':
      return renterRoutes.some(r => route.startsWith(r));
    case 'landlord':
      return landlordRoutes.some(r => route.startsWith(r));
    case 'agent':
      return agentRoutes.some(r => route.startsWith(r));
    case 'admin':
      return adminRoutes.some(r => route.startsWith(r)) || 
             renterRoutes.some(r => route.startsWith(r)) ||
             landlordRoutes.some(r => route.startsWith(r)) ||
             agentRoutes.some(r => route.startsWith(r)); // Admin has access to all
    default:
      return false;
  }
}

/**
 * Get user-friendly name for user type
 */
export function getUserTypeName(userType: UserType | null): string {
  if (!userType) return 'User';
  
  switch (userType) {
    case 'renter':
      return 'Renter';
    case 'landlord':
      return 'Landlord';
    case 'agent':
      return 'Agent';
    case 'admin':
      return 'Administrator';
    default:
      return 'User';
  }
}

/**
 * Get available navigation items for a user type
 */
export function getNavigationItems(userType: UserType | null): NavigationItem[] {
  const commonItems: NavigationItem[] = [
    { label: 'Profile', path: '/profile', icon: 'User' },
    { label: 'Billing', path: '/billing', icon: 'CreditCard' },
    { label: 'Help', path: '/help', icon: 'HelpCircle' },
  ];

  if (!userType) {
    return commonItems;
  }

  let typeSpecificItems: NavigationItem[] = [];

  switch (userType) {
    case 'renter':
      typeSpecificItems = [
        { label: 'Dashboard', path: '/dashboard', icon: 'Home' },
        { label: 'Find Apartments', path: '/program-ai', icon: 'Search' },
        { label: 'Market Intel', path: '/market-intel', icon: 'TrendingUp' },
        { label: 'Saved Properties', path: '/saved-properties', icon: 'Heart' },
        { label: 'My Offers', path: '/offers-made', icon: 'FileText' },
      ];
      break;
    case 'landlord':
      typeSpecificItems = [
        { label: 'Dashboard', path: '/landlord-dashboard', icon: 'LayoutDashboard' },
        { label: 'Portfolio', path: '/portfolio-dashboard', icon: 'Building' },
        { label: 'Renewal Optimizer', path: '/renewal-optimizer', icon: 'RefreshCw' },
        { label: 'Email Templates', path: '/email-templates', icon: 'Mail' },
        { label: 'Verify Lease', path: '/verify-lease', icon: 'CheckCircle' },
      ];
      break;
    case 'agent':
      typeSpecificItems = [
        { label: 'Dashboard', path: '/agent-dashboard', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/agent-dashboard#clients', icon: 'Users' },
        { label: 'Commissions', path: '/agent-dashboard#commissions', icon: 'DollarSign' },
      ];
      break;
    case 'admin':
      typeSpecificItems = [
        { label: 'Admin Panel', path: '/admin', icon: 'Shield' },
        { label: 'Dashboard', path: '/dashboard', icon: 'Home' },
      ];
      break;
  }

  return [...typeSpecificItems, ...commonItems];
}

export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
}

/**
 * Storage helpers for user type
 * TODO: Replace with backend API calls when available
 */
export const userTypeStorage = {
  get(): UserType | null {
    return localStorage.getItem('userType') as UserType | null;
  },

  set(userType: UserType): void {
    localStorage.setItem('userType', userType);
  },

  clear(): void {
    localStorage.removeItem('userType');
  },
};

/**
 * Check if user needs to complete onboarding
 * TODO: Enhance with backend check for onboarding completion status
 */
export function needsOnboarding(userType: UserType | null): boolean {
  if (!userType) return true;

  // Check if onboarding was completed (stored flag)
  const onboardingComplete = localStorage.getItem(`${userType}_onboarding_complete`);
  return !onboardingComplete;
}

/**
 * Mark onboarding as complete
 */
export function markOnboardingComplete(userType: UserType): void {
  localStorage.setItem(`${userType}_onboarding_complete`, 'true');
}
