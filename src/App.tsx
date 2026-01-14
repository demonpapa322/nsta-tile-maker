import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MotionConfig, AnimatePresence } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import Home from "./pages/Home";
import GridSplitter from "./pages/GridSplitter";
import CaptionGenerator from "./pages/CaptionGenerator";
import HashtagFinder from "./pages/HashtagFinder";
import ImageResizer from "./pages/ImageResizer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/grid-splitter" element={<GridSplitter />} />
        <Route path="/caption-generator" element={<CaptionGenerator />} />
        <Route path="/hashtag-finder" element={<HashtagFinder />} />
        <Route path="/image-resizer" element={<ImageResizer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Analytics />
        <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 400, damping: 35, restDelta: 0.001, restSpeed: 0.001 }}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </MotionConfig>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
