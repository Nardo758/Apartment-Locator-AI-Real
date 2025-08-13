import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Zap, DollarSign, Calendar, FileText, Sparkles, TrendingUp, AlertCircle, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import Header from '../components/Header';

interface OfferFormData {
  userEmail: string;
  moveInDate: string;
  leaseTerm: string;
  monthlyBudget: string;
  notes: string;
}

const GenerateOffer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('property');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  const form = useForm<OfferFormData>({
    defaultValues: {
      userEmail: '',
      moveInDate: '',
      leaseTerm: '12',
      monthlyBudget: '',
      notes: ''
    }
  });

  const handleGenerateOffer = async (data: OfferFormData) => {
    setIsGenerating(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAiSuggestions({
        recommendedOffer: 2850,
        marketAnalysis: {
          averageRent: 2950,
          marketPosition: 'Competitive',
          negotiationLikelihood: 85
        },
        concessions: [
          { type: 'First Month Free', probability: 78, value: 2850 },
          { type: 'Reduced Security Deposit', probability: 65, value: 500 },
          { type: 'Waived Application Fee', probability: 90, value: 200 }
        ],
        timing: {
          optimal: true,
          reason: 'End of quarter - landlords motivated to fill units'
        }
      });
      setIsGenerating(false);
    }, 3000);
  };

  const handleSubmitOffer = async () => {
    const formData = form.getValues();
    
    if (!formData.userEmail) {
      alert('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    // Simulate email sending
    setTimeout(() => {
      setOfferSubmitted(true);
      setIsSubmitting(false);
    }, 2000);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-400';
    if (probability >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen animated-bg">
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
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                <span className="gradient-text">AI Offer Generator</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Let our AI create the perfect rental offer based on market data
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="text-primary" size={24} />
                <h2 className="text-xl font-bold text-foreground">Offer Details</h2>
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
                  <div className="glass border border-secondary/20 rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-foreground mb-2">What's Next?</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 text-left">
                      <li>• Check your email for confirmation</li>
                      <li>• Leasing office will review your offer</li>
                      <li>• They'll respond with Accept/Counter/Decline</li>
                      <li>• All future communication happens via email</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={() => navigate('/')}
                    className="btn-primary"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                <form onSubmit={form.handleSubmit(handleGenerateOffer)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="userEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Mail size={16} />
                          <span>Your Email Address</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john@example.com"
                            {...field} 
                            className="glass border-white/10 focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moveInDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Calendar size={16} />
                          <span>Preferred Move-in Date</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="glass border-white/10 focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leaseTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lease Term (months)</FormLabel>
                        <FormControl>
                          <select 
                            {...field} 
                            className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 6).map(months => (
                              <option key={months} value={months.toString()}>
                                {months} months
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <DollarSign size={16} />
                          <span>Monthly Budget</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2800" 
                            {...field} 
                            className="glass border-white/10 focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special requests or circumstances..."
                            {...field} 
                            className="glass border-white/10 focus:border-primary min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full btn-primary" 
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <Zap className="animate-pulse" size={16} />
                        <span>AI Analyzing Market...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles size={16} />
                        <span>Generate AI Offer</span>
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
              )}
            </div>

            {/* AI Suggestions Section */}
            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="text-secondary" size={24} />
                <h2 className="text-xl font-bold text-foreground">AI Market Analysis</h2>
              </div>

              {!aiSuggestions ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <p className="text-muted-foreground">
                    Fill out the form to get AI-powered market insights and offer recommendations
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Recommended Offer */}
                  <div className="glass border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Recommended Offer</span>
                      <TrendingUp className="text-primary" size={16} />
                    </div>
                    <div className="text-3xl font-bold gradient-text">
                      ${aiSuggestions.recommendedOffer.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${(aiSuggestions.marketAnalysis.averageRent - aiSuggestions.recommendedOffer).toLocaleString()} below market average
                    </p>
                  </div>

                  {/* Market Analysis */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Market Analysis</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass border border-white/5 rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">Market Average</div>
                        <div className="text-lg font-semibold text-foreground">
                          ${aiSuggestions.marketAnalysis.averageRent.toLocaleString()}
                        </div>
                      </div>
                      <div className="glass border border-white/5 rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                        <div className="text-lg font-semibold text-green-400">
                          {aiSuggestions.marketAnalysis.negotiationLikelihood}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Potential Concessions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Potential Concessions</h3>
                    <div className="space-y-3">
                      {aiSuggestions.concessions.map((concession: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 glass border border-white/5 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{concession.type}</div>
                            <div className="text-sm text-muted-foreground">
                              Value: ${concession.value.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${getProbabilityColor(concession.probability)}`}>
                              {concession.probability}%
                            </div>
                            <div className="text-xs text-muted-foreground">Likelihood</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timing Analysis */}
                  <div className="glass border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="text-green-400" size={16} />
                      <span className="font-semibold text-green-400">Optimal Timing</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {aiSuggestions.timing.reason}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      className="flex-1 btn-primary"
                      onClick={handleSubmitOffer}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <Mail className="animate-pulse" size={16} />
                          <span>Sending Email...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send size={16} />
                          <span>Submit Offer via Email</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateOffer;