"use client";

import { useEffect, useMemo, useState } from "react";

export type PerfTier = "low" | "mid" | "high";

/**
 * Упрощённый режим на слабых устройствах:
 * - deviceMemory / hardwareConcurrency (если доступны)
 * - prefers-reduced-motion
 */
export function usePerfTier() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReducedMotion(!!mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const tier = useMemo<PerfTier>(() => {
    if (typeof navigator === "undefined") return "high";

    const cores = (navigator as any).hardwareConcurrency as number | undefined;
    const mem = (navigator as any).deviceMemory as number | undefined;

    // conservative defaults
    const c = cores ?? 6;
    const m = mem ?? 8;

    if (reducedMotion) return "low";
    if (c <= 4 || m <= 4) return "low";
    if (c <= 6 || m <= 6) return "mid";
    return "high";
  }, [reducedMotion]);

  return { tier, reducedMotion };
}
