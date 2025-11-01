import { ElevenLabsVoice } from '../types';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io';

export async function getElevenLabsVoices(apiKey: string): Promise<ElevenLabsVoice[]> {
    const response = await fetch(`${ELEVENLABS_API_BASE}/v1/voices`, {
        headers: {
            'xi-api-key': apiKey,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
    }));
}

export async function streamTextToSpeech(
    apiKey: string,
    voiceId: string,
    text: string
): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${ELEVENLABS_API_BASE}/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_turbo_v2', // Or another suitable model
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`ElevenLabs TTS request failed: ${response.statusText}`);
    }

    if (!response.body) {
        throw new Error("ElevenLabs response did not contain a readable stream.");
    }
    
    return response.body;
}
