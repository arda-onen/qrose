import { useEffect, useState } from "react";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function useParallaxOffset(speed = 0.05, maxOffset = 20) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let rafId = null;
    let prefersReducedMotion = false;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion = mediaQuery.matches;

    const updateOffset = () => {
      rafId = null;
      if (prefersReducedMotion) {
        setOffset(0);
        return;
      }
      setOffset(clamp(window.scrollY * speed, -maxOffset, maxOffset));
    };

    const onScroll = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(updateOffset);
    };

    const onMotionPreferenceChange = (event) => {
      prefersReducedMotion = event.matches;
      onScroll();
    };

    updateOffset();
    window.addEventListener("scroll", onScroll, { passive: true });
    mediaQuery.addEventListener("change", onMotionPreferenceChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      mediaQuery.removeEventListener("change", onMotionPreferenceChange);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [speed, maxOffset]);

  return { transform: `translate3d(0, ${offset}px, 0)` };
}
