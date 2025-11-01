import { GoogleGenAI, LiveServerMessage, Blob, Modality } from '@google/genai';

// Gemini Connection
interface LiveCallbacks {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}

export function connectToGemini(
    ai: GoogleGenAI,
    systemInstruction: string,
    callbacks: LiveCallbacks
) {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemInstruction,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            tools: [{ googleSearch: {} }],
        },
    });
}