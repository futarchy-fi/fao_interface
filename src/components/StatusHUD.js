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
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-6">
            <div className="bg-black/80 backdrop-blur-xl border border-white p-1 flex items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {stats.map((stat, i) => (
                    <div key={stat.label} className={`flex-1 px-8 py-3 flex flex-col items-center border-r border-white/10 last:border-r-0`}>
                        <span className="text-[8px] font-pixel opacity-30 uppercase tracking-widest mb-1">{stat.label}</span>
                        <div className="flex flex-col items-center">
                            <span className="font-mono text-sm font-bold text-white tracking-tight">{stat.value}</span>
                            <span className="text-[9px] font-mono text-white/40">{stat.subValue}</span>
                        </div>
                    </div>
                ))}

                {/* Live Pulse Indicator */}
                <div className="px-6 flex items-center gap-3">
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
