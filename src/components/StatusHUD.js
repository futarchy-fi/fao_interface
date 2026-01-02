'use client';

import { motion } from 'framer-motion';
import { useETHPrice } from '../hooks/useETHPrice';

export default function StatusHUD() {
    const { price, loading } = useETHPrice();
    const faoPriceEth = 0.0034; // Static protocol price for Phase 1
    const faoPriceUsd = price ? (faoPriceEth * price).toFixed(4) : '...';

    const stats = [
        { label: 'PROTOCOL_TREASURY', value: '1,420.69 ETH', subValue: `$${price ? (1420.69 * price).toLocaleString() : '...'} USD` },
        { label: 'CIRCULATING_SUPPLY', value: '254,000 FAO', subValue: 'PHASE_1_RESERVE' },
        { label: 'CURRENT_FAO_PRICE', value: `${faoPriceEth} ETH`, subValue: `≈ $${faoPriceUsd} USD` },
    ];

    return (
        <div className="fixed inset-x-0 bottom-0 z-[1200] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] md:pb-6 pointer-events-none">
            <div className="w-full max-w-5xl mx-auto bg-black/90 backdrop-blur-xl border border-white/10 p-1 flex items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide rounded-sm pointer-events-auto">
                <div className="flex min-w-full sm:min-w-0 sm:flex-1">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="min-w-[160px] sm:min-w-0 sm:flex-1 px-4 sm:px-6 py-3 flex flex-col items-center border-r border-white/10 last:border-r-0"
                        >
                            <span className="text-[8px] font-pixel opacity-30 uppercase tracking-widest mb-1 text-center">{stat.label}</span>
                            <div className="flex flex-col items-center">
                                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-tight">{stat.value}</span>
                                <span className="text-[9px] font-mono text-white/40">{stat.subValue}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live Pulse Indicator */}
                <div className="px-4 sm:px-6 flex items-center gap-3 flex-shrink-0">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-20" />
                    </div>
                    <span className="text-[8px] font-pixel opacity-40 uppercase tracking-tighter">LIVE_SYNC</span>
                </div>
            </div>
        </div>
    );
}
