// Eleven Labs TTS service
const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io';

/**
 * Get available Eleven Labs voices
 * @param {string} apiKey - Eleven Labs API key
 * @returns {Promise<Array>} Array of voices
 */
export async function getElevenLabsVoices(apiKey) {
  const response = await fetch(`${ELEVENLABS_API_BASE}/v1/voices`, {
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.statusText}`);
  }

  const data = await response.json();
  return data.voices.map((voice) => ({
    voice_id: voice.voice_id,
    name: voice.name,
  }));
}

/**
 * Stream text to speech using Eleven Labs
 * @param {string} apiKey - Eleven Labs API key
 * @param {string} voiceId - Voice ID to use
 * @param {string} text - Text to convert to speech
 * @returns {Promise<ReadableStream>} Audio stream
 */
export async function streamTextToSpeech(apiKey, voiceId, text, voiceSettings = { stability: 0.5, similarity_boost: 0.75 }) {
  const response = await fetch(`${ELEVENLABS_API_BASE}/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_turbo_v2',
      voice_settings: {
        stability: voiceSettings.stability ?? 0.5,
        similarity_boost: voiceSettings.similarity_boost ?? 0.75,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS request failed: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('ElevenLabs response did not contain a readable stream.');
  }
  
  return response.body;
}

/**
 * Play audio from Eleven Labs stream
 * @param {ReadableStream} stream - Audio stream
 * @param {AudioContext} audioContext - Audio context
 * @returns {Promise<void>}
 */
export async function playElevenLabsAudio(stream, audioContext, onSource) {
  const reader = stream.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });

  // Ensure audio context is running (user gesture may have created it suspended)
  try {
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
    }
  } catch (e) {
    // continue - we'll still try fallback
    console.warn('Failed to resume audio context:', e);
  }

  // Try WebAudio decode/play first, fallback to HTMLAudio if decoding fails
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    // decodeAudioData returns a promise in modern browsers
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    if (typeof onSource === 'function') onSource(source);
    source.start();

    return new Promise((resolve) => {
      source.onended = () => resolve(audioBuffer.duration);
    });
  } catch (err) {
    console.warn('WebAudio decode failed, falling back to HTMLAudioElement:', err);
    // Fallback using <audio> element and object URL
    try {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.autoplay = true;

      // If caller wants to treat this as a source, provide a stop handler wrapper
      const fakeSource = {
        stop: () => {
          try { audio.pause(); } catch (e) {}
          try { audio.currentTime = 0; } catch (e) {}
        }
      };
      if (typeof onSource === 'function') onSource(fakeSource);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          const duration = Number.isFinite(audio.duration) ? audio.duration : null;
          URL.revokeObjectURL(url);
          resolve(duration);
        };
        audio.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(e);
        };
        // Attempt play and surface any promise rejection
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.catch((playError) => {
            console.warn('HTMLAudioElement play() rejected:', playError);
            // reject so caller can handle
            reject(playError);
          });
        }
      });
    } catch (fallbackErr) {
      console.error('Playback fallback also failed:', fallbackErr);
      throw fallbackErr;
    }
  }
}





