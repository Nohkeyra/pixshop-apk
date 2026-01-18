

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef } from 'react';

const urbanPhrases = ['SHAKING CAN', 'MIXING PIGMENT', 'CUTTING STENCIL', 'BUFFING WALL', 'PRIMING SURFACE', 'IGNITING NEURONS', 'CALIBRATING FLUX'];

const systemLogs = [
    "Initializing neural handshake...",
    "Allocating VRAM tensors [==================] 100%",
    "Loading LoRA weights: URBAN_V9.safetensors",
    "Quantizing latent vectors...",
    "Denoising steps: 0/25",
    "Injecting controlnet guidance...",
    "Refining high-frequency details...",
    "Upcasting precision to float16...",
    "Rasterizing vector paths...",
    "Applying post-processing filters...",
    "Compiling shader cache...",
    "Verifying output integrity...",
    "System stable. Rendering..."
];

interface SpinnerProps {
  instruction?: string | null;
}

export const Spinner: React.FC<SpinnerProps> = ({ instruction }) => {
  const [phrase, setPhrase] = useState(urbanPhrases[0]);
  const [logs, setLogs] = useState<string[]>([]);
  const logIndexRef = useRef(0);
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
        index = (index + 1) % urbanPhrases.length;
        setPhrase(urbanPhrases[index]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
          const nextLog = systemLogs[logIndexRef.current % systemLogs.length];
          setLogs(prev => {
              const newLogs = [...prev, nextLog];
              return newLogs.slice(-5); // Keep last 5 lines
          });
          logIndexRef.current++;
      }, 300);
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-sm p-4">
        {/* Background Glow */}
        <div className="absolute w-80 h-80 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
        
        {/* Spray Can Visualization */}
        <div className="relative w-24 h-40 mb-8 flex flex-col items-center group z-10 scale-90 sm:scale-100 transition-transform">
            {/* Spray Mist Effect */}
            <div className="absolute -top-12 w-24 h-24 bg-primary/30 blur-2xl rounded-full animate-pulse" />
            
            {/* Can Top */}
            <div className="w-10 h-4 bg-zinc-400 rounded-t-lg relative">
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-4 h-8 bg-zinc-500 rounded-sm animate-can-rattle" />
            </div>
            {/* Can Body */}
            <div className="w-16 h-32 bg-zinc-100 border-4 border-zinc-800 flex flex-col items-center justify-center overflow-hidden relative shadow-[0_0_30px_rgba(255,92,0,0.3)]">
                <div className="absolute inset-0 bg-primary/10 animate-overspray-pulse" />
                <div className="w-full h-8 bg-primary mt-4 flex items-center justify-center -rotate-6 border-y-2 border-black">
                    <span className="text-[10px] font-black text-black uppercase">PIX</span>
                </div>
                <div className="mt-auto mb-4 text-[8px] font-mono text-zinc-500 uppercase tracking-tighter font-bold">NEURAL_INK</div>
            </div>
        </div>

        {/* Text Metadata */}
        <div className="flex flex-col items-center gap-3 w-full z-10">
             <div className="text-white font-display text-2xl sm:text-3xl font-black italic tracking-widest uppercase text-center animate-pulse drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {instruction || phrase}
             </div>
             
             {/* Stylized Progress Bar */}
             <div className="w-full h-1 bg-zinc-800 relative overflow-hidden rounded-full">
                 <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-1/2 h-full animate-[shimmer_1s_infinite_linear]" 
                 />
             </div>

             {/* Terminal Logs */}
             <div className="w-full bg-black/60 border border-zinc-700/50 p-3 mt-4 rounded font-mono text-[10px] text-zinc-400 h-28 overflow-hidden flex flex-col justify-end backdrop-blur-md shadow-inner">
                 {logs.map((log, i) => (
                     <div key={i} className="animate-fade-in truncate leading-relaxed">
                         <span className="text-primary font-bold mr-2">{'>'}</span>
                         <span className="text-zinc-300">{log}</span>
                     </div>
                 ))}
                 <div className="flex items-center gap-1 mt-1">
                    <span className="text-primary font-bold">{'>'}</span>
                    <div className="w-2 h-4 bg-primary animate-pulse" />
                 </div>
             </div>
        </div>
    </div>
  );
};