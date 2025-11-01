import React, { useMemo } from 'react';
import { useSautiStore } from '../hooks/useSautiStore';
import MicrophoneIcon from './MicrophoneIcon';

interface SautiAnimatorProps {
    onMicClick: () => void;
    audioData: Uint8Array;
}

const SautiAnimator: React.FC<SautiAnimatorProps> = ({ onMicClick, audioData }) => {
    const { isRecording, isSpeaking, isAmbientMode } = useSautiStore();

    const avgAmplitude = useMemo(() => {
        if (!isRecording || !audioData || audioData.length === 0) return 0;
        const sum = audioData.reduce((a: number, b: number) => a + b, 0);
        return (sum / audioData.length) / 128.0; // Normalize to 0-2 range
    }, [audioData, isRecording]);

    const buttonScale = isRecording && !isSpeaking ? 1 + avgAmplitude * 0.1 : 1;
    const outerRingScale = 1 + avgAmplitude * 0.3;
    const middleRingScale = 1 + avgAmplitude * 0.2;

    const ringBaseClasses = "absolute inset-0 rounded-full border-2 transition-transform,opacity duration-100 ease-out";

    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            {/* Base glow for different states */}
            {!isRecording && !isAmbientMode && (
                 <div className="absolute -inset-2 rounded-full bg-sky-500/50 blur-2xl transition-opacity duration-500"></div>
            )}
             {isAmbientMode && !isSpeaking && (
                 <div className="absolute -inset-2 rounded-full bg-sky-500/30 blur-2xl transition-opacity duration-500 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            )}
            {isSpeaking && (
                 <div className="absolute -inset-2 rounded-full bg-teal-400/60 blur-2xl transition-opacity duration-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            )}


            {/* Pulsing rings for user speaking */}
            {isRecording && !isSpeaking && (
                <>
                    <div 
                        className={`${ringBaseClasses} border-sky-400/30`} 
                        style={{ transform: `scale(${outerRingScale})`, opacity: avgAmplitude > 0.05 ? 1 : 0 }} 
                    />
                    <div 
                        className={`${ringBaseClasses} border-sky-400/20`} 
                        style={{ transform: `scale(${middleRingScale})`, opacity: avgAmplitude > 0.05 ? 1 : 0 }} 
                    />
                </>
            )}
            
            <button
                onClick={onMicClick}
                disabled={isAmbientMode}
                className={`relative flex items-center justify-center w-28 h-28 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-slate-900
                    ${isRecording && !isAmbientMode
                        ? 'bg-red-500/90 shadow-2xl shadow-red-500/30 ring-red-500/30' 
                        : isSpeaking 
                        ? 'bg-teal-500/90 shadow-2xl shadow-teal-500/30 ring-teal-500/30'
                        : 'bg-sky-500/90 shadow-2xl shadow-sky-500/30 ring-sky-500/30'
                    }
                    ${isAmbientMode ? 'cursor-default' : ''}
                    `}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                style={{ transform: `scale(${buttonScale})` }}
            >
                {isRecording && !isAmbientMode && <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>}
                <MicrophoneIcon className="w-10 h-10 text-white" />
            </button>
        </div>
    );
};

export default SautiAnimator;