// Gemini service for voice conversations
import { GoogleGenAI, Modality } from '@google/genai';

/**
 * Connect to Gemini Live API
 * @param {GoogleGenAI} ai - GoogleGenAI instance
 * @param {string} systemInstruction - System instruction for the AI
 * @param {Object} callbacks - Callback functions
 */
export function connectToGemini(ai, systemInstruction, callbacks) {
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





