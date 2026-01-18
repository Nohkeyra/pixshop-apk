

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MaximizeIcon } from './icons';

interface ZoomPanViewerProps {
    src: string;
    className?: string;
    children?: React.ReactNode; 
}

export const ZoomPanViewer: React.FC<ZoomPanViewerProps> = ({ 
    src, className, children
}) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    
    const dragStart = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const scaleRef = useRef(scale);

    // Sync ref for event handlers
    useEffect(() => { scaleRef.current = scale; }, [scale]);

    // Reset view when image changes
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [src]);

    // Event Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scaleRef.current > 1) {
            setIsDragging(true);
            dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            if (scaleRef.current > 1) {
                setIsDragging(true);
                dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            if (isDragging) {
                setPosition({
                    x: touch.clientX - dragStart.current.x,
                    y: touch.clientX - dragStart.current.y
                });
            }
        }
    };

    // Zoom Wheel
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) < 100) {
                e.preventDefault();
                const delta = -e.deltaY * 0.005;
                const newScale = Math.min(Math.max(1, scaleRef.current + delta), 8);
                setScale(newScale);
                if (newScale === 1) setPosition({ x: 0, y: 0 });
            }
        };

        container.addEventListener('wheel', onWheel, { passive: false });
        return () => container.removeEventListener('wheel', onWheel);
    }, []);

    return (
        <div 
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden bg-surface-deep flex items-center justify-center touch-none select-none ${className || ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            <div className="absolute top-4 right-4 z-20 pointer-events-auto flex flex-col gap-2">
                <button 
                    onClick={() => { setScale(1); setPosition({x:0, y:0}); }}
                    className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white/10 transition-all active:scale-90 shadow-2xl"
                    title="Reset View"
                >
                    <MaximizeIcon size={18} />
                </button>
            </div>

            <div 
                className="relative flex items-center justify-center transform-gpu"
                style={{
                    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale3d(${scale}, ${scale}, 1)`,
                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    width: '100%',
                    height: '100%',
                    transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)'
                }}
            >
                <div className="relative max-w-full max-h-full flex items-center justify-center pointer-events-none">
                    <img 
                        src={src} 
                        alt="Neural Preview" 
                        className="max-w-[95%] max-h-[95%] object-contain shadow-2xl"
                        style={{ imageRendering: 'auto' }}
                    />
                    {children && <div className="absolute inset-0">{children}</div>}
                </div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-md border border-white/5 px-3 py-1 rounded-full text-[9px] font-mono text-gray-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Scale: {scale.toFixed(1)}x
            </div>
        </div>
    );
};