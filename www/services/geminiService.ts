
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Factory to always get the freshest instance
const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("NEURAL_LINK_NULL: Authentication key missing. Initialize via System Config.");
    }
    return new GoogleGenAI({ apiKey });
};

export const PROTOCOLS = {
    ARTIST: `You are the PIXSHOP Synthesis Engine. Transform prompts into raw, high-fidelity urban visuals. Adhere to street-culture aesthetics: grit, neon, and high contrast.`,
    EDITOR: `Role: High-End Neural Retoucher. Apply technical adjustments with photographic precision.`,
    DESIGNER: `Role: Professional Urban Vector Designer. Output crisp, flat illustrations with bold silhouettes and isolated backgrounds.`,
    TYPOGRAPHER: `Role: Master Street Typographer. Render text as high-impact urban assets (stencil, wildstyle, chrome).`,
    IMAGE_TRANSFORMER: `Role: Stylistic Diffusion Core. Infuse the source subject with the target visual DNA.`,
    STYLE_ROUTER: `Analyze visual DNA and route to: 'filter_panel', 'vector_art_panel', 'typographic_panel'. Output STRICT JSON.`,
    PRESET_GENERATOR: `Analyze prompt and generate urban metadata. Output STRICT JSON.`
};

export interface ImageGenerationConfig {
    aspectRatio?: string;
    isChaos?: boolean;
    systemInstructionOverride?: string;
    negativePrompt?: string; 
    denoisingInstruction?: string; 
    setViewerInstruction?: (text: string | null) => void; // New prop for granular feedback
    useGoogleSearch?: boolean; // New prop for grounding
}

// Unified response type for image generation
interface ImageGenerationResult {
    imageUrl: string;
    groundingUrls?: { uri: string; title?: string }[];
}

const fileToPart = async (file: File | string, setViewerInstruction?: (text: string | null) => void): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    if (typeof file === 'string') {
        const parts = file.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        const data = parts[1];
        return { inlineData: { mimeType, data } };
    }
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (setViewerInstruction) setViewerInstruction("UPLOADING_VOXEL_MAP...");
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve({ inlineData: { mimeType: file.type, data: base64Data } });
        };
        reader.onerror = () => reject(new Error("IO_FAULT: Image sequence corrupted during read."));
    });
};

const handleApiResponse = (response: GenerateContentResponse, setViewerInstruction?: (text: string | null) => void): ImageGenerationResult => {
    if (setViewerInstruction) setViewerInstruction("DECODING_NEURAL_RESPONSE...");
    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("BUFFER_EMPTY: Neural response returned null content.");
    if (candidate.finishReason === 'SAFETY') throw new Error("SYNTHESIS_ABORTED: Neural safety filter triggered. Content contains prohibited tokens.");

    let imageUrl: string | undefined;
    for (const part of candidate.content.parts) {
        if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
        }
    }
    if (!imageUrl) throw new Error("PARSING_FAULT: Synthesis succeeded but visual data stream was truncated.");

    const groundingUrls: { uri: string; title?: string }[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        for (const chunk of response.candidates[0].groundingMetadata.groundingChunks) {
            if (chunk.web?.uri) {
                groundingUrls.push({ uri: chunk.web.uri, title: chunk.web.title });
            }
            if (chunk.maps?.uri) { // Also handle Maps grounding, although not explicitly requested for this feature.
                groundingUrls.push({ uri: chunk.maps.uri, title: chunk.maps.title });
            }
        }
    }

    return { imageUrl, groundingUrls: groundingUrls.length > 0 ? groundingUrls : undefined };
};

export const refineImagePrompt = async (prompt: string, useDeepThinking?: boolean, setViewerInstruction?: (text: string | null) => void): Promise<string> => {
    try {
        if (setViewerInstruction) setViewerInstruction("REFINING_PROMPT_GRAMMAR...");
        const ai = getAiClient();
        // Always use gemini-3-flash-preview for text reasoning (free tier compatible)
        const model = 'gemini-3-flash-preview'; 
        
        const config: any = {};
        if (useDeepThinking) { // useDeepThinking can still be used to enable deeper thinking for flash model
            config.thinkingConfig = { thinkingBudget: 2048 };
        }

        const response = await ai.models.generateContent({
            model,
            contents: `Professionalize this urban synthesis prompt into a high-density AI generation directive: "${prompt}". Focus on lighting, texture, and composition terms.`,
            config
        });
        return response.text || prompt;
    } catch (e: any) {
        if (e.message?.includes('403') || e.message?.includes('401') || e.message?.includes('NEURAL_LINK_NULL')) throw new Error("AUTH_DENIED: Invalid Neural Link Key. Reset via Config.");
        if (e.message?.includes('429')) throw new Error("BUFFER_OVERFLOW: API rate limit reached. Cool down.");
        throw e;
    } finally {
        if (setViewerInstruction) setViewerInstruction(null);
    }
};

export const generateFluxTextToImage = async (prompt: string, config?: ImageGenerationConfig): Promise<ImageGenerationResult> => {
    if (config?.setViewerInstruction) config.setViewerInstruction("GENERATING_FLUX_FROM_TEXT...");
    const ai = getAiClient();
    // Always use gemini-2.5-flash-image for image generation (free tier compatible)
    const model = 'gemini-2.5-flash-image';
    const generationConfig: any = {
        systemInstruction: config?.systemInstructionOverride || PROTOCOLS.ARTIST,
        imageConfig: { aspectRatio: (config?.aspectRatio || '1:1') as any }
    };
    if (config?.useGoogleSearch) {
        generationConfig.tools = [{googleSearch: {}}];
    }

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: `${prompt}${config?.negativePrompt ? ` --avoid ${config.negativePrompt}` : ''}` }] },
        config: generationConfig
    });
    return handleApiResponse(response, config?.setViewerInstruction);
};

export const generateFluxImage = async (source: File | string, prompt: string, config?: ImageGenerationConfig): Promise<ImageGenerationResult> => {
    if (config?.setViewerInstruction) config.setViewerInstruction("TRANSFORMING_VISUAL_FLUX...");
    const ai = getAiClient();
    // Always use gemini-2.5-flash-image for image generation (free tier compatible)
    const model = 'gemini-2.5-flash-image';
    const imagePart = await fileToPart(source, config?.setViewerInstruction);
    const generationConfig: any = {
        systemInstruction: config?.systemInstructionOverride || PROTOCOLS.IMAGE_TRANSFORMER, 
        imageConfig: { aspectRatio: (config?.aspectRatio || '1:1') as any }
    };
    if (config?.useGoogleSearch) {
        generationConfig.tools = [{googleSearch: {}}];
    }

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }, imagePart] },
        config: generationConfig
    });
    return handleApiResponse(response, config?.setViewerInstruction);
};

export const generateFilteredImage = async (source: File | string, prompt: string, config?: ImageGenerationConfig): Promise<ImageGenerationResult> => {
    if (config?.setViewerInstruction) config.setViewerInstruction("APPLYING_NEURAL_FILTERS...");
    const ai = getAiClient();
    // Always use gemini-2.5-flash-image for image generation (free tier compatible)
    const model = 'gemini-2.5-flash-image';
    const imagePart = await fileToPart(source, config?.setViewerInstruction);
    const generationConfig: any = {
        systemInstruction: config?.systemInstructionOverride || PROTOCOLS.EDITOR, 
        imageConfig: { aspectRatio: (config?.aspectRatio || '1:1') as any }
    };
    if (config?.useGoogleSearch) {
        generationConfig.tools = [{googleSearch: {}}];
    }
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }, imagePart] },
        config: generationConfig
    });
    return handleApiResponse(response, config?.setViewerInstruction);
};

export interface RoutedStyle {
    target_panel_id: 'filter_panel' | 'vector_art_panel' | 'typographic_panel';
    preset_data: { name: string; description: string; prompt: string; };
}

export const extractStyleFromImage = async (imageFile: File | string, setViewerInstruction?: (text: string | null) => void): Promise<RoutedStyle> => {
    if (setViewerInstruction) setViewerInstruction("SEQUENCING_VISUAL_DNA...");
    const ai = getAiClient();
    const imagePart = await fileToPart(imageFile, setViewerInstruction);
    const response = await ai.models.generateContent({
        // Always use gemini-3-flash-preview for text reasoning (free tier compatible)
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: "Extract Visual DNA and route to target module." }, imagePart] },
        config: {
            systemInstruction: PROTOCOLS.STYLE_ROUTER,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    target_panel_id: { type: Type.STRING, enum: ['filter_panel', 'vector_art_panel', 'typographic_panel'] },
                    preset_data: {
                        type: Type.OBJECT,
                        properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, prompt: { type: Type.STRING } },
                        required: ['name', 'description', 'prompt']
                    }
                },
                required: ['target_panel_id', 'preset_data']
            }
        }
    });
    return JSON.parse(response.text || '{}');
};

export const describeImageForPrompt = async (imageFile: File | string, setViewerInstruction?: (text: string | null) => void): Promise<string> => {
    if (setViewerInstruction) setViewerInstruction("ANALYZING_IMAGE_GEOMETRY...");
    const ai = getAiClient();
    const imagePart = await fileToPart(imageFile, setViewerInstruction);
    const response = await ai.models.generateContent({
        // Always use gemini-3-flash-preview for text reasoning (free tier compatible)
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: "Describe the core subject and aesthetic of this image for a synthesis prompt." }, imagePart] },
    });
    return response.text || "";
};