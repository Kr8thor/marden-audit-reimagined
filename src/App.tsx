import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuditPage from "./pages/AuditPage";
import BatchAuditPage from "./pages/BatchAuditPage";
import SiteAuditPage from "./pages/SiteAuditPage";
import EnhancedSeoAnalyzer from "./pages/EnhancedSeoAnalyzer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/audit/:url" element={<AuditPage />} />
          <Route path="/batch-audit" element={<BatchAuditPage />} />
          <Route path="/site-audit" element={<SiteAuditPage />} />
          <Route path="/enhanced" element={<EnhancedSeoAnalyzer />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;