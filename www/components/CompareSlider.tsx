/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CompareIcon } from './icons';

interface CompareSliderProps {
    originalImage: string;
    modifiedImage: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({ originalImage, modifiedImage }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
    }, []);

    const onMouseDown = () => setIsDragging(true);
    const onTouchStart = () => setIsDragging(true);

    useEffect(() => {
        const onMouseUp = () => setIsDragging(false);
        const onMouseMove = (e: MouseEvent) => { if (isDragging) handleMove(e.clientX); };
        const onTouchMove = (e: TouchEvent) => { if (isDragging) handleMove(e.touches[0].clientX); };

        if (isDragging) {
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('touchend', onMouseUp);
            window.addEventListener('touchmove', onTouchMove);
        }

        return () => {
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchend', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, [isDragging, handleMove]);

    return (
        <div ref={containerRef} className="relative w-full h-full max-h-[80vh] aspect-square md:aspect-auto select-none overflow-hidden group border border-zinc-800 bg-black/50 shadow-2xl rounded-sm">
             {/* Background: Modified Image */}
             <img 
                src={modifiedImage} 
                alt="Modified" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
             />

             {/* Foreground: Original Image (Clipped) */}
             <div 
                className="absolute inset-0 pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
             >
                <img 
                    src={originalImage} 
                    alt="Original" 
                    className="absolute inset-0 w-full h-full object-contain" 
                />
             </div>

             {/* Labels */}
             <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border border-zinc-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                 Original
             </div>
             <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-primary text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                 Modified
             </div>

             {/* Slider Handle */}
             <div 
                className="absolute top-0 bottom-0 w-0.5 bg-primary cursor-ew-resize z-10 group-hover:shadow-[0_0_15px_rgba(255,51,0,0.8)] transition-all"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
             >
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <div className="w-6 h-6 bg-black border border-primary rounded-full flex items-center justify-center shadow-lg">
                        <CompareIcon className="w-3 h-3 text-primary" />
                    </div>
                 </div>
             </div>
        </div>
    );
};