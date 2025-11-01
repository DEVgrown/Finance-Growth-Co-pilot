import React, { useState, useEffect } from 'react';
import { useSautiStore } from '../hooks/useSautiStore';
import MicrophoneIcon from './MicrophoneIcon';
import WaveformVisualizer from './WaveformVisualizer';

interface ControlsProps {
    onMicClick: () => void;
    audioData: Uint8Array;
    theme: { from: string; to:string; main: string };
}

const Controls: React.FC<ControlsProps> = ({ onMicClick, audioData, theme }) => {
    const { isRecording, isConnected, apiError } = useSautiStore();
    const [thinkingDots, setThinkingDots] = useState('');

    useEffect(() => {
        // Fix: Use ReturnType<typeof setInterval> for browser compatibility instead of NodeJS.Timeout
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isRecording && isConnected) {
            interval = setInterval(() => {
                setThinkingDots(dots => (dots.length >= 3 ? '' : dots + '.'));
            }, 400);
        } else {
            setThinkingDots('');
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording, isConnected]);


    let statusText = "Tap to speak";
    if (apiError) statusText = apiError;
    else if (isRecording && !isConnected) statusText = "Connecting...";
    else if (isRecording && isConnected) statusText = `Listening${thinkingDots}`;
    else if (!isRecording && isConnected) statusText = "Processing...";
    
    return (
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative flex items-center justify-center w-40 h-40">
                {isRecording && <WaveformVisualizer audioData={audioData} theme={theme} />}
                
                <div className="absolute">
                     {!isRecording && (
                        <div className={`absolute -inset-2 bg-gradient-to-r ${theme.from} ${theme.to} rounded-full blur-xl opacity-50 animate-pulse transition-colors duration-500`}></div>
                     )}
                    <button
                        onClick={onMicClick}
                        className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4
                            ${isRecording 
                                ? 'bg-red-500 shadow-lg shadow-red-500/30 ring-red-500/30' 
                                : `${theme.main} shadow-lg shadow-sky-500/30 ring-sky-500/30`
                            }`}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                        {isRecording && <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>}
                        <MicrophoneIcon className="w-9 h-9 text-white" />
                    </button>
                </div>
            </div>

            <p className={`text-sm text-center min-h-[20px] transition-colors duration-300 w-48 font-medium ${apiError ? 'text-red-500' : 'text-gray-500'}`}>
                {isRecording && isConnected ? <span>Listening<span className="w-3 inline-block text-left">{thinkingDots}</span></span> : statusText}
            </p>
        </div>
    );
};

export default Controls;