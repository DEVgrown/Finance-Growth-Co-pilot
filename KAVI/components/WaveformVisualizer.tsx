import React, { useMemo } from 'react';

interface WaveformVisualizerProps {
    audioData: Uint8Array;
    theme: { from: string; to: string; main: string };
}

const NUM_BARS = 60;
const MAX_BAR_HEIGHT = 30;
const MIN_BAR_HEIGHT = 2;
const RADIUS = 70; // in pixels

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ audioData, theme }) => {
    const bars = useMemo(() => {
        // FIX: Explicitly type `data` as `number[]` to resolve TS inference issue where `value` was `unknown`.
        const data: number[] = Array.from(audioData);
        const barData: number[] = [];
        const relevantData = data.slice(0, data.length / 2);
        const step = Math.max(1, Math.floor(relevantData.length / NUM_BARS));

        for (let i = 0; i < NUM_BARS; i++) {
            const start = i * step;
            const end = start + step;
            const slice = relevantData.slice(start, end);
            // FIX: Replaced reduce with a for...of loop to avoid a potential toolchain/linter error.
            let sum = 0;
            for (const value of slice) {
                sum += value;
            }
            const avg = slice.length > 0 ? sum / slice.length : 0;
            barData.push(avg);
        }
        return barData;
    }, [audioData]);

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {bars.map((value, i) => (
                <div
                    key={i}
                    className={`absolute w-0.5 bg-gradient-to-t ${theme.from} ${theme.to} rounded-full origin-bottom transition-all duration-500`}
                    style={{
                        height: `${Math.max(MIN_BAR_HEIGHT, (value / 255) * MAX_BAR_HEIGHT)}px`,
                        transform: `rotate(${i * (360 / NUM_BARS)}deg) translateY(-${RADIUS}px)`,
                        transitionProperty: 'height, background',
                    }}
                />
            ))}
        </div>
    );
};

export default WaveformVisualizer;