
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { BoltIcon } from './icons';

interface HeaderProps {
    isPlatinumTier: boolean;
    onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isPlatinumTier, onGoHome }) => {
  return (
    <header className="w-full pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 px-6 relative z-30 shrink-0">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div 
            onClick={onGoHome} 
            className="flex items-center gap-3 group cursor-pointer"
            title="Session Home"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all shadow-glass">
                <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl wildstyle-logo select-none leading-none tracking-tight text-white drop-shadow-md">
                PIXSH<span>O</span>P
              </h1>
              <div className="text-[9px] font-mono text-white/50 uppercase tracking-[0.3em] font-bold">Liquid Synthesis</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                  <span className="text-[9px] font-bold font-mono text-white/70 uppercase tracking-widest">Connected</span>
              </div>
          </div>
      </div>
    </header>
  );
};