import React from 'react';
import ModeSelector from './ModeSelector';
import VoiceSelector from './VoiceSelector';
import { useSautiStore } from '../hooks/useSautiStore';

const ClearChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.695v-2.695A8.25 8.25 0 0 0 5.68 9.348v2.695Z" />
    </svg>
);

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M11.078 2.25c-.217-.065-.437-.12-.66-.168a.75.75 0 0 0-.698.026c-.24.124-.46.29-.65.493a.75.75 0 0 0-.11.666A11.91 11.91 0 0 1 7.22 9.42a.75.75 0 0 0-.623.53c-.05.152-.076.307-.076.463a.75.75 0 0 0 .75.75c.076 0 .15-.01.223-.028A10.418 10.418 0 0 0 9.25 8.16a.75.75 0 0 0 .596-.323 8.41 8.41 0 0 1 4.238-2.52.75.75 0 0 0 .53-.623c.01-.155-.016-.312-.076-.463a.75.75 0 0 0-.666-.11c-.193-.203-.41-.37-.65-.493a.75.75 0 0 0-.698-.026c-.223.048-.443.103-.66.168Zm-1.74.125a.75.75 0 0 0-.666.11c-.193.203-.41.37-.65.493a.75.75 0 0 0-.698.026c-.223-.048-.443-.103-.66-.168a.75.75 0 0 0-.698-.026c-.24.124-.46.29-.65.493a.75.75 0 0 0-.11.666A11.91 11.91 0 0 1 3.78 9.42a.75.75 0 0 0-.623.53c-.05.152-.076.307-.076.463a.75.75 0 0 0 .75.75c.076 0 .15-.01.223-.028A10.418 10.418 0 0 0 5.25 8.16a.75.75 0 0 0 .596-.323 8.41 8.41 0 0 1 4.238-2.52.75.75 0 0 0 .53-.623c.01-.155-.016-.312-.076-.463a.75.75 0 0 0-.666-.11c-.193-.203-.41-.37-.65-.493a.75.75 0 0 0-.698-.026c-.223.048-.443-.103-.66.168Zm3.48.062a.75.75 0 0 0-.698-.026c-.24.124-.46.29-.65.493a.75.75 0 0 0-.11.666A11.91 11.91 0 0 1 10.72 9.42a.75.75 0 0 0-.623.53c-.05.152-.076.307-.076.463a.75.75 0 0 0 .75.75c.076 0 .15-.01.223-.028A10.418 10.418 0 0 0 12.25 8.16a.75.75 0 0 0 .596-.323 8.41 8.41 0 0 1 4.238-2.52.75.75 0 0 0 .53-.623c.01-.155-.016-.312-.076-.463a.75.75 0 0 0-.666-.11c-.193-.203-.41-.37-.65-.493a.75.75 0 0 0-.698-.026c-.223.048-.443.103-.66.168Z" clipRule="evenodd" />
    </svg>
);

interface HeaderProps {
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
    const clearCurrentHistory = useSautiStore((state) => state.clearCurrentHistory);
    
    return (
        <header className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                KAVI
            </h1>
            <div className="flex items-center gap-2 md:gap-3">
                <VoiceSelector />
                <ModeSelector />
                <button
                    onClick={clearCurrentHistory}
                    title="Clear chat history for this mode"
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors duration-200"
                    aria-label="Clear chat history"
                >
                    <ClearChatIcon className="w-5 h-5" />
                </button>
                 <button
                    onClick={onSettingsClick}
                    title="Open settings"
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors duration-200"
                    aria-label="Open settings"
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default Header;
