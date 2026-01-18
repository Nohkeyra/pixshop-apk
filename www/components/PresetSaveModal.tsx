
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { XIcon } from './icons';

interface PresetSaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, desc: string) => void;
}

export const PresetSaveModal: React.FC<PresetSaveModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-surface-panel border-2 border-zinc-800 p-6 w-full max-w-sm shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-zinc-500 hover:text-white transition-colors"><XIcon className="w-5 h-5"/></button>
                <h3 className="text-xl font-black italic text-white mb-4 uppercase font-display tracking-wider">Save Preset</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">ID Tag</label>
                        <input 
                            className="w-full bg-black border border-zinc-700 p-3 text-sm text-white font-mono placeholder-zinc-600 focus:border-primary focus:outline-none transition-colors"
                            placeholder="PRESET_NAME"
                            value={name}
                            onChange={e => setName(e.target.value.toUpperCase())}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Meta Description</label>
                        <textarea 
                             className="w-full bg-black border border-zinc-700 p-3 text-xs text-white font-mono placeholder-zinc-600 resize-none h-20 focus:border-primary focus:outline-none transition-colors"
                             placeholder="Brief description of the visual style..."
                             value={desc}
                             onChange={e => setDesc(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    disabled={!name.trim()}
                    onClick={() => { onSave(name, desc); onClose(); setName(''); setDesc(''); }}
                    className="w-full mt-6 bg-primary text-black font-black uppercase py-3 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                    Save to Archive
                </button>
            </div>
        </div>
    )
}
