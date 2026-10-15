import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MotionConfig, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { usePerfTier } from "@/lib/perf";
import { pick } from "@/lib/springs";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import GridSplitter from "./pages/GridSplitter";
import HashtagFinder from "./pages/HashtagFinder";
import ImageResizer from "./pages/ImageResizer";
import Tools from "./pages/Tools";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Tools />} />
        <Route path="/grid-splitter" element={<GridSplitter />} />
        <Route path="/caption-generator" element={<ComingSoon title="Caption Generator" />} />
        <Route path="/hashtag-finder" element={<HashtagFinder />} />
        <Route path="/image-resizer" element={<ImageResizer />} />
        <Route path="/image-generator" element={<ComingSoon title="AI Image Generator" />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/trend-scout" element={<ComingSoon title="Viral Trend Scout" />} />
        <Route path="/post-scheduler" element={<ComingSoon title="Post Scheduler" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const tier = usePerfTier();
  return (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Analytics />
        <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion={tier === "low" ? "always" : "user"} transition={pick(tier)}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </MotionConfig>
        </LazyMotion>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
  );
};

export default App;
