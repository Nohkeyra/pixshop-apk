
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GenerationRequest } from '../App';
import { TypeIcon, XIcon, BoltIcon, SaveIcon, TrashIcon } from './icons';
import { PROTOCOLS } from '../services/geminiService';
import { loadUserPresets, addUserPreset, deleteUserPreset } from '../services/persistence';
import { PresetSaveModal } from './PresetSaveModal'; // Corrected import path

interface TypographicPreset {
  name: string;
  description: string;
  applyPrompt: string;
  id?: string;
  isCustom?: boolean;
}

const basePresetGroups: Record<string, TypographicPreset[]> = {
  "STREET TOOLS": [
    { name: 'The Standard', description: 'Round-tip paint marker.', applyPrompt: `Clean, legible text with consistent solid line width using a standard round-tip paint marker on a street sign. Professional tag aesthetic, high contrast, solid ink.` },
    { name: 'The Chisel', description: 'Angular calligraphy.', applyPrompt: `Sharp, angular text featuring thick-to-thin line variations using a wide chisel-tip marker on glass. Aggressive technical calligraphy aesthetic.` },
    { name: 'The Scribe', description: 'Jagged etched lines.', applyPrompt: `Raw, jagged white lines physically scratched into surface using a diamond bit on plexiglass. Sharp destructive texture.` },
    { name: 'The Flare', description: 'Fat cap aerosol flare.', applyPrompt: `Large-scale text with solid centers and fuzzy faded edges using an aerosol can with a fat cap on brick. Spray paint mist effect.` },
    { name: 'The Drip', description: 'Glossy mop marker.', applyPrompt: `Thick, glossy paint with heavy vertical drips extending down using a Krink mop marker. Fluid gravity-defying drips, grungy contrast.` },
    { name: 'Rough Brush', description: 'Textured brush strokes, expressive.', applyPrompt: `Rough, textured brush strokes with an expressive, hand-painted feel, strong impasto.` },
    { name: 'Sticker Bomb', description: 'Layered stickers, varied fonts/styles.', applyPrompt: `Layered sticker bomb typography, varied fonts and styles, overlapping, colorful urban aesthetic.` }
  ],
  "STREET & URBAN": [
    { name: 'Wildstyle Tag', description: 'Interlocking letters, sharp arrows.', applyPrompt: `Flat vector wildstyle graffiti tag. Complex interlocking letters, sharp arrows, bold black outlines, vibrant flat colors.` },
    { name: 'Bubble Throwie', description: 'Inflated letters, thick outline.', applyPrompt: `Flat vector bubble graffiti throw-up. Rounded inflated letters, thick bold outline, solid color fill, sticker aesthetic.` },
    { name: 'Stencil Spray', description: 'Banksy style, clean cuts.', applyPrompt: `Flat vector stencil art piece. High contrast black and white, clean distinct cuts, minimalist street art style.` },
    { name: 'Old School NY', description: '70s subway block letters.', applyPrompt: `Bold, structured classic New York block letters in stark black and white. Hand-drawn subway aesthetic, iconic NY graffiti style.` },
    { name: 'Bubble Wildstyle', description: 'Complex, multi-layered bubble letters.', applyPrompt: `Highly complex and multi-layered bubble letters in a wildstyle graffiti aesthetic, vibrant gradients, thick outlines.` },
    { name: '3D Blockbuster', description: 'Bold 3D block letters, cinematic.', applyPrompt: `Bold, three-dimensional block letters with a cinematic, blockbuster movie title aesthetic, dramatic lighting.` },
    { name: 'Script Tag', description: 'Elegant, flowing script graffiti.', applyPrompt: `Elegant, flowing script graffiti tag, dynamic swooshes, urban calligraphic style.` },
    { name: 'Hand-drawn Comic', description: 'Irregular, expressive comic lettering.', applyPrompt: `Hand-drawn comic book lettering, irregular lines, expressive, bold.` }
  ],
  "DIGITAL & MODERN": [
    { name: 'Chrome', description: 'Mercury metal, high reflection.', applyPrompt: `Chrome metal typography. High reflection, bevelled edges, liquid silver look.` },
    { name: 'Glitch', description: 'Data leak, pixel sorting.', applyPrompt: `Glitch art typography. Pixel sorting, RGB shift, signal noise, distorted text.` },
    { name: 'Swiss Grid', description: 'Helvetica, grid-based, clean.', applyPrompt: `Swiss international typographic style. Helvetica, grid based, asymmetrical, clean sans-serif.` },
    { name: 'Geometric Monogram', description: 'Abstract, minimalist letter combo.', applyPrompt: `Abstract geometric monogram, minimalist letter combinations, sleek, corporate.` },
    { name: 'Sci-Fi Neon Glow', description: 'Futuristic block letters, glowing edges.', applyPrompt: `Futuristic block letters with a vibrant neon glow, glowing edges, sharp angles, cyberpunk.` },
    { name: 'Distorted Cyber', description: 'Digital distortion, fragmented text.', applyPrompt: `Digitally distorted and fragmented cyberpunk typography, broken forms, glitch effects.` },
    { name: 'Modern Sans', description: 'Clean, minimalist sans-serif logo style.', applyPrompt: `Modern minimalist sans-serif typography suitable for a clean logo, precise kerning, understated elegance.` },
    { name: 'Calligraphy Script', description: 'Elegant, flowing script for branding.', applyPrompt: `Elegant and flowing calligraphy script suitable for luxury branding or invitations, hand-lettered style.` }
  ]
};

export const TypographicPanel: React.FC<{
  onRequest: (request: GenerationRequest) => void;
  isLoading: boolean;
  hasImage: boolean;
  setViewerInstruction: (text: string | null) => void;
  initialPrompt?: string;
}> = ({ onRequest, isLoading, hasImage, setViewerInstruction, initialPrompt }) => {
  const [userInput, setUserInput] = useState('');
  const [selectedPresetName, setSelectedPresetName] = useState<string>('The Standard');
  const [routedApplyPrompt, setRoutedApplyPrompt] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const loadPresets = useCallback(async () => {
    try {
        const stored = await loadUserPresets();
        setCustomPresets(stored.filter((p: any) => p.recommendedPanel === 'typographic_panel'));
    } catch(e) {}
  }, []);

  useEffect(() => {
    loadPresets();
    window.addEventListener('stylePresetsUpdated', loadPresets);
    return () => window.removeEventListener('stylePresetsUpdated', loadPresets);
  }, [loadPresets]);

  useEffect(() => {
    if (initialPrompt) { setRoutedApplyPrompt(initialPrompt); setSelectedPresetName(''); }
  }, [initialPrompt]);

  const presetGroups = useMemo(() => {
    if (customPresets.length === 0) return basePresetGroups;
    return { "USER ARCHIVE": customPresets, ...basePresetGroups };
  }, [customPresets]);

  const allPresets = useMemo(() => Object.values(presetGroups).flat() as TypographicPreset[], [presetGroups]);
  const selectedPreset = useMemo(() => allPresets.find(p => p.name === selectedPresetName), [selectedPresetName, allPresets]);

  const handleAction = () => {
    const applyPrompt = selectedPreset ? selectedPreset.applyPrompt : routedApplyPrompt;
    if (!applyPrompt) return;
    
    let basePrompt = userInput.trim() || "PIX";
    const fullPrompt = `${applyPrompt} CONTENT: "${basePrompt.toUpperCase()}". Directives: Pure graphic asset, zero environmental noise, studio isolation.`;

    onRequest({ 
      type: 'typography', prompt: fullPrompt, forceNew: !hasImage, aspectRatio: '1:1', 
      systemInstructionOverride: hasImage ? PROTOCOLS.IMAGE_TRANSFORMER : PROTOCOLS.TYPOGRAPHER,
      denoisingInstruction: hasImage ? "Medium denoising (55%). Integrate glyphs into source geometry." : ""
    });
  };

  const handleSavePreset = async (name: string, desc: string) => {
      // Fix: Use `selectedPreset` directly as it already holds the selected preset object.
      const promptToSave = selectedPreset ? selectedPreset.applyPrompt : routedApplyPrompt;
      if (!promptToSave) return;

      const newPreset = {
          id: `type_${Date.now()}`,
          name, description: desc,
          applyPrompt: promptToSave,
          recommendedPanel: 'typographic_panel',
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
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% -20%, rgba(255, 0, 255, 0.15) 0%, transparent 70%)' }} />

      <div className="p-4 border-b border-zinc-800 bg-surface-panel/90 shrink-0 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-sm bg-type/20 border border-type/50 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.4)]">
                 <TypeIcon className="w-4 h-4 text-type" />
             </div>
             <div>
                 <h3 className="text-sm font-black italic tracking-tighter text-white uppercase leading-none font-display">Type Lab</h3>
                 <p className="text-[9px] text-type font-mono tracking-[0.2em] uppercase font-bold drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]">Glyph.Synthesis</p>
             </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-10"> {/* Increased space-y */}
           <div className="mb-6"> {/* Increased bottom margin */}
                <h4 className="panel-label border-type/50 pl-2">Input Sequence</h4>
                <div className="group border border-zinc-800 bg-black/40 rounded-sm overflow-hidden focus-within:border-type/60 focus-within:shadow-[0_0_15px_rgba(255,0,255,0.15)] transition-all relative shadow-inner">
                    <div className="flex justify-between items-center bg-zinc-900/50 px-2 py-1.5 border-b border-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-type rounded-full animate-pulse shadow-[0_0_5px_rgba(255,0,255,0.8)]" />
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black group-focus-within:text-type transition-colors">STRING_BUFFER</span>
                        </div>
                        <div className="flex gap-2">
                             {(selectedPreset || routedApplyPrompt) && (
                                <button onClick={() => setIsSaveModalOpen(true)} className="text-zinc-600 hover:text-type transition-colors">
                                    <SaveIcon className="w-3.5 h-3.5" />
                                </button>
                             )}
                            {userInput && <button onClick={() => setUserInput('')} className="text-zinc-600 hover:text-white transition-colors"><XIcon className="w-3.5 h-3.5" /></button>}
                        </div>
                    </div>
                    <input 
                        type="text" 
                        value={userInput} 
                        onChange={(e) => setUserInput(e.target.value.slice(0, 30))}
                        placeholder="ENTER TEXT..."
                        className="w-full bg-transparent p-4 text-xl font-mono text-white placeholder-zinc-800 tracking-[0.2em] uppercase font-black focus:outline-none selection:bg-type/30"
                    />
                    <div className="absolute bottom-0 right-0 p-1 opacity-20 pointer-events-none group-focus-within:opacity-100 transition-opacity duration-300">
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 10L0 10L10 0V10Z" fill="var(--color-type)" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="space-y-8 pb-4"> {/* Increased space-y for groups */}
              {Object.entries(presetGroups).map(([groupName, presets]) => (
                  <div key={groupName} className="w-full">
                      <h4 className={`panel-label border-type/50 pl-2 mb-3 ${groupName === 'USER ARCHIVE' ? 'text-type' : ''}`}>{groupName}</h4> {/* Increased bottom margin for group label */}
                      {/* New: Wrapped preset grid in a box */}
                      <div className="bg-black/40 border border-zinc-800 p-4 rounded-sm shadow-inner">
                          <div className="preset-grid">
                              {(presets as TypographicPreset[]).map(preset => (
                                  <button 
                                      key={preset.name} 
                                      onClick={() => { setSelectedPresetName(preset.name); setRoutedApplyPrompt(null); }}
                                      className={`preset-card items-center text-center gap-1 ${ /* Changed items-start text-left to items-center text-center */
                                          selectedPresetName === preset.name 
                                          ? 'bg-type/20 text-white border-type shadow-[0_0_15px_rgba(255,0,255,0.25)] z-10' 
                                          : 'text-zinc-600 hover:text-zinc-400'
                                      }`}
                                  >
                                      {/* Fix: Corrected className syntax for dynamic text color */}
                                      <div className={`text-[11px] font-black uppercase tracking-wider transition-colors ${selectedPresetName === preset.name ? 'text-white' : 'text-zinc-300'}`}>{preset.name}</div> {/* Increased font size */}
                                      <p className={`text-[10px] leading-tight font-mono uppercase tracking-tight truncate w-full ${selectedPresetName === preset.name ? 'text-type' : 'text-zinc-500'}`}>{preset.description}</p> {/* Increased font size */}
                                      
                                      {(preset.id || preset.isCustom) && (
                                         <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                            <div onClick={(e) => handleDelete(e, preset.id!)} className="p-1 text-zinc-500 hover:text-red-500 bg-black/80 rounded"><TrashIcon className="w-3 h-3" /></div>
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

      <div className="p-4 border-t border-zinc-800 bg-surface-panel/90 shrink-0 relative z-10 backdrop-blur-md">
         <button onClick={handleAction} disabled={isLoading || (!selectedPresetName && !routedApplyPrompt)} className="execute-btn group border-zinc-800 hover:border-type transition-colors">
              <div className="execute-btn-glow" style={{ background: 'radial-gradient(circle, #FF00FF 0%, transparent 70%)' }}></div>
              <div className="relative z-10 flex items-center justify-center gap-3 h-full">
                  <span className={`font-black italic uppercase tracking-[0.2em] text-[10px] transition-colors skew-x-[-10deg] ${isLoading ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-type'}`}>
                      {isLoading ? 'Synthesizing...' : 'Execute Type'}
                  </span>
                  <BoltIcon className={`w-4 h-4 transition-colors ${isLoading ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-type'}`} />
              </div>
         </button>
      </div>
    </div>
  );
};