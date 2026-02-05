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
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import LandingSSRSafe from "./pages/LandingSSRSafe";
import About from "./pages/About";
import AIFormulaNew from "./pages/AIFormulaNew";
import PropertyDetails from "./pages/PropertyDetails";
import GenerateOffer from "./pages/GenerateOffer";
import MarketIntel from "./pages/MarketIntel";
import NotFound from "./pages/NotFound";
import AuthModern from "./pages/AuthModern";
import ProgramAIUnified from "./pages/ProgramAIUnified";
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
import LandlordDashboard from "./pages/LandlordDashboard";
import LandlordPricing from "./pages/LandlordPricing";
import LandlordOnboarding from "./pages/LandlordOnboarding";
import LeaseVerification from "./pages/LeaseVerification";
import SavedAndOffers from "./pages/SavedAndOffers";
import EmailTemplates from "./pages/EmailTemplates";
import RenewalOptimizer from "./pages/RenewalOptimizer";
import AgentDashboard from "./pages/AgentDashboard";
import AgentPricing from "./pages/AgentPricing";
import AgentOnboarding from "./pages/AgentOnboarding";
import UserTypeSelection from "./pages/UserTypeSelection";
import LandlordSettings from "./components/landlord/LandlordSettings";
import LandlordRetentionDashboard from "./pages/LandlordRetentionDashboard";
import "./lib/data-tracker"; // Initialize data tracking


const App = () => (
  <ErrorBoundary>
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
                    {/* Public Routes - No Authentication Required */}
                    <Route path="/" element={<LandingSSRSafe />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/landlord-pricing" element={<LandlordPricing />} />
                    <Route path="/agent-pricing" element={<AgentPricing />} />
                    
                    {/* Auth Routes */}
                    <Route path="/auth" element={<AuthModern />} />
                    <Route path="/signup" element={<AuthModern />} />
                    <Route path="/trial" element={<AuthModern />} />
                    
                    {/* Support & Legal - Public Access */}
                    <Route path="/help" element={<Help />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    
                    {/* User Type Selection - Requires Auth */}
                    <Route path="/user-type" element={
                      <ProtectedRoute requireAuth>
                        <UserTypeSelection />
                      </ProtectedRoute>
                    } />
                    
                    {/* Renter Dashboard - Requires Account */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute requireAuth>
                        <UnifiedDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute requireAuth>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/billing" element={
                      <ProtectedRoute requireAuth>
                        <Billing />
                      </ProtectedRoute>
                    } />
                    <Route path="/data-export" element={
                      <ProtectedRoute requireAuth>
                        <DataExport />
                      </ProtectedRoute>
                    } />
                    <Route path="/data-management" element={
                      <ProtectedRoute requireAuth>
                        <DataManagement />
                      </ProtectedRoute>
                    } />
                    
                    {/* Renter-Specific Routes */}
                    <Route path="/program-ai" element={
                      <ProtectedRoute allowedUserTypes={['renter']}>
                        <ProgramAIUnified />
                      </ProtectedRoute>
                    } />
                    <Route path="/ai-formula" element={
                      <ProtectedRoute allowedUserTypes={['renter']}>
                        <AIFormulaNew />
                      </ProtectedRoute>
                    } />
                    <Route path="/market-intel" element={
                      <ProtectedRoute allowedUserTypes={['renter']}>
                        <MarketIntel />
                      </ProtectedRoute>
                    } />
                    <Route path="/saved-properties" element={
                      <ProtectedRoute allowedUserTypes={['renter']}>
                        <SavedAndOffers />
                      </ProtectedRoute>
                    } />
                    <Route path="/property/:id" element={
                      <ProtectedRoute allowedUserTypes={['renter']}>
                        <PropertyDetails />
                      </ProtectedRoute>
                    } />
                    <Route path="/generate-offer" element={
                      <ProtectedRoute allowedUserTypes={['renter']}>
                        <GenerateOffer />
                      </ProtectedRoute>
                    } />
                    <Route path="/offers-made" element={
                      <ProtectedRoute allowedUserTypes={['renter']}>
                        <OffersMade />
                      </ProtectedRoute>
                    } />
                    <Route path="/payment-success" element={
                      <ProtectedRoute allowedUserTypes={['renter']}>
                        <PaymentSuccess />
                      </ProtectedRoute>
                    } />
                    <Route path="/success" element={
                      <ProtectedRoute allowedUserTypes={['renter']}>
                        <Success />
                      </ProtectedRoute>
                    } />
                    
                    {/* Landlord-Specific Routes */}
                    <Route path="/landlord-onboarding" element={
                      <ProtectedRoute allowedUserTypes={['landlord']}>
                        <LandlordOnboarding />
                      </ProtectedRoute>
                    } />
                    <Route path="/portfolio-dashboard" element={
                      <ProtectedRoute allowedUserTypes={['landlord']}>
                        <PortfolioDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/landlord-dashboard" element={
                      <ProtectedRoute allowedUserTypes={['landlord']}>
                        <LandlordRetentionDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/landlord-dashboard-old" element={
                      <ProtectedRoute allowedUserTypes={['landlord']}>
                        <LandlordDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/landlord/settings" element={
                      <ProtectedRoute allowedUserTypes={['landlord']}>
                        <LandlordSettings />
                      </ProtectedRoute>
                    } />
                    <Route path="/email-templates" element={
                      <ProtectedRoute allowedUserTypes={['landlord']}>
                        <EmailTemplates />
                      </ProtectedRoute>
                    } />
                    <Route path="/renewal-optimizer" element={
                      <ProtectedRoute allowedUserTypes={['landlord']}>
                        <RenewalOptimizer />
                      </ProtectedRoute>
                    } />
                    <Route path="/verify-lease" element={
                      <ProtectedRoute allowedUserTypes={['landlord']}>
                        <LeaseVerification />
                      </ProtectedRoute>
                    } />
                    
                    {/* Agent-Specific Routes */}
                    <Route path="/agent-onboarding" element={
                      <ProtectedRoute allowedUserTypes={['agent']}>
                        <AgentOnboarding />
                      </ProtectedRoute>
                    } />
                    <Route path="/agent-dashboard" element={
                      <ProtectedRoute allowedUserTypes={['agent']}>
                        <AgentDashboard />
                      </ProtectedRoute>
                    } />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute allowedUserTypes={['admin']}>
                        <Admin />
                      </ProtectedRoute>
                    } />
                    
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
  </ErrorBoundary>
);

export default App;
