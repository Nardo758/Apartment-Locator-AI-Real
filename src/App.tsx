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
import LandingSSRSafe from "./pages/LandingSSRSafe";
import About from "./pages/About";
import AIFormulaNew from "./pages/AIFormulaNew";
import PropertyDetails from "./pages/PropertyDetails";
import GenerateOffer from "./pages/GenerateOffer";
import MarketIntel from "./pages/MarketIntel";
import NotFound from "./pages/NotFound";
import AuthModern from "./pages/AuthModern";
import ProgramAIUnified from "./pages/ProgramAIUnified";
import Trial from "./pages/Trial";
import UnifiedDashboard from "./pages/UnifiedDashboard";
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
import DataExport from "./pages/DataExport";
import DataManagement from "./pages/DataManagement";
import Admin from "./pages/Admin";
import PortfolioDashboard from "./pages/PortfolioDashboard";
import LandlordPricing from "./pages/LandlordPricing";
import LandlordOnboarding from "./pages/LandlordOnboarding";
import LeaseVerification from "./pages/LeaseVerification";
import SavedAndOffers from "./pages/SavedAndOffers";
import EmailTemplates from "./pages/EmailTemplates";
import RenewalOptimizer from "./pages/RenewalOptimizer";
import AgentDashboard from "./pages/AgentDashboard";
import AgentPricing from "./pages/AgentPricing";
import UserTypeSelection from "./pages/UserTypeSelection";
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
                    {/* Main App Routes */}
                    <Route path="/" element={<LandingSSRSafe />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/pricing" element={<Pricing />} />
                    
                    {/* Auth Routes */}
                    <Route path="/auth" element={<AuthModern />} />
                    <Route path="/signup" element={<Trial />} />
                    <Route path="/trial" element={<Trial />} />
                    <Route path="/user-type" element={<UserTypeSelection />} />
                    
                    {/* Dashboard & Main Features */}
                    <Route path="/dashboard" element={<UnifiedDashboard />} />
                    <Route path="/program-ai" element={<ProgramAIUnified />} />
                    <Route path="/ai-formula" element={<AIFormulaNew />} />
                    <Route path="/market-intel" element={<MarketIntel />} />
                    <Route path="/saved-properties" element={<SavedAndOffers />} />
                    
                    {/* Property & Offers */}
                    <Route path="/property/:id" element={<PropertyDetails />} />
                    <Route path="/generate-offer" element={<GenerateOffer />} />
                    <Route path="/offers-made" element={<OffersMade />} />
                    
                    {/* User Account */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/data-export" element={<DataExport />} />
                    <Route path="/data-management" element={<DataManagement />} />
                    
                    {/* Support & Legal */}
                    <Route path="/help" element={<Help />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    
                    {/* Payment */}
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/success" element={<Success />} />
                    
                    {/* Landlord/Property Manager Routes */}
                    <Route path="/landlord-pricing" element={<LandlordPricing />} />
                    <Route path="/landlord-onboarding" element={<LandlordOnboarding />} />
                    <Route path="/portfolio-dashboard" element={<PortfolioDashboard />} />
                    <Route path="/email-templates" element={<EmailTemplates />} />
                    <Route path="/renewal-optimizer" element={<RenewalOptimizer />} />
                    <Route path="/verify-lease" element={<LeaseVerification />} />
                    
                    {/* Agent/Broker Routes */}
                    <Route path="/agent-dashboard" element={<AgentDashboard />} />
                    <Route path="/agent-pricing" element={<AgentPricing />} />
                    
                    {/* Admin */}
                    <Route path="/admin" element={<Admin />} />
                    
                    {/* 404 Catch-all */}
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
