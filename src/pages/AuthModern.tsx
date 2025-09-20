import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowLeft, AlertCircle, Loader2, Building } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import { ModernLoading } from '@/components/modern/ModernLoading';

const AuthModern = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.log('Auth check failed:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Clean up auth state utility
  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created successfully! Please check your email to verify your account.');
        setIsSignUp(false);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Welcome back!');
        // Navigate to dashboard using react-router
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please check your email and click the verification link before signing in.');
      } else {
        setError(error.message || 'Failed to sign in');
      }
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

  if (initialLoading) {
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
              {/* App Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Building className="w-8 h-8 text-white" />
              </div>
              
              <CardTitle className={designSystem.typography.subheadingLarge}>
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className={designSystem.typography.body}>
                {isSignUp 
                  ? 'Start finding your perfect rental with AI-powered market intelligence'
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
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className={`h-11 ${designSystem.backgrounds.feature} border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${designSystem.animations.transition}`}
                  />
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className={`flex items-center gap-2 ${designSystem.typography.label} font-medium`}>
                      <Lock className={designSystem.icons.small} />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className={`h-11 ${designSystem.backgrounds.feature} border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${designSystem.animations.transition}`}
                    />
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

              {/* Email confirmation notice */}
              {isSignUp && (
                <div className={`p-4 ${designSystem.backgrounds.section} border border-blue-200 rounded-lg ${designSystem.animations.entrance}`}>
                  <p className={`${designSystem.typography.caption} text-blue-700 text-center`}>
                    📧 After signing up, please check your email and click the verification link to activate your account.
                  </p>
                </div>
              )}

              {/* Demo Link */}
              <div className="pt-2">
                <Link to="/demo">
                  <Button 
                    variant="outline" 
                    className={`w-full h-11 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 ${designSystem.animations.transition}`}
                  >
                    <Building className={`${designSystem.icons.small} mr-2`} />
                    View Demo (no account needed)
                  </Button>
                </Link>
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
          <div className={`mt-6 text-center ${designSystem.animations.entrance}`} style={{ animationDelay: '300ms' }}>
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