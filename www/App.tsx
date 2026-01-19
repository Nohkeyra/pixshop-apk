/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useRef, useEffect, useMemo, useContext } from 'react';
import { clearState, nukeDatabase, dataUrlToBlob } from './services/persistence';
import { AppContext } from './context/AppContext';
import { Spinner } from './components/Spinner';
import { FilterPanel } from './components/FilterPanel';
import { LightPanel } from './components/LightPanel'; 
import { TypographicPanel } from './components/TypographicPanel';
import { VectorArtPanel } from './components/VectorArtPanel';
import { FluxPanel } from './components/FluxPanel';
import { StyleExtractorPanel } from './components/StyleExtractorPanel';
import { CompareSlider } from './components/CompareSlider';
import { ZoomPanViewer } from './components/ZoomPanViewer';
import { XIcon, HistoryIcon, BoltIcon, PaletteIcon, SunIcon, EraserIcon, TypeIcon, VectorIcon, StyleExtractorIcon, CameraIcon, TrashIcon, PlusIcon, UndoIcon, RedoIcon, CompareIcon, WandIcon } from './components/icons';
import { SystemConfigWidget } from './components/SystemConfigWidget';
import { ImageUploadPlaceholder } from './components/ImageUploadPlaceholder';
import { StartScreen } from './components/StartScreen';
import * as geminiService from './services/geminiService';
import { RoutedStyle } from './services/geminiService';
import { HistoryGrid } from './components/HistoryGrid';
import { debugService } from './services/debugService';
import { DebugConsole } from './components/DebugConsole';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { LightningManager } from './components/LightningManager';
import { audioService } from './services/audioService';

export type ActiveTab = 'flux' | 'style_extractor' | 'filters' | 'light' | 'typography' | 'vector';

export interface HistoryItem {
    content: File | string;
    prompt?: string;
    type: 'upload' | 'generation' | 'edit' | 'transformation';
    timestamp: number;
    groundingUrls?: { uri: string; title?: string }[];
}

export type GenerationRequest = {
    type: ActiveTab;
    prompt?: string;
    useOriginal?: boolean;
    forceNew?: boolean;
    aspectRatio?: string;
    isChaos?: boolean;
    batchSize?: number;
    batchIndex?: number;
    systemInstructionOverride?: string;
    negativePrompt?: string; 
    denoisingInstruction?: string; 
    useGoogleSearch?: boolean; 
};

export const App: React.FC = () => {
    const { isLoading, setIsLoading, density, hasPaidApiKey } = useContext(AppContext);
    const [appStarted, setAppStarted] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]); 
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab | null>('flux');
    const [isComparing, setIsComparing] = useState(false);
    const [viewerInstruction, setViewerInstruction] = useState<string | null>(null);
    const [showHistoryGrid, setShowHistoryGrid] = useState(false);
    const [showDebugger, setShowDebugger] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

    useEffect(() => {
        debugService.init();
    }, []);

    useEffect(() => {
        if (isLoading) {
            audioService.startDrone();
        } else {
            audioService.stopDrone();
        }
    }, [isLoading]);

    const currentItem = useMemo(() => history[historyIndex], [history, historyIndex]);
    const [currentMediaUrl, setCurrentMediaUrl] = useState<string | null>(null);

    useEffect(() => {
        if (currentItem) {
            const url = typeof currentItem.content === 'string' 
                ? currentItem.content 
                : URL.createObjectURL(currentItem.content);
            setCurrentMediaUrl(url);
            return () => { if (url && url.startsWith('blob:')) URL.revokeObjectURL(url); };
        } else {
            setCurrentMediaUrl(null);
        }
    }, [currentItem]);

    const originalImageUrl = useMemo(() => {
        const item = history.find(h => h.type === 'upload');
        if (!item) return null;
        return typeof item.content === 'string' ? item.content : URL.createObjectURL(item.content);
    }, [history]);

    const handleImageUpload = useCallback(async (file: File) => {
        audioService.playClick();
        setIsLoading(true);
        setViewerInstruction("INJECTING_SOURCE_DNA...");
        const newItem: HistoryItem = { content: file, type: 'upload', timestamp: Date.now() };
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newItem]);
        setHistoryIndex(prev => prev + 1);
        setAppStarted(true);
        setViewerInstruction(null);
        setIsLoading(false);
    }, [setIsLoading, historyIndex]);

    const handleDownload = useCallback(async () => {
        audioService.playClick();
        if (!currentMediaUrl) return;
        setIsLoading(true);
        setViewerInstruction("COLLECTING_PIXELS...");
        try {
            const blob = currentMediaUrl.startsWith('data:') ? dataUrlToBlob(currentMediaUrl) : await (await fetch(currentMediaUrl)).blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pixshop_${Date.now()}.png`;
            link.click();
            setViewerInstruction("DNA_SAVED");
            audioService.playSuccess();
            setTimeout(() => setViewerInstruction(null), 2000);
        } catch (e: any) { setError(`FAULT: ${e.message}`); } finally { setIsLoading(false); }
    }, [currentMediaUrl, setIsLoading]);

    const handleClearSession = useCallback(async () => { 
        audioService.playClick();
        setHistory([]);
        setHistoryIndex(-1);
        await clearState().catch(console.error); 
    }, []);

    const handleCloseMedia = useCallback(() => {
        audioService.playClick();
        setHistoryIndex(-1);
    }, []);

    const handleTabSwitch = useCallback((tab: ActiveTab) => { 
        audioService.playClick();
        setPendingPrompt(null);
        setActiveTab(tab);
    }, []);

    const handleRouteStyle = useCallback((style: RoutedStyle) => {
        setActiveTab(style.targetTab);
        setPendingPrompt(style.prompt);
    }, []);

    const handleGenerationRequest = useCallback(async (req: GenerationRequest) => {
        audioService.playClick();
        setIsLoading(true);
        setError(null);
        setViewerInstruction("CALIBRATING_NEURAL_FLOW...");
        try {
            const source = (req.useOriginal ? history.find(h => h.type === 'upload')?.content : currentItem?.content) as File;
            let result = '';
            let groundingData: { uri: string; title?: string }[] | undefined;
            
            if (!hasPaidApiKey) {
                 throw new Error("NEURAL_LINK_NULL: API access requires a Neural Link.");
            }
            
            const commonConfig = { ...req, setViewerInstruction };

            switch(req.type) {
                case 'flux':
                    setViewerInstruction("SYNTHESIZING_LATENT_VECTORS...");
                    const fluxResponse = (req.forceNew || !source)
                        ? await geminiService.generateFluxTextToImage(req.prompt!, commonConfig)
                        : await geminiService.generateFluxImage(source, req.prompt!, commonConfig);
                    result = fluxResponse.imageUrl;
                    groundingData = fluxResponse.groundingUrls;
                    break;
                case 'filters':
                case 'light':
                    if (!source) {
                        throw new Error("Missing_Source_Visual: Requires an image to apply filters.");
                    }
                    setViewerInstruction("APPLYING_FILTER_PROTOCOL...");
                    const filterResponse = await geminiService.generateFilteredImage(source, req.prompt!, commonConfig);
                    result = filterResponse.imageUrl;
                    groundingData = filterResponse.groundingUrls;
                    break;
                case 'typography':
                case 'vector':
                    setViewerInstruction("RASTERIZING_PATHS...");
                    // FIX: Falls back to TextToImage if no source image is uploaded
                    const graphicResponse = (!source) 
                        ? await geminiService.generateFluxTextToImage(req.prompt!, commonConfig)
                        : await geminiService.generateFluxImage(source, req.prompt!, commonConfig);
                    result = graphicResponse.imageUrl;
                    groundingData = graphicResponse.groundingUrls;
                    break;
                case 'style_extractor':
                    // Handled by handleRouteStyle
                    break;
            }
            if (result) {
                 const blob = dataUrlToBlob(result);
                 const file = new File([blob], `pix_${Date.now()}.png`, { type: 'image/png' });
                 setHistory(prev => [...prev.slice(0, historyIndex + 1), { content: file, type: 'generation', timestamp: Date.now(), prompt: req.prompt, groundingUrls: groundingData }]);
                 setHistoryIndex(prev => prev + 1);
                 audioService.playSuccess();
            }
        } catch (e: any) { 
            setError(e.message || "SYNTHESIS_FAULT");
        } finally { 
            setIsLoading(false);
            setViewerInstruction(null);
        }
    }, [history, historyIndex, currentItem, setIsLoading, setViewerInstruction, hasPaidApiKey]);

    const sidebarTabs = [
        { id: 'flux', icon: BoltIcon, label: 'FLUX', color: 'text-flux' },
        { id: 'style_extractor', icon: StyleExtractorIcon, label: 'DNA', color: 'text-dna' },
        { id: 'filters', icon: PaletteIcon, label: 'FX', color: 'text-filter' },
        { id: 'light', icon: SunIcon, label: 'LIGHT', color: 'text-highlight' },
        { id: 'vector', icon: VectorIcon, label: 'SVG', color: 'text-vector' },
        { id: 'typography', icon: TypeIcon, label: 'TYPE', color: 'text-type' },
    ];

    return (
        <div className="min-h-screen w-full flex flex-col items-center bg-black overflow-hidden selection:bg-matrix/30">
            <div className="scanline-overlay" />
            <LightningManager />
            <div className="absolute inset-0 asphalt-grid opacity-10 pointer-events-none" />

            <div className="w-full h-full max-w-[1920px] flex flex-col relative z-10 overflow-hidden">
                {showDebugger && <DebugConsole onClose={() => setShowDebugger(false)} />}
                {showHistoryGrid && <HistoryGrid history={history} setHistoryIndex={(i) => { setHistoryIndex(i); setShowHistoryGrid(false); }} onClose={() => setShowHistoryGrid(false)} />}
                <CameraCaptureModal isOpen={showCamera} onClose={() => setShowCamera(false)} onCapture={handleImageUpload} />

                {!appStarted ? (
                    <StartScreen onStart={(tab) => { if (tab) setActiveTab(tab); setAppStarted(true); audioService.playSuccess(); }} />
                ) : (
                    <>
                        <div className={`absolute top-0 left-0 w-full h-[2px] bg-matrix/20 z-[100] transition-opacity duration-500 overflow-hidden ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="h-full w-60 bg-matrix shadow-neon-matrix animate-neural-loading" />
                        </div>

                        <header className="h-14 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 z-50 shrink-0 pt-safe-top">
                            <div className="flex items-center gap-4">
                                <div onClick={handleClearSession} className="cursor-pointer group flex items-center gap-3 active:scale-95 transition-transform">
                                    <div className="w-7 h-7 border border-matrix/30 flex items-center justify-center shadow-neon-matrix transform skew-x-[-12deg] group-hover:skew-x-0 transition-all duration-300 bg-matrix/5">
                                        <BoltIcon className={`w-3.5 h-3.5 skew-x-[12deg] group-hover:skew-x-0 transition-all ${isLoading ? 'text-matrix animate-pulse' : 'text-matrix'}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-base pixshop-wordmark font-display tracking-tighter">PIXSH<span className="text-matrix">O</span>P</h1>
                                        <span className="text-[6px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-black leading-none opacity-40">Neuro_Link.v9</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={() => setShowCamera(true)} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-all hover:bg-white/5 rounded-none"><CameraIcon className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setShowHistoryGrid(true)} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-all hover:bg-white/5 rounded-none"><HistoryIcon className="w-3.5 h-3.5" /></button>
                                <div className="w-px h-4 bg-white/10 mx-2 opacity-30" />
                                <button onClick={handleDownload} disabled={!currentMediaUrl} className="cyber-button px-3 py-1.5 !text-[8px]">SAVE_DNA</button>
                            </div>
                        </header>

                        <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-4 relative gpu-accelerate overflow-hidden">
                            {isLoading && (
                                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-8 animate-fade-in">
                                    <Spinner instruction={viewerInstruction} />
                                    {viewerInstruction && (
                                        <div className="mt-12 text-matrix font-display text-2xl animate-pulse tracking-[0.4em] uppercase px-10 py-4 border-2 border-matrix/30 bg-black shadow-neon-matrix text-center max-w-sm skew-x-[-12deg]">
                                            <span className="skew-x-[12deg] block">{viewerInstruction}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="absolute top-4 z-[70] glass-panel border-red-500/50 bg-red-950/95 text-white p-4 flex gap-4 items-center animate-fade-in max-w-[90vw] shadow-[0_0_60px_rgba(239,68,68,0.3)] rounded-none">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black tracking-widest uppercase opacity-50 mb-0.5 font-mono">System_Fault</p>
                                        <p className="text-[10px] font-bold tracking-tight uppercase leading-tight truncate">{error}</p>
                                    </div>
                                    <button onClick={() => setError(null)} className="px-3 py-1.5 bg-red-500/10 border border-red-500/40 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all skew-x-[-12deg]">
                                        <span className="skew-x-[12deg] block">CLEAR</span>
                                    </button>
                                </div>
                            )}
                            
                            <div className="w-full aspect-[4/5] relative group shadow-2xl">
                                <div className="w-full h-full bg-zinc-900/20 backdrop-blur-md overflow-hidden relative flex items-center justify-center shadow-inner">
                                    {currentMediaUrl ? (
                                        <div className="w-full h-full overflow-hidden relative group">
                                            {isComparing && originalImageUrl ? (
                                                <CompareSlider originalImage={originalImageUrl} modifiedImage={currentMediaUrl} />
                                            ) : (
                                                <ZoomPanViewer src={currentMediaUrl} />
                                            )}
                                        </div>
                                    ) : (
                                        <ImageUploadPlaceholder onImageUpload={handleImageUpload} />
                                    )}
                                </div>

                                <div className="absolute bottom-0 left-0 w-full z-30 pointer-events-none p-4">
                                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 flex justify-between items-center p-2 pointer-events-auto shadow-2xl">
                                        <div className="flex items-center gap-1">
                                            <button onClick={handleCloseMedia} className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-all bg-white/5 border border-white/5"><XIcon className="w-4 h-4" /></button>
                                            <div className="w-px h-6 bg-white/5 mx-2" />
                                            <button onClick={() => setHistoryIndex(Math.max(0, historyIndex - 1))} disabled={historyIndex <= 0} className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-matrix transition-all bg-white/5 border border-white/5"><UndoIcon className="w-4 h-4" /></button>
                                            <button onClick={() => setHistoryIndex(Math.min(history.length - 1, historyIndex + 1))} disabled={historyIndex >= history.length - 1} className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-matrix transition-all bg-white/5 border border-white/5"><RedoIcon className="w-4 h-4" /></button>
                                        </div>
                                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 transition-all group">
                                            <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform text-matrix" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">UPLOAD_SRC</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>

                        <aside className="w-full h-20 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center px-6 z-50 shrink-0 pb-safe-bottom">
                            <div className="flex items-center gap-2 w-full max-w-md overflow-x-auto no-scrollbar py-2">
                                {sidebarTabs.map(tab => (
                                    <button key={tab.id} onClick={() => handleTabSwitch(tab.id as ActiveTab)} className={`flex flex-col items-ce
