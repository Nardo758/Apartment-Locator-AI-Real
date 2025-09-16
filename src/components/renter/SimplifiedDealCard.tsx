import React from 'react';
import { MapPin, Clock, DollarSign, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type ApartmentIQData } from '@/lib/pricing-engine';

interface SimplifiedDealCardProps {
  property: {
    id: string;
    name: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    image?: string;
    apartmentIQData: ApartmentIQData;
  };
}

export const SimplifiedDealCard: React.FC<SimplifiedDealCardProps> = ({ property }) => {
  const { apartmentIQData } = property;
  
  // Calculate simplified savings
  const currentRent = apartmentIQData.currentRent;
  const effectiveRent = apartmentIQData.effectiveRent;
  const concessionValue = apartmentIQData.concessionValue;
  
  // AI Recommended reduction based on days on market and urgency
  const aiRecommendedReduction = Math.round(currentRent * 0.17); // Roughly 17% reduction
  const monthlyAvailableConcessions = Math.round(concessionValue / 12); // Monthly value of concessions
  const totalMonthlySavings = aiRecommendedReduction + monthlyAvailableConcessions;
  const annualSavings = totalMonthlySavings * 12;
  
  // Landlord loss calculation
  const dailyRentLoss = Math.round(currentRent / 30);
  const totalLandlordLoss = dailyRentLoss * apartmentIQData.daysOnMarket;
  
  // Determine deal quality and negotiate power
  const isDeal = apartmentIQData.daysOnMarket > 20 || apartmentIQData.concessionUrgency === 'aggressive';
  const negotiationPower = apartmentIQData.daysOnMarket > 30 ? 'HIGH' : 
                          apartmentIQData.daysOnMarket > 14 ? 'MEDIUM' : 'LOW';
  
  const shouldNegotiate = apartmentIQData.daysOnMarket > 14;
  const shouldWait = apartmentIQData.marketVelocity === 'hot' && apartmentIQData.daysOnMarket < 7;

  return (
    <Card className="w-full bg-background border hover:shadow-lg transition-shadow">
      {/* Hero Section */}
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Property Image Placeholder */}
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border">
            <div className="text-2xl">🏢</div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{property.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property.address}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {property.bedrooms}BR/{property.bathrooms}BA • {property.sqft} sqft
                </p>
              </div>
              {isDeal && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Great Deal
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Large Savings Callout */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-sm font-medium text-green-800 mb-2">💰 POTENTIAL SAVINGS</div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-green-700">AI Recommended Reduction</div>
                  <div className="font-bold text-green-800">${aiRecommendedReduction}/month</div>
                </div>
                <div>
                  <div className="text-green-700">Available Concessions</div>
                  <div className="font-bold text-green-800">${monthlyAvailableConcessions}/month</div>
                </div>
              </div>
              
              <div className="border-t border-green-200 pt-3">
                <div className="text-lg font-bold text-green-800">
                  TOTAL MONTHLY SAVINGS: ${totalMonthlySavings}
                </div>
                <div className="text-sm text-green-700">
                  Annual Savings: ${annualSavings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Landlord Loss Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Landlord Pressure</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Sitting empty:</span>
              <span className="font-semibold text-blue-800">{apartmentIQData.daysOnMarket} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Landlord's lost revenue:</span>
              <span className="font-semibold text-blue-800">${totalLandlordLoss.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Your negotiation leverage:</span>
              <span className={`font-bold ${
                negotiationPower === 'HIGH' ? 'text-green-600' :
                negotiationPower === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {negotiationPower}
              </span>
            </div>
          </div>
        </div>

        {/* Simple Deal Explanation */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-600" />
            Why This is a Deal
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {apartmentIQData.daysOnMarket > 20 && (
              <p>• Unit has been empty for {apartmentIQData.daysOnMarket} days - landlord is motivated</p>
            )}
            {apartmentIQData.concessionValue > 0 && (
              <p>• Already offering ${apartmentIQData.concessionValue.toLocaleString()} in concessions</p>
            )}
            {apartmentIQData.marketVelocity === 'stale' && (
              <p>• Market is slow - expect landlords to negotiate</p>
            )}
            <p>• Listed at ${currentRent.toLocaleString()}/month but likely willing to accept ${(currentRent - aiRecommendedReduction).toLocaleString()}/month</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {shouldNegotiate ? (
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Negotiate Now
            </Button>
          ) : shouldWait ? (
            <Button variant="outline" className="flex-1 border-yellow-500 text-yellow-600">
              <Clock className="w-4 h-4 mr-2" />
              Wait for Better Deal
            </Button>
          ) : (
            <Button className="flex-1">
              Apply Now
            </Button>
          )}
          
          <Button variant="outline" size="default">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};