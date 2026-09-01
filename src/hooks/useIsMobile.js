import { useState, useEffect } from 'react';

/**
 * useIsMobile — Hook to detect if current viewport is mobile screen width.
 * @param {number} breakpoint - Maximum width in pixels for mobile (default: 767px for Tailwind md breakpoint)
 * @returns {boolean}
 */
export function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mediaQuery.matches);

    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}
