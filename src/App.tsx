import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyStateProvider } from "./contexts";
import { OnboardingFlowProvider } from "./contexts/OnboardingFlowContext";
import Landing from "./pages/Landing";
import TestLanding from "./pages/TestLanding";
import LandingFixed from "./pages/LandingFixed";
import LandingSSRSafe from "./pages/LandingSSRSafe";
import About from "./pages/About";

import AIFormula from "./pages/AIFormula";
import PropertyDetails from "./pages/PropertyDetails";
import GenerateOffer from "./pages/GenerateOffer";
import SavedProperties from "./pages/SavedProperties";
import MarketIntel from "./pages/MarketIntel";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthModern from "./pages/AuthModern";
import ProgramAI from "./pages/ProgramAI";
import Trial from "./pages/Trial";
import LocationIntelligenceDemo from "./pages/LocationIntelligenceDemo";
import Dashboard from "./pages/Dashboard";
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
import "./lib/data-tracker"; // Initialize data tracking


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/renter-intelligence" element={<RenterIntelligence />} />
            <Route path="/auth" element={<AuthModern />} />
            <Route path="/auth-original" element={<Auth />} />
            <Route path="/signup" element={<Trial />} />
            <Route path="/program-ai" element={<ProgramAI />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-formula" element={<AIFormula />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </OnboardingFlowProvider>
        </BrowserRouter>
      </TooltipProvider>
    </PropertyStateProvider>
  </QueryClientProvider>
);

export default App;
