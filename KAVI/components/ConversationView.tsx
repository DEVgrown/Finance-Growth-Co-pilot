import React, { useEffect, useRef, useState } from 'react';
import { useSautiStore } from '../hooks/useSautiStore';
import { ChatMessage } from '../types';

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 0 0 .41-1.412A9.957 9.957 0 0 0 10 12c-2.31 0-4.438.784-6.131 2.095Z" />
    </svg>
);

const SautiIcon: React.FC<{className?: string}> = ({className = 'w-5 h-5'}) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`${className} text-white`}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
    </svg>
);

const SourceCitations: React.FC<{ sources: ChatMessage['sources'] }> = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">Sources:</h4>
            <div className="flex flex-wrap gap-2">
                {sources.map((source, index) => (
                    <a
                        key={index}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-100 text-sky-700 hover:bg-sky-100 hover:text-sky-800 rounded-full px-2.5 py-1 transition-colors duration-200 truncate"
                        title={source.title}
                    >
                         {new URL(source.uri).hostname}
                    </a>
                ))}
            </div>
        </div>
    );
};


const GREETINGS = ['Karibu', 'Jambo', 'Kúhoro', 'Wemse', 'Mbuya more'];

const ConversationView: React.FC = () => {
    const { conversationHistories, currentMode, _liveUserInput, _liveModelOutput, isRecording, userName } = useSautiStore();
    const conversationHistory = conversationHistories[currentMode];
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const [greeting, setGreeting] = useState(GREETINGS[0]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationHistory, _liveUserInput, _liveModelOutput]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setGreeting(prev => {
                const currentIndex = GREETINGS.indexOf(prev);
                const nextIndex = (currentIndex + 1) % GREETINGS.length;
                return GREETINGS[nextIndex];
            });
        }, 2000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="space-y-6">
            {conversationHistory.length === 0 && !isRecording && (
                 <div className="text-center pt-12 pb-4 text-gray-500 animate-fade-in-slide-up">
                    <div className="inline-block p-4 bg-sky-500 rounded-full mb-4 shadow-lg shadow-sky-500/20">
                         <SautiIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 transition-all duration-300">{greeting}, {userName}!</h2>
                    <p className="text-gray-500 mt-2">Ready to chat in <span className="font-semibold">{currentMode} Mode</span>.</p>
                    <p className="text-sm text-gray-400 mt-4">Tap the microphone below to begin.</p>
                </div>
            )}
            {conversationHistory.map((message) => (
                <div key={message.id} className={`flex items-start gap-3.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-slide-up`}>
                   {message.role === 'model' && (
                       <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                           <SautiIcon />
                       </div>
                   )}
                    <div className={`max-w-xl px-4 py-2.5 rounded-2xl ${message.role === 'user' ? 'bg-sky-500 text-white rounded-br-lg' : 'bg-white text-gray-700 rounded-bl-lg border border-gray-200'}`}>
                        <p className="text-base whitespace-pre-wrap">{message.text}</p>
                        <SourceCitations sources={message.sources} />
                    </div>
                     {message.role === 'user' && (
                       <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                           <UserIcon />
                       </div>
                   )}
                </div>
            ))}

            {isRecording && (_liveUserInput || _liveModelOutput) && (
                <>
                    {_liveUserInput && (
                         <div className="flex items-start gap-3.5 justify-end animate-fade-in-slide-up">
                            <div className="max-w-xl px-4 py-2.5 rounded-2xl rounded-br-lg bg-sky-500/20 text-gray-600">
                                <p className="text-base">{_liveUserInput}</p>
                            </div>
                             <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                               <UserIcon />
                           </div>
                        </div>
                    )}
                    {_liveModelOutput && (
                          <div className="flex items-start gap-3.5 justify-start animate-fade-in-slide-up">
                           <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                               <SautiIcon />
                           </div>
                            <div className="max-w-xl px-4 py-2.5 rounded-2xl rounded-bl-lg bg-gray-100 text-gray-500">
                                <p className="text-base">{_liveModelOutput}</p>
                            </div>
                        </div>
                    )}
                </>
            )}
            
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ConversationView;