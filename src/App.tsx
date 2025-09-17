import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyStateProvider } from "./contexts/PropertyStateContext";
import Landing from "./pages/Landing";
import About from "./pages/About";
import DashboardNew from "./pages/DashboardNew";
import AIFormula from "./pages/AIFormula";
import PropertyDetails from "./pages/PropertyDetails";
import GenerateOffer from "./pages/GenerateOffer";
import SavedProperties from "./pages/SavedProperties";
import MarketIntel from "./pages/MarketIntel";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProgramAI from "./pages/ProgramAI";
import Trial from "./pages/Trial";
import LocationIntelligenceDemo from "./pages/LocationIntelligenceDemo";
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


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PropertyStateProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/demo" element={<LocationIntelligenceDemo />} />
            <Route path="/renter-intelligence" element={<RenterIntelligence />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Trial />} />
            <Route path="/program-ai" element={<ProgramAI />} />
            <Route path="/dashboard" element={<DashboardNew />} />
            <Route path="/ai-formula" element={<AIFormula />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/generate-offer" element={<GenerateOffer />} />
            <Route path="/saved-properties" element={<SavedProperties />} />
            <Route path="/market-intel" element={<MarketIntel />} />
            <Route path="/trial" element={<Trial />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/success" element={<Success />} />
            
            <Route path="/profile" element={<Profile />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/help" element={<Help />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PropertyStateProvider>
  </QueryClientProvider>
);

export default App;
