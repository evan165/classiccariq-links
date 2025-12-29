"use client";

import { useEffect } from "react";

/**
 * Triggers a client-side redirect to the native/app deep link.
 * We keep the HTML response at 200 so social scrapers can reliably read OG tags
 * while real users still bounce to the app as soon as the page loads.
 */
export function DetourRedirect({ target }: { target?: string }) {
  useEffect(() => {
    if (!target) return;

    const timer = setTimeout(() => {
      window.location.replace(target);
    }, 0);

    return () => clearTimeout(timer);
  }, [target]);

  return null;
}
