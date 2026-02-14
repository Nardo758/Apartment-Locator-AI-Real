import { lazy, Suspense } from "react";
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
import "./lib/data-tracker"; // Initialize data tracking

// Eagerly loaded pages (landing, auth, common public pages)
import LandingSSRSafe from "./pages/LandingSSRSafe";
import AuthModern from "./pages/AuthModern";
import NotFound from "./pages/NotFound";

// Lazy loaded pages - split into separate chunks for better performance
const About = lazy(() => import("./pages/About"));
const AIFormulaNew = lazy(() => import("./pages/AIFormulaNew"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const GenerateOffer = lazy(() => import("./pages/GenerateOffer"));
const MarketIntel = lazy(() => import("./pages/MarketIntel"));
const ProgramAIUnified = lazy(() => import("./pages/ProgramAIUnified"));
const UnifiedDashboard = lazy(() => import("./pages/UnifiedDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Billing = lazy(() => import("./pages/Billing"));
const Help = lazy(() => import("./pages/Help"));
const Contact = lazy(() => import("./pages/Contact"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Success = lazy(() => import("./pages/Success"));
const OffersMade = lazy(() => import("./pages/OffersMade"));
const DataExport = lazy(() => import("./pages/DataExport"));
const DataManagement = lazy(() => import("./pages/DataManagement"));
const Admin = lazy(() => import("./pages/Admin"));
const PortfolioDashboard = lazy(() => import("./pages/PortfolioDashboard"));
const LandlordDashboard = lazy(() => import("./pages/LandlordDashboard"));
const LandlordPricing = lazy(() => import("./pages/LandlordPricing"));
const LandlordOnboarding = lazy(() => import("./pages/LandlordOnboarding"));
const LeaseVerification = lazy(() => import("./pages/LeaseVerification"));
const SavedAndOffers = lazy(() => import("./pages/SavedAndOffers"));
const EmailTemplates = lazy(() => import("./pages/EmailTemplates"));
const RenewalOptimizer = lazy(() => import("./pages/RenewalOptimizer"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const AgentPricing = lazy(() => import("./pages/AgentPricing"));
const AgentOnboarding = lazy(() => import("./pages/AgentOnboarding"));
const UserTypeSelection = lazy(() => import("./pages/UserTypeSelection"));
const LandlordSettings = lazy(() => import("./components/landlord/LandlordSettings"));
const LandlordRetentionDashboard = lazy(() => import("./pages/LandlordRetentionDashboard"));
const BrowseScrapedProperties = lazy(() => import("./pages/BrowseScrapedProperties"));

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);


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
                <Suspense fallback={<PageLoader />}>
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
                    <Route path="/browse-properties" element={
                      <ProtectedRoute allowedUserTypes={['renter']}>
                        <BrowseScrapedProperties />
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
                </Suspense>
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
