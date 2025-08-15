import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail } from 'lucide-react';

interface TrialSignupProps {
  onSignupComplete: (email: string) => void;
  className?: string;
}

export const TrialSignup: React.FC<TrialSignupProps> = ({ onSignupComplete, className }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onSignupComplete(email);
    }, 1500);
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="glass-dark rounded-2xl p-8 border border-white/10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Start Your <span className="gradient-text">Free Trial</span>
          </h2>
          <p className="text-muted-foreground">
            Discover hidden rental opportunities with AI-powered analysis
          </p>
        </div>

        {/* Value Props */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-white font-bold text-xs">✓</span>
            </div>
            <span className="text-foreground">3 free property analyses</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-white font-bold text-xs">✓</span>
            </div>
            <span className="text-foreground">72-hour trial period</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-white font-bold text-xs">✓</span>
            </div>
            <span className="text-foreground">No credit card required</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-lg bg-muted/20 border-muted/40 focus:border-primary"
              disabled={loading}
            />
            {error && (
              <p className="text-destructive text-sm mt-2">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full h-12 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Setting up your trial...
              </>
            ) : (
              'Start Free Trial'
            )}
          </Button>
        </form>

        {/* Trust indicators */}
        <div className="mt-6 pt-6 border-t border-muted/20">
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              <span>15K+ users</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              <span>73% success rate</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              <span>$312 avg savings</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};