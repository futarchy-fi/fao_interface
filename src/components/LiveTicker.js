'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const TICKER_EVENTS = [
    { label: 'NETWORK_INIT', val: '0x3820..9c9e', type: 'SALE_START', amount: '0 xDAI' },
    { label: 'LIQUIDITY_SECURED', val: '0x2a34..dafa', type: 'BUY', amount: '0.0001 xDAI' },
    { label: 'DAO_EXIT', val: '0x26c7..e747', type: 'RAGEQUIT', amount: '0 xDAI' },
    { label: 'RESERVE_EXPANSION', val: '0x111c..7795', type: 'BUY', amount: '0.001 xDAI' },
    { label: 'ADMIN_SETTLEMENT', val: '0xe327..87e7', type: 'WITHDRAW', amount: '0 xDAI' },
];

export default function LiveTicker() {
    const [ethPrice, setEthPrice] = useState(2450.42);

    useEffect(() => {
        const interval = setInterval(() => {
            setEthPrice(prev => prev + (Math.random() - 0.5) * 2);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-white text-black h-8 overflow-hidden flex items-center whitespace-nowrap border-b border-black select-none z-[100] relative">
            <motion.div
                className="flex items-center gap-16 px-4"
                animate={{ x: [0, -1000] }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {/* ETH PRICE */}
                <div className="flex items-center gap-3">
                    <span className="font-pixel text-[8px] uppercase tracking-widest opacity-50">ORACLE_FEED:</span>
                    <span className="font-mono text-xs font-black">ETH/USD: ${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                </div>

                {/* EVENTS LOOP */}
                {[...TICKER_EVENTS, ...TICKER_EVENTS].map((e, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <span className="font-pixel text-[8px] uppercase tracking-widest opacity-50">{e.label}:</span>
                        <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 text-[8px] font-pixel ${e.type === 'BUY' ? 'bg-blue-600 text-white' :
                                    e.type === 'RAGEQUIT' ? 'bg-black text-white' :
                                        'bg-gray-200 text-black'
                                }`}>{e.type}</span>
                            <span className="font-mono text-[10px] font-bold">{e.val}</span>
                            <span className="font-mono text-[10px] opacity-40">[{e.amount}]</span>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
