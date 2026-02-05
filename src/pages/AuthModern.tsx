import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Mail, Lock, ArrowLeft, AlertCircle, Loader2, Building, Eye, EyeOff, Home, Briefcase } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import { ModernLoading } from '@/components/modern/ModernLoading';
import { useUser } from '@/hooks/useUser';
import type { UserType } from '@/components/routing/ProtectedRoute';

const AuthModern = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading: userLoading, login, register, setUserType, userType } = useUser();
  
  // Get URL parameters
  const urlUserType = searchParams.get('type') as UserType | null;
  const urlMode = searchParams.get('mode');
  const urlPlan = searchParams.get('plan');
  
  const [isSignUp, setIsSignUp] = useState(urlMode === 'signup');
  const [loading, setLoading] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false); // Prevents auto-redirect during form submission
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Redirect helper based on user type - for NEW signups, go to onboarding
  const getSignupRedirectPath = (type: UserType | null): string => {
    switch (type) {
      case 'admin':
        return '/admin';
      case 'landlord':
        return '/landlord-onboarding';
      case 'agent':
        return '/agent-onboarding';
      case 'renter':
      default:
        return '/program-ai'; // Renters go to AI program flow
    }
  };

  // Redirect helper for EXISTING users (sign-in) - go to dashboard
  const getSigninRedirectPath = (type: UserType | null): string => {
    switch (type) {
      case 'admin':
        return '/admin';
      case 'landlord':
        return '/landlord-dashboard';
      case 'agent':
        return '/agent-dashboard';
      case 'renter':
      default:
        return '/dashboard';
    }
  };

  // Only redirect for already-authenticated users who land on auth page directly (not during form submission)
  // This handles the case where a logged-in user navigates to /auth
  useEffect(() => {
    // Skip redirect if we're in the middle of form submission
    if (isFormSubmitting || loading) {
      return;
    }
    
    // Only redirect if user is already authenticated BEFORE interacting with the form
    if (isAuthenticated && userType) {
      // Use signin redirect since they already have an account
      const redirectPath = getSigninRedirectPath(userType);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, userType, isFormSubmitting, loading]);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setIsFormSubmitting(true); // Prevent useEffect auto-redirect during submission
    setError('');

    try {
      // Determine the target user type BEFORE any async operations
      // Priority: URL parameter > existing context value > default to renter
      const targetUserType: UserType = urlUserType || 'renter';
      
      // Register the user
      await register(email, password, email.split('@')[0]);
      
      // Set the user type in database - await to ensure it completes
      await setUserType(targetUserType);
      
      // Small delay to ensure state is fully propagated
      await new Promise(resolve => setTimeout(resolve, 50));
      
      toast.success('Account created successfully!');
      
      // Navigate DIRECTLY to the correct path based on the URL user type
      // Don't rely on state - use the known targetUserType
      const redirectPath = getSignupRedirectPath(targetUserType);
      navigate(redirectPath, { replace: true });
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('already registered') || message.includes('409')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(message || 'Failed to create account');
      }
      setIsFormSubmitting(false); // Reset on error so user can try again
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsFormSubmitting(true); // Prevent useEffect auto-redirect during submission
    setError('');

    try {
      // Login first to get the user's existing data
      await login(email, password);
      
      // If URL specifies a user type, update the user's type
      // Otherwise, the login() function already sets userType from the database
      if (urlUserType) {
        await setUserType(urlUserType);
        // Small delay to ensure state is fully propagated
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      toast.success('Welcome back!');
      
      // For sign-in, use signin redirect (to dashboard, not onboarding)
      // If URL specified a type, use that; otherwise use the user's existing type from login
      const redirectType = urlUserType || userType;
      const redirectPath = getSigninRedirectPath(redirectType);
      navigate(redirectPath, { replace: true });
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Invalid') || message.includes('401')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(message || 'Failed to sign in');
      }
      setIsFormSubmitting(false); // Reset on error so user can try again
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  if (userLoading) {
    return (
      <ModernLoading 
        title="Apartment Locator AI"
        subtitle="Loading authentication..."
        fullScreen={true}
      />
    );
  }

  return (
    <div className={`${designSystem.backgrounds.hero} min-h-screen`}>
      {/* Background overlay */}
      <div className={designSystem.backgrounds.overlay}></div>
      
      <div className="relative flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Back to Landing */}
          <div className={`mb-6 ${designSystem.animations.entrance}`}>
            <Link 
              to="/" 
              className={`inline-flex items-center text-sm ${designSystem.colors.muted} hover:text-gray-900 ${designSystem.animations.transition}`}
            >
              <ArrowLeft className={`${designSystem.icons.small} mr-2`} />
              Back to Home
            </Link>
          </div>

          <Card className={`${designSystem.backgrounds.card} ${designSystem.backgrounds.cardHover} ${designSystem.animations.entrance}`}>
            <CardHeader className="text-center pb-6">
              {/* App Icon - changes based on user type */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
                urlUserType === 'landlord' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                  : urlUserType === 'agent'
                  ? 'bg-gradient-to-br from-orange-500 to-red-600'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                {urlUserType === 'landlord' ? (
                  <Building className="w-8 h-8 text-white" />
                ) : urlUserType === 'agent' ? (
                  <Briefcase className="w-8 h-8 text-white" />
                ) : (
                  <Home className="w-8 h-8 text-white" />
                )}
              </div>
              
              {/* User type badge */}
              {urlUserType && (
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    urlUserType === 'landlord'
                      ? 'bg-purple-100 text-purple-700'
                      : urlUserType === 'agent'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {urlUserType === 'landlord' ? 'Landlord Account' : urlUserType === 'agent' ? 'Agent Account' : 'Renter Account'}
                    {urlPlan && <span className="ml-1">• {urlPlan.charAt(0).toUpperCase() + urlPlan.slice(1)} Plan</span>}
                  </span>
                </div>
              )}
              
              <CardTitle className={designSystem.typography.subheadingLarge}>
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className={designSystem.typography.body}>
                {isSignUp 
                  ? urlUserType === 'landlord'
                    ? 'Start optimizing your portfolio with AI-powered market intelligence'
                    : urlUserType === 'agent'
                    ? 'Start growing your business with powerful agent tools'
                    : 'Start finding your perfect rental with AI-powered market intelligence'
                  : 'Sign in to access your rental intelligence dashboard and saved properties'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className={`border-red-200 bg-red-50 ${designSystem.animations.entrance}`}>
                  <AlertCircle className={designSystem.icons.small} />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className={`flex items-center gap-2 ${designSystem.typography.label} font-medium`}>
                    <Mail className={designSystem.icons.small} />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                    className={`h-11 ${designSystem.backgrounds.feature} border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${designSystem.animations.transition}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className={`flex items-center gap-2 ${designSystem.typography.label} font-medium`}>
                    <Lock className={designSystem.icons.small} />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className={`h-11 pr-10 ${designSystem.backgrounds.feature} border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${designSystem.animations.transition}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className={`flex items-center gap-2 ${designSystem.typography.label} font-medium`}>
                      <Lock className={designSystem.icons.small} />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className={`h-11 pr-10 ${designSystem.backgrounds.feature} border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${designSystem.animations.transition}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        data-testid="button-toggle-confirm-password"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className={`w-full h-11 ${designSystem.buttons.primary} ${designSystem.animations.transition} shadow-lg hover:shadow-xl`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className={`${designSystem.icons.small} mr-2 animate-spin`} />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowLeft className={`${designSystem.icons.small} ml-2 rotate-180`} />
                    </>
                  )}
                </Button>
              </form>

              {/* Toggle Sign In/Up */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className={designSystem.typography.label}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    onClick={toggleMode}
                    disabled={loading}
                    className={`ml-1 ${designSystem.colors.primary} hover:text-blue-700 font-medium ${designSystem.animations.transition} hover:underline`}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>



              {/* Features Preview */}
              <div className="pt-4 space-y-3">
                <h4 className={`${designSystem.typography.label} font-semibold text-gray-900 text-center`}>
                  What you'll get:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    AI-Powered Search
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Market Intelligence
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Rent vs Buy Analysis
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Negotiation Tools
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className={`mt-6 text-center ${designSystem.animations.entrance} animation-delay-300`}>
            <p className={`${designSystem.typography.caption} text-gray-600`}>
              🔒 Secure authentication • 📊 Real market data • 🤖 AI-powered insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModern;