

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

interface LightPanelProps { // Changed interface name
  onRequest: (request: GenerationRequest) => void;
  isLoading: boolean;
  setViewerInstruction: (text: string | null) => void;
  // isFastAiEnabled: boolean; // Removed, as model choice is now fixed
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

export const LightPanel: React.FC<LightPanelProps> = ({ onRequest, isLoading }) => { // Changed component name
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedPresetName, setSelectedPresetName] = useState<string>('');
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [intensity, setIntensity] = useState(50);
  
  const loadPresets = useCallback(async () => {
    try {
        const stored = await loadUserPresets();
        setCustomPresets(stored.filter((p: any) => p.recommendedPanel === 'light_panel')); // Updated preset filter
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
        type: 'light', // Changed type
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
          id: `light_${Date.now()}`, // Updated ID prefix
          name, description: desc,
          applyPrompt: promptToSave,
          recommendedPanel: 'light_panel', // Updated recommended panel
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
      {/* Fix: Use the state variable `isSaveModalOpen` for the `isOpen` prop */}
      <PresetSaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSavePreset} />
      
      <div className="p-4 border-b border-white/5 bg-zinc-950/40 shrink-0 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-highlight/10 border border-highlight/40 flex items-center justify-center"> {/* Changed color to highlight */}
                 <SunIcon className="w-4.5 h-4.5 text-highlight" /> {/* Changed color to highlight */}
             </div>
             <div>
                 <h3 className="text-sm font-black italic tracking-tighter text-white uppercase leading-none font-display">Neural Light</h3>
                 <p className="text-[7px] text-highlight font-mono tracking-[0.2em] uppercase font-black opacity-60">Illumination_v1</p> {/* Changed text */}
             </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-10">
          <div className="mb-6">
              <h4 className