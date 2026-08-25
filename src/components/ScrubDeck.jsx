import React, { useEffect } from 'react';
import { Play } from 'lucide-react';
import { usePointerType } from '../hooks/usePointerType';

export default function ScrubDeck({ isActive, progress, onScrub }) {
  const isCoarse = usePointerType();

  useEffect(() => {
    if (isActive && !isCoarse) {
      onScrub(progress);
    }
  }, [isActive, isCoarse, progress, onScrub]);

  if (isCoarse) {
    return (
      <div className={`absolute inset-0 bg-navy-deep/60 flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-12 h-12 rounded-full bg-blue-accent flex items-center justify-center text-navy-deep">
          <Play size={20} fill="currentColor" className="ml-1" />
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-navy-deep/90 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-full h-1 bg-divider rounded-full overflow-hidden relative">
        <div 
          className="absolute top-0 left-0 h-full bg-onair-red transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 font-mono text-[9px] text-ivory">
        <span>PREVIEW</span>
        <span>{Math.floor(progress)}%</span>
      </div>
    </div>
  );
}
