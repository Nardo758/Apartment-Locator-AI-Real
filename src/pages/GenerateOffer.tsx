import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Zap, DollarSign, Calendar, FileText, Sparkles, TrendingUp, AlertCircle, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '../components/Header';

interface OfferFormData {
  userEmail: string;
  moveInDate: string;
  leaseTerm: string;
  monthlyBudget: string;
  securityDeposit: string;
  notes: string;
  // Important Terms
  petPolicy: string;
  utilities: string;
  parking: string;
  // Lease Incentives
  firstMonthFree: boolean;
  reducedDeposit: boolean;
  waiveAppFee: boolean;
  // Qualifications
  monthlyIncome: string;
  creditScore: string;
  employmentHistory: string;
  rentalHistory: string;
}

const GenerateOffer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('property');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>({
    recommendedOffer: {
      suggestedRent: '$2,850',
      strategy: 'Competitive pricing below market average',
      reasoning: 'Property is priced 3.4% below market rate, increasing acceptance likelihood'
    },
    marketAnalysis: {
      marketPosition: 'Competitive - Below market average',
      demandLevel: 'High demand area with 85% occupancy rate',
      competitiveAnalysis: 'Similar properties range $2,800-$3,100'
    },
    potentialConcessions: [
      { type: 'First Month Free', description: 'Waive first month rent', likelihood: 'High' },
      { type: 'Reduced Security Deposit', description: 'Lower deposit to $500', likelihood: 'Medium' },
      { type: 'Waived Application Fee', description: 'Remove $200 application fee', likelihood: 'Very High' }
    ],
    timingRecommendations: {
      bestTimeToApply: 'Within 48 hours',
      reasoning: 'End of quarter - landlords motivated to fill units before reporting period'
    },
    importantTerms: [
      { term: 'Lease Term', detail: '12 months with option to renew' },
      { term: 'Security Deposit', detail: '$500 (negotiable down from $1,000)' },
      { term: 'Pet Policy', detail: 'Pets allowed with $250 deposit' },
      { term: 'Utilities', detail: 'Tenant responsible for electric/gas' },
      { term: 'Parking', detail: 'One reserved spot included' },
      { term: 'Move-in Date', detail: 'Flexible within 30 days' }
    ]
  });

  const form = useForm<OfferFormData>({
    defaultValues: {
      userEmail: '',
      moveInDate: '',
      leaseTerm: '12',
      monthlyBudget: '2850',
      securityDeposit: '500',
      notes: '',
      // Important Terms
      petPolicy: 'Pets allowed with $250 deposit',
      utilities: 'Tenant responsible for electric/gas',
      parking: 'One reserved spot included',
      // Lease Incentives
      firstMonthFree: false,
      reducedDeposit: true,
      waiveAppFee: true,
      // Qualifications
      monthlyIncome: '',
      creditScore: '',
      employmentHistory: '',
      rentalHistory: ''
    }
  });

  const handleGenerateOffer = async (data: OfferFormData) => {
    setIsGenerating(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAiSuggestions({
        recommendedOffer: {
          suggestedRent: '$2,850',
          strategy: 'Competitive pricing below market average',
          reasoning: 'Property is priced 3.4% below market rate, increasing acceptance likelihood'
        },
        marketAnalysis: {
          marketPosition: 'Competitive - Below market average',
          demandLevel: 'High demand area with 85% occupancy rate',
          competitiveAnalysis: 'Similar properties range $2,800-$3,100'
        },
        potentialConcessions: [
          { type: 'First Month Free', description: 'Waive first month rent', likelihood: 'High' },
          { type: 'Reduced Security Deposit', description: 'Lower deposit to $500', likelihood: 'Medium' },
          { type: 'Waived Application Fee', description: 'Remove $200 application fee', likelihood: 'Very High' }
        ],
        timingRecommendations: {
          bestTimeToApply: 'Within 48 hours',
          reasoning: 'End of quarter - landlords motivated to fill units before reporting period'
        }
      });
      setIsGenerating(false);
    }, 3000);
  };

  const handleSubmitOffer = async () => {
    const formData = form.getValues();
    
    if (!formData.userEmail) {
      toast({ title: "Error", description: "Please enter your email address", variant: "destructive" });
      return;
    }

    if (!aiSuggestions) {
      toast({ title: "Error", description: "Please generate AI recommendations first", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-offer-email', {
        body: {
          userEmail: formData.userEmail,
          moveInDate: formData.moveInDate,
          leaseTerm: parseInt(formData.leaseTerm),
          monthlyBudget: formData.monthlyBudget ? parseFloat(formData.monthlyBudget) : null,
          securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
          notes: formData.notes,
          // Important Terms
          petPolicy: formData.petPolicy,
          utilities: formData.utilities,
          parking: formData.parking,
          // Lease Incentives
          leaseIncentives: {
            firstMonthFree: formData.firstMonthFree,
            reducedDeposit: formData.reducedDeposit,
            waiveAppFee: formData.waiveAppFee
          },
          // Qualifications
          qualifications: {
            monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
            creditScore: formData.creditScore ? parseInt(formData.creditScore) : null,
            employmentHistory: formData.employmentHistory,
            rentalHistory: formData.rentalHistory
          },
          propertyId: propertyId || '1',
          aiSuggestions: aiSuggestions,
          propertyDetails: {
            id: propertyId,
            name: 'Sunshine Lake Apartments',
            address: '4567 Sunburst Dr, Austin, TX 78713',
            unitType: '2 bed / 2 bath - 1,120 sqft',
            listedRent: '$2,950/month'
          }
        }
      });

      if (error) {
        console.error('Error sending offer:', error);
        toast({ title: "Error", description: "Failed to send offer. Please try again.", variant: "destructive" });
        return;
      }

      if (data?.success) {
        setOfferSubmitted(true);
        toast({ title: "Success", description: "Offer sent successfully!" });
      } else {
        toast({ title: "Error", description: "Failed to send offer. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to send offer. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-400';
    if (probability >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg glass-dark hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
          </div>

          {offerSubmitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-secondary flex items-center justify-center mx-auto mb-4">
                <Send size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Offer Sent Successfully!</h2>
              <p className="text-muted-foreground">
                Your offer has been emailed to the leasing office. They will respond directly to your email within 24-48 hours.
              </p>
              <Button onClick={() => navigate('/')} className="btn-primary">
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGenerateOffer)} className="space-y-8">
                {/* Document Header */}
                <div className="bg-white rounded-lg shadow-lg border border-border p-8">
                  <div className="text-center border-b border-border pb-6 mb-8">
                    <h1 className="text-2xl font-bold text-primary mb-2">Rental Application & Offer</h1>
                    <p className="text-sm text-muted-foreground">Powered by AI Market Intelligence</p>
                    <div className="inline-block bg-primary text-white px-4 py-1 rounded-full text-xs mt-2">
                      AI Recommended
                    </div>
                  </div>

                  {/* Property Information */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Property Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Property:</span>
                        <span className="ml-2 text-foreground">Sunshine Lake Apartments</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Address:</span>
                        <span className="ml-2 text-foreground">4567 Sunburst Dr, Austin, TX 78713</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Unit Type:</span>
                        <span className="ml-2 text-foreground">2 bed / 2 bath - 1,120 sqft</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Listed Rent:</span>
                        <span className="ml-2 text-foreground">$2,950/month</span>
                      </div>
                    </div>
                  </div>

                  {/* Proposed Lease Terms */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Proposed Lease Terms
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="monthlyBudget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-muted-foreground">Monthly Rent</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="number" 
                                    placeholder="2850" 
                                    {...field} 
                                    className="pl-10 bg-background border-border focus:border-primary"
                                  />
                                </div>
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Based on current market analysis</p>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="moveInDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-muted-foreground">Move-in Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                  className="bg-background border-border focus:border-primary"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Flexible within 30 days</p>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="leaseTerm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-muted-foreground">Lease Term</FormLabel>
                              <FormControl>
                                <select 
                                  {...field} 
                                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                >
                                  {Array.from({ length: 10 }, (_, i) => i + 6).map(months => (
                                    <option key={months} value={months.toString()}>
                                      {months} months
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <p className="text-xs text-muted-foreground">With option to renew</p>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="securityDeposit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-muted-foreground">Security Deposit</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="number" 
                                    placeholder="500" 
                                    {...field} 
                                    className="pl-10 bg-background border-border focus:border-primary"
                                  />
                                </div>
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Subject to negotiation below</p>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Requested Lease Incentives */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Requested Lease Incentives
                    </h2>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="firstMonthFree"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-border"
                                />
                              </FormControl>
                              <div className="flex-1">
                                <FormLabel className="text-sm font-medium text-foreground">First Month Free</FormLabel>
                                <p className="text-xs text-muted-foreground">Waive first month rent ($2,850 value)</p>
                              </div>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">High likelihood</span>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="reducedDeposit"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-border"
                                />
                              </FormControl>
                              <div className="flex-1">
                                <FormLabel className="text-sm font-medium text-foreground">Reduced Security Deposit</FormLabel>
                                <p className="text-xs text-muted-foreground">Lower deposit to $500 from standard $1,000</p>
                              </div>
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Medium likelihood</span>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="waiveAppFee"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-border"
                                />
                              </FormControl>
                              <div className="flex-1">
                                <FormLabel className="text-sm font-medium text-foreground">Waived Application Fee</FormLabel>
                                <p className="text-xs text-muted-foreground">Application processing fee waived ($200 value)</p>
                              </div>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Very High likelihood</span>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Applicant Qualifications */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Applicant Qualifications
                    </h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="monthlyIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-muted-foreground">Monthly Income</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="number" 
                                    placeholder="8550" 
                                    {...field} 
                                    className="pl-10 bg-background border-border focus:border-primary"
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="creditScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-muted-foreground">Credit Score</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="750" 
                                  {...field} 
                                  className="bg-background border-border focus:border-primary"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="employmentHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-muted-foreground">Employment History</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="3+ years current position" 
                                  {...field} 
                                  className="bg-background border-border focus:border-primary"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="rentalHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-muted-foreground">Rental History</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="No prior rental history" 
                                  {...field} 
                                  className="bg-background border-border focus:border-primary"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Important Terms - Editable */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Important Terms
                    </h2>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="petPolicy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-muted-foreground">Pet Policy</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-background border-border focus:border-primary"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="utilities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-muted-foreground">Utilities</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-background border-border focus:border-primary"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parking"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-muted-foreground">Parking</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-background border-border focus:border-primary"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Response Timeline */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Response Timeline
                    </h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-muted-foreground">Application Decision:</span>
                          <span className="text-foreground">Response within 24 hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-muted-foreground">Lease Signing:</span>
                          <span className="text-foreground">Available immediately upon approval</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-muted-foreground">Move-in Timeline:</span>
                          <span className="text-foreground">Can be completed within 7 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-muted-foreground">Offer Validity:</span>
                          <span className="text-foreground">Valid for 7 days from submission</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Justification */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
                      Market Justification
                    </h2>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        Based on our AI market analysis, this property is currently priced 3.4% below the local market average.
                        Similar 2-bedroom units in the area range from $2,800-$3,100, with an average rent of $2,950. The proposed
                        rent of $2,850 represents a competitive offer that accounts for current market conditions.
                      </p>
                      <p>
                        The area shows high demand with an 85% occupancy rate, and properties typically lease within 2-3 weeks.
                        End-of-quarter timing may provide additional leverage for concessions as property managers aim to meet
                        occupancy targets before their reporting period.
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-8">
                    <FormField
                      control={form.control}
                      name="userEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-muted-foreground">Contact Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your.email@example.com"
                              {...field} 
                              className="bg-background border-border focus:border-primary"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">All communication will be sent to this email</p>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-8">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-muted-foreground">Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Thank you for considering this application. I'm excited about the opportunity to call Sunshine Lake Apartments home and am prepared to move in quickly upon approval."
                              {...field} 
                              className="bg-background border-border focus:border-primary min-h-[100px]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-6 border-t border-border">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-primary hover:bg-primary/90 text-white" 
                      disabled={isGenerating || isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <Mail className="animate-pulse" size={16} />
                          <span>Sending Offer...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send size={16} />
                          <span>Submit Offer via Email</span>
                        </div>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigate(-1)}
                      className="px-8"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </div>
      </main>
    </div>
  );
};

export default GenerateOffer;