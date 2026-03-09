import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MotionConfig, AnimatePresence } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import Home from "./pages/Home";
import GridSplitter from "./pages/GridSplitter";
import CaptionGenerator from "./pages/CaptionGenerator";
import HashtagFinder from "./pages/HashtagFinder";
import ImageResizer from "./pages/ImageResizer";
import ImageGenerator from "./pages/ImageGenerator";
import TrendScout from "./pages/TrendScout";
import PostScheduler from "./pages/PostScheduler";
import Tools from "./pages/Tools";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/grid-splitter" element={<GridSplitter />} />
      <Route path="/caption-generator" element={<CaptionGenerator />} />
      <Route path="/hashtag-finder" element={<HashtagFinder />} />
      <Route path="/image-resizer" element={<ImageResizer />} />
      <Route path="/image-generator" element={<ImageGenerator />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/trend-scout" element={<TrendScout />} />
      <Route path="/post-scheduler" element={<PostScheduler />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

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
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </MotionConfig>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
