import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useSautiStore } from './hooks/useSautiStore';
import { getSystemInstruction } from './constants';
import { connectToGemini } from './services/geminiService';
import { createBlob, decode, decodeAudioData } from './services/audioUtils';
import Onboarding from './components/Onboarding';
import Settings from './components/Settings';
import Header from './components/Header';
import ConversationView from './components/ConversationView';
import SautiAnimator from './components/SautiAnimator';
import { ChatMessage } from './types';

const App: React.FC = () => {
    // Select state and actions from the Zustand store.
    const {
        isAmbientMode, isRecording, isSpeaking, userName, onboardingComplete,
        currentMode, initialize, setIsSpeaking, setApiError,
        setIsRecording, setIsConnected, resetLiveTranscriptions, updateLiveTranscription,
        finalizeTurn, outputAudioContext, initializeAudio
    } = useSautiStore();
    const getState = useSautiStore.getState;

    const sessionPromiseRef = useRef<ReturnType<typeof connectToGemini> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourceNodes = useRef<Set<AudioBufferSourceNode>>(new Set()).current;
    
    const [audioData, setAudioData] = useState(new Uint8Array(0));
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        initialize();
    }, [initialize]);
    
    // Effect to initialize the main audio context on the first user interaction.
    // This is crucial to comply with browser autoplay policies.
    useEffect(() => {
        const initAudio = () => {
            initializeAudio();
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
        };
        if (!outputAudioContext && onboardingComplete) {
            window.addEventListener('click', initAudio);
            window.addEventListener('keydown', initAudio);
        }
        return () => {
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
        };
    }, [initializeAudio, outputAudioContext, onboardingComplete]);

    // Effect to clean up the global audio context when the app is fully unmounted.
     useEffect(() => {
        return () => {
            const { outputAudioContext } = useSautiStore.getState();
            outputAudioContext?.close().catch(console.error);
        }
    }, []);

    const systemInstruction = useMemo(() => (
        getSystemInstruction(currentMode, userName, isAmbientMode)
    ), [currentMode, userName, isAmbientMode]);

    const stopOngoingSpeech = useCallback(() => {
        window.speechSynthesis.cancel();
        audioSourceNodes.forEach(source => {
            try { source.stop(); } catch (e) { /* ignore */ }
        });
        audioSourceNodes.clear();
        nextStartTimeRef.current = 0;
    }, [audioSourceNodes]);

    const stopConversation = useCallback(() => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        
        setAudioData(new Uint8Array(0));
        
        sessionPromiseRef.current?.then((session) => session.close());
        
        audioContextRef.current?.close().catch(console.error);
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());

        stopOngoingSpeech();

        audioContextRef.current = null;
        sessionPromiseRef.current = null;
        
        setIsRecording(false);
        setIsConnected(false);
        setIsSpeaking(false);
        resetLiveTranscriptions();
        
    }, [setIsRecording, setIsConnected, setIsSpeaking, resetLiveTranscriptions, stopOngoingSpeech]);

    const startConversation = useCallback(async () => {
        const { outputAudioContext } = getState();
        if (getState().isRecording) return;

        if (!outputAudioContext) {
            setApiError("Click anywhere to initialize audio.");
            return;
        }
        if (outputAudioContext.state === 'suspended') {
            await outputAudioContext.resume();
        }

        if (!process.env.API_KEY) {
            setApiError("Gemini API key not found.");
            return;
        }
        
        resetLiveTranscriptions();
        setIsRecording(true);
        nextStartTimeRef.current = 0;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const sessionPromise = connectToGemini(ai, systemInstruction, {
            onopen: () => {
                setIsConnected(true);
                setApiError(null);
            },
            onmessage: async (message) => {
                const userInput = message.serverContent?.inputTranscription?.text;
                const modelOutput = message.serverContent?.outputTranscription?.text;
                updateLiveTranscription(userInput, modelOutput);
                
                const audioDataB64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (audioDataB64) {
                    setIsSpeaking(true);
                    const audioBytes = decode(audioDataB64);
                    const audioContext = getState().outputAudioContext;
                    if (audioContext && audioBytes.length > 0) {
                        try {
                            // Ensure audio context is resumed before playing
                            if (audioContext.state === 'suspended') {
                                await audioContext.resume();
                            }
                            
                            const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
                            if (!audioBuffer || audioBuffer.duration === 0) {
                                throw new Error('Gemini audio buffer empty');
                            }
                            
                            const now = audioContext.currentTime;
                            // Use the next scheduled start time to avoid gaps in playback
                            const startTime = Math.max(now, nextStartTimeRef.current);
                            const source = audioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioContext.destination);
                            source.onended = () => {
                                audioSourceNodes.delete(source);
                                if (audioSourceNodes.size === 0) {
                                    setIsSpeaking(false);
                                }
                            };
                            audioSourceNodes.add(source);
                            source.start(startTime);
                            // Schedule next chunk to start exactly when this one ends
                            nextStartTimeRef.current = startTime + audioBuffer.duration;
                        } catch (e) {
                            console.error("Error playing Gemini audio:", e);
                            setIsSpeaking(false);
                        }
                    }
                }

                if (message.serverContent?.interrupted) {
                    stopOngoingSpeech();
                }

                if (message.serverContent?.turnComplete) {
                    const groundingChunks = message.serverContent?.groundingMetadata?.groundingChunks;
                    let sources: ChatMessage['sources'];
                    if (groundingChunks) {
                        sources = groundingChunks.map(chunk => ({
                            uri: chunk.web?.uri || '',
                            title: chunk.web?.title || 'Source'
                        })).filter(source => source.uri);
                    }
                    finalizeTurn(sources);
                    resetLiveTranscriptions();
                }
            },
            onerror: (e) => {
                console.error("Session error:", e);
                setApiError("Connection error. Check API key and network.");
                stopConversation();
            },
            onclose: () => {
                stopConversation();
            },
        });

        sessionPromiseRef.current = sessionPromise;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromiseRef.current?.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };
            
            source.connect(analyserRef.current);
            analyserRef.current.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
            
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            const visualize = () => {
                if (!analyserRef.current || !animationFrameIdRef) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                setAudioData(new Uint8Array(dataArray));
                animationFrameIdRef.current = requestAnimationFrame(visualize);
            };
            visualize();

        } catch (error: any) {
            console.error("Microphone access error:", error);
            let errorMessage = "Microphone access is required.";
            if (error.name === 'NotFoundError') {
                errorMessage = 'No microphone found. Please connect a microphone and try again.';
            } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage = 'Microphone is being used by another application. Please close other apps and try again.';
            }
            setApiError(errorMessage);
            setIsRecording(false);
        }

    }, [
        systemInstruction, stopConversation, getState, setApiError, 
        resetLiveTranscriptions, setIsRecording, setIsConnected, 
        updateLiveTranscription, finalizeTurn, setIsSpeaking, audioSourceNodes, stopOngoingSpeech
    ]);

    useEffect(() => {
        if (isAmbientMode && onboardingComplete) {
            startConversation();
            return () => {
                stopConversation();
            };
        }
    }, [isAmbientMode, onboardingComplete, startConversation, stopConversation]);


    const handleMicClick = () => {
        initializeAudio();
        if (isAmbientMode) return;
        if (isSpeaking || isRecording) {
            stopConversation();
        } else {
            startConversation();
        }
    };
    
    if (!onboardingComplete) {
        return <Onboarding />;
    }

    return (
        <div className="flex flex-col h-screen max-h-screen w-full font-sans bg-slate-900 text-slate-200">
           <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
           <Header onSettingsClick={() => setIsSettingsOpen(true)} />
           <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    <ConversationView />
                </div>
           </main>
           <footer className="p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 flex justify-center items-center">
                <SautiAnimator onMicClick={handleMicClick} audioData={audioData} />
           </footer>
        </div>
    );
};

export default App;