import { useState, useEffect } from 'react';

export function usePointerType() {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    setIsCoarse(mediaQuery.matches);

    const handler = (e) => setIsCoarse(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isCoarse;
}
