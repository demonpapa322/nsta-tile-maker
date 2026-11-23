import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { MotionConfig, AnimatePresence } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import Tools from "./pages/Tools";

const GridSplitter = lazy(() => import("./pages/GridSplitter"));
const HashtagFinder = lazy(() => import("./pages/HashtagFinder"));
const ImageResizer = lazy(() => import("./pages/ImageResizer"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <div className="page-stack">
      <AnimatePresence mode="sync">
        <div key={location.pathname} className="page-stack-item">
          <Suspense fallback={<RouteLoading />}>
            <Routes location={location}>
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
          </Suspense>
        </div>
      </AnimatePresence>
    </div>
  );
};

const RouteLoading = () => (
  <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading tool">
    <span className="h-5 w-5 rounded-full border-2 border-muted border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Analytics />
        <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 300, damping: 30 }}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </MotionConfig>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
