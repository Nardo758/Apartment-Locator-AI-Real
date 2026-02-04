import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyStateProvider } from "./contexts";
import { OnboardingFlowProvider } from "./contexts/OnboardingFlowContext";
import { UserProvider } from "./hooks/useUser";
import { LocationCostProvider } from "./contexts/LocationCostContext";
import { UnifiedAIProvider } from "./contexts/UnifiedAIContext";
import Landing from "./pages/Landing";
import LocationIntelligence from "./pages/LocationIntelligence";
import TestLanding from "./pages/TestLanding";
import LandingFixed from "./pages/LandingFixed";
import LandingSSRSafe from "./pages/LandingSSRSafe";
import About from "./pages/About";

import AIFormula from "./pages/AIFormula";
import AIFormulaNew from "./pages/AIFormulaNew";
import PropertyDetails from "./pages/PropertyDetails";
import GenerateOffer from "./pages/GenerateOffer";
import SavedProperties from "./pages/SavedProperties";
import MarketIntel from "./pages/MarketIntel";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthModern from "./pages/AuthModern";
import ProgramAI from "./pages/ProgramAI";
import ProgramAIUnified from "./pages/ProgramAIUnified";
import Trial from "./pages/Trial";
import LocationIntelligenceDemo from "./pages/LocationIntelligenceDemo";
import Dashboard from "./pages/Dashboard";
import UnifiedDashboard from "./pages/UnifiedDashboard";
import SetupWizard from "./pages/SetupWizard";
import RenterIntelligence from "./pages/RenterIntelligence";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PaymentSuccess from "./pages/PaymentSuccess";
import Pricing from "./pages/Pricing";
import Success from "./pages/Success";
import OffersMade from "./pages/OffersMade";
import AdvancedPricingDemo from "./pages/AdvancedPricingDemo";
import ResponsiveDashboard from "./components/design/ResponsiveDashboard";
import { RentVsBuyAnalysis } from "./components/RentVsBuyAnalysis";
import { EnhancedPricingDashboard } from "./components/EnhancedPricingDashboard";
import MarketIntelRevamped from "./pages/MarketIntelRevamped";
import DataExport from "./pages/DataExport";
import ComponentDemo from "./pages/ComponentDemo";
import AdvancedFeaturesDemo from "./pages/AdvancedFeaturesDemo";
import DataManagement from "./pages/DataManagement";
import Admin from "./pages/Admin";
import SearchDashboardDemo from "./components/demo/SearchDashboardDemo";
import PortfolioDashboard from "./pages/PortfolioDashboard";
import LandlordPricing from "./pages/LandlordPricing";
import LandlordOnboarding from "./pages/LandlordOnboarding";
import LeaseVerification from "./pages/LeaseVerification";
import "./lib/data-tracker"; // Initialize data tracking


const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <UnifiedAIProvider>
        <LocationCostProvider>
          <PropertyStateProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <OnboardingFlowProvider>
                  <Routes>
                    <Route path="/" element={<LandingSSRSafe />} />
                    <Route path="/test" element={<TestLanding />} />
                    <Route path="/original" element={<Landing />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/demo" element={<LocationIntelligenceDemo />} />
                    <Route path="/search-demo" element={<SearchDashboardDemo />} />
                    <Route path="/renter-intelligence" element={<RenterIntelligence />} />
                    <Route path="/auth" element={<AuthModern />} />
                    <Route path="/auth-original" element={<Auth />} />
                    <Route path="/signup" element={<Trial />} />
                    <Route path="/program-ai" element={<ProgramAIUnified />} />
                    <Route path="/program-ai-old" element={<ProgramAI />} />
                    <Route path="/setup-wizard" element={<SetupWizard />} />
                    <Route path="/dashboard" element={<UnifiedDashboard />} />
                    <Route path="/dashboard-old" element={<Dashboard />} />
                    <Route path="/ai-formula" element={<AIFormulaNew />} />
                    <Route path="/ai-formula-old" element={<AIFormula />} />
                    <Route path="/property/:id" element={<PropertyDetails />} />
                    <Route path="/generate-offer" element={<GenerateOffer />} />
                    <Route path="/offers-made" element={<OffersMade />} />
                    <Route path="/saved-properties" element={<SavedProperties />} />
                    <Route path="/market-intel" element={<MarketIntel />} />
                    <Route path="/market-intel-revamped" element={<MarketIntelRevamped />} />
                    <Route path="/trial" element={<Trial />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/pricing-demo" element={<AdvancedPricingDemo />} />
                    <Route path="/revenue-hub" element={<ResponsiveDashboard />} />
                    <Route path="/rent-vs-buy" element={<RentVsBuyAnalysis propertyValue={450000} currentRent={2800} location="San Francisco, CA" />} />
                    <Route path="/enhanced-pricing" element={<EnhancedPricingDashboard properties={[]} enableMLFeatures={true} enableAutomation={true} />} />
                    <Route path="/success" element={<Success />} />
            
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/data-export" element={<DataExport />} />
                    <Route path="/data-management" element={<DataManagement />} />
                    <Route path="/component-demo" element={<ComponentDemo />} />
                    <Route path="/advanced-features" element={<AdvancedFeaturesDemo />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/location-intelligence" element={<LocationIntelligence />} />
                    
                    {/* Landlord/Property Manager Routes */}
                    <Route path="/landlord-pricing" element={<LandlordPricing />} />
                    <Route path="/landlord-onboarding" element={<LandlordOnboarding />} />
                    <Route path="/portfolio-dashboard" element={<PortfolioDashboard />} />
                    
                    {/* Lease Verification & Refund */}
                    <Route path="/verify-lease" element={<LeaseVerification />} />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </OnboardingFlowProvider>
              </BrowserRouter>
            </TooltipProvider>
          </PropertyStateProvider>
        </LocationCostProvider>
      </UnifiedAIProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
