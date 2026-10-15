import type { Transition } from "framer-motion";
import type { PerfTier } from "./perf";

export const springs = {
  standard: { type: "spring", stiffness: 300, damping: 30 } as Transition,
  sheet: { type: "spring", stiffness: 220, damping: 26, mass: 1.2 } as Transition,
};

export const lowTierTransition: Transition = { duration: 0.15 };

export function pick(tier: PerfTier, kind: keyof typeof springs = "standard"): Transition {
  return tier === "low" ? lowTierTransition : springs[kind];
}
