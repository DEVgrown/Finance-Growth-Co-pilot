import React from 'react';
import { useSautiStore } from '../hooks/useSautiStore';
import { ConversationMode } from '../types';

const ModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10.832 2.223A.75.75 0 0 0 9.75 3.437v13.126a.75.75 0 0 0 1.5 0V3.437a.75.75 0 0 0-1.082-1.214ZM5.403 4.634a.75.75 0 0 0-1.06 1.06l2.061 2.06-2.06 2.06a.75.75 0 0 0 1.06 1.061l2.06-2.06 2.06 2.06a.75.75 0 1 0 1.06-1.06l-2.06-2.061 2.06-2.06a.75.75 0 1 0-1.06-1.06l-2.06 2.06-2.06-2.06Z" clipRule="evenodd" />
        <path d="M14.597 15.366a.75.75 0 0 0 1.06-1.06l-2.06-2.06 2.06-2.06a.75.75 0 0 0-1.06-1.06l-2.06 2.06-2.06-2.06a.75.75 0 0 0-1.06 1.06l2.06 2.06-2.06 2.06a.75.75 0 1 0 1.06 1.06l2.06-2.06 2.06 2.06Z" />
    </svg>
);

const ModeSelector: React.FC = () => {
    const { currentMode, setMode, isRecording } = useSautiStore();
    const modes = Object.values(ConversationMode);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setMode(event.target.value as ConversationMode);
    };

    return (
        <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <ModeIcon className="w-4 h-4" />
            </span>
            <select
                value={currentMode}
                onChange={handleChange}
                disabled={isRecording}
                className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-500 block w-full py-2 pl-9 pr-8 transition-colors duration-200 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                aria-label="Select a mode"
            >
                {modes.map((mode) => (
                    <option key={mode} value={mode}>
                        {mode} Mode
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>
        </div>
    );
};

export default ModeSelector;
