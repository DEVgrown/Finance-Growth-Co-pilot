import React, { useState } from 'react';
import { useSautiStore } from '../hooks/useSautiStore';

const SautiIcon: React.FC<{className?: string}> = ({className = 'w-5 h-5'}) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`${className} text-white`}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
    </svg>
);


const Onboarding: React.FC = () => {
    const [name, setName] = useState('');
    const { setUserName, displayText } = useSautiStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            setUserName(name.trim());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4 animate-fade-in-slide-up">
            <div className="inline-block p-5 bg-sky-500/80 rounded-full mb-6 shadow-2xl shadow-sky-500/20 ring-4 ring-sky-500/10">
                <SautiIcon className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100">Welcome to KAVI</h1>
            <p className="text-lg text-slate-400 mt-2 max-w-md">
                {displayText}
            </p>
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center w-full max-w-sm">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 text-center text-lg bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition placeholder:text-slate-500"
                    aria-label="Enter your name"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={!name.trim()}
                    className="mt-4 w-full px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300 disabled:bg-sky-500/40 disabled:cursor-not-allowed"
                >
                    Let's Begin
                </button>
            </form>
        </div>
    );
};

export default Onboarding;