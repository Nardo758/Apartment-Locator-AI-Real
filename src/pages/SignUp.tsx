import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Lock, ArrowLeft, AlertCircle, Loader2, Building, Eye, EyeOff, Briefcase, User, Phone, MapPin, Hash } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import type { UserType } from '@/components/routing/ProtectedRoute';

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading: userLoading, register, setUserType, userType: storedUserType } = useUser();
  
  const urlUserType = searchParams.get('type') as 'landlord' | 'agent' | null;
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryMarket, setPrimaryMarket] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Landlord-specific fields
  const [numberOfUnits, setNumberOfUnits] = useState('');
  
  // Agent-specific fields
  const [brokerage, setBrokerage] = useState('');
  const [roleType, setRoleType] = useState('');

  // Redirect already authenticated users based on their stored type or URL type
  useEffect(() => {
    if (isAuthenticated && !userLoading) {
      // Use URL type if provided, otherwise fall back to stored user type
      const effectiveType = urlUserType || storedUserType;
      if (effectiveType === 'landlord') {
        navigate('/landlord/dashboard', { replace: true });
      } else if (effectiveType === 'agent') {
        navigate('/agent/dashboard', { replace: true });
      } else {
        // Renter or unknown type goes to apartments
        navigate('/apartments', { replace: true });
      }
      return;
    }
    
    // For non-authenticated users: redirect renters or unknown types to apartments
    if (!userLoading && (!urlUserType || (urlUserType !== 'landlord' && urlUserType !== 'agent'))) {
      navigate('/apartments', { replace: true });
    }
  }, [isAuthenticated, userLoading, urlUserType, storedUserType, navigate]);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!primaryMarket.trim()) {
      setError('Primary market is required');
      return;
    }

    if (urlUserType === 'landlord' && !numberOfUnits) {
      setError('Please select the number of units you manage');
      return;
    }

    if (urlUserType === 'agent' && !roleType) {
      setError('Please select your role type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(email, password, name);
      await setUserType(urlUserType as UserType);
      
      toast.success('Account created successfully!');
      
      if (urlUserType === 'landlord') {
        navigate('/landlord/dashboard', { replace: true });
      } else if (urlUserType === 'agent') {
        navigate('/agent/dashboard', { replace: true });
      }
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('already registered') || message.includes('409')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLandlord = urlUserType === 'landlord';
  const isAgent = urlUserType === 'agent';

  const themeColor = isLandlord ? 'purple' : 'orange';
  const Icon = isLandlord ? Building : Briefcase;
  const title = isLandlord ? 'Create Landlord Account' : 'Create Agent Account';
  const description = isLandlord 
    ? 'Start managing your properties with AI-powered retention insights'
    : 'Grow your business with AI-powered market intelligence';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isLandlord ? 'from-purple-50 via-indigo-50 to-blue-50' : 'from-orange-50 via-amber-50 to-yellow-50'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 ${isLandlord ? 'bg-purple-200/30' : 'bg-orange-200/30'} rounded-full blur-3xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 ${isLandlord ? 'bg-indigo-200/30' : 'bg-amber-200/30'} rounded-full blur-3xl`}></div>
      </div>
      
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          data-testid="link-back-home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Card className="w-full max-w-md shadow-xl border-0" data-testid="card-signup">
          <CardHeader className="text-center pb-6">
            <div className={`w-16 h-16 ${isLandlord ? 'bg-purple-600' : 'bg-orange-600'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold" data-testid="text-signup-title">{title}</CardTitle>
            <CardDescription className="text-gray-600" data-testid="text-signup-description">
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6" data-testid="alert-error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Phone {isLandlord ? '(Optional)' : ''}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={isAgent}
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryMarket" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Primary Market
                </Label>
                <Input
                  id="primaryMarket"
                  type="text"
                  placeholder="e.g., Austin, TX"
                  value={primaryMarket}
                  onChange={(e) => setPrimaryMarket(e.target.value)}
                  required
                  data-testid="input-primary-market"
                />
              </div>

              {isLandlord && (
                <div className="space-y-2">
                  <Label htmlFor="numberOfUnits" className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    Number of Units
                  </Label>
                  <Select value={numberOfUnits} onValueChange={setNumberOfUnits}>
                    <SelectTrigger data-testid="select-units">
                      <SelectValue placeholder="Select number of units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 units</SelectItem>
                      <SelectItem value="6-20">6-20 units</SelectItem>
                      <SelectItem value="21-50">21-50 units</SelectItem>
                      <SelectItem value="51-100">51-100 units</SelectItem>
                      <SelectItem value="100+">100+ units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isAgent && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="brokerage" className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      Brokerage (Optional)
                    </Label>
                    <Input
                      id="brokerage"
                      type="text"
                      placeholder="e.g., Keller Williams"
                      value={brokerage}
                      onChange={(e) => setBrokerage(e.target.value)}
                      data-testid="input-brokerage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roleType" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      Role Type
                    </Label>
                    <Select value={roleType} onValueChange={setRoleType}>
                      <SelectTrigger data-testid="select-role-type">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment-locator">Apartment Locator</SelectItem>
                        <SelectItem value="real-estate-agent">Real Estate Agent</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="property-manager">Property Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    data-testid="input-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full ${isLandlord ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                disabled={loading}
                data-testid="button-submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>Create Account</>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/auth" className={`font-medium ${isLandlord ? 'text-purple-600 hover:text-purple-700' : 'text-orange-600 hover:text-orange-700'}`} data-testid="link-signin">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
