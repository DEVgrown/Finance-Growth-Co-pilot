import React from "react";

export default function VoiceWaveform({ isActive }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-white/60 rounded-full transition-all duration-200 ${
            isActive ? 'animate-wave' : 'h-2'
          }`}
          style={{
            height: isActive ? `${Math.random() * 40 + 10}px` : '8px',
            animationDelay: `${i * 0.05}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2); }
        }
        .animate-wave {
          animation: wave 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
