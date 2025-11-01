import React from 'react';

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        {...props}
    >
        <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
        <path d="M5.5 8.5a.5.5 0 0 1 .5.5v1a4 4 0 0 0 8 0v-1a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V17h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-1.525A5 5 0 0 1 4.5 10v-1a.5.5 0 0 1 .5-.5Z" />
    </svg>
);

export default MicrophoneIcon;