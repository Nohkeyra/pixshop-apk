/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Factory to always get the freshest instance
const getAiClient = () => {
    // FIX: The build script will replace this string with your real GitHub Secret
    const apiKey = "PLACEHOLDER_API_KEY";
    
    if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
        throw new Error("NEURAL_LINK_NULL: Authentication key missing. Initialize via System Config.");
    }
    return new GoogleGenAI({ apiKey });
};

export const PROTOCOLS = {
// ... keep everything else below this exactly the same ...
    
