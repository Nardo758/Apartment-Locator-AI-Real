import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  CheckCircle,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Star,
  ArrowRight
} from 'lucide-react';

export default function LeaseVerification() {
  const [step, setStep] = useState<'upload' | 'review' | 'approved'>('upload');
  const [leaseFile, setLeaseFile] = useState<File | null>(null);
  const [leaseDetails, setLeaseDetails] = useState({
    propertyName: '',
    finalRent: '',
    leaseSignedDate: '',
    moveInDate: ''
  });

  // Mock data - in production, fetch from purchase record
  const mockPurchaseData = {
    purchaseId: 'purch_abc123',
    predictedSavings: 3847, // Annual
    predictedRent: 2100,
    originalAskingRent: 2300,
    purchaseDate: '2026-02-04'
  };

  const calculateRefund = () => {
    const finalRent = parseInt(leaseDetails.finalRent) || 0;
    const monthlySavings = mockPurchaseData.originalAskingRent - finalRent;
    
    // Refund tiers
    if (monthlySavings >= 100) {
      return { amount: 25, percentage: 50, tier: 'gold' };
    } else if (monthlySavings >= 50) {
      return { amount: 15, percentage: 30, tier: 'silver' };
    } else if (monthlySavings >= 1) {
      return { amount: 10, percentage: 20, tier: 'bronze' };
    } else if (monthlySavings === 0 && finalRent === mockPurchaseData.predictedRent) {
      return { amount: 5, percentage: 10, tier: 'bonus' };
    }
    return { amount: 0, percentage: 0, tier: 'none' };
  };

  const refund = calculateRefund();
  const finalRent = parseInt(leaseDetails.finalRent) || 0;
  const actualSavings = mockPurchaseData.originalAskingRent - finalRent;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLeaseFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, upload to backend for verification
    setStep('review');
  };

  const handleApprove = () => {
    // In production, trigger refund via Stripe
    setStep('approved');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="success" size="lg" className="mb-4">
            <DollarSign className="w-4 h-4 mr-2" />
            Verify Your Lease & Get Refund
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            Show Us Your Success Story
          </h1>
          <p className="text-white/60 text-lg">
            Upload your signed lease and get money back based on how much you saved
          </p>
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            {/* How It Works */}
            <Card variant="highlighted" className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Upload Your Signed Lease</p>
                    <p className="text-white/60 text-sm">PDF, DOCX, or image files accepted</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">We Verify Your Savings</p>
                    <p className="text-white/60 text-sm">Confirm the rent amount you negotiated</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Get Your Refund</p>
                    <p className="text-white/60 text-sm">$10-25 back based on your savings!</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Refund Tiers */}
            <Card variant="elevated" className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Refund Tiers</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-400 mb-1">$25</div>
                  <div className="text-sm text-white/70 mb-2">50% Refund</div>
                  <div className="text-xs text-white/50">Saved $100+/mo</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-400/10 border border-gray-400/30 text-center">
                  <Star className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-300 mb-1">$15</div>
                  <div className="text-sm text-white/70 mb-2">30% Refund</div>
                  <div className="text-xs text-white/50">Saved $50-99/mo</div>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                  <Star className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400 mb-1">$10</div>
                  <div className="text-sm text-white/70 mb-2">20% Refund</div>
                  <div className="text-xs text-white/50">Saved $1-49/mo</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                  <CheckCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400 mb-1">$5</div>
                  <div className="text-sm text-white/70 mb-2">Accuracy Bonus</div>
                  <div className="text-xs text-white/50">Matched prediction</div>
                </div>
              </div>
            </Card>

            {/* Upload Form */}
            <Card variant="elevated" className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="label mb-3 text-lg font-semibold">
                    Upload Your Signed Lease
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors">
                    {leaseFile ? (
                      <div className="space-y-3">
                        <FileText className="w-12 h-12 text-green-400 mx-auto" />
                        <div>
                          <p className="text-white font-semibold">{leaseFile.name}</p>
                          <p className="text-white/50 text-sm">
                            {(leaseFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLeaseFile(null)}
                        >
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-white/40 mx-auto" />
                        <div>
                          <label htmlFor="lease-file" className="cursor-pointer">
                            <span className="text-blue-400 hover:text-blue-300 font-semibold">
                              Click to upload
                            </span>
                            <span className="text-white/60"> or drag and drop</span>
                          </label>
                          <p className="text-white/50 text-sm mt-1">
                            PDF, DOCX, PNG, JPG up to 10MB
                          </p>
                        </div>
                        <input
                          id="lease-file"
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Lease Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label mb-2">Property Name</label>
                    <Input
                      placeholder="ARIUM Downtown"
                      value={leaseDetails.propertyName}
                      onChange={(e) => setLeaseDetails({ ...leaseDetails, propertyName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label mb-2">Final Monthly Rent</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
                      <Input
                        type="number"
                        placeholder="2100"
                        value={leaseDetails.finalRent}
                        onChange={(e) => setLeaseDetails({ ...leaseDetails, finalRent: e.target.value })}
                        required
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label mb-2">Lease Signed Date</label>
                    <Input
                      type="date"
                      value={leaseDetails.leaseSignedDate}
                      onChange={(e) => setLeaseDetails({ ...leaseDetails, leaseSignedDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label mb-2">Move-In Date</label>
                    <Input
                      type="date"
                      value={leaseDetails.moveInDate}
                      onChange={(e) => setLeaseDetails({ ...leaseDetails, moveInDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Your Purchase Info */}
                <Card variant="glass" className="p-4">
                  <h4 className="text-sm font-semibold text-white/70 mb-3">
                    Your Original Search (Feb 4, 2026)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-white/50">Original Asking:</span>
                      <span className="text-white font-semibold ml-2">
                        ${mockPurchaseData.originalAskingRent}/mo
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50">We Predicted:</span>
                      <span className="text-white font-semibold ml-2">
                        ${mockPurchaseData.predictedRent}/mo
                      </span>
                    </div>
                  </div>
                </Card>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!leaseFile || !leaseDetails.finalRent}
                >
                  Submit for Verification
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 'review' && (
          <div className="space-y-6">
            <Card variant="elevated" className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Reviewing Your Lease
                </h2>
                <p className="text-white/60">
                  Please confirm the details below are correct
                </p>
              </div>

              {/* Verification Details */}
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Lease Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-white/50 text-sm">Property</div>
                      <div className="text-white font-semibold">{leaseDetails.propertyName}</div>
                    </div>
                    <div>
                      <div className="text-white/50 text-sm">Final Rent</div>
                      <div className="text-white font-semibold">${leaseDetails.finalRent}/mo</div>
                    </div>
                    <div>
                      <div className="text-white/50 text-sm">Lease Signed</div>
                      <div className="text-white font-semibold">{leaseDetails.leaseSignedDate}</div>
                    </div>
                    <div>
                      <div className="text-white/50 text-sm">Move-In Date</div>
                      <div className="text-white font-semibold">{leaseDetails.moveInDate}</div>
                    </div>
                  </div>
                </div>

                {/* Savings Calculation */}
                <div className="p-6 rounded-xl bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30">
                  <h3 className="text-lg font-bold text-white mb-4">Your Savings</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-white/60 text-sm mb-1">Original Asking</div>
                      <div className="text-2xl font-bold text-white">
                        ${mockPurchaseData.originalAskingRent}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm mb-1">You Negotiated</div>
                      <div className="text-2xl font-bold text-green-400">
                        ${leaseDetails.finalRent}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm mb-1">Monthly Savings</div>
                      <div className="text-2xl font-bold text-green-400">
                        ${actualSavings}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">
                      Annual Savings: ${actualSavings * 12}
                    </span>
                  </div>
                </div>

                {/* Refund Amount */}
                <Card variant="highlighted" className="p-6 text-center">
                  <Badge 
                    variant={refund.tier === 'gold' ? 'success' : refund.tier === 'silver' ? 'primary' : 'warning'} 
                    size="lg" 
                    className="mb-4"
                  >
                    {refund.tier.toUpperCase()} TIER
                  </Badge>
                  <div className="mb-2">
                    <span className="text-white/60">Your Refund:</span>
                  </div>
                  <div className="text-5xl font-bold text-green-400 mb-2">
                    ${refund.amount}
                  </div>
                  <div className="text-white/60 mb-6">
                    {refund.percentage}% of your $49 purchase
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setStep('upload')}
                    >
                      Go Back
                    </Button>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600"
                      onClick={handleApprove}
                    >
                      Confirm & Process Refund
                    </Button>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Approved */}
        {step === 'approved' && (
          <Card variant="highlighted" className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Refund Approved!
            </h2>
            <p className="text-white/70 text-lg mb-6">
              ${refund.amount} will be refunded to your original payment method within 5-7 business days
            </p>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10 mb-6 max-w-md mx-auto">
              <div className="text-white/60 text-sm mb-2">Total Verified Savings</div>
              <div className="text-4xl font-bold text-green-400 mb-2">
                ${actualSavings * 12}
              </div>
              <div className="text-white/60 text-sm">per year</div>
            </div>

            <div className="space-y-3 mb-8">
              <p className="text-white/80">
                🎉 Congratulations on your successful negotiation!
              </p>
              <p className="text-white/60 text-sm">
                Your verified savings help us improve recommendations for future users
              </p>
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              onClick={() => window.location.href = '/dashboard'}
            >
              Return to Dashboard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
