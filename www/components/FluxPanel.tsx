

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { SparklesIcon, BoltIcon } from './icons';
import { refineImagePrompt, describeImageForPrompt } from '../services/geminiService';
import { GenerationRequest } from '../App';

interface FluxPanelProps {
  onRequest: (request: GenerationRequest) => void;
  isLoading: boolean;
  hasImage?: boolean;
  currentImageFile?: File | null;
  fluxPrompt: string;
  setFluxPrompt: (prompt: string) => void;
  // isFastAiEnabled: boolean; // Removed, as model choice is now fixed
  setViewerInstruction: (text: string | null) => void;
}

const STYLE_PRESETS = {
  "default": { label: "Urban", suffix: "gritty street photography, raw texture" },
  "vandal": { label: "Vandal", suffix: "spray paint mural, drip texture" },
  "neon": { label: "Cyber", suffix: "vibrant neon, glitch accents" },
  "riso": { label: "Riso", suffix: "risograph print style, grain" },
  "sketch": { label: "Ink", suffix: "charcoal wildstyle sketch" },
  "mono": { label: "Mono", suffix: "minimalist vector logo, white background" },
  "editorial": { label: "Fashion", suffix: "high fashion studio lighting" },
  "anime": { label: "Anime", suffix: "90s anime style, cel shaded" },
  "cinema": { label: "Film", suffix: "anamorphic lens, teal and orange" },
  "abstract_exp": { label: "Abstract Exp.", suffix: "bold brushstrokes, vibrant colors, expressionist art by Basquiat" },
  "street_pop": { label: "Street Pop", suffix: "bold outlines, graphic shapes, vivid pop art colors, inspired by KAWS" },
  "low_poly": { label: "Low Poly", suffix: "geometric triangles, low polygon art, vibrant gradient fills" },
  "grunge": { label: "Grunge", suffix: "distressed textures, faded colors, urban grunge aesthetic" },
  "vaporwave": { label: "Vaporwave", suffix: "dreamy pastels, neon glow, retrofuturistic, 80s aesthetic" },
  "glitch_art": { label: "Glitch Art", suffix: "digital distortion, chromatic aberration, pixel sorting, broken aesthetics" },
  "comic_book": { label: "Comic Book", suffix: "halftone dots, bold linework, strong shadows, dynamic comic book style" },
  "gothic_cyber": { label: "Gothic Cyber", suffix: "dark, moody, futuristic gothic architecture, neon accents, rain" },
  "minimalist": { label: "Minimalist", suffix: "clean lines, stark contrast, simple forms, elegant minimalist art" },
  "surreal": { label: "Surreal", suffix: "dreamlike, impossible landscapes, Salvador Dali inspired, otherworldly" }
};

export const FluxPanel: React.FC<FluxPanelProps> = ({ 
    onRequest, isLoading, hasImage, currentImageFile,
    fluxPrompt, setFluxPrompt, setViewerInstruction
}) => {
  const [isRefining, setIsRefining] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("default");
  const [deepLogic, setDeepLogic] = useState(false);
  const [useGoogleSearch, setUseGoogleSearch] = useState(false); // New state for Google Search grounding

  const handleAction = async (forceNew: boolean) => {
    let effectivePrompt = fluxPrompt.trim();
    const style = STYLE_PRESETS[selectedStyle as keyof typeof STYLE_PRESETS];
    
    if (hasImage && !effectivePrompt && currentImageFile) {
        setIsAnalyzing(true);
        setViewerInstruction("ANALYZING_VISUAL_SEED...");
        try { effectivePrompt = await describeImageForPrompt(currentImageFile); } 
        catch (e) { effectivePrompt = "urban transformation"; }
        finally { 
            setIsAnalyzing(false); 
            setViewerInstruction(null);
        }
    }

    const finalPrompt = style.suffix ? `${effectivePrompt}, ${style.suffix}` : effectivePrompt;

    onRequest({ 
        type: 'flux', 
        prompt: finalPrompt, 
        forceNew, 
        aspectRatio: '1:1',
        useGoogleSearch: useGoogleSearch // Pass grounding preference
    });
  };

  const handleRefine = async () => {
    if (!fluxPrompt.trim() || isRefining) return;
    setIsRefining(true);
    setViewerInstruction("REFINING_PROMPT_GRAMMAR...");
    try {
      const refined = await refineImagePrompt(fluxPrompt, deepLogic);
      setFluxPrompt(refined);
    } catch (e) {} 
    finally { 
      setIsRefining(false); 
      setViewerInstruction(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
        <div className="p-4 border-b border-white/5 bg-zinc-950/40 shrink-0 relative z-10 backdrop-blur-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <div className="w-9 h-9 bg-flux/10 border border-flux/40 flex items-center justify-center">
                         <BoltIcon className="w-4.5 h-4.5 text-flux" />
                     </div>
                     <div>
                         <h3 className="text-sm font-black italic tracking-tighter text-white uppercase leading-none font-display">Flux Core</h3>
                         <p className="text-[7px] text-flux font-mono tracking-[0.2em] uppercase font-black opacity-60">Synthesis_v9</p>
                     </div>
                </div>
                <button 
                    onClick={() => setDeepLogic(!deepLogic)}
                    className={`flex items-center gap-2 px-3 py-1.5 border transition-all text-[8px] uppercase tracking-widest font-black ${deepLogic ? 'bg-flux border-flux text-white shadow-neon-flux' : 'bg-transparent border-white/10 text-white/40'}`}
                >
                    <span>Deep_Logic</span>
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-10">
            <div className="mb-6"> {/* Increased bottom margin */}
                <h4 className="panel-label">Terminal_Input</h4>
                <div className="group border border-white/5 bg-black rounded-none overflow-hidden focus-within:border-flux transition-all relative">
                    <div className="flex justify-between items-center bg-zinc-900/40 px-3 py-1.5 border-b border-white/5">
                        <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest font-black group-focus-within:text-flux transition-colors">PROMPT_ENGINE</span>
                        <button onClick={handleRefine} disabled={!fluxPrompt.trim() || isRefining} className={`text-zinc-600 hover:text-flux transition-all ${isRefining ? 'animate-spin' : ''}`}>
                             <SparklesIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <textarea 
                        value={fluxPrompt}
                        onChange={(e) => setFluxPrompt(e.target.value)}
                        placeholder={hasImage ? "// Analyze visual seed..." : "// Define vision..."}
                        className="w-full bg-transparent p-3 text-xs font-sans font-medium text-white placeholder-zinc-800 focus:outline-none resize-none h-20 leading-relaxed"
                    />
                </div>
            </div>

            {/* Google Search Grounding Toggle */}
            <div className="bg-white/[0.03] p-3 border border-white/5 mb-6"> {/* Increased bottom margin */}
                <div className="flex justify-between mb-3 items-center">
                    <h4 className="text-[8px] font-mono font-black text-zinc-600 uppercase tracking-[0.3em]">Data_Link</h4>
                    <button 
                        onClick={() => setUseGoogleSearch(!useGoogleSearch)}
                        className={`flex items-center gap-2 px-3 py-1.5 border transition-all text-[8px] uppercase tracking-widest font-black ${useGoogleSearch ? 'bg-matrix border-matrix text-white shadow-neon-matrix' : 'bg-transparent border-white/10 text-white/40'}`}
                    >
                        <span>Neural_Ground</span>
                    </button>
                </div>
            </div>

            <div>
                 <h4 className="panel-label mb-3">Aesthetic_Selection</h4>
                 {/* New: Wrapped preset grid in a box */}
                 <div className="bg-black/40 border border-zinc-800 p-4 rounded-sm shadow-inner">
                     <div className="preset-grid pb-4"> {/* Removed pb-20 from here, added pb-4 to the grid itself */}
                        {Object.entries(STYLE_PRESETS).map(([key, style]) => (
                            <button 
                                key={key} 
                                onClick={() => setSelectedStyle(key)}
                                className={`preset-card ${
                                  selectedStyle === key 
                                    ? 'bg-flux border-flux text-white z-10' 
                                    : 'text-zinc-500 hover:text-white border-white/5'
                                }`}
                            >
                                <span className="text-[11px] font-black uppercase tracking-widest">{style.label}</span> {/* Increased font size */}
                            </button>
                        ))}
                     </div>
                 </div>
            </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-zinc-950/60 shrink-0 relative z-10 backdrop-blur-md">
            <button onClick={() => handleAction(true)} disabled={isLoading || isAnalyzing} className="execute-btn group hover:border-flux transition-colors">
                <span className={`font-black italic uppercase tracking-[0.2em] text-[10px] transition-colors ${isLoading ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-flux'}`}>
                    {isLoading ? 'Calibrating...' : 'Execute Flux'}
                </span>
                <BoltIcon className={`w-3.5 h-3.5 transition-colors ${isLoading ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-flux'}`} />
            </button>
        </div>
    </div>
  );
};