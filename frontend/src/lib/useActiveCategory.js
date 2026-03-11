import { useEffect, useState } from "react";
import { categoryAnchor } from "./menuThemeUtils";

export function useActiveCategory(categoryIds) {
  const [activeCategoryId, setActiveCategoryId] = useState(categoryIds[0] || null);

  useEffect(() => {
    setActiveCategoryId(categoryIds[0] || null);
  }, [categoryIds]);

  useEffect(() => {
    if (!categoryIds.length) {
      return undefined;
    }

    let rafId = null;

    const updateActiveCategory = () => {
      rafId = null;
      const threshold = 150;
      let currentId = categoryIds[0];

      for (const categoryId of categoryIds) {
        const section = document.getElementById(categoryAnchor(categoryId));
        if (!section) {
          continue;
        }

        if (section.getBoundingClientRect().top <= threshold) {
          currentId = categoryId;
        } else {
          break;
        }
      }

      setActiveCategoryId((prev) => (prev === currentId ? prev : currentId));
    };

    const onViewportChange = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(updateActiveCategory);
    };

    updateActiveCategory();
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);

    return () => {
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [categoryIds]);

  return activeCategoryId;
}
