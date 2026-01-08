'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubgraphData } from '../hooks/useSubgraphData';
import { useNativeCurrency } from '../hooks/useNativeCurrency';

export default function PhaseCountdown() {
    const { sale } = useSubgraphData({ pollInterval: 30000 });
    const { symbol: nativeSymbol } = useNativeCurrency();
    const [showInfo, setShowInfo] = useState(false);
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

    // Calculate dates for display
    const startDateStr = sale?.saleStartTime
        ? new Date(Number(sale.saleStartTime) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '...';
    const endDateStr = sale?.initialPhaseEnd
        ? new Date(Number(sale.initialPhaseEnd) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '...';
    const fixedPrice = sale?.currentPrice || '0.0001';

    return (
        <div className="border border-white/20 bg-white/5 p-6 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-pixel text-white/40 tracking-widest uppercase">
                <span>_PHASE_0_EXPIRATION</span>
                <span className={ended ? 'text-yellow-500' : 'text-white'}>
                    {ended ? 'PHASE_COMPLETE' : 'FIXED_PRICE_ACTIVE'}
                </span>
            </div>

            {ended ? (
                <div className="text-center py-4">
                    <span className="font-pixel text-2xl text-yellow-500 animate-pulse">PHASE_1_ACTIVE</span>
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
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-[8px] font-pixel text-white hover:underline uppercase tracking-widest"
                >
                    [ {showInfo ? 'HIDE_INFO' : 'WHAT_IS_THIS?'} ]
                </button>
            </div>

            {/* Expandable Info Section */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 space-y-4 border-t border-white/10">
                            <h4 className="font-pixel text-xs tracking-widest text-white/80">FAO_SALE_MECHANICS</h4>

                            <div className="space-y-3 font-mono text-[11px] text-white/60 leading-relaxed">
                                <div className="p-3 bg-white/5 border border-white/10">
                                    <div className="font-pixel text-[8px] text-blue-400 mb-2 tracking-wider">PHASE_0: FIXED_PRICE_WINDOW</div>
                                    <p>During this initial period, FAO tokens are available at a <span className="text-white font-bold">constant price of {fixedPrice} {nativeSymbol}</span> per token. This ensures fair access for all participants before the bonding curve activates.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white/5 border border-white/10">
                                        <div className="font-pixel text-[8px] text-white/40 mb-1">SALE_STARTED</div>
                                        <div className="text-white font-bold">{startDateStr}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/10">
                                        <div className="font-pixel text-[8px] text-white/40 mb-1">PHASE_0_ENDS</div>
                                        <div className="text-white font-bold">{endDateStr}</div>
                                    </div>
                                </div>

                                <div className="p-3 bg-white/5 border border-white/10">
                                    <div className="font-pixel text-[8px] text-yellow-400 mb-2 tracking-wider">PHASE_1: BONDING_CURVE</div>
                                    <p>After Phase 0, the price follows a linear bonding curve: <span className="text-white font-bold">P = m × S + b</span>. Price increases with each token minted, rewarding early participants while maintaining full treasury backing.</p>
                                </div>

                                <div className="p-3 bg-green-500/10 border border-green-500/30">
                                    <div className="font-pixel text-[8px] text-green-400 mb-2 tracking-wider">RAGEQUIT_GUARANTEE</div>
                                    <p>At any time, you can exit the protocol by burning your FAO tokens and receiving your <span className="text-green-400 font-bold">proportional share of the treasury</span>. 100% liquidity backing is guaranteed by the smart contract.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
