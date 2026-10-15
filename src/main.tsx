import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPerfTier } from "./lib/perf";

initPerfTier();

createRoot(document.getElementById("root")!).render(<App />);
