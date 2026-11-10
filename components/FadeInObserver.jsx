"use client";

import useScrollFadeIn from "@/hooks/useFadeOnScroll";

// Fades in the .fade-in elements when they scroll into view. A component
// (rendering nothing), so server-rendered pages can use the hook.
export default function FadeInObserver() {
  useScrollFadeIn();
  return null;
}
