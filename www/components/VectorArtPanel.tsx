

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GenerationRequest } from '../App';
import { VectorIcon, SparklesIcon, SaveIcon, TrashIcon, XIcon } from './icons';
import { describeImageForPrompt, PROTOCOLS, refineImagePrompt } from '../services/geminiService';
import { loadUserPresets, addUserPreset, deleteUserPreset } from '../services/persistence';
import { PresetSaveModal } from './PresetSaveModal';

interface VectorPreset {
  name: string;
  description: string;
  applyPrompt: string;
  genPrompt: string;
  id?: string;
  isCustom?: boolean;
}

const basePresetGroups: Record<string, VectorPreset[]> = {
  "IDENTITY": [
    { name: 'Monogram', description: 'Intertwined letters logo.', applyPrompt: 'Vector monogram logo, intertwined letters.', genPrompt: 'Minimalist vector monogram logo, white background.' },
    { name: 'Emblem', description: 'Crest style shield.', applyPrompt: 'Vector crest emblem, shield shape.', genPrompt: 'Vector emblem logo, shield crest, thick lines.' },
    { name: 'Badge', description: 'Circular text badge.', applyPrompt: 'Vector badge style, circular text.', genPrompt: 'Vector badge logo, circular layout, vintage style.' },
    { name: 'Mascot', description: 'Esports character logo.', applyPrompt: 'Esports mascot vector logo.', genPrompt: 'Aggressive esports mascot vector, bold outlines, flat colors.' },
    { name: 'Abstract Mark', description: 'Non-representational geometric shapes.', applyPrompt: 'Abstract vector logo mark, non-representational geometric shapes, modern design.', genPrompt: 'Minimalist abstract vector logo, geometric shapes, clean, isolated white background.' },
    { name: 'Wordmark', description: 'Custom typography-based logo.', applyPrompt: 'Custom wordmark vector logo, unique typography.', genPrompt: 'Elegant custom typography wordmark vector logo, minimalist, isolated white background.' },
    { name: 'Iconic Symbol', description: 'Simple, memorable, scalable symbol.', applyPrompt: 'Iconic vector symbol, simple, memorable, scalable.', genPrompt: 'Minimalist iconic vector symbol, universal recognition, clean, isolated white background.' },
    { name: 'Geometric Animal', description: 'Animal figure with geometric shapes.', applyPrompt: 'Geometric animal vector logo, stylized animal figure with clean geometric shapes.', genPrompt: 'Stylized geometric animal vector logo, modern, abstract, isolated white background.' }
  ],
  "STREET": [
    { name: 'Stencil', description: 'Spray cutout texture.', applyPrompt: 'Stencil vector art style, spray paint texture.', genPrompt: 'Street art stencil vector, sharp edges, black and white.' },
    { name: 'Sticker', description: 'Die-cut vinyl, white border.', applyPrompt: 'Die-cut sticker vector, white border.', genPrompt: 'Vector sticker design, white die-cut border, thick outlines.' },
    { name: 'Tag', description: 'Graffiti handstyle vector.', applyPrompt: 'Graffiti tag vector style.', genPrompt: 'Graffiti handstyle tag, dripping ink, vector.' },
    { name: 'Wheatpaste', description: 'Rough, worn poster texture.', applyPrompt: 'Wheatpaste poster style vector art, rough, worn texture, bold black lines.', genPrompt: 'Urban wheatpaste poster vector art, distressed texture, bold graphic, isolated on a light background.' },
    { name: 'Neo-Exp.', description: 'Distorted figures, vibrant colors.', applyPrompt: 'Neo-Expressionist vector art, distorted figures, vibrant colors, strong lines, raw emotion.', genPrompt: 'Neo-Expressionist vector illustration, bold strokes, rich textures, isolated on a white background.' }
  ],
  "ILLUSTRATION": [
    { name: 'Pop Art', description: 'Bold halftone dots.', applyPrompt: 'Pop art vector style, halftone dots.', genPrompt: 'Pop art vector illustration, bold colors, halftone pattern.' },
    { name: 'Woodcut', description: 'Engraved lines texture.', applyPrompt: 'Woodcut vector style, hatching lines.', genPrompt: 'Woodcut vector illustration, engraving style, black and white.' },
    { name: 'Low Poly', description: 'Geometric mesh, gradient fills.', applyPrompt: 'Low poly vector style, geometric.', genPrompt: 'Low poly vector illustration, geometric triangles, gradient fills.' },
    { name: 'Isometric View', description: '3D perspective, clean lines.', applyPrompt: 'Isometric view vector illustration, 3D perspective, clean lines, flat colors.', genPrompt: 'Detailed isometric vector illustration, clean lines, vibrant flat colors, isolated on a minimalist background.' },
    { name: 'Retro Cartoon', description: 'Classic animation, bold outlines.', applyPrompt: 'Retro cartoon style vector illustration, classic animation style, bold outlines, limited palette.', genPrompt: 'Vibrant retro cartoon vector, bold lines, expressive characters, isolated on a simple background.' },
    { name: 'Art Deco', description: 'Geometric, stylized, elegant.', applyPrompt: 'Art Deco vector illustration, geometric, stylized, elegant.', genPrompt: 'Elegant Art Deco vector illustration, symmetrical, intricate geometric patterns, isolated on a luxurious background.' },
    { name: 'Line Icon', description: 'Simple, clean line icons.', applyPrompt: 'Minimalist line icon vector, simple bold shapes, single flat color.', genPrompt: 'Clean minimalist line icon set, abstract, universal symbol aesthetic, isolated on a white background.' }
  ],
  "MINIMAL": [
    { name: 'Line Art', description: 'Continuous monoline drawing.', applyPrompt: 'Continuous line art vector.', genPrompt: 'Minimalist continuous line drawing, black on white.' },
    { name: 'Flat Icon', description: 'Solid shapes, no gradients.', applyPrompt: 'Flat design vector icon.', genPrompt: 'Flat vector illustration, geometric shapes, no gradients.' },
    { name: 'Blueprint', description: 'Technical schematic, grid.', applyPrompt: 'Technical blueprint vector.', genPrompt: 'Technical blueprint, cyan lines, grid background.' },
    { name: 'Minimal Line', description: 'Ultra-thin, elegant line art.', applyPrompt: 'Ultra-thin continuous line art vector, extremely minimalist, elegant.', genPrompt: 'Elegant minimalist line art vector illustration, subtle details, isolated on a clean white background.' },
    { name: 'Duo Tone', description: 'Two contrasting colors, stark graphic.', applyPrompt: 'Duo tone vector graphic, two contrasting colors, stark, bold.', genPrompt: 'High contrast duo tone vector illustration, sharp graphic quality, isolated on a simple background.' }
  ],
  "PROFESSIONAL": [
    { name: 'Golden Ratio', description: 'Precise geometric balance.', applyPrompt: 'Elegant golden ratio vector illustration. Precise geometric construction.', genPrompt: 'Elegant golden ratio vector illustration, balanced proportions, minimalist, isolated white.' },
    { name: 'Swiss Style', description: 'Modernist, grid-based, clean.', applyPrompt: 'Swiss style flat vector illustration. Grid-based, clean geometric shapes, limited color palette.', genPrompt: 'Swiss style flat vector illustration, modernist, stark contrast, isolated white.' },
    { name: 'Iconography', description: 'Universal symbol aesthetic.', applyPrompt: 'Reduce to minimalist iconography vector. Simple bold shapes, single flat color.', genPrompt: 'Minimalist iconography vector, bold outline, universal symbol aesthetic, isolated white.' },
    { name: 'Corporate Abstract', description: 'Sophisticated abstract shapes.', applyPrompt: 'Sophisticated abstract vector illustration suitable for corporate branding, elegant geometric forms.', genPrompt: 'Modern corporate abstract vector logo, clean lines, subtle gradients, isolated on a white background.' },
    { name: 'Luxury Monogram', description: 'Elegant interlocking letters, refined.', applyPrompt: 'Luxury monogram vector logo, elegant interlocking letters, refined design.', genPrompt: 'Exquisite luxury monogram vector logo, intricate details, classic serif typeface, isolated on a premium background.' }
  ]
};

export const VectorArtPanel: React.FC<{
  onRequest: (request: GenerationRequest) => void;
  isLoading: boolean;
  hasImage: boolean;
  currentImageFile?: File | null;
  setViewerInstruction: (text: string | null) => void;
  initialPrompt?: string;
  // isFastAiEnabled: boolean; // Removed, as model choice is now fixed
}> = ({ onRequest, isLoading, hasImage, currentImageFile, setViewerInstruction, initialPrompt }) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedPresetName, setSelectedPresetName] = useState<string>('Stencil');
  const [isRefining, setIsRefining] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const loadPresets = useCallback(async () => {
    try {
        const stored = await loadUserPresets();
        setCustomPresets(stored.filter((p: any) => p.recommendedPanel === 'vector_art_panel'));
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
    return { "USER DNA": customPresets, ...basePresetGroups };
  }, [customPresets]);

  const allPresets = useMemo(() => Object.values(presetGroups).flat() as VectorPreset[], [presetGroups]);
  const selectedPreset = useMemo(() => allPresets.find(p => p.name === selectedPresetName), [selectedPresetName, allPresets]);

  const handleApply = async () => {
    setIsAnalyzing(true);
    setLocalError(null);
    try {
        let effectiveSubject = userPrompt.trim();
        if (!effectiveSubject && hasImage && currentImageFile) {
            setViewerInstruction("ANALYZING_SOURCE...");
            effectiveSubject = await describeImageForPrompt(currentImageFile).catch(() => "primary subject");
            setViewerInstruction(null);
        } else if (!effectiveSubject) effectiveSubject = "primary subject";

        let fullPrompt = "";
        let sysOverride = PROTOCOLS.DESIGNER;

        if (selectedPreset) {
            if (hasImage) {
                 fullPrompt = `${selectedPreset.applyPrompt} Subject: ${effectiveSubject}. Pure vector style.`;
                 sysOverride = PROTOCOLS.IMAGE_TRANSFORMER;
            } else {
                 fullPrompt = `${selectedPreset.genPrompt || selectedPreset.applyPrompt}, ${effectiveSubject}`;
            }
        } else {
             fullPrompt = `${effectiveSubject}. Vector art, flat colors, clean lines.`;
             sysOverride = hasImage ? PROTOCOLS.IMAGE_TRANSFORMER : PROTOCOLS.DESIGNER;
        }

        onRequest({ type: 'vector', prompt: fullPrompt, forceNew: !hasImage, aspectRatio: '1:1', systemInstructionOverride: sysOverride });
    } catch (e: any) { setLocalError(e.message || "Malfunction."); } 
    finally { setIsAnalyzing(false); }
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
      let promptToSave = userPrompt.trim();
      const newPreset = {
          id: `vector_${Date.now()}`,
          name, description: desc,
          applyPrompt: promptToSave, 
          genPrompt: promptToSave,
          recommendedPanel: 'vector_art_panel',
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
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% -20%, rgba(0, 255, 204, 0.15) 0%, transparent 70%)' }} />

      <div className="p-4 border-b border-zinc-800 bg-surface-panel/90 shrink-0 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-sm bg-vector/20 border border-vector/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,204,0.4)]">
                 <VectorIcon className="w-4 h-4 text-vector" />
             </div>
             <div>
                 <h3 className="text-sm font-black italic tracking-tighter text-white uppercase leading-none font-display">Vector Foundry</h3>
                 <p className="text-[9px] text-vector font-mono tracking-[0.2em] uppercase font-bold drop-shadow-[0_0_5px_rgba(0,255,204,0.5)]">SVG.Synthesizer</p>
             </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-10"> {/* Increased space-y */}
          {localError && (
            <div className="bg-red-950/20 border-l-2 border-red-500 p-3 shrink-0">
                <p className="text-[9px] text-red-500 font-mono uppercase font-black mb-1">Fault</p>
                <p className="text-[10px] text-red-200 leading-tight font-mono">{localError}</p>
            </div>
          )}

          <div className="mb-6"> {/* Increased bottom margin */}
              <h4 className="panel-label border-vector/50 pl-2">Path Directive</h4>
              <div className="group border border-zinc-800 bg-black/40 rounded-sm overflow-hidden focus-within:border-vector/60 focus-within:shadow-[0_0_15px_rgba(0,255,204,0.15)] transition-all relative shadow-inner">
                  <div className="flex justify-between items-center bg-zinc-900/50 px-2 py-1.5 border-b border-zinc-800/50">
                      <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-vector rounded-full animate-pulse shadow-[0_0_5px_rgba(0,255,204,0.8)]" />
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black group-focus-within:text-vector transition-colors">PATH_PAYLOAD</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setIsSaveModalOpen(true)} disabled={!userPrompt.trim()} className="text-zinc-600 hover:text-vector disabled:opacity-20 transition-colors">
                            <SaveIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleRefine} disabled={!userPrompt.trim() || isRefining} className="text-zinc-600 hover:text-vector transition-colors">
                            <SparklesIcon className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                  </div>
                  {/* Fix: Use setUserPrompt instead of setUserInput */}
                  <textarea 
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder={hasImage ? "// Analyze source..." : "// Describe icon..."}
                      className="w-full bg-transparent p-3 text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none resize-none h-16 leading-relaxed selection:bg-vector/30"
                  />
                  <div className="absolute bottom-0 right-0 p-1 opacity-20 pointer-events-none group-focus-within:opacity-100 transition-opacity duration-300">
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 10L0 10L10 0V10Z" fill="var(--color-vector)" />
                        </svg>
                  </div>
              </div>
          </div>

          <div className="space-y-8 pb-4"> {/* Increased space-y for groups */}
            {Object.entries(presetGroups).map(([groupName, presets]) => (
                <div key={groupName} className="w-full">
                    <h4 className={`panel-label border-vector/50 pl-2 mb-3 ${groupName === 'USER DNA' ? 'text-vector' : ''}`}>{groupName}</h4> {/* Increased bottom margin for group label */}
                    {/* New: Wrapped preset grid in a box */}
                    <div className="bg-black/40 border border-zinc-800 p-4 rounded-sm shadow-inner">
                        <div className="preset-grid">
                            {(presets as any[]).map(preset => (
                                <button 
                                    key={preset.name} onClick={() => setSelectedPresetName(preset.name === selectedPresetName ? '' : preset.name)}
                                    className={`preset-card items-center text-center gap-1 ${ /* Changed items-start text-left to items-center text-center */
                                        selectedPresetName === preset.name 
                                        ? 'bg-vector/20 text-white border-vector shadow-[0_0_15px_rgba(0,255,204,0.25)] z-10' 
                                        : 'text-zinc-600 hover:text-zinc-400'
                                    }`}
                                >
                                    {/* Fix: Corrected className syntax for dynamic text color */}
                                    <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${selectedPresetName === preset.name ? 'text-white' : 'text-zinc-300'}`}>{preset.name}</span> {/* Increased font size */}
                                    <p className={`text-[10px] leading-tight font-mono uppercase tracking-tight truncate w-full ${selectedPresetName === preset.name ? 'text-vector' : 'text-zinc-500'}`}>{preset.description}</p> {/* Increased font size */}
                                    
                                    {(preset.id || preset.isCustom) && (
                                             <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                <div onClick={(e) => handleDelete(e, preset.id)} className="p-1 text-zinc-500 hover:text-red-500 bg-black/80 rounded"><TrashIcon className="w-3 h-3" /></div>
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
          <button onClick={handleApply} disabled={isLoading || isAnalyzing || (!selectedPresetName && !userPrompt.trim() && !hasImage)} className="execute-btn group border-zinc-800 hover:border-vector transition-colors">
              <div className="execute-btn-glow" style={{ background: 'radial-gradient(circle, #00FFCC 0%, transparent 70%)' }}></div>
              <div className="relative z-10 flex items-center justify-center gap-3 h-full">
                  <span className={`font-black italic uppercase tracking-[0.2em] text-[10px] transition-colors skew-x-[-10deg] ${isLoading || isAnalyzing ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-vector'}`}>
                      {isAnalyzing ? 'Pathing...' : (isLoading ? 'Processing...' : 'Forge Vector')}
                  </span>
                  <VectorIcon className={`w-4 h-4 transition-colors ${isLoading || isAnalyzing ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-vector'}`} />
              </div>
          </button>
      </div>
    </div>
  );
};