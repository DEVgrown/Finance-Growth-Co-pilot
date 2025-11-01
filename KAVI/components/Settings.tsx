import React, { useState } from 'react';
import ModeSelector from './ModeSelector';
import VoiceSelector from './VoiceSelector';
import { useSautiStore } from '../hooks/useSautiStore';

const AmbientModeToggle: React.FC = () => {
    const { isAmbientMode, toggleAmbientMode } = useSautiStore();
    return (
        <button
            onClick={toggleAmbientMode}
            role="switch"
            aria-checked={isAmbientMode}
            className={`${
                isAmbientMode ? 'bg-sky-500' : 'bg-slate-700'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
        >
            <span
                aria-hidden="true"
                className={`${
                    isAmbientMode ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    );
}

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
    const { elevenLabsApiKey, setElevenLabsApiKey } = useSautiStore();
    const [tempApiKey, setTempApiKey] = useState(elevenLabsApiKey || '');

    if (!isOpen) return null;

    const handleSaveKey = () => {
        setElevenLabsApiKey(tempApiKey);
        // Optionally close panel on save
        // onClose();
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
                onClick={onClose}
            ></div>
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-800/90 backdrop-blur-lg shadow-2xl z-50 p-6 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700/70 hover:text-slate-200 transition-colors" aria-label="Close settings">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 G 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-sm font-semibold text-sky-400 mb-2">Ambient Mode</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400 max-w-xs">
                                Listen continuously and activate the conversation by saying the wake word "KAVI".
                            </p>
                            <AmbientModeToggle />
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-700"></div>

                    <div>
                        <h3 className="text-sm font-semibold text-sky-400 mb-2">Capabilities</h3>
                         <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-400 max-w-xs">
                                KAVI can browse the internet for real-time information and will cite its sources.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-slate-700"></div>
                    
                    <div>
                         <h3 className="text-sm font-semibold text-sky-400 mb-2">Conversation Mode</h3>
                        <ModeSelector />
                    </div>

                    <div className="border-t border-slate-700"></div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-sky-400">ElevenLabs Voice (Optional)</h3>
                        <div>
                            <label htmlFor="eleven-key" className="block text-sm font-medium text-slate-300 mb-1">API Key</label>
                            <div className="flex gap-2">
                                <input 
                                    id="eleven-key"
                                    type="password" 
                                    value={tempApiKey}
                                    onChange={(e) => setTempApiKey(e.target.value)}
                                    placeholder="Enter your ElevenLabs API key"
                                    className="flex-grow px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-200"
                                />
                                <button
                                    onClick={handleSaveKey}
                                    className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="voice-select" className="block text-sm font-medium text-slate-300 mb-1">Voice</label>
                            <VoiceSelector />
                        </div>
                    </div>

                    <div className="border-t border-slate-700"></div>

                     <div>
                        <h3 className="text-sm font-semibold text-sky-400 mb-2">About The Creator</h3>
                        <div className="text-sm text-slate-400 space-y-3">
                           <p>
                                KAVI is the brainchild of <span className="font-semibold text-slate-200">Jackson Alex</span>, a visionary software engineer and a proud Computer Science graduate from <span className="font-semibold text-slate-200">Jomo Kenyatta University of Agriculture and Technology (JKUAT)</span>.
                            </p>
                            <p>
                                Based in Kenya, Jackson is at the forefront of the nation's tech revolution, driven by a passion for creating innovative solutions that are culturally intelligent and accessible to all. KAVI represents his commitment to building technology that understands and speaks the true language of Kenyans, blending advanced AI with a deep appreciation for local context.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;