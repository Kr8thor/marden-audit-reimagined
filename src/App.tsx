import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuditPage from "./pages/AuditPage";
import BatchAuditPage from "./pages/BatchAuditPage";
import EnhancedSeoAnalyzer from "./pages/EnhancedSeoAnalyzer";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import TestCrawl from "./pages/TestCrawl";
import MockDebugger from "./pages/MockDebugger";

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
          <Route path="/enhanced-analyzer" element={<EnhancedSeoAnalyzer />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="/test-crawl" element={<TestCrawl />} />
          <Route path="/mock-debugger" element={<MockDebugger />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;