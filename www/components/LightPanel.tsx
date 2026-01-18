

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GenerationRequest } from '../App';
import { SunIcon, SlidersIcon, SaveIcon, TrashIcon } from './icons';
import { PROTOCOLS } from '../services/geminiService'; 
import { loadUserPresets, addUserPreset, deleteUserPreset } from '../services/persistence';
import { PresetSaveModal } from './PresetSaveModal';

interface LightPanelProps { 
  onRequest: (request: GenerationRequest) => void;
  isLoading: boolean;
  setViewerInstruction: (text: string | null) => void;
}

const PRESETS = [
    { name: 'Studio', description: 'Clean, soft shadows, neutral tones.', prompt: 'Professional studio lighting, soft shadows, neutral.' },
    { name: 'Golden Hour', description: 'Warm, diffused glow.', prompt: 'Golden hour lighting, warm color temperature, diffused sunlight.' },
    { name: 'Cyberpunk', description: 'Teal & magenta neon.', prompt: 'Cyberpunk color grading, strong teal and magenta tones, high contrast.' },
    { name: 'Neon Flare', description: 'Electric blues & pinks, high bloom.', prompt: 'Electric blue and hot pink grading, high bloom, vibrant light trails.' },
    { name: 'Arctic Frost', description: 'Cold blue grading, icy.', prompt: 'Cold blue grading, high brightness, icy, stark atmosphere.' },
    { name: 'Tropical Rain', description: 'Deep greens, lush shadows.', prompt: 'Deep jungle green, rich shadows, vibrant foliage, wet texture.' },
    { name: 'Sahara Heat', description: 'Dusty orange, heat haze.', prompt: 'Dusty orange color grading, heat haze, arid, high sun.' },
    { name: 'Film Noir', description: 'High contrast B&W.', prompt: 'Classic film noir photography, high contrast black and white, dramatic shadows.' },
    { name: 'Vintage Film', description: 'Sepia, film grain, faded.', prompt: 'Vintage film aesthetic, sepia tones, subtle film grain, slightly desaturated colors.' },
    { name: 'Gritty Urban', description: 'Desaturated, harsh shadows.', prompt: 'Gritty urban street photography style, high contrast, desaturated colors with selective vibrant accents, harsh shadows.' },
    { name: 'Vaporwave Dream', description: 'Dreamy pastels, neon glow.', prompt: 'Vaporwave aesthetic, dreamy pastel color palette, soft neon glow, retrofuturistic.' },
    { name: 'Dramatic Sunset', description: 'Intense oranges, deep blues.', prompt: 'Dramatic sunset lighting, intense oranges and reds blending into deep blues, silhouette effects.' },
    { name: 'Bleak Winter', description: 'Desaturated, stark, cold.', prompt: 'Bleak winter atmosphere, heavily desaturated blues and grays, stark, high contrast.' },
    { name: 'Glowstick Rave', description: 'Extreme neon highlights.', prompt: 'Extreme glowstick lighting, vibrant fluorescent highlights, deep dark shadows, high energy.' }
];

export const LightPanel: React.FC<LightPanelProps> = ({ onRequest, isLoading }) => { 
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedPresetName, setSelectedPresetName] = useState<string>('');
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [intensity, setIntensity] = useState(50);
  
  const loadPresets = useCallback(async () => {
    try {
        const stored = await loadUserPresets();
        setCustomPresets(stored.filter((p: any) => p.recommendedPanel === 'light_panel')); 
    } catch(e) {}
  }, []);

  useEffect(() => {
    loadPresets();
    window.addEventListener('stylePresetsUpdated', loadPresets);
    return () => window.removeEventListener('stylePresetsUpdated', loadPresets);
  }, [loadPresets]);

  const allPresets = useMemo(() => {
      const formattedCustom = customPresets.map(p => ({
          name: p.name,
          description: p.description,
          prompt: p.applyPrompt || p.genPrompt,
          isCustom: true,
          id: p.id
      }));
      return [...formattedCustom, ...PRESETS];
  }, [customPresets]);

  const selectedPreset = useMemo(() => allPresets.find(p => p.name === selectedPresetName), [selectedPresetName, allPresets]);

  const handleApply = () => {
    const parts = [];
    if (selectedPreset) parts.push(selectedPreset.prompt);
    if (userPrompt.trim()) parts.push(userPrompt.trim());
    
    if (parts.length > 0) {
      const adjustmentPrompt = `Apply lighting: ${parts.join('. ')}. Intensity: ${intensity}%.`;
      onRequest({ 
        type: 'light', 
        prompt: adjustmentPrompt, 
        useOriginal: false, 
        systemInstructionOverride: PROTOCOLS.EDITOR 
      });
    }
  };

  const handleSavePreset = async (name: string, desc: string) => {
      let promptToSave = userPrompt.trim();
      if (selectedPreset && !selectedPreset.isCustom) {
          promptToSave = promptToSave ? `${selectedPreset.prompt}. ${promptToSave}` : selectedPreset.prompt;
      }
      const newPreset = {
          id: `light_${Date.now()}`, 
          name, description: desc,
          applyPrompt: promptToSave,
          recommendedPanel: 'light_panel', 
          timestamp: Date.now()
      };
      await addUserPreset(newPreset);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(confirm('Format data?')) await deleteUserPreset(id);
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
      <PresetSaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSavePreset} />
      
      <div className="p-4 border-b border-white/5 bg-zinc-950/40 shrink-0 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-highlight/10 border border-highlight/40 flex items-center justify-center"> 
                 <SunIcon className="w-4.5 h-4.5 text-highlight" /> 
             </div>
             <div>
                 <h3 className="text-sm font-black italic tracking-tighter text-white uppercase leading-none font-display">Neural Light</h3>
                 <p className="text-[7px] text-highlight font-mono tracking-[0.2em] uppercase font-black opacity-60">Illumination_v1</p> 
             </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-10">
          <div className="mb-6">
              <h4 className="panel-label">Grade_Calibration</h4>
              <div className="group border border-white/5 bg-black rounded-none overflow-hidden focus-within:border-highlight transition-all relative"> 
                  <div className="flex justify-between items-center bg-zinc-900/40 px-3 py-1.5 border-b border-white/5">
                      <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest font-black group-focus-within:text-highlight transition-colors">LUT_MODIFIER</span> 
                      <button onClick={() => setIsSaveModalOpen(true)} disabled={!userPrompt.trim()} className="text-zinc-600 hover:text-highlight transition-colors"> 
                          <SaveIcon className="w-3.5 h-3.5" />
                      </button>
                  </div>
                  <textarea 
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="// Describe environment..."
                      className="w-full bg-transparent p-3 text-xs font-sans font-medium text-white placeholder-zinc-800 focus:outline-none resize-none h-16 leading-relaxed"
                  />
              </div>
          </div>

          <div className="bg-white/[0.03] p-3 border border-white/5 mb-6">
                <div className="flex justify-between mb-3 items-center">
                    <h4 className="text-[8px] font-mono font-black text-zinc-600 uppercase tracking-[0.3em]">Neural_Force</h4>
                    <span className="text-sm font-display text-highlight italic tracking-widest">{intensity}%</span> 
                </div>
                <input 
                    type="range" 
                    min="10" max="100" 
                    value={intensity} 
                    onChange={(e) => setIntensity(Number(e.target.value))} 
                    className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-highlight" 
                />
          </div>

          <div>
            <h4 className="panel-label mb-3">Calibration_Library</h4>
            <div className="bg-black/40 border border-zinc-800 p-4 rounded-sm shadow-inner">
                <div className="preset-grid pb-4"> 
                    {allPresets.map(preset => (
                        <button
                            key={preset.id || preset.name}
                            onClick={() => setSelectedPresetName(preset.name === selectedPresetName ? '' : preset.name)}
                            className={`preset-card ${
                                selectedPresetName === preset.name 
                                ? 'bg-highlight border-highlight text-black z-10' 
                                : 'text-zinc-500 hover:text-white border-white/5'
                            }`}
                        >
                            <div className="flex flex-col items-center text-center"> 
                                <span className={`text-[11px] font-black uppercase tracking-wider mb-0.5 transition-colors ${selectedPresetName === preset.name ? 'text-black' : 'text-zinc-300'}`}>{preset.name}</span> 
                                <span className={`text-[9px] font-mono uppercase tracking-tighter line-clamp-1 ${selectedPresetName === preset.name ? 'text-black/50' : 'text-zinc-500'}`}>{preset.description}</span> 
                            </div>
                        </button>
                    ))}
                </div>
            </div>
          </div>
      </div>

      <div className="p-4 border-t border-white/5 bg-zinc-950/60 shrink-0 relative z-10 backdrop-blur-md">
          <button onClick={handleApply} disabled={isLoading || (!selectedPreset && !userPrompt.trim())} className="execute-btn group hover:border-highlight transition-colors"> 
              <span className={`font-black italic uppercase tracking-[0.2em] text-[10px] transition-colors ${isLoading ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-highlight'}`}> 
                  {isLoading ? 'Calibrating...' : 'Execute Grade'}
              </span>
              <SlidersIcon className={`w-3.5 h-3.5 transition-colors ${isLoading ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-highlight'}`} /> 
          </button>
      </div>
    </div>
  );
};