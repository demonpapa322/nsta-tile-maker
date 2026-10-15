import { useSyncExternalStore } from "react";

export type PerfTier = "low" | "high";

let tier: PerfTier = "high";
const listeners = new Set<() => void>();

function setTier(next: PerfTier) {
  if (tier === next) return;
  tier = next;
  document.documentElement.dataset.perf = next;
  listeners.forEach((l) => l());
}

function staticCheck(): PerfTier {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if ((nav.hardwareConcurrency ?? 8) <= 4) return "low";
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return "low";
  if (nav.connection?.saveData) return "low";
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "low";
  return "high";
}

/** Run once on startup: static device checks + 1s frame-time probe. */
export function initPerfTier() {
  if (typeof window === "undefined") return;
  tier = staticCheck();
  document.documentElement.dataset.perf = tier;

  // Pause non-essential CSS animation while the tab is hidden
  const onVis = () => {
    document.documentElement.toggleAttribute("data-hidden", document.hidden);
  };
  document.addEventListener("visibilitychange", onVis);

  if (tier === "low") return;
  let frames = 0;
  let start = 0;
  let last = 0;
  const step = (t: number) => {
    if (!start) start = last = t;
    else frames++;
    last = t;
    if (t - start < 1000) requestAnimationFrame(step);
    else if (frames > 0 && (last - start) / frames > 24) setTier("low");
  };
  requestAnimationFrame(step);
}

export function getPerfTier() {
  return tier;
}

export function usePerfTier(): PerfTier {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => tier,
    () => "high",
  );
}
