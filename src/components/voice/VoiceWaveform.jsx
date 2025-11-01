import React from "react";

export default function VoiceWaveform({ isActive, audioData }) {
  const bars = [...Array(20)];
  
  const getBarHeight = (index) => {
    if (!isActive || !audioData || audioData.length === 0) return 8;
    const dataIndex = Math.floor((index / bars.length) * audioData.length);
    const value = audioData[dataIndex] || 0;
    return Math.max(8, (value / 255) * 40 + 10);
  };

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full transition-all duration-200 ${
            isActive ? 'animate-pulse' : ''
          }`}
          style={{
            height: `${getBarHeight(i)}px`,
            animationDelay: `${i * 0.05}s`
          }}
        />
      ))}
    </div>
  );
}


