

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleExtractorIcon, PaletteIcon, VectorIcon, TypeIcon, SaveIcon, TrashIcon, HistoryIcon, DownloadIcon, UploadIcon, CheckIcon, SparklesIcon } from './icons';
import { extractStyleFromImage, RoutedStyle } from '../services/geminiService';
import { saveUserPresets, loadUserPresets } from '../services/persistence';

interface StyleExtractorPanelProps {
  isLoading: boolean;
  hasImage: boolean;
  currentImageFile: File | null;
  onRouteStyle: (style: RoutedStyle) => void;
  // isFastAiEnabled: boolean; // Removed, as model choice is now fixed
  setViewerInstruction: (text: string | null) => void;
}

const PanelIconMap: Record<string, React.FC<{className?: string}>> = {
    filter_panel: PaletteIcon,
    vector_art_panel: VectorIcon,
    typographic_panel: TypeIcon,
    flux: StyleExtractorIcon
};

const PanelNameMap: Record<string, string> = {
    filter_panel: 'Filters',
    vector_art_panel: 'Vector',
    typographic_panel: 'Type',
    flux: 'Flux'
};

const PanelColorMap: Record<string, string> = {
    filter_panel: 'text-filter',
    vector_art_panel: 'text-vector',
    typographic_panel: 'text-type',
    flux: 'text-flux'
};

export const StyleExtractorPanel: React.FC<StyleExtractorPanelProps> = ({ 
  isLoading, 
  hasImage, 
  currentImageFile, 
  onRouteStyle,
  setViewerInstruction
}) => {
  const [activeView, setActiveView] = useState<'scan' | 'library'>('scan');
  const [routedStyle, setRoutedStyle] = useState<RoutedStyle | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedPresets, setSavedPresets] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPresets = useCallback(async () => {
    setIsLoadingLibrary(true);
    try {
        const loaded = await loadUserPresets();
        setSavedPresets(loaded);
    } catch (e) {
        console.error("Failed to load presets", e);
        setError("Library Fault.");
    } finally {
        setIsLoadingLibrary(false);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  useEffect(() => {
    setRoutedStyle(null);
    setActiveView('scan');
    setError(null);
    setSelectedPanel(null);
    setIsSaved(false);
  }, [currentImageFile]);

  useEffect(() => {
    if (routedStyle) {
      setSelectedPanel(routedStyle.target_panel_id);
    }
  }, [routedStyle]);

  const handleExtract = useCallback(async () => {
    if (!currentImageFile || isExtracting) return;
    
    setIsExtracting(true);
    setError(null);
    setRoutedStyle(null);
    setSelectedPanel(null);
    setIsSaved(false);
    setViewerInstruction("SEQUENCING_VISUAL_DNA...");
    
    try {
      const result = await extractStyleFromImage(currentImageFile, setViewerInstruction);
      setRoutedStyle(result);
    } catch (e: any) {
      console.error('Extraction failed:', e);
      setError(e.message || "Extraction Fault.");
    } finally {
      setIsExtracting(false);
      setViewerInstruction(null);
    }
  }, [currentImageFile, isExtracting, setViewerInstruction]);

  const handleSavePreset = async () => {
    if (!routedStyle || !selectedPanel) return;
    try {
        const existingPresets = await loadUserPresets();
        const promptContent = routedStyle.preset_data.prompt;
        const newPreset = {
            id: `dna_${Date.now()}`,
            name: routedStyle.preset_data.name,
            description: routedStyle.preset_data.description,
            applyPrompt: promptContent, 
            genPrompt: promptContent, 
            category: 'CUSTOM',
            recommendedPanel: selectedPanel,
            isCustom: true,
            timestamp: Date.now()
        };
        const updatedPresets = [newPreset, ...existingPresets];
        await saveUserPresets(updatedPresets);
        setSavedPresets(updatedPresets);
        setIsSaved(true);
        window.dispatchEvent(new Event('stylePresetsUpdated'));
    } catch (e) {
        setError("Save Fault.");
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
        const existing = await loadUserPresets();
        const updated = existing.filter(p => p.id !== id);
        await saveUserPresets(updated);
        setSavedPresets(updated);
        window.dispatchEvent(new Event('stylePresetsUpdated'));
    } catch (e) {}
  };

  const handleRoute = useCallback((styleToRoute?: RoutedStyle) => {
    const style = styleToRoute || routedStyle;
    const targetPanel = styleToRoute ? styleToRoute.target_panel_id : selectedPanel;
    if (style && targetPanel) {
      onRouteStyle({ ...style, target_panel_id: targetPanel as any });
    }
  }, [routedStyle, onRouteStyle, selectedPanel]);

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedPresets));
      const anchor = document.createElement('a');
      anchor.setAttribute("href", dataStr);
      anchor.setAttribute("download", `pixshop_dna_${Date.now()}.json`);
      anchor.click();
  };

  const canExtract = hasImage && currentImageFile && !isLoading && !isExtracting;

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% -20%, rgba(168, 85, 247, 0.1) 0%, transparent 70%)' }} />

      <div className="p-5 border-b border-zinc-800 bg-zinc-950/80 shrink-0 relative z-10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-none bg-dna/20 border border-dna/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                     <StyleExtractorIcon className="w-5 h-5 text-dna" />
                 </div>
                 <div>
                     <h3 className="text-lg font-black italic tracking-tighter text-white uppercase leading-none font-display">DNA Lab</h3>
                     <p className="text-[9px] text-dna font-mono tracking-[0.2em] uppercase font-bold drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">Visual.Extraction</p>
                 </div>
             </div>
             
             {/* Relocated Toggle Bar to Top */}
             <div className="flex p-1 bg-black/40 border border-zinc-800 rounded-none overflow-hidden h-9">
                {['scan', 'library'].map((v) => (
                    <button 
                        key={v}
                        onClick={() => setActiveView(v as any)}
                        className={`px-4 text-[8px] font-black uppercase tracking-widest transition-all rounded-none ${activeView === v ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        {v === 'scan' ? 'SCANNER' : `ARCHIVE (${savedPresets.length})`}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar relative z-10 pb-32">
         {activeView === 'scan' ? (
             !routedStyle ? (
                 <div className="h-full flex flex-col items-center justify-center border border-zinc-800 bg-black/20 text-center p-8 rounded-none mt-4">
                     <StyleExtractorIcon className="w-10 h-10 text-zinc-700 mb-4" />
                     <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.2em] leading-relaxed max-w-[160px]">
                        Upload seed image to sequence visual DNA.
                     </p>
                 </div>
             ) : (
                 <div className="animate-fade-in space-y-6">
                     <div className="bg-black/40 border border-zinc-800 p-4 rounded-none space-y-6">
                        <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-3 font-black">Target Lock</span>
                            <div className="flex gap-2">
                                {['filters', 'vector', 'typography'].map((id) => {
                                    const actualId = id === 'filters' ? 'filter_panel' : (id === 'vector' ? 'vector_art_panel' : 'typographic_panel');
                                    const Icon = PanelIconMap[actualId];
                                    const isActive = selectedPanel === actualId;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => { setSelectedPanel(actualId); setIsSaved(false); }}
                                            className={`flex-1 p-3 border transition-all flex flex-col items-center gap-2 rounded-none ${isActive ? 'bg-dna/20 border-dna text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-black/40 border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700'}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-[9px] font-black uppercase tracking-wider">{id}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Identity</span>
                                    <p className="text-white font-black text-base uppercase tracking-tight font-display italic leading-tight">{routedStyle.preset_data.name}</p>
                                </div>
                                <button 
                                    onClick={handleSavePreset}
                                    disabled={isSaved}
                                    className={`p-2.5 border transition-all rounded-none ${isSaved ? 'bg-zinc-900 border-zinc-800 text-green-500' : 'bg-black/40 border-dna/40 text-dna hover:border-dna'}`}
                                >
                                    {isSaved ? <CheckIcon className="w-4 h-4" /> : <SaveIcon className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-zinc-500 text-[11px] leading-relaxed italic font-mono">"{routedStyle.preset_data.description}"</p>
                        </div>
                     </div>
                 </div>
             )
         ) : (
             <div className="space-y-4 animate-fade-in pb-10">
                 <div className="flex gap-2 mb-4">
                    <button onClick={handleExport} disabled={savedPresets.length === 0} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-dna hover:border-dna/40 transition-all rounded-none">
                        <DownloadIcon className="w-3.5 h-3.5" /> Export
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-dna hover:border-dna/40 transition-all rounded-none">
                        <UploadIcon className="w-3.5 h-3.5" /> Import
                    </button>
                    <input type="file" ref={fileInputRef} onChange={(e) => {}} accept=".json" className="hidden" />
                 </div>

                {savedPresets.length === 0 ? (
                    <div className="text-center py-20 opacity-30">
                        <HistoryIcon className="w-8 h-8 mx-auto mb-4 text-zinc-700" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">DNA Archives Empty</p>
                    </div>
                ) : (
                    savedPresets.map((preset) => {
                        const Icon = PanelIconMap[preset.recommendedPanel] || StyleExtractorIcon;
                        const colorClass = PanelColorMap[preset.recommendedPanel] || 'text-zinc-500';
                        return (
                            <div key={preset.id} className="preset-card bg-black/40 p-4 flex flex-col gap-4 group relative rounded-none">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner">
                                            <Icon className={`w-5 h-5 ${colorClass}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-black text-white uppercase tracking-tight leading-tight">{preset.name}</h4>
                                            <p className={`text-[9px] font-mono uppercase font-black opacity-50 mt-1`}>{PanelNameMap[preset.recommendedPanel]}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeletePreset(preset.id)} className="text-zinc-600 hover:text-red-500 transition-colors relative z-20 p-1"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                                <button 
                                    onClick={() => handleRoute({ target_panel_id: preset.recommendedPanel, preset_data: { name: preset.name, description: preset.description, prompt: preset.applyPrompt } })}
                                    className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all rounded-none relative z-20"
                                >
                                    Inject Sequence
                                </button>
                            </div>
                        );
                    })
                )}
             </div>
         )}
      </div>

      {/* Floating Execute Button to prevent occlusion */}
      <div className="absolute bottom-5 left-5 right-5 z-20 pointer-events-auto">
          <button
              onClick={routedStyle ? () => handleRoute() : handleExtract}
              disabled={!canExtract && !routedStyle}
              className="execute-btn group border-zinc-800 hover:border-dna transition-colors !bg-zinc-950/90 backdrop-blur-xl"
          >
              <div className="relative z-10 flex items-center justify-center gap-3 h-full">
                  <span className={`font-black italic uppercase tracking-[0.2em] text-[11px] transition-colors skew-x-[-10deg] ${isExtracting ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-dna'}`}>
                      {isExtracting ? 'Sequencing...' : (routedStyle ? `Jump to ${PanelNameMap[selectedPanel || '']}` : 'Analyze DNA')}
                  </span>
                  <SparklesIcon className={`w-4 h-4 transition-colors ${isExtracting ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-dna'}`} />
              </div>
          </button>
      </div>
    </div>
  );
};