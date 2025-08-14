import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyStateProvider } from "./contexts/PropertyStateContext";
import Landing from "./pages/Landing";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Signup from "./pages/Signup";
import SignupNew from "./pages/SignupNew";
import Dashboard from "./pages/Dashboard";
import DashboardNew from "./pages/DashboardNew";
import AIFormula from "./pages/AIFormula";
import PropertyDetails from "./pages/PropertyDetails";
import GenerateOffer from "./pages/GenerateOffer";
import NotFound from "./pages/NotFound";

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
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup-new" element={<SignupNew />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-new" element={<DashboardNew />} />
            <Route path="/ai-formula" element={<AIFormula />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/generate-offer" element={<GenerateOffer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PropertyStateProvider>
  </QueryClientProvider>
);

export default App;
