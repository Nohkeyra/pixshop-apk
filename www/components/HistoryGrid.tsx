


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { XIcon, HistoryIcon } from './icons';
import { HistoryItem } from '../App';

interface HistoryGridProps {
    history: HistoryItem[];
    setHistoryIndex: (index: number) => void;
    onClose: () => void;
}

const getImageUrl = (item: File | string): string => {
    if (typeof item === 'string') return item;
    return URL.createObjectURL(item);
};

const TypeBadge: React.FC<{ type: HistoryItem['type'] }> = ({ type }) => {
    const colors = {
        upload: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        generation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        edit: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
        transformation: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
    return (
        <span className={`px-2 py-0.5 rounded-none text-[8px] font-mono border uppercase tracking-widest ${colors[type]}`}>
            {type}
        </span>
    );
};

export const HistoryGrid: React.FC<HistoryGridProps> = ({ history, setHistoryIndex, onClose }) => {

    const historyItemsWithUrls = useMemo(() => {
        return history.map((item, index) => ({
            ...item,
            url: getImageUrl(item.content),
            originalIndex: index
        })).reverse();
    }, [history]);

    return (
        <div className="fixed inset-0 z-[500] bg-surface-panel/95 backdrop-blur-md flex flex-col animate-fade-in overflow-hidden pt-[env(safe-area-inset-top)] text-zinc-100">
            <div className="absolute inset-0 asphalt-grid opacity-10" />
            <div className="neural-scanlines absolute inset-0 opacity-10 pointer-events-none"></div>

            <header className="p-6 border-b border-zinc-700 bg-surface-elevated/80 relative z-10 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/40 flex items-center justify-center shadow-lg shadow-primary/10 transform skew-x-[-12deg]">
                        <HistoryIcon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none font-display">
                            Evidence Locker
                        </h3>
                        <p className="text-[10px] text-primary font-mono tracking-[0.4em] uppercase mt-1">
                            Neural History Log
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-3 bg-black/20 border border-zinc-700 text-zinc-500 hover:text-white transition-all transform hover:rotate-90 shadow-sm"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative z-10">
                {historyItemsWithUrls.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-800/30 rounded-lg border border-zinc-700">
                        <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <HistoryIcon className="w-12 h-12 text-zinc-500" />
                        </div>
                        <h4 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-400 font-display">
                            Vault Empty
                        </h4>
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-2">
                            Initialize synthesis to populate archives.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                        {historyItemsWithUrls.map((item) => (
                            <div 
                                key={item.timestamp + '-' + item.originalIndex}
                                className="relative flex flex-col bg-zinc-900/40 border border-zinc-800 group cursor-pointer hover:border-primary transition-all active:scale-[0.98] shadow-md hover:-translate-y-2"
                                onClick={() => { setHistoryIndex(item.originalIndex); onClose(); }}
                            >
                                <div className="aspect-square relative overflow-hidden bg-black/20">
                                    <img 
                                        src={item.url} 
                                        alt={`Sequence ${item.originalIndex}`} 
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="px-4 py-2 bg-primary text-black border-2 border-primary text-[10px] font-black uppercase tracking-widest skew-x-[-10deg]">Restore Seq</div>
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <TypeBadge type={item.type} />
                                    </div>
                                </div>
                                <div className="p-4 border-t border-zinc-700 space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-mono">
                                        <span className="text-zinc-400 font-black">#SEQ_{item.originalIndex.toString().padStart(3, '0')}</span>
                                        <span className="text-zinc-600 font-bold">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {item.prompt && (
                                        <p className="text-[10px] text-zinc-500 line-clamp-2 italic font-mono leading-tight group-hover:text-white transition-colors">
                                            "{item.prompt}"
                                        </p>
                                    )}
                                    {item.groundingUrls && item.groundingUrls.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-zinc-800 flex flex-wrap gap-1">
                                            <span className="text-[7px] font-mono text-matrix uppercase tracking-widest font-bold">Sources:</span>
                                            {item.groundingUrls.map((link, idx) => (
                                                <a 
                                                    key={idx} 
                                                    href={link.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-[7px] font-mono text-blue-400 hover:text-blue-200 underline truncate max-w-[100px]"
                                                >
                                                    {link.title || link.uri}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <footer className="p-6 bg-surface-elevated/80 border-t border-zinc-700 text-center relative z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.8em] font-black">
                    Neural Archive Terminal • {history.length} Sequences Cached
                </p>
            </footer>
        </div>
    );
};
