import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowLeft, AlertCircle, Loader2, Shield, Zap, CheckCircle } from 'lucide-react';
import { designSystem } from '@/lib/design-system';
import ModernCard from '@/components/modern/ModernCard';

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/dashboard');
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

  const benefits = [
    {
      icon: Zap,
      title: "AI-Powered Search",
      description: "Find hidden rental opportunities with advanced algorithms"
    },
    {
      icon: Shield,
      title: "Negotiation Advantage", 
      description: "Get data-driven insights to secure better rental terms"
    },
    {
      icon: CheckCircle,
      title: "Proven Results",
      description: "Join 15,000+ renters who've saved an average of $312/month"
    }
  ];

  return (
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark} flex items-center justify-center px-4 py-8`}>
      <div className="w-full max-w-6xl">
        {/* Back to Landing */}
        <div className="mb-6">
          <Link to="/" className={`inline-flex items-center text-sm ${designSystem.colors.muted} hover:text-foreground ${designSystem.animations.transition}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className={`${designSystem.animations.entrance} space-y-8`}>
            <div>
              <h1 className={`${designSystem.typography.hero} mb-4`}>
                {isSignUp ? 'Join Apartment Locator AI' : 'Welcome Back'}
              </h1>
              <p className={`${designSystem.typography.bodyLarge} mb-8`}>
                {isSignUp 
                  ? 'Start finding your perfect rental with AI-powered search and negotiation intelligence'
                  : 'Access your rental intelligence dashboard and continue your apartment search'
                }
              </p>
            </div>

            <div className={designSystem.spacing.content}>
              {benefits.map((benefit, index) => (
                <ModernCard
                  key={benefit.title}
                  animate
                  animationDelay={index * 100}
                  hover
                  className="flex items-start gap-4"
                >
                  <div className="p-3 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`${designSystem.typography.subheadingLarge} mb-1`}>
                      {benefit.title}
                    </h3>
                    <p className={designSystem.typography.body}>
                      {benefit.description}
                    </p>
                  </div>
                </ModernCard>
              ))}
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className={`${designSystem.animations.entrance}`} style={{ animationDelay: '300ms' }}>
            <ModernCard className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className={`${designSystem.typography.headingGradient} mb-2`}>
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className={designSystem.typography.body}>
                  {isSignUp 
                    ? 'Get started with your AI-powered apartment search'
                    : 'Sign in to access your rental intelligence dashboard'
                  }
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className={designSystem.spacing.content}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
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
                  />
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
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
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className={`w-full ${designSystem.buttons.primary}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className={`text-sm ${designSystem.colors.muted}`}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    onClick={toggleMode}
                    disabled={loading}
                    className="ml-1 text-primary hover:underline font-medium"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>

              {/* Email confirmation notice */}
              {isSignUp && (
                <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400 text-center">
                    After signing up, please check your email and click the verification link to activate your account.
                  </p>
                </div>
              )}

              {/* Or view demo */}
              <div className="mt-4">
                <Link to="/demo">
                  <Button variant="outline" className="w-full">View Demo (no login)</Button>
                </Link>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;