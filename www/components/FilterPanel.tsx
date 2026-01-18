
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GenerationRequest } from '../App';
import { PaletteIcon, SparklesIcon, SaveIcon, TrashIcon } from './icons';
import { refineImagePrompt, describeImageForPrompt, PROTOCOLS } from '../services/geminiService';
import { loadUserPresets, addUserPreset, deleteUserPreset } from '../services/persistence';
import { PresetSaveModal } from './PresetSaveModal';

interface FilterPreset {
  name: string;
  description: string;
  prompt: string;
  id?: string;
  isCustom?: boolean;
}

interface FilterPanelProps {
  onRequest: (request: GenerationRequest) => void;
  isLoading: boolean;
  // isFastAiEnabled: boolean; // Removed, as model choice is now fixed
  hasImage: boolean;
  currentImageFile: File | null;
  initialPrompt?: string;
  setViewerInstruction: (text: string | null) => void;
}

const basePresetGroups: Record<string, FilterPreset[]> = {
  "BIOMECHANICAL": [
    { name: 'Gigeresque', description: 'Alien Exoskeleton, bioluminescent tubing.', prompt: 'Reconstruct as Gigeresque biomechanical symbiote. Obsidian exoskeleton, bioluminescent tubing.' },
    { name: 'Mycelial', description: 'Fungal corruption, cordyceps growths.', prompt: 'Corrupt with bioluminescent mycelial network and cordyceps growths.' },
    { name: 'Glass Decon.', description: 'Fragmented colored glass sculpture.', prompt: 'Anatomical sculpture made of fragmented colored glass.' },
    { name: 'Biopunk', description: 'Organic tech, dark, grotesque.', prompt: 'Biopunk aesthetic with organic technology, grotesque biological elements, and dark, muted tones.' },
    { name: 'Techwear', description: 'Sleek, functional, sharp accents.', prompt: 'Techwear aesthetic, sleek and functional design, dark muted colors with sharp, vibrant accents.' },
  ],
  "TEMPORAL": [
    { name: 'VHS Glitch', description: 'Analog errors, chroma noise.', prompt: 'Analog tracking errors, heavy chroma noise, corrupted hex code, VHS effect.' },
    { name: 'Baroque Cyber', description: 'Ornate, cracked, chrome.', prompt: 'Baroque ornamentation, cracked marble, chrome cybernetics, historical futuristic.' },
    { name: 'Digital Glitch', description: 'Chromatic aberration, pixel sorting.', prompt: 'Digital artifacts, chromatic aberration, pixel sorting, iridescent distortion.' },
    { name: 'Monochrome Glitch', description: 'B&W digital distortion, noise.', prompt: 'Monochrome glitch art, black, white, and gray digital distortion, static noise effect.' },
  ],
  "ESOTERIC": [
    { name: 'Arcane Sigils', description: 'Glowing arcane, geometric patterns.', prompt: 'Glowing arcane sigils and occult geometric patterns, mystical.' },
    { name: 'Tarot Future', description: 'Futuristic tarot, holographic.', prompt: 'Futuristic tarot card. Ornate sci-fi border, holographic accents, illuminated.' },
  ],
  "CINEMATIC": [
    { name: 'Epic HDR', description: 'Filmic, teal and orange grading.', prompt: 'HDR cinematic style. Intense teal and orange grading, dramatic.' },
    { name: 'Noir Rain', description: 'Cyberpunk, rainy city reflections.', prompt: 'Cyberpunk Noir. High contrast, rainy futuristic city reflections, neon glow.' },
    { name: 'Luxury Edit', description: 'Editorial, gold & earthy tones.', prompt: 'Editorial luxury look. Refined gold and earthy tones, high-end.' }
  ],
  "ARTISTIC": [
    { name: 'Impasto', description: 'Thick, swirling oil paint.', prompt: 'Oil painting with thick, swirling impasto brushstrokes, vibrant colors.' },
    { name: 'Ghibli Water', description: 'Lush hand-painted watercolor.', prompt: 'Anime style, lush hand-painted watercolor backgrounds, soft lighting.' },
    { name: 'Neo-Pop', description: 'Abstract, ribbon-like color blocks.', prompt: 'Abstract neo-pop illustration. Ribbon-like color blocks, vibrant, bold.' },
    { name: 'Abstract Exp.', description: 'Energetic, vivid, raw emotion.', prompt: 'Abstract Expressionism art style, energetic brushstrokes, vibrant and chaotic colors, raw emotion.' },
    { name: 'Street Pop', description: 'Bold, graphic, Haring/KAWS inspired.', prompt: 'Street Pop art style, bold outlines, graphic shapes, vivid colors, inspired by Keith Haring or KAWS.' },
    { name: 'Neo-Cubist', description: 'Fragmented, geometric, multiple views.', prompt: 'Neo-Cubist art style, fragmented and geometric forms, multiple perspectives, modern abstract.' },
    { name: 'Digital Graffiti', description: 'Layered, fluorescent, spray texture.', prompt: 'Digital graffiti art, complex letterforms, layered effects, fluorescent colors, realistic spray paint textures.' },
    { name: 'Pixel Art', description: 'Low resolution, retro game style.', prompt: 'Pixel art style, low resolution, retro video game aesthetic, blocky characters.' },
    { name: 'Glitchwave', description: 'Vaporwave, digital distortion, pastel neon.', prompt: 'Glitchwave aesthetic, combination of vaporwave and glitch art, digital distortion, pastel neon colors.' },
    { name: 'Sketchbook Noir', description: 'Rough pencil, film noir mood.', prompt: 'Sketchbook noir style, rough pencil lines, film noir mood, chiaroscuro lighting, dark and moody.' }
  ],
  "ILLUSTRATIVE": [
    { name: 'Line Drawing', description: 'Minimalist, clean black lines.', prompt: 'Minimalist line drawing, clean black lines, simple forms, elegant.' },
    { name: 'Comic Book', description: 'Halftone, bold lines, strong shadows.', prompt: 'Classic comic book illustration, halftone dots, bold linework, strong shadows, dynamic composition.' },
  ],
  "SCI-FI": [
    { name: 'Hologram', description: 'Holographic effect. Shimmering iridescent metallic sheen.', prompt: 'Holographic effect. Shimmering iridescent metallic sheen.' },
    { name: 'Infrared', description: 'Solarized, Aerochrome film effect.', prompt: 'Surreal solarized infrared effect emulating Aerochrome film.' }
  ]
};

export const FilterPanel: React.FC<FilterPanelProps> = ({ onRequest, isLoading, hasImage, currentImageFile, initialPrompt, setViewerInstruction }) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedPresetName, setSelectedPresetName] = useState<string>('');
  const [isRefining, setIsRefining] = useState(false);
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [useGoogleSearch, setUseGoogleSearch] = useState(false); // New state for Google Search grounding

  const loadPresets = useCallback(async () => {
    try {
        const stored = await loadUserPresets();
        setCustomPresets(stored.filter((p: any) => p.recommendedPanel === 'filter_panel'));
    } catch(e) {}
  }, []);

  useEffect(() => {
    loadPresets();
    window.addEventListener('stylePresetsUpdated', loadPresets);
    return () => window.removeEventListener('stylePresetsUpdated', loadPresets);
  }, [loadPresets]);

  useEffect(() => {
    if (initialPrompt) { setUserPrompt(initialPrompt); setSelectedPresetName(''); }
  }, [initialPrompt]);

  const presetGroups = useMemo(() => {
    if (customPresets.length === 0) return basePresetGroups;
    return { "ARCHIVE": customPresets, ...basePresetGroups };
  }, [customPresets]);

  const allPresets = useMemo(() => Object.values(presetGroups).flat() as FilterPreset[], [presetGroups]);

  const handleApply = async () => {
    let effectiveSubject = userPrompt.trim();
    if (!effectiveSubject && currentImageFile) {
        setViewerInstruction("ANALYZING_SOURCE_VISUALS...");
        try { effectiveSubject = await describeImageForPrompt(currentImageFile); } 
        catch (err) { effectiveSubject = "the primary subject"; }
        finally { setViewerInstruction(null); }
    } else if (!effectiveSubject) effectiveSubject = "the primary subject";

    const preset = allPresets.find(p => p.name === selectedPresetName);
    let prompt = preset 
        ? (preset.prompt || (preset as any).applyPrompt)
        : effectiveSubject;
        
    if (userPrompt.trim() && preset) {
        prompt = `${prompt}. Modifier: ${userPrompt.trim()}`;
    }

    onRequest({ 
        type: 'filters', 
        prompt: prompt, 
        useOriginal: false, 
        systemInstructionOverride: PROTOCOLS.IMAGE_TRANSFORMER,
        useGoogleSearch: useGoogleSearch // Pass grounding preference
    });
  };
  
  const handleRefine = async () => {
    if (!userPrompt.trim() || isRefining) return;
    setIsRefining(true);
    setViewerInstruction("REFINING_PROMPT_GRAMMAR...");
    try { setUserPrompt(await refineImagePrompt(userPrompt)); } catch (e) {} 
    finally { 
      setIsRefining(false); 
      setViewerInstruction(null);
    }
  };

  const handleSavePreset = async (name: string, desc: string) => {
      const newPreset = {
          id: `filter_${Date.now()}`,
          name, description: desc,
          applyPrompt: userPrompt.trim() || `Style of ${selectedPresetName}`,
          recommendedPanel: 'filter_panel',
          timestamp: Date.now(),
          isCustom: true
      };
      await addUserPreset(newPreset);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(confirm('Delete this preset?')) await deleteUserPreset(id);
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
      <PresetSaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSavePreset} />
      
      <div className="p-4 border-b border-white/5 bg-zinc-950/40 shrink-0 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-filter/10 border border-filter/40 flex items-center justify-center">
                 <PaletteIcon className="w-4.5 h-4.5 text-filter" />
             </div>
             <div>
                 <h3 className="text-sm font-black italic tracking-tighter text-white uppercase leading-none font-display">FX Pipeline</h3>
                 <p className="text-[7px] text-filter font-mono tracking-[0.2em] uppercase font-black opacity-60">Neural_v9</p>
             </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-10">
          <div className="mb-6"> {/* Increased bottom margin for Input Directive */}
              <h4 className="panel-label">Input_Directive</h4>
              <div className="group border border-white/5 bg-black rounded-none overflow-hidden focus-within:border-filter transition-all relative">
                  <div className="flex justify-between items-center bg-zinc-900/40 px-3 py-1.5 border-b border-white/5">
                      <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest font-black group-focus-within:text-filter transition-colors">DNA_SEED</span>
                      <div className="flex gap-4">
                        <button onClick={() => setIsSaveModalOpen(true)} disabled={!userPrompt.trim()} className="text-zinc-600 hover:text-filter transition-colors">
                            <SaveIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleRefine} disabled={!userPrompt.trim() || isRefining} className="text-zinc-600 hover:text-filter transition-colors">
                            <SparklesIcon className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                  </div>
                  <textarea 
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder={hasImage ? "// Analyze source..." : "// Define vision..."}
                      className="w-full bg-transparent p-3 text-xs font-sans font-medium text-white placeholder-zinc-800 focus:outline-none resize-none h-20 leading-relaxed"
                  />
              </div>
          </div>
          
          {/* Google Search Grounding Toggle */}
          <div className="bg-white/[0.03] p-3 border border-white/5 mb-6"> {/* Increased bottom margin for Data Link */}
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

          <div className="space-y-8 pb-20"> {/* Increased space-y to give more room between groups */}
            {Object.entries(presetGroups).map(([groupName, presets]) => (
                <div key={groupName} className="w-full">
                    <h4 className="panel-label mb-3">{groupName}</h4> {/* Increased bottom margin for group label */}
                    {/* New: Wrapped preset grid in a box */}
                    <div className="bg-black/40 border border-zinc-800 p-4 rounded-sm shadow-inner">
                        <div className="preset-grid">
                            {(presets as any[]).map(preset => (
                                <button 
                                    key={preset.name} onClick={() => setSelectedPresetName(preset.name === selectedPresetName ? '' : preset.name)}
                                    className={`preset-card group ${
                                        selectedPresetName === preset.name 
                                        ? 'bg-filter border-filter text-black z-10' 
                                        : 'text-zinc-500 hover:text-white border-white/5'
                                    }`}
                                >
                                    <div className="flex flex-col items-center text-center"> {/* Added items-center and text-center */}
                                        {/* Fix: Corrected className syntax for dynamic text color */}
                                        <span className={`text-[11px] font-black uppercase tracking-wider mb-0.5 transition-colors ${selectedPresetName === preset.name ? 'text-black' : 'text-zinc-300'}`}>{preset.name}</span> {/* Increased font size */}
                                        <span className={`text-[9px] font-mono uppercase tracking-tighter line-clamp-1 ${selectedPresetName === preset.name ? 'text-black/50' : 'text-zinc-500'}`}>{preset.description}</span> {/* Increased font size */}
                                    </div>
                                    
                                    {(preset.id || preset.isCustom) && (
                                         <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                            <div onClick={(e) => handleDelete(e, preset.id)} className="p-1 text-red-500 bg-black/40"><TrashIcon className="w-3 h-3" /></div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
          </div>
      </div>

      <div className="p-4 border-t border-white/5 bg-zinc-950/60 shrink-0 relative z-10 backdrop-blur-md">
          <button onClick={handleApply} disabled={isLoading || (!selectedPresetName && !userPrompt.trim())} className="execute-btn group hover:border-filter transition-colors">
              <span className={`font-black italic uppercase tracking-[0.2em] text-[10px] transition-colors ${isLoading ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-filter'}`}>
                  {isLoading ? 'Synthesizing...' : 'Apply Filter'}
              </span>
              <PaletteIcon className={`w-3.5 h-3.5 transition-colors ${isLoading ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-filter'}`} />
          </button>
      </div>
    </div>
  );
};