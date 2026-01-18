

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { audioService } from '../services/audioService';

type Theme = 'dark' | 'light';
// Removed 'gemini-3-pro-image-preview' as an option
export type ImageModel = 'gemini-2.5-flash-image'; 

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

interface AppContextType {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    isFastAiEnabled: boolean;
    setIsFastAiEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    theme: Theme;
    toggleTheme: () => void;
    pixelRatio: number;
    density: 'compact' | 'standard' | 'large';
    imageModel: ImageModel;
    // Removed setImageModel from type as it's no longer user-selectable
    isAudioMuted: boolean;
    toggleAudio: () => void;
    hasPaidApiKey: boolean; // Added
    setHasPaidApiKey: React.Dispatch<React.SetStateAction<boolean>>; // Added
}

export const AppContext = createContext<AppContextType>({
    isLoading: false,
    setIsLoading: () => {},
    isFastAiEnabled: false,
    setIsFastAiEnabled: () => {},
    theme: 'dark',
    toggleTheme: () => {},
    pixelRatio: 1,
    density: 'standard',
    imageModel: 'gemini-2.5-flash-image',
    // setImageModel: () => {}, // Removed
    isAudioMuted: false,
    toggleAudio: () => {},
    hasPaidApiKey: false, // Default value
    setHasPaidApiKey: () => {}, // Default setter
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFastAiEnabled, setIsFastAiEnabled] = useState(false);
    const [pixelRatio, setPixelRatio] = useState(window.devicePixelRatio || 1);
    const [density, setDensity] = useState<'compact' | 'standard' | 'large'>('standard');
    const [hasPaidApiKey, setHasPaidApiKey] = useState(false); // New state for API key status
    
    // Always default to 'gemini-2.5-flash-image'
    const [imageModel, setImageModel] = useState<ImageModel>('gemini-2.5-flash-image');

    const [isAudioMuted, setIsAudioMuted] = useState(() => {
        try {
            return localStorage.getItem('app-audio-muted') === 'true';
        } catch {
            return false;
        }
    });

    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const saved = localStorage.getItem('app-theme');
            return (saved === 'light') ? 'light' : 'dark';
        } catch {
            return 'dark';
        }
    });

    // Initialize Audio Service
    useEffect(() => {
        const initAudio = async () => {
            await audioService.init(); // Ensure init is awaited to load custom drone
            audioService.setMuted(isAudioMuted);
        };
        initAudio();
    }, [isAudioMuted]);

    const updateMetrics = useCallback(() => {
        const pr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        setPixelRatio(pr);
        
        let d: 'compact' | 'standard' | 'large' = 'standard';
        // Tailored for mobile viewports (e.g. Pixel 7 is ~412px width)
        if (width < 640) {
            d = 'compact';
        } else if (width > 1400) {
            d = 'large';
        }
        
        setDensity(d);
        document.documentElement.style.setProperty('--ui-density', d === 'compact' ? '0.8' : (d === 'large' ? '1.1' : '1'));
    }, []);

    useEffect(() => {
        updateMetrics();
        window.addEventListener('resize', updateMetrics);
        return () => window.removeEventListener('resize', updateMetrics);
    }, [updateMetrics]);

    // Check API key status on app load
    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio) {
                try {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    setHasPaidApiKey(hasKey);
                } catch (e) {
                    console.error("Failed to check API key status on app load:", e);
                    setHasPaidApiKey(false);
                }
            } else {
                setHasPaidApiKey(!!process.env.API_KEY); // Fallback for local dev
            }
        };
        checkKey();
    }, []);


    // Removed localStorage saving for imageModel as it's no longer user-selectable
    // useEffect(() => {
    //     localStorage.setItem('app-image-model', imageModel);
    // }, [imageModel]);

    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('app-theme', newTheme);
            return newTheme;
        });
    };

    const toggleAudio = () => {
        setIsAudioMuted(prev => {
            const newState = !prev;
            localStorage.setItem('app-audio-muted', String(newState));
            audioService.setMuted(newState);
            return newState;
        });
    };

    return (
        <AppContext.Provider value={{ 
            isLoading, setIsLoading, isFastAiEnabled, setIsFastAiEnabled, 
            theme, toggleTheme, pixelRatio, density, imageModel, // imageModel is now fixed
            isAudioMuted, toggleAudio, hasPaidApiKey, setHasPaidApiKey
        }}>
            {children}
        </AppContext.Provider>
    );
};