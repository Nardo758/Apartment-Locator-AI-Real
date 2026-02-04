/**
 * Example: Property View Page with Paywall Integration
 * 
 * This example demonstrates how to integrate the paywall with property viewing.
 * Copy this pattern to your actual property pages.
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePaywall } from '@/hooks/usePaywall';
import { PaywallModalEnhanced } from '@/components/PaywallModalEnhanced';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText } from 'lucide-react';

export function PropertyViewWithPaywall() {
  const { id } = useParams<{ id: string }>();
  const {
    isPaywallOpen,
    closePaywall,
    trackPropertyView,
    trackAIScoreAccess,
    trackOfferGeneration,
    resetPaywallState,
    getRemainingViews,
  } = usePaywall();

  // Track property view when component mounts
  useEffect(() => {
    if (id) {
      trackPropertyView(id);
    }
  }, [id, trackPropertyView]);

  const handleViewAIScore = () => {
    if (id && trackAIScoreAccess(id)) {
      // User has access - show AI score
      console.log('Showing AI score for property:', id);
    } else {
      // Paywall triggered - modal will show automatically
      console.log('Paywall triggered for AI score access');
    }
  };

  const handleGenerateOffer = () => {
    if (id && trackOfferGeneration(id)) {
      // User has access - generate offer
      console.log('Generating offer for property:', id);
    } else {
      // Paywall triggered - modal will show automatically
      console.log('Paywall triggered for offer generation');
    }
  };

  const handlePaymentSuccess = () => {
    // Reset paywall state after successful payment
    resetPaywallState();
    
    // Close paywall modal
    closePaywall();
    
    // Redirect to success page or show success message
    console.log('Payment successful! User now has full access.');
  };

  const remainingViews = getRemainingViews();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Free views warning */}
        {remainingViews > 0 && remainingViews <= 2 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-900">
              <strong>Heads up!</strong> You have {remainingViews} free property {remainingViews === 1 ? 'view' : 'views'} remaining.
              Upgrade for unlimited access.
            </p>
          </div>
        )}

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Beautiful 2BR Apartment
          </h1>
          
          <div className="mb-6">
            <img 
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" 
              alt="Property" 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">Price</p>
              <p className="text-2xl font-bold text-gray-900">$2,400/mo</p>
            </div>
            <div>
              <p className="text-gray-600">Location</p>
              <p className="text-lg font-medium text-gray-900">Downtown, City Center</p>
            </div>
          </div>

          {/* Premium Features - Gated */}
          <div className="space-y-4">
            <Button
              onClick={handleViewAIScore}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              View AI Smart Score (Premium)
            </Button>

            <Button
              onClick={handleGenerateOffer}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Generate Negotiation Offer (Premium)
            </Button>
          </div>
        </div>

        {/* Basic Info - Always visible */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Property Details</h2>
          
          <div className="space-y-2">
            <p className="text-gray-600"><strong>Bedrooms:</strong> 2</p>
            <p className="text-gray-600"><strong>Bathrooms:</strong> 2</p>
            <p className="text-gray-600"><strong>Square Feet:</strong> 950</p>
            <p className="text-gray-600"><strong>Parking:</strong> 1 space included</p>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModalEnhanced
        isOpen={isPaywallOpen}
        onClose={closePaywall}
        onPaymentSuccess={handlePaymentSuccess}
        propertyViewCount={3 - remainingViews}
      />
    </div>
  );
}
