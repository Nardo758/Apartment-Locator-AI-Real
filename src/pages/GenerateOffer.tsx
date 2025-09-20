import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Zap, DollarSign, Calendar, FileText, Sparkles, TrendingUp, AlertCircle, Mail, Send, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { usePropertyState } from '@/contexts/PropertyStateContext';
import { Property } from '@/data/mockData';
import { designSystem } from '@/lib/design-system';
import ModernPageLayout from '@/components/modern/ModernPageLayout';
import ModernCard from '@/components/modern/ModernCard';
import Breadcrumb from '@/components/Breadcrumb';
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
  trash: string;
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
  const { selectedProperty, setOfferFormData, offerFormData } = usePropertyState();
  
  // Get property from context or URL params
  const propertyFromParams = searchParams.get('property');
  const property: Property | null = selectedProperty || null;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  
  // Enhanced AI suggestions with property-specific data
  const [aiSuggestions, setAiSuggestions] = useState<any>({
    recommendedOffer: {
      suggestedRent: property?.effectivePrice ? `$${property.effectivePrice.toLocaleString()}` : '$2,850',
      strategy: 'Competitive pricing based on AI analysis',
      reasoning: property ? `Property shows ${property.successRate}% success rate for negotiations` : 'Property is priced below market rate, increasing acceptance likelihood'
    },
    marketAnalysis: {
      marketPosition: 'Competitive - AI optimized pricing',
      demandLevel: property ? `${property.matchScore}% match with current market demand` : 'High demand area with 85% occupancy rate',
      competitiveAnalysis: 'Similar properties analyzed by AI system'
    },
    potentialConcessions: property?.concessions?.map(c => ({
      type: c.type,
      description: `Value: ${c.value}`,
      likelihood: c.probability > 70 ? 'High' : c.probability > 50 ? 'Medium' : 'Low'
    })) || [
      { type: 'First Month Free', description: 'Waive first month rent', likelihood: 'High' },
      { type: 'Reduced Security Deposit', description: 'Lower deposit to $500', likelihood: 'Medium' },
      { type: 'Waived Application Fee', description: 'Remove $200 application fee', likelihood: 'Very High' }
    ],
    timingRecommendations: {
      bestTimeToApply: 'Within 48 hours',
      reasoning: property?.daysVacant > 30 ? 'Property has been vacant for extended period - landlord motivated' : 'End of quarter - landlords motivated to fill units before reporting period'
    },
    importantTerms: [
      { term: 'Lease Term', detail: '12 months with option to renew' },
      { term: 'Security Deposit', detail: '$500 (negotiable down from $1,000)' },
      { term: 'Pet Policy', detail: property?.petPolicy || 'Pets allowed with $250 deposit' },
      { term: 'Utilities', detail: 'Tenant responsible for electric/gas' },
      { term: 'Parking', detail: property?.parking || 'One reserved spot included' },
      { term: 'Move-in Date', detail: 'Flexible within 30 days' }
    ]
  });

  const form = useForm<OfferFormData>({
    defaultValues: {
      ...offerFormData,
      userEmail: offerFormData.userEmail || '',
      moveInDate: offerFormData.moveInDate || '',
      leaseTerm: offerFormData.leaseTerm || '12',
      monthlyBudget: offerFormData.monthlyBudget || (property?.effectivePrice?.toString() || '2850'),
      securityDeposit: offerFormData.securityDeposit || '500',
      notes: offerFormData.notes || '',
      // Important Terms
      petPolicy: offerFormData.petPolicy || (property?.petPolicy || 'Pets allowed with $250 deposit'),
      utilities: offerFormData.utilities || 'Tenant responsible for electric/gas',
      parking: offerFormData.parking || (property?.parking || 'One reserved spot included'),
      trash: offerFormData.trash || 'To be negotiated',
      // Lease Incentives
      firstMonthFree: offerFormData.firstMonthFree || false,
      reducedDeposit: offerFormData.reducedDeposit || true,
      waiveAppFee: offerFormData.waiveAppFee || true,
      // Qualifications
      monthlyIncome: offerFormData.monthlyIncome || '',
      creditScore: offerFormData.creditScore || '',
      employmentHistory: offerFormData.employmentHistory || '',
      rentalHistory: offerFormData.rentalHistory || ''
    }
  });

  // Save form data to context on changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      setOfferFormData(data);
    });
    return () => subscription.unsubscribe();
  }, [form, setOfferFormData]);

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
          trash: formData.trash,
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
          propertyId: property?.id || propertyFromParams || '1',
          aiSuggestions: aiSuggestions,
          propertyDetails: {
            id: property?.id || propertyFromParams || '1',
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
    <div className={`${designSystem.backgrounds.page} ${designSystem.backgrounds.pageDark}`}>
      <Header />
      
      <ModernPageLayout
        title="Generate AI Offer"
        subtitle={property ? `Create a compelling offer for ${property.name}` : "Create a data-driven rental offer"}
        showHeader={false}
        headerContent={
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft size={16} />
              Back to Properties
            </Button>
          </Link>
        }
      >
        <Breadcrumb />

        {offerSubmitted ? (
          <ModernCard className="text-center p-12">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                <Send className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h2 className={`${designSystem.typography.subheadingLarge} mb-4`}>Offer Sent Successfully!</h2>
                <p className={`${designSystem.typography.body} max-w-md mx-auto mb-6`}>
                  Your professional rental offer has been emailed to the leasing office. They will respond directly within 24-48 hours.
                </p>
              </div>
              <div className="glass border border-secondary/20 rounded-lg p-6 mt-6">
                <h3 className="font-semibold text-foreground mb-3">What's Next?</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    <span>Check your email for confirmation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    <span>Leasing office will review your offer</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    <span>They'll respond with Accept/Counter/Decline</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    <span>All future communication happens via email</span>
                  </li>
                </ul>
              </div>
              <Button onClick={() => navigate('/')} className="btn-primary px-8">
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGenerateOffer)} className="space-y-8">
                {/* Document Header */}
                <div className="glass-dark rounded-xl border border-white/10 p-8">
                  <div className="text-center border-b border-white/10 pb-6 mb-8">
                    <h1 className="text-2xl font-bold gradient-text mb-2">Rental Application & Offer</h1>
                    <p className="text-sm text-muted-foreground">Powered by AI Market Intelligence</p>
                    <div className="inline-flex items-center bg-gradient-primary text-white px-4 py-2 rounded-full text-xs mt-3">
                      <Sparkles size={14} className="mr-2" />
                      AI Recommended
                    </div>
                  </div>

                  {/* Property Information */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <FileText size={18} className="mr-2 text-primary" />
                      Property Information
                    </h2>
                    <div className="glass border border-white/5 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Property:</span>
                          <span className="text-foreground font-medium">Sunshine Lake Apartments</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Address:</span>
                          <span className="text-foreground font-medium">4567 Sunburst Dr, Austin, TX</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unit Type:</span>
                          <span className="text-foreground font-medium">2 bed / 2 bath - 1,120 sqft</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Listed Rent:</span>
                          <span className="text-foreground font-medium">$2,950/month</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proposed Lease Terms */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <DollarSign size={18} className="mr-2 text-primary" />
                      Proposed Lease Terms
                    </h2>
                    <div className="glass border border-white/5 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="monthlyBudget"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-foreground flex items-center">
                                  <TrendingUp size={14} className="mr-2 text-secondary" />
                                  Monthly Rent
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      type="number" 
                                      placeholder="2850" 
                                      {...field} 
                                      className="pl-10 glass border-white/10 focus:border-primary text-foreground"
                                    />
                                  </div>
                                </FormControl>
                                <p className="text-xs text-secondary">AI recommended based on market analysis</p>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="moveInDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-foreground flex items-center">
                                  <Calendar size={14} className="mr-2 text-secondary" />
                                  Move-in Date
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    {...field} 
                                    className="glass border-white/10 focus:border-primary text-foreground"
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Flexible within 30 days</p>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="leaseTerm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-foreground">Lease Term</FormLabel>
                                <FormControl>
                                  <select 
                                    {...field} 
                                    className="flex h-10 w-full rounded-md border border-white/10 glass px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
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
                                <FormLabel className="text-sm font-medium text-foreground">Security Deposit</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      type="number" 
                                      placeholder="500" 
                                      {...field} 
                                      className="pl-10 glass border-white/10 focus:border-primary text-foreground"
                                    />
                                  </div>
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Negotiable from standard $1,000</p>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Requested Lease Incentives */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <Zap size={18} className="mr-2 text-secondary" />
                      Proposed Lease Incentives
                    </h2>
                    <div className="glass border border-green-500/20 rounded-lg p-6 bg-gradient-to-br from-green-500/5 to-transparent">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="firstMonthFree"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 glass border border-white/5 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="rounded border-white/20 bg-transparent"
                                  />
                                </FormControl>
                                <div>
                                  <FormLabel className="text-sm font-medium text-foreground">First Month Free</FormLabel>
                                  <p className="text-xs text-muted-foreground">Waive first month rent ($2,850 value)</p>
                                </div>
                              </div>
                              <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
                                High Success
                              </span>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="reducedDeposit"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 glass border border-white/5 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="rounded border-white/20 bg-transparent"
                                  />
                                </FormControl>
                                <div>
                                  <FormLabel className="text-sm font-medium text-foreground">Reduced Security Deposit</FormLabel>
                                  <p className="text-xs text-muted-foreground">Lower deposit to $500 from standard $1,000</p>
                                </div>
                              </div>
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/20">
                                Medium Success
                              </span>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="waiveAppFee"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 glass border border-white/5 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="rounded border-white/20 bg-transparent"
                                  />
                                </FormControl>
                                <div>
                                  <FormLabel className="text-sm font-medium text-foreground">Waived Application Fee</FormLabel>
                                  <p className="text-xs text-muted-foreground">Application processing fee waived ($200 value)</p>
                                </div>
                              </div>
                              <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
                                Very High Success
                              </span>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Applicant Qualifications */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <AlertCircle size={18} className="mr-2 text-primary" />
                      Applicant Qualifications
                    </h2>
                    <div className="glass border border-yellow-500/20 rounded-lg p-6 bg-gradient-to-br from-yellow-500/5 to-transparent">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="monthlyIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-foreground">Monthly Income</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="number" 
                                    placeholder="8550" 
                                    {...field} 
                                    className="pl-10 glass border-white/10 focus:border-primary text-foreground"
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
                              <FormLabel className="text-sm font-medium text-foreground">Credit Score</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="750" 
                                  {...field} 
                                  className="glass border-white/10 focus:border-primary text-foreground"
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
                              <FormLabel className="text-sm font-medium text-foreground">Employment History</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="3+ years current position" 
                                  {...field} 
                                  className="glass border-white/10 focus:border-primary text-foreground"
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
                              <FormLabel className="text-sm font-medium text-foreground">Rental History</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="No prior rental history" 
                                  {...field} 
                                  className="glass border-white/10 focus:border-primary text-foreground"
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
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <FileText size={18} className="mr-2 text-primary" />
                      Important Terms
                    </h2>
                    <div className="glass border border-orange-500/20 rounded-lg p-6 bg-gradient-to-br from-orange-500/5 to-transparent">
                      <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <p className="text-sm text-orange-400 flex items-center">
                          <AlertCircle size={16} className="mr-2" />
                          These terms require further negotiation with the landlord
                        </p>
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="petPolicy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-foreground flex items-center">
                                <span className="w-2 h-2 rounded-full bg-orange-400 mr-3"></span>
                                Pet Policy
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="glass border-white/10 focus:border-primary text-foreground ml-5"
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
                              <FormLabel className="text-sm font-medium text-foreground flex items-center">
                                <span className="w-2 h-2 rounded-full bg-orange-400 mr-3"></span>
                                Utilities
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="glass border-white/10 focus:border-primary text-foreground ml-5"
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
                              <FormLabel className="text-sm font-medium text-foreground flex items-center">
                                <span className="w-2 h-2 rounded-full bg-orange-400 mr-3"></span>
                                Parking
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="glass border-white/10 focus:border-primary text-foreground ml-5"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="trash"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-foreground flex items-center">
                                <span className="w-2 h-2 rounded-full bg-orange-400 mr-3"></span>
                                Trash Service
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="glass border-white/10 focus:border-primary text-foreground ml-5"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Response Timeline */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <Calendar size={18} className="mr-2 text-secondary" />
                      Response Timeline
                    </h2>
                    <div className="glass border border-blue-500/20 rounded-lg p-6 bg-gradient-to-br from-blue-500/5 to-transparent">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between items-center p-3 glass border border-white/5 rounded-lg">
                          <span className="text-muted-foreground">Application Decision:</span>
                          <span className="text-foreground font-medium">24 hours</span>
                        </div>
                        <div className="flex justify-between items-center p-3 glass border border-white/5 rounded-lg">
                          <span className="text-muted-foreground">Lease Signing:</span>
                          <span className="text-foreground font-medium">Upon approval</span>
                        </div>
                        <div className="flex justify-between items-center p-3 glass border border-white/5 rounded-lg">
                          <span className="text-muted-foreground">Move-in Timeline:</span>
                          <span className="text-foreground font-medium">Within 7 days</span>
                        </div>
                        <div className="flex justify-between items-center p-3 glass border border-white/5 rounded-lg">
                          <span className="text-muted-foreground">Offer Validity:</span>
                          <span className="text-foreground font-medium">7 days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Justification */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <TrendingUp size={18} className="mr-2 text-secondary" />
                      Market Justification
                    </h2>
                    <div className="glass border border-white/5 rounded-lg p-6">
                      <div className="text-sm text-muted-foreground space-y-3">
                        <p>
                          Based on our AI market analysis, this property is currently priced <span className="text-secondary font-medium">3.4% below</span> the local market average.
                          Similar 2-bedroom units range from <span className="text-foreground">$2,800-$3,100</span>, with an average of $2,950.
                        </p>
                        <p>
                          The area shows <span className="text-green-400 font-medium">high demand</span> with 85% occupancy rate. End-of-quarter timing provides
                          additional leverage for concessions as property managers aim to meet occupancy targets.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <Mail size={18} className="mr-2 text-primary" />
                      Contact Information
                    </h2>
                    <div className="glass border border-white/5 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="userEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-foreground">Email Address</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="your.email@example.com"
                                  {...field} 
                                  className="glass border-white/10 focus:border-primary text-foreground"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div>
                          <FormLabel className="text-sm font-medium text-foreground">Full Name</FormLabel>
                          <Input 
                            placeholder="Your full name"
                            className="glass border-white/10 focus:border-primary text-foreground"
                          />
                        </div>
                        
                        <div>
                          <FormLabel className="text-sm font-medium text-foreground">Phone Number</FormLabel>
                          <Input 
                            placeholder="(555) 123-4567"
                            className="glass border-white/10 focus:border-primary text-foreground"
                          />
                        </div>
                        
                        <div>
                          <FormLabel className="text-sm font-medium text-foreground">Current Address</FormLabel>
                          <Input 
                            placeholder="Current address"
                            className="glass border-white/10 focus:border-primary text-foreground"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">All communication will be sent to the provided email address</p>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Additional Notes</h2>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder="Thank you for considering this application. I'm excited about the opportunity to call Sunshine Lake Apartments home and am prepared to move in quickly upon approval."
                              {...field} 
                              className="glass border-white/10 focus:border-primary text-foreground min-h-[120px] resize-none"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                    <Button 
                      type="submit" 
                      className="flex-1 btn-primary h-12" 
                      disabled={isGenerating || isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <Mail className="animate-pulse" size={18} />
                          <span>Sending Professional Offer...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send size={18} />
                          <span>Submit Offer via Email</span>
                        </div>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigate(-1)}
                      className="px-8 h-12 glass border-white/20 hover:bg-white/10 text-foreground"
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