import { create } from 'zustand';
import { ConversationMode, ConversationHistories, ChatMessage, ElevenLabsVoice } from '../types';

const initialHistories: ConversationHistories = Object.values(ConversationMode).reduce((acc, mode) => {
    acc[mode] = [];
    return acc;
}, {} as ConversationHistories);


interface SautiState {
    currentMode: ConversationMode;
    displayText: string;
    isConnected: boolean;
    isRecording: boolean;
    isSpeaking: boolean;
    isAmbientMode: boolean;
    apiError: string | null;
    userName: string | null;
    onboardingComplete: boolean;
    conversationHistories: ConversationHistories;

    // ElevenLabs State
    elevenLabsApiKey: string | null;
    elevenLabsVoices: ElevenLabsVoice[];
    currentVoiceId: string | null;
    
    // Web Audio API Global Context
    outputAudioContext: AudioContext | null;

    // Internal state for accumulating transcriptions
    _liveUserInput: string;
    _liveModelOutput: string;
    _turnUserInput: string;

    initialize: () => void;
    initializeAudio: () => void;
    setUserName: (name: string) => void;
    setMode: (mode: ConversationMode) => void;
    setVoiceId: (voiceId: string) => void;
    setIsConnected: (status: boolean) => void;
    setIsRecording: (status: boolean) => void;
    setIsSpeaking: (status: boolean) => void;
    toggleAmbientMode: () => void;
    setDisplayText: (text: string) => void;
    setApiError: (error: string | null) => void;
    setElevenLabsApiKey: (key: string) => void;
    setElevenLabsVoices: (voices: ElevenLabsVoice[]) => void;
    
    // Actions for handling transcriptions internally
    updateLiveTranscription: (userInput?: string, modelOutput?: string) => void;
    finalizeTurn: (sources?: ChatMessage['sources']) => void;
    resetLiveTranscriptions: () => void;
    getFinalUserInput: () => string;
    clearCurrentHistory: () => void;
}

export const useSautiStore = create<SautiState>((set, get) => ({
    currentMode: ConversationMode.Casual,
    displayText: '',
    isConnected: false,
    isRecording: false,
    isSpeaking: false,
    isAmbientMode: false,
    apiError: null,
    userName: null,
    onboardingComplete: false,
    conversationHistories: initialHistories,
    
    elevenLabsApiKey: null,
    elevenLabsVoices: [],
    currentVoiceId: null,

    outputAudioContext: null,

    _liveUserInput: '',
    _liveModelOutput: '',
    _turnUserInput: '',

    initialize: () => {
        const storedName = localStorage.getItem('sauti_userName');
        if (storedName) {
            set({ userName: storedName, onboardingComplete: true });
        } else {
            set({ displayText: "Welcome to KAVI. What should I call you?" });
        }
        
        const storedKey = localStorage.getItem('sauti_elevenLabsApiKey');
        if (storedKey) {
            set({ elevenLabsApiKey: storedKey });
        }
        
        const storedVoiceId = localStorage.getItem('sauti_voiceId');
        if (storedVoiceId) {
            set({ currentVoiceId: storedVoiceId });
        }
        
        const storedAmbient = localStorage.getItem('sauti_ambientMode');
        set({ isAmbientMode: storedAmbient === 'true' });
    },
    initializeAudio: () => {
        if (get().outputAudioContext) return; // Already initialized
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            set({ outputAudioContext: context });
        } catch (e) {
            console.error("Failed to create audio context", e);
            set({ apiError: "Browser audio not supported." });
        }
    },
    setUserName: (name) => {
        localStorage.setItem('sauti_userName', name);
        get().initializeAudio(); // Initialize audio on first user action (onboarding)
        set({ userName: name, onboardingComplete: true, displayText: `Karibu, ${name}! Let's get started.` });
    },
    setMode: (mode) => set({ currentMode: mode }),
    setVoiceId: (voiceId) => {
        localStorage.setItem('sauti_voiceId', voiceId);
        set({ currentVoiceId: voiceId });
    },
    setIsConnected: (status) => set({ isConnected: status }),
    setIsRecording: (status) => set({ isRecording: status }),
    setIsSpeaking: (status) => set({ isSpeaking: status }),
    toggleAmbientMode: () => {
        const newStatus = !get().isAmbientMode;
        localStorage.setItem('sauti_ambientMode', newStatus.toString());
        set({ isAmbientMode: newStatus });
    },
    setDisplayText: (text) => set({ displayText: text, _liveUserInput: '', _liveModelOutput: '' }),
    setApiError: (error) => set({ apiError: error }),

    setElevenLabsApiKey: (key) => {
        if (key) {
            localStorage.setItem('sauti_elevenLabsApiKey', key);
        } else {
            localStorage.removeItem('sauti_elevenLabsApiKey');
        }
        set({ elevenLabsApiKey: key, elevenLabsVoices: [], currentVoiceId: null });
    },

    setElevenLabsVoices: (voices) => {
        set({ elevenLabsVoices: voices });
        if (voices.length > 0 && !get().currentVoiceId) {
            const defaultVoice = voices[0].voice_id;
            localStorage.setItem('sauti_voiceId', defaultVoice);
            set({ currentVoiceId: defaultVoice });
        }
    },

    updateLiveTranscription: (userInput, modelOutput) => {
        if (userInput !== undefined) {
            set((state) => ({ _liveUserInput: state._liveUserInput + userInput }));
        }
        if (modelOutput !== undefined) {
            if (get()._liveUserInput.trim() && !get()._turnUserInput) {
                set(state => ({ _turnUserInput: state._liveUserInput.trim() }));
            }
            set((state) => ({ _liveModelOutput: state._liveModelOutput + modelOutput, _liveUserInput: '' })); 
        }
    },
    finalizeTurn: (sources) => {
        const { _turnUserInput, _liveModelOutput, currentMode } = get();
        const messagesToAdd: ChatMessage[] = [];

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
            set(state => ({
                 conversationHistories: {
                    ...state.conversationHistories,
                    [currentMode]: [...state.conversationHistories[currentMode], ...messagesToAdd]
                },
                displayText: _liveModelOutput.trim() || state.displayText,
            }));
        }
    },
    resetLiveTranscriptions: () => {
        set({ _liveUserInput: '', _liveModelOutput: '', _turnUserInput: '' });
    },
    getFinalUserInput: () => {
        return get()._liveUserInput.trim();
    },
    clearCurrentHistory: () => {
        const { currentMode } = get();
        set(state => ({
            conversationHistories: {
                ...state.conversationHistories,
                [currentMode]: [],
            }
        }));
    },
}));