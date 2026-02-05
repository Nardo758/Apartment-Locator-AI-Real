import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authFetchJson } from '@/lib/authHelpers';
import { 
  User, 
  Mail, 
  Phone, 
  Home,
  DollarSign,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  currentRent: string;
  moveInDate: string;
  location: string;
  bedrooms: string;
  budget: string;
  notes: string;
}

interface LeadCaptureFormProps {
  onSubmit?: (data: LeadData) => void;
  initialData?: Partial<LeadData>;
}

export function LeadCaptureForm({ onSubmit, initialData }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<LeadData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    currentRent: initialData?.currentRent || '',
    moveInDate: initialData?.moveInDate || '',
    location: initialData?.location || '',
    bedrooms: initialData?.bedrooms || '1',
    budget: initialData?.budget || '',
    notes: initialData?.notes || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const parseName = (fullName: string) => {
    const trimmed = fullName.trim();
    if (!trimmed) return { firstName: '', lastName: '' };
    const parts = trimmed.split(/\s+/);
    const firstName = parts.shift() || '';
    const lastName = parts.length > 0 ? parts.join(' ') : 'Unknown';
    return { firstName, lastName };
  };

  const parseBudget = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) return null;
    const parsed = parseInt(cleaned, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const parseBedrooms = (value: string) => {
    if (!value) return undefined;
    if (value === 'studio') return 0;
    if (value === '4+') return 4;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage(null);

    try {
      const { firstName, lastName } = parseName(formData.name);
      const budgetMax = parseBudget(formData.budget);
      const moveInDate = formData.moveInDate
        ? new Date(formData.moveInDate).toISOString()
        : undefined;
      const bedrooms = parseBedrooms(formData.bedrooms);

      const payload = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        leadSource: 'agent_dashboard_form',
        budgetMax: budgetMax ?? undefined,
        preferredLocations: formData.location ? [formData.location] : [],
        bedrooms,
        moveInDate,
        notes: formData.notes || undefined,
        metadata: {
          currentRent: formData.currentRent || undefined,
        },
      };

      const result = await authFetchJson<{ lead: unknown; message?: string }>(
        '/api/agent/leads',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      if (!result.success) {
        setSubmitStatus('error');
        setErrorMessage(result.error);
        return;
      }
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      setSubmitStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          currentRent: '',
          moveInDate: '',
          location: '',
          bedrooms: '1',
          budget: '',
          notes: ''
        });
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.phone && formData.budget;

  return (
    <Card variant="elevated" className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Capture New Lead</CardTitle>
            <CardDescription>Collect client information to start building their profile</CardDescription>
          </div>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            <User className="w-3 h-3 mr-1" />
            New Client
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Current Rent (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    name="currentRent"
                    value={formData.currentRent}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    placeholder="$1,500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-purple-400" />
              Property Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Desired Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Move-in Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="date"
                    name="moveInDate"
                    value={formData.moveInDate}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Bedrooms
                </label>
                <select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                >
                  <option value="studio">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4+">4+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Monthly Budget *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    placeholder="$2,000"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none"
              placeholder="Any special requirements, pet ownership, parking needs, etc."
            />
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300">Lead captured successfully!</span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">
                {errorMessage ? `Failed to capture lead: ${errorMessage}` : 'Failed to capture lead. Please try again.'}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Capturing Lead...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Capture Lead
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
