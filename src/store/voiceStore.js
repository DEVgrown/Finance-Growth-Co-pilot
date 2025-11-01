// Voice assistant state store using Zustand
import { create } from 'zustand';

const ConversationMode = {
  Casual: 'Casual',
  Financial: 'Financial',
  Insights: 'Insights',
  Planning: 'Planning',
};

const initialHistories = Object.values(ConversationMode).reduce((acc, mode) => {
  acc[mode] = [];
  return acc;
}, {});

export const useVoiceStore = create((set, get) => ({
  // State
  currentMode: ConversationMode.Financial,
  isConnected: false,
  isRecording: false,
  isSpeaking: false,
  isAmbientMode: false,
  apiError: null,
  userName: null,
  onboardingComplete: false,
  conversationHistories: initialHistories,
  
  // ElevenLabs State
  elevenLabsApiKey: null,
  elevenLabsVoices: [],
  currentVoiceId: null,
  useElevenLabs: false,
  // TTS provider preference: 'auto' | 'gemini' | 'elevenlabs'
  ttsProvider: 'auto',
  // ElevenLabs voice tuning
  elevenLabsVoiceSettings: { stability: 0.5, similarity_boost: 0.75 },
  
  // Web Audio API Global Context
  outputAudioContext: null,

  // Internal state for accumulating transcriptions
  _liveUserInput: '',
  _liveModelOutput: '',
  _turnUserInput: '',

  // Actions
  initialize: () => {
    // Auto-complete onboarding if no stored name - skip the input screen
    const storedName = localStorage.getItem('kavi_userName');
    if (!storedName) {
      // Set default name to complete onboarding immediately
      const defaultName = 'my friend';
      localStorage.setItem('kavi_userName', defaultName);
      set({ userName: defaultName, onboardingComplete: true });
    } else {
      set({ userName: storedName, onboardingComplete: true });
    }
    
    const storedKey = localStorage.getItem('kavi_elevenLabsApiKey');
    if (storedKey) {
      set({ elevenLabsApiKey: storedKey, useElevenLabs: true });
    }
    
    const storedVoiceId = localStorage.getItem('kavi_voiceId');
    if (storedVoiceId) {
      set({ currentVoiceId: storedVoiceId });
    }
    try {
      const storedElevenSettings = localStorage.getItem('kavi_elevenLabsVoiceSettings');
      if (storedElevenSettings) {
        set({ elevenLabsVoiceSettings: JSON.parse(storedElevenSettings) });
      }
    } catch (e) {
      // ignore parse errors
    }
    const storedTts = localStorage.getItem('kavi_ttsProvider');
    if (storedTts) {
      set({ ttsProvider: storedTts });
    }
    
    const storedAmbient = localStorage.getItem('kavi_ambientMode');
    set({ isAmbientMode: storedAmbient === 'true' });
  },

  initializeAudio: () => {
    if (get().outputAudioContext) return;
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      set({ outputAudioContext: context });
    } catch (e) {
      console.error('Failed to create audio context', e);
      set({ apiError: 'Browser audio not supported.' });
    }
  },

  setUserName: (name) => {
    localStorage.setItem('kavi_userName', name);
    get().initializeAudio();
    set({ userName: name, onboardingComplete: true });
  },

  setMode: (mode) => set({ currentMode: mode }),

  setVoiceId: (voiceId) => {
    localStorage.setItem('kavi_voiceId', voiceId);
    set({ currentVoiceId: voiceId });
  },

  setIsConnected: (status) => set({ isConnected: status }),

  setIsRecording: (status) => set({ isRecording: status }),

  setIsSpeaking: (status) => set({ isSpeaking: status }),

  toggleAmbientMode: () => {
    const newStatus = !get().isAmbientMode;
    localStorage.setItem('kavi_ambientMode', newStatus.toString());
    set({ isAmbientMode: newStatus });
  },

  setApiError: (error) => set({ apiError: error }),

  setElevenLabsApiKey: (key) => {
    if (key) {
      localStorage.setItem('kavi_elevenLabsApiKey', key);
      set({ elevenLabsApiKey: key, useElevenLabs: true });
    } else {
      localStorage.removeItem('kavi_elevenLabsApiKey');
      set({ elevenLabsApiKey: null, useElevenLabs: false });
    }
  },

  setElevenLabsVoiceSettings: (settings) => {
    try { localStorage.setItem('kavi_elevenLabsVoiceSettings', JSON.stringify(settings)); } catch (e) {}
    set({ elevenLabsVoiceSettings: settings });
  },

  // Load demo conversation and user data into the store
  loadDemoConversations: (demoConversations) => {
    set((state) => ({
      conversationHistories: {
        ...state.conversationHistories,
        ...demoConversations,
      },
    }));
  },

  setTtsProvider: (provider) => {
    // provider should be 'auto', 'gemini' or 'elevenlabs'
    localStorage.setItem('kavi_ttsProvider', provider);
    set({ ttsProvider: provider });
  },

  setElevenLabsVoices: (voices) => {
    set({ elevenLabsVoices: voices });
    if (voices.length > 0 && !get().currentVoiceId) {
      const defaultVoice = voices[0].voice_id;
      localStorage.setItem('kavi_voiceId', defaultVoice);
      set({ currentVoiceId: defaultVoice });
    }
  },

  updateLiveTranscription: (userInput, modelOutput) => {
    if (userInput !== undefined) {
      set((state) => ({ _liveUserInput: state._liveUserInput + userInput }));
    }
    if (modelOutput !== undefined) {
      if (get()._liveUserInput.trim() && !get()._turnUserInput) {
        set((state) => ({ _turnUserInput: state._liveUserInput.trim() }));
      }
      set((state) => ({ _liveModelOutput: state._liveModelOutput + modelOutput, _liveUserInput: '' }));
    }
  },

  finalizeTurn: (sources) => {
    const { _turnUserInput, _liveModelOutput, currentMode } = get();
    const messagesToAdd = [];

    if (_turnUserInput) {
      messagesToAdd.push({
        id: `user-${Date.now()}`,
        role: 'user',
        text: _turnUserInput,
      });
    }
    if (_liveModelOutput.trim()) {
      messagesToAdd.push({
        id: `model-${Date.now()}`,
        role: 'model',
        text: _liveModelOutput.trim(),
        sources: sources,
      });
    }

    if (messagesToAdd.length > 0) {
      set((state) => ({
        conversationHistories: {
          ...state.conversationHistories,
          [currentMode]: [...state.conversationHistories[currentMode], ...messagesToAdd],
        },
      }));
    }

    // Reset live transcriptions
    set({ _liveUserInput: '', _liveModelOutput: '', _turnUserInput: '' });
  },

  resetLiveTranscriptions: () => {
    set({ _liveUserInput: '', _liveModelOutput: '', _turnUserInput: '' });
  },

  clearCurrentHistory: () => {
    const { currentMode } = get();
    set((state) => ({
      conversationHistories: {
        ...state.conversationHistories,
        [currentMode]: [],
      },
    }));
  },
}));

export { ConversationMode };

