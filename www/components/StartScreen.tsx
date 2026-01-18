

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useContext } from 'react';
import { ActiveTab } from '../App';
import { AppContext } from '../context/AppContext';
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  BoltIcon, 
  StyleExtractorIcon, 
  PaletteIcon,
  VectorIcon,
  TypeIcon,
  SunIcon 
} from './icons';

interface StartScreenProps {
  onStart: (tab?: ActiveTab) => void;
}

const BOOT_LOGS = [
    "KERNEL_INIT: [OK]",
    "VRAM_BUFFER: 16GB_READY",
    "DNA_SEQUENCER: ONLINE",
    "NEURAL_LATENT_MAP: LOADED",
    "ENCRYPT_CHANNEL: SECURE",
    "LINK_ESTABLISHED...",
    "PIXEL_RECON_CORE: STABLE",
    "UPLOADING_VOXEL_MAP..."
];

const ScribbleArt = ({ color = "white" }: { color?: string }) => (
    <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-[1]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path 
            d="M5,15 C25,5 75,25 95,5 M10,85 C20,95 80,75 90,95 M5,10 L95,90 M90,10 L10,95 M2,50 Q50,40 98,50 M50,2 Q40,50 50,98" 
            stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" 
            className="scribble-pattern"
        />
        <path 
            d="M30,5 L70,90 M15,75 L85,25 M45,10 C55,40 45,60 55,90 M10,45 C40,55 60,45 90,55" 
            stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" 
            className="scribble-pattern"
        />
    </svg>
);

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const { density } = useContext(AppContext);
  const [isVisible, setIsVisible] = useState(false);
  const [bootSequence, setBootSequence] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    const bootInterval = setInterval(() => {
        setBootSequence(prev => {
            if (prev < 100) return prev + Math.floor(Math.random() * 18);
            return 100;
        });
    }, 30);

    let logIdx = 0;
    const logInterval = setInterval(() => {
        if (logIdx < BOOT_LOGS.length) {
            setLogs(prev => [...prev, BOOT_LOGS[logIdx]].slice(-6));
            logIdx++;
        } else {
            clearInterval(logInterval);
        }
    }, 150);

    return () => {
        clearTimeout(timer);
        clearInterval(bootInterval);
        clearInterval(logInterval);
    };
  }, []);

  const handleLaunch = (tab?: ActiveTab) => {
    setIsVisible(false);
    setTimeout(() => onStart(tab), 500);
  };

  const modules: { id: ActiveTab; title: string; sub: string; icon: React.FC<{className?: string}>; solidColor: string }[] = [
    { id: 'flux', title: 'Flux', sub: 'GEN', icon: BoltIcon, solidColor: '#FF2D55' },
    { id: 'style_extractor', title: 'DNA', sub: 'SEQ', icon: StyleExtractorIcon, solidColor: '#A855F7' },
    { id: 'filters', title: 'FX', sub: 'PROC', icon: PaletteIcon, solidColor: '#00F0FF' },
    { id: 'vector', title: 'SVG', sub: 'PATH', icon: VectorIcon, solidColor: '#00FF9D' },
    { id: 'typography', title: 'TYPE', sub: 'GLYPH', icon: TypeIcon, solidColor: '#FF00FF' },
    { id: 'light', title: 'LIGHT', sub: 'GRADE', icon: SunIcon, solidColor: '#FCF721' }, 
  ];

  const isCompact = density === 'compact';

  return (
    <div className={`fixed inset-0 bg-black flex flex-col items-center transition-all duration-700 z-[9999] overflow-hidden ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-[#050505] to-black" />
      
      {/* Background HUD Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-px bg-white/5 rotate-12" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-px bg-white/5 -rotate-12" />
      </div>

      <div className={`relative z-10 w-full max-w-6xl px-6 flex flex-col items-center custom-scrollbar overflow-y-auto h-full pt-safe-top pb-safe-bottom ${isCompact ? 'gap-6 justify-start py-8' : 'gap-10 justify-center py-12'}`}>
        
        {/* Header Section */}
        <div className={`text-center group relative w-full ${isCompact ? 'mb-2' : 'mb-4'}`}>
           <h1 className={`${isCompact ? 'text-5xl sm:text-6xl' : 'text-8xl sm:text-9xl md:text-[14rem]'} wildstyle-logo transition-all duration-500 group-hover:scale-105 animate-fade-in`}>
              PIXSHOP
           </h1>
           <div className={`inline-block bg-white text-black font-black uppercase font-mono tracking-[0.4em] z-20 relative transform -rotate-1 group-hover:rotate-0 transition-transform ${isCompact ? 'text-[8px] px-4 py-1.5 mt-[-0.25rem]' : 'text-[14px] px-10 py-3 mt-[-1rem]'} shadow-[6px_6px_0px_#FF2D55]`}>
              Neural_Engine_Active
           </div>
        </div>

        {/* Main Entry Point */}
        <div className={`w-full max-w-sm flex flex-col items-center ${isCompact ? 'gap-3' : 'gap-6'}`}>
            <button
              onClick={() => handleLaunch()}
              className={`${isCompact ? 'h-14 text-xs tracking-[0.2em] gap-3' : 'h-24 text-base tracking-[0.5em] gap-8'} w-full bg-white/5 border-2 border-white/20 text-white font-black uppercase italic flex items-center justify-center transition-all hover:bg-white hover:text-black hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] active:scale-95 rounded-none group`}
            >
              <SparklesIcon className={`${isCompact ? 'w-5 h-5' : 'w-8 h-8'} animate-spin-slow group-hover:text-matrix`} />
              <span>INITIALIZE_DNA</span>
              <ArrowRightIcon className={`${isCompact ? 'w-5 h-5' : 'w-8 h-8'} group-hover:translate-x-2 transition-transform`} />
            </button>
            <div className={`w-full h-1.5 bg-zinc-900 border border-white/10 overflow-hidden`}>
                <div className="h-full bg-matrix transition-all duration-300 shadow-[0_0_15px_#00FF9D]" style={{ width: `${bootSequence}%` }} />
            </div>
        </div>

        {/* The Doodle Grid - Optimized for Mobile Tiling */}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full ${isCompact ? 'gap-3' : 'gap-8'}`}>
          {modules.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => handleLaunch(m.id)}
              className="group relative aspect-[1/1] sm:aspect-[4/5] w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-500 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/5 bg-zinc-950/40 backdrop-blur-md"
              style={{ transitionDelay: `${idx * 40}ms` }}
            >
                <div className="absolute inset-0 z-0 transition-opacity duration-700 opacity-0 group-hover:opacity-10" style={{ backgroundColor: m.solidColor }} />
                <ScribbleArt color={m.solidColor} />
                <div className="hover-scanline" />

                <div className="relative z-10 flex flex-col items-center justify-center w-full px-2 text-center">
                    <div className={`${isCompact ? 'w-10 h-10 mb-2' : 'w-20 h-20 mb-6'} bg-black/95 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:rotate-12 shadow-lg flex-shrink-0`}>
                        <m.icon className={`${isCompact ? 'w-5 h-5' : 'w-10 h-10'} text-white opacity-80 group-hover:opacity-100`} />
                    </div>
                    
                    <div className="bg-black/80 border border-white/10 skew-x-[-15deg] shadow-2xl transition-all group-hover:skew-x-0 transition-all">
                       <h4 className={`text-white font-black uppercase tracking-wider ${isCompact ? 'text-[11px] py-1 px-2' : 'text-sm py-2 px-4'}`}>{m.title}</h4>
                       <p className={`text-zinc-400 font-mono uppercase tracking-[0.2em] opacity-80 ${isCompact ? 'text-[7px] mt-0.5' : 'text-[9px] mt-1'}`}>{m.sub}</p>
                    </div>
                </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};