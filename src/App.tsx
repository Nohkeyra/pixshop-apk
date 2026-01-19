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
    const { isLoading, setIsLoading, hasPaidApiKey } = useContext(AppContext);
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
        const updateDisplayMetrics = () => {
            const dpi = window.devicePixelRatio;
            document.documentElement.style.setProperty('--system-dpi', dpi.toString());
        };
        updateDisplayMetrics();
        window.addEventListener('resize', updateDisplayMetrics);
        return () => window.removeEventListener('resize', updateDisplayMetrics);
    }, []);

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
                : URL.createObjectURL(currentItem.content as Blob);
            setCurrentMediaUrl(url);
            return () => { if (url && url.startsWith('blob:')) URL.revokeObjectURL(url); };
        } else {
            setCurrentMediaUrl(null);
        }
    }, [currentItem]);

    const originalImageUrl = useMemo(() => {
        const item = history.find(h => h.type === 'upload');
        if (!item) return null;
        return typeof item.content === 'string' ? item.content : URL.createObjectURL(item.content as Blob);
    }, [history]);

    const handleImageUpload = useCallback(async (file: File) => {
        audioService.playClick();
        setIsLoading(true);
        const newItem: HistoryItem = { content: file, type: 'upload', timestamp: Date.now() };
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newItem]);
        setHistoryIndex(prev => prev + 1);
        setAppStarted(true);
        setIsLoading(false);
    }, [setIsLoading, historyIndex]);

    // SAFE DOWNLOAD LOGIC - AVOIDS BLOB INTENT CRASH
    const handleDownload = useCallback(async () => {
        audioService.playClick();
        if (!currentMediaUrl) {
            setError("NO_PIXELS_IN_BUFFER");
            return;
        }
        setIsLoading(true);
        setViewerInstruction("EXTRACTING_VISUAL_DATA...");
        try {
            const response = await fetch(currentMediaUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result;
                const link = document.createElement('a');
                link.href = base64data as string;
                link.download = `pixshop_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setViewerInstruction("DOWNLOAD_COMPLETE");
                audioService.playSuccess();
                setTimeout(() => setViewerInstruction(null), 2000);
            };
            reader.readAsDataURL(blob);
        } catch (e: any) { 
            setError(`SAVE_FAULT: ${e.message}`); 
        } finally { 
            setIsLoading(false); 
        }
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

    const handleRouteStyle = useCallback((style: any) => {
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
                 throw new Error("NEURAL_LINK_NULL: API access required.");
            }
            
            const commonConfig = { ...req, setViewerInstruction };

            switch(req.type) {
                case 'flux':
                    const fluxResponse = (req.forceNew || !source)
                        ? await geminiService.generateFluxTextToImage(req.prompt!, commonConfig)
                        : await geminiService.generateFluxImage(source, req.prompt!, commonConfig);
                    result = fluxResponse.imageUrl;
                    groundingData = fluxResponse.groundingUrls;
                    break;
                case 'filters':
                case 'light':
                    if (!source) throw new Error("SOURCE_REQUIRED");
                    const filterResponse = await geminiService.generateFilteredImage(source, req.prompt!, commonConfig);
                    result = filterResponse.imageUrl;
                    groundingData = filterResponse.groundingUrls;
                    break;
                case 'typography':
                case 'vector':
                    const graphicResponse = (!source) 
                        ? await geminiService.generateFluxTextToImage(req.prompt!, commonConfig)
                        : await geminiService.generateFluxImage(source, req.prompt!, commonConfig);
                    result = graphicResponse.imageUrl;
                    groundingData = graphicResponse.groundingUrls;
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
            <div className="w-full h-full max-w-[1920px] flex flex-col relative z-10 overflow-hidden">
                {showDebugger && <DebugConsole onClose={() => setShowDebugger(false)} />}
                {showHistoryGrid && <HistoryGrid history={history} setHistoryIndex={(i) => { setHistoryIndex(i); setShowHistoryGrid(false); }} onClose={() => setShowHistoryGrid(false)} />}
                <CameraCaptureModal isOpen={showCamera} onClose={() => setShowCamera(false)} onCapture={handleImageUpload} />

                {!appStarted ? (
                    <StartScreen onStart={(tab) => { if (tab) setActiveTab(tab); setAppStarted(true); audioService.playSuccess(); }} />
                ) : (
                    <>
                        <header className="h-14 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 z-50 shrink-0">
                            <div onClick={handleClearSession} className="cursor-pointer group flex items-center gap-3">
                                <div className="w-7 h-7 border border-matrix/30 flex items-center justify-center bg-matrix/5">
                                    <BoltIcon className={`w-3.5 h-3.5 ${isLoading ? 'text-matrix animate-pulse' : 'text-matrix'}`} />
                                </div>
                                <h1 className="text-base font-display uppercase italic">PIXSH<span className="text-matrix">O</span>P</h1>
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={() => setShowCamera(true)} className="w-8 h-8 flex items-center justify-center text-white/30"><CameraIcon className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setShowHistoryGrid(true)} className="w-8 h-8 flex items-center justify-center text-white/30"><HistoryIcon className="w-3.5 h-3.5" /></button>
                                <button onClick={handleDownload} disabled={!currentMediaUrl} className="cyber-button px-3 py-1.5 !text-[8px]">SAVE_DNA</button>
                            </div>
                        </header>

                        <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-4 relative overflow-hidden">
                            {isLoading && <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"><Spinner instruction={viewerInstruction} /></div>}
                            <div className="w-full aspect-[4/5] relative group shadow-2xl">
                                <div className="w-full h-full bg-zinc-900/20 backdrop-blur-md overflow-hidden relative flex items-center justify-center">
                                    {currentMediaUrl ? <ZoomPanViewer src={currentMediaUrl} /> : <ImageUploadPlaceholder onImageUpload={handleImageUpload} />}
                                </div>
                                <div className="absolute bottom-0 left-0 w-full z-30 p-4">
                                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 flex justify-between items-center p-2">
                                        <button onClick={handleCloseMedia} className="w-9 h-9 flex bg-white/5 items-center justify-center text-zinc-500"><XIcon className="w-4 h-4" /></button>
                                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20">
                                            <PlusIcon className="w-4 h-4 text-matrix" />
                                            <span className="text-[10px] font-black uppercase text-white/70">UPLOAD_SRC</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>

                        <aside className="w-full h-20 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center px-6 z-50">
                            <div className="flex items-center gap-2 w-full max-w-md overflow-x-auto no-scrollbar">
                                {sidebarTabs.map(tab => (
                                    <button key={tab.id} onClick={() => handleTabSwitch(tab.id as ActiveTab)} className={`flex flex-col items-center justify-center min-w-[64px] h-14 transition-all ${activeTab === tab.id ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}>
                                        <tab.icon className={`w-5 h-5 mb-1 ${tab.color}`} />
                                        <span className={`text-[8px] font-bold tracking-widest ${tab.color}`}>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </aside>

                        <div className="w-full max-w-2xl mx-auto px-4 pb-8 z-40 bg-black/50 backdrop-blur-md">
                            {activeTab === 'flux' && <FluxPanel onGenerate={(req) => handleGenerationRequest({ ...req, type: 'flux' })} />}
                            {activeTab === 'filters' && <FilterPanel onGenerate={(prompt) => handleGenerationRequest({ type: 'filters', prompt })} />}
                            {activeTab === 'light' && <LightPanel onGenerate={(prompt) => handleGenerationRequest({ type: 'light', prompt })} />}
                            {activeTab === 'typography' && <TypographicPanel onGenerate={(prompt) => handleGenerationRequest({ type: 'typography', prompt })} />}
                            {activeTab === 'vector' && <VectorArtPanel onGenerate={(prompt) => handleGenerationRequest({ type: 'vector', prompt })} />}
                            {activeTab === 'style_extractor' && <StyleExtractorPanel onRouteStyle={handleRouteStyle} setViewerInstruction={setViewerInstruction} hasImage={!!currentItem} currentImageFile={currentItem?.content instanceof File ? currentItem.content : null} isLoading={isLoading} />}
                        </div>
                        
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
                        <SystemConfigWidget />
                        <div className="fixed bottom-4 right-4 z-[100]">
                             <button onClick={() => setShowDebugger(!showDebugger)} className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center opacity-20 hover:opacity-100"><WandIcon className="w-3.5 h-3.5 text-white" /></button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
