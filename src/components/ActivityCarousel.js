'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const REAL_EVENTS = [
    { id: 1, type: 'startSale()', user: 'ADMIN_NODE', amount: '0 xDAI', val: '0x3820..9c9e', time: '27D AGO' },
    { id: 2, type: 'buy()', user: 'USER_NODE', amount: '0.0001 xDAI', val: '0x2a34..dafa', time: '27D AGO' },
    { id: 3, type: 'ragequit()', user: 'USER_NODE', amount: '0 xDAI', val: '0x26c7..e747', time: '27D AGO', isRagequit: true },
    { id: 4, type: 'buy()', user: 'USER_NODE', amount: '0.001 xDAI', val: '0x111c..7795', time: '27D AGO' },
    { id: 5, type: 'withdraw()', user: 'ADMIN_NODE', amount: '0 xDAI', val: '0xe327..87e7', time: '27D AGO' },
];

export default function ActivityCarousel() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % REAL_EVENTS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const event = REAL_EVENTS[index];

    return (
        <div className="h-24 border border-white/10 bg-white/2 flex items-center px-8 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-1 items-center justify-between"
                >
                    <div className="flex items-center gap-6">
                        <div className={`text-[10px] font-pixel px-2 py-1 ${event.isGovernance
                            ? (event.isFailure ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white')
                            : (event.isRagequit ? 'bg-red-500 text-white' : 'bg-white text-black')
                            }`}>
                            {event.type}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-pixel opacity-30 uppercase tracking-widest">
                                {event.isGovernance ? 'GOVERNANCE_NODE' : 'USER_NODE'}
                            </span>
                            <span className="font-mono text-sm">{event.user}</span>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <span className={`text-lg font-mono font-bold leading-none ${event.isGovernance
                            ? (event.isFailure ? 'text-yellow-500' : 'text-blue-500')
                            : 'text-white'
                            }`}>
                            {event.amount}
                        </span>
                        <span className="text-[8px] font-pixel opacity-20 uppercase mt-1">{event.time} // {event.isGovernance ? 'FUTARCHY_SIGNAL' : 'LIVE_FEED'}</span>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Pagination Dotted Line */}
            <div className="absolute bottom-2 left-8 right-8 flex gap-1">
                {REAL_EVENTS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-[1px] flex-1 transition-all ${i === index ? 'bg-white' : 'bg-white/10'}`}
                    />
                ))}
            </div>
        </div>
    );
}
