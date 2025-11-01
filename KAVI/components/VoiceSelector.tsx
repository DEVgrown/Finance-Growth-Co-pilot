import React, { useEffect, useState } from 'react';
import { useSautiStore } from '../hooks/useSautiStore';
import { getElevenLabsVoices } from '../services/elevenLabsService';

const VoiceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10 3a.75.75 0 0 1 .75.75v.502A6.507 6.507 0 0 1 16 9.75v.25a.75.75 0 0 1-1.5 0v-.25a5.007 5.007 0 0 0-4.25-4.95V5.5a.75.75 0 0 1-1.5 0v-.502A5.007 5.007 0 0 0 4 9.75v.25a.75.75 0 0 1-1.5 0v-.25A6.507 6.507 0 0 1 9.25 4.252V3.75A.75.75 0 0 1 10 3Z" />
        <path d="M4 11a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 11Z" />
        <path d="M4.193 12.55a.75.75 0 0 1 0 1.06l-.72.72a.75.75 0 1 1-1.06-1.06l.72-.72a.75.75 0 0 1 1.06 0ZM16.527 13.61a.75.75 0 0 1 1.06 0l.72.72a.75.75 0 0 1-1.06 1.06l-.72-.72a.75.75 0 0 1 0-1.06ZM10 12.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z" />
    </svg>
);

const VoiceSelector: React.FC = () => {
    const { 
        isRecording, 
        elevenLabsApiKey, 
        elevenLabsVoices,
        setElevenLabsVoices,
        currentVoiceId,
        setVoiceId
    } = useSautiStore();
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!elevenLabsApiKey) {
            setElevenLabsVoices([]);
            setError("API Key is not set.");
            return;
        }

        const fetchVoices = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const voices = await getElevenLabsVoices(elevenLabsApiKey);
                setElevenLabsVoices(voices);
            } catch (err) {
                setError("Failed to fetch voices. Check API key.");
                setElevenLabsVoices([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVoices();
    }, [elevenLabsApiKey, setElevenLabsVoices]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setVoiceId(event.target.value);
    };

    const isDisabled = isRecording || isLoading || !!error || elevenLabsVoices.length === 0;

    let placeholderText = "Select Voice";
    if (!elevenLabsApiKey) placeholderText = "Set API Key First";
    else if (isLoading) placeholderText = "Loading voices...";
    else if (error) placeholderText = "Error loading voices";
    else if (elevenLabsVoices.length === 0) placeholderText = "No voices found";

    return (
        <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <VoiceIcon className="w-4 h-4" />
            </span>
            <select
                id="voice-select"
                value={currentVoiceId || ''}
                onChange={handleChange}
                disabled={isDisabled}
                className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-500 block w-full py-2 pl-9 pr-8 transition-colors duration-200 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                aria-label="Select a voice"
            >
                {elevenLabsVoices.length === 0 ? (
                    <option value="" disabled>{placeholderText}</option>
                ) : (
                    elevenLabsVoices.map((voice) => (
                        <option key={voice.voice_id} value={voice.voice_id}>
                            {voice.name}
                        </option>
                    ))
                )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>
        </div>
    );
};

export default VoiceSelector;
