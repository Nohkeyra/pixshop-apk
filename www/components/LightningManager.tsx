/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';

interface Bolt {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  path: string;
  branches: string[];
}

const generateBoltPath = (length: number, jitter: number) => {
  let path = 'M 30 0';
  const segments = 16;
  let currentX = 30;
  let currentY = 0;
  const dy = length / segments;

  for (let i = 1; i <= segments; i++) {
    const currentJitter = jitter * (i / segments);
    currentX += (Math.random() - 0.5) * currentJitter;
    currentY += dy;
    path += ` L ${currentX} ${currentY}`;
  }
  return path;
};

export const LightningManager: React.FC = () => {
  const [bolts, setBolts] = useState<Bolt[]>([]);
  const [isFlashActive, setIsFlashActive] = useState(false);

  const triggerStrike = useCallback(() => {
    const boltCount = Math.floor(Math.random() * 2) + 1;
    const newBolts: Bolt[] = Array.from({ length: boltCount }).map(() => {
      const mainPath = generateBoltPath(100, 50);
      const branches = Array.from({ length: Math.floor(Math.random() * 4) }).map(() => {
          return generateBoltPath(30 + Math.random() * 40, 25);
      });

      return {
        id: Math.random(),
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        scale: 0.4 + Math.random() * 1.6,
        rotation: (Math.random() - 0.5) * 60,
        opacity: 1,
        path: mainPath,
        branches
      };
    });

    setBolts(newBolts);
    setIsFlashActive(true);

    const runFlicker = (stage: number) => {
      const stages = [
        { opacity: 1, delay: 50, flash: true },
        { opacity: 0.2, delay: 20, flash: false },
        { opacity: 0.8, delay: 40, flash: true },
        { opacity: 0.1, delay: 30, flash: false },
        { opacity: 0.5, delay: 60, flash: true },
        { opacity: 0, delay: 0, flash: false }
      ];

      if (stage >= stages.length) {
        setBolts([]);
        setIsFlashActive(false);
        return;
      }

      const current = stages[stage];
      setTimeout(() => {
        setBolts(prev => prev.map(b => ({
          ...b,
          opacity: current.opacity,
          x: b.x + (Math.random() - 0.5) * 1.5
        })));
        setIsFlashActive(current.flash);
        runFlicker(stage + 1);
      }, current.delay);
    };

    runFlicker(0);
  }, []);

  useEffect(() => {
    let timeoutId: number;
    const scheduleNext = () => {
      const delay = 6000 + Math.random() * 12000;
      timeoutId = window.setTimeout(() => {
        triggerStrike();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [triggerStrike]);

  return (
    <>
      <div 
        className={`fixed inset-0 pointer-events-none z-[99998] bg-white transition-opacity duration-75 ${isFlashActive ? 'opacity-[0.15]' : 'opacity-0'}`}
        style={{ filter: 'brightness(1.8)', mixBlendMode: 'screen' }}
      />
      
      <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
        {bolts.map((bolt) => (
          <div
            key={bolt.id}
            className="absolute"
            style={{
              left: `${bolt.x}%`,
              top: `${bolt.y}%`,
              transform: `translate(-50%, -50%) rotate(${bolt.rotation}deg) scale(${bolt.scale})`,
              opacity: bolt.opacity,
              transition: 'opacity 0.04s ease-out'
            }}
          >
            <div className="relative">
                <svg width="150" height="250" viewBox="0 0 60 100" fill="none" className="text-lightning blur-[25px] opacity-40 absolute inset-0">
                  <path d={bolt.path} stroke="currentColor" strokeWidth="10" fill="none" strokeLinecap="round" />
                  {bolt.branches.map((b, i) => (
                      <path key={i} d={b} stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" transform={`translate(${15 * (i+1)}, ${15 * (i+1)}) rotate(${30 * (i+1)})`} />
                  ))}
                </svg>
                
                <svg width="150" height="250" viewBox="0 0 60 100" fill="none" className="text-white filter drop-shadow-[0_0_15px_rgba(255,255,255,1)]">
                  <path d={bolt.path} stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d={bolt.path} stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" className="opacity-90" />
                  {bolt.branches.map((b, i) => (
                      <path key={i} d={b} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" transform={`translate(${15 * (i+1)}, ${15 * (i+1)}) rotate(${30 * (i+1)})`} />
                  ))}
                </svg>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};