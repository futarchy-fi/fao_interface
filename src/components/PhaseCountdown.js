'use client';

import { useState, useEffect } from 'react';
import { useSubgraphData } from '../hooks/useSubgraphData';

export default function PhaseCountdown() {
    const { sale } = useSubgraphData({ pollInterval: 30000 });
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [ended, setEnded] = useState(false);

    useEffect(() => {
        // Use real initialPhaseEnd from subgraph
        if (!sale?.initialPhaseEnd) return;

        const targetDate = new Date(Number(sale.initialPhaseEnd) * 1000);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                setEnded(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [sale?.initialPhaseEnd]);

    // Calculate end date for display
    const endDateStr = sale?.initialPhaseEnd
        ? new Date(Number(sale.initialPhaseEnd) * 1000).toISOString().split('T')[0]
        : '...';

    return (
        <div className="border border-white/20 bg-white/5 p-6 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-pixel text-white/40 tracking-widest uppercase">
                <span>_PHASE_I_EXPIRATION</span>
                <span className={ended ? 'text-yellow-500' : 'text-white'}>
                    {ended ? 'PHASE_COMPLETE' : 'STABLE_EQUILIBRIUM'}
                </span>
            </div>

            {ended ? (
                <div className="text-center py-4">
                    <span className="font-pixel text-2xl text-yellow-500 animate-pulse">PHASE_II_ACTIVE</span>
                </div>
            ) : (
                <div className="flex gap-4">
                    {[
                        { label: 'DD', value: timeLeft.days },
                        { label: 'HH', value: timeLeft.hours },
                        { label: 'MM', value: timeLeft.minutes },
                        { label: 'SS', value: timeLeft.seconds }
                    ].map((unit, i) => (
                        <div key={unit.label} className="flex-1 text-center">
                            <div className="text-3xl font-mono font-black tabular-nums">
                                {unit.value.toString().padStart(2, '0')}
                            </div>
                            <div className="text-[8px] font-pixel opacity-30 mt-1">{unit.label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] font-mono text-white/50 italic">
                    {ended ? 'BONDING_CURVE_ACTIVE' : `ENDS: ${endDateStr}`}
                </span>
                <button className="text-[8px] font-pixel text-white hover:underline uppercase tracking-widest">
                    [ WHAT_IS_THIS? ]
                </button>
            </div>
        </div>
    );
}
