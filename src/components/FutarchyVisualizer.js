'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const REAL_PROPOSALS = [
    {
        id: 1,
        title: "What is the impact on AAVE token price",
        outcomeStr: "if AAVE token alignment proposal is approved",
        yesPrice: 161.01,
        noPrice: 143.96,
        assetLabel: "GHO",
        companyLogo: "https://nvhqdqtlsdboctqjcelq.supabase.co/storage/v1/object/public/market-images/company-logos/1766411438470_tlj5q.webp",
        networkTag: "Ethereum",
        timeLeft: "Open until: 37d 1h 42m"
    },
    {
        id: 2,
        title: "What will be the price of GNO",
        outcomeStr: "if its price is >= 130 sDAI",
        yesPrice: 137.14,
        noPrice: 87.35,
        assetLabel: "sDAI",
        companyLogo: "https://s2.coinmarketcap.com/static/img/coins/200x200/36629.png",
        networkTag: "Gnosis",
        timeLeft: "Open until: 2d 13h 41m"
    },
    {
        id: 3,
        title: "Will GnosisDAO adopt futarchy advisory markets",
        outcomeStr: "for ≥ $5M treasury or strategic decisions",
        yesPrice: 113.23,
        noPrice: 102.90,
        assetLabel: "sDAI",
        companyLogo: "https://raw.githubusercontent.com/Gnosis-DAO/brand-kit/main/Logos/GnosisDAO%20Logomark%20(Green).png",
        networkTag: "Gnosis",
        timeLeft: "Open until: 4d 13h 42m"
    },
    {
        id: 4,
        title: "Impact on GNO price",
        outcomeStr: "if Circle deploy native USDC on Gnosis Chain",
        yesPrice: 136.47,
        noPrice: 84.06,
        assetLabel: "sDAI",
        companyLogo: "https://s2.coinmarketcap.com/static/img/coins/200x200/36629.png",
        networkTag: "Gnosis",
        timeLeft: "Open until: 5d 13h 42m"
    }
];

import MicroProposalCard from './MicroProposalCard';

export default function FutarchyVisualizer() {
    const [points, setPoints] = useState({ yes: [{ x: 0, y: 50 }], no: [{ x: 0, y: 50 }] });
    const [outcome, setOutcome] = useState(null);
    const [step, setStep] = useState(0);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [proposalQueue, setProposalQueue] = useState(REAL_PROPOSALS);

    const current = proposalQueue[0];

    const cycleQueue = () => {
        setOutcome(null);
        setStep(0);
        setPoints({ yes: [{ x: 0, y: 50 }], no: [{ x: 0, y: 50 }] });
        // Move the first item to the end of the queue
        setProposalQueue(prev => {
            const [first, ...rest] = prev;
            return [...rest, first];
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (step >= 100) {
                const impact = ((current.yesPrice - current.noPrice) / current.noPrice);
                setOutcome(impact > 0 ? 'APPROVE' : 'REJECT');
                const nextTimer = setTimeout(cycleQueue, 4000);
                return () => clearTimeout(nextTimer);
            }

            setStep(s => s + 2.0); // Slightly faster simulation for ticker feel
            setPoints(prev => {
                const lastYes = prev.yes[prev.yes.length - 1];
                const lastNo = prev.no[prev.no.length - 1];

                const targetYesY = 100 - (current.yesPrice / (current.yesPrice + current.noPrice) * 120);
                const targetNoY = 100 - (current.noPrice / (current.yesPrice + current.noPrice) * 120);

                const nextYesY = lastYes.y + (targetYesY - lastYes.y) * 0.15 + (Math.random() - 0.5) * 6;
                const nextNoY = lastNo.y + (targetNoY - lastNo.y) * 0.15 + (Math.random() - 0.5) * 6;

                return {
                    yes: [...prev.yes, { x: step + 2.0, y: Math.max(5, Math.min(95, nextYesY)) }],
                    no: [...prev.no, { x: step + 2.0, y: Math.max(5, Math.min(95, nextNoY)) }]
                };
            });
        }, 30); // Faster updates

        return () => clearTimeout(timer);
    }, [step, proposalQueue]);

    const toPath = (pts) => pts.map(p => `${p.x},${p.y} `).join(' ');

    return (
        <div className="relative w-full overflow-hidden bg-black">
            {/* HERO SIMULATOR SECTION */}
            <div className="relative h-[500px] border-b border-white/5 flex flex-col items-center justify-center">
                {/* Background Branding */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="font-pixel text-[20vw] opacity-[0.02] leading-none text-white uppercase italic">SIMULATION</span>
                </div>

                {/* Dashboard Metrics */}
                <div className="absolute top-8 left-8 z-10 space-y-1">
                    <h3 className="font-pixel text-[8px] tracking-[0.4em] text-white/20">CONDITIONAL_DECISION_STREAM</h3>
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-tighter">NODE_SYNC_ACTIVE // 240TPS</span>
                    </div>
                </div>

                {/* Simulation Canvas */}
                <div className="w-full h-full max-w-7xl relative px-20">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-60">
                        <defs>
                            <linearGradient id="simYes" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
                            </linearGradient>
                            <linearGradient id="simNo" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FACC15" stopOpacity="0" />
                                <stop offset="100%" stopColor="#FACC15" stopOpacity="0.8" />
                            </linearGradient>
                        </defs>
                        <motion.polyline points={toPath(points.yes)} fill="none" stroke="url(#simYes)" strokeWidth="0.5" />
                        <motion.polyline points={toPath(points.no)} fill="none" stroke="url(#simNo)" strokeWidth="0.5" />
                    </svg>

                    {/* Minimalist Terminal Toast */}
                    <AnimatePresence>
                        {outcome && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute top-8 right-8 z-30 pointer-events-none"
                            >
                                <div className={`flex items-center gap-6 px-8 py-4 bg-black/80 backdrop-blur-xl border-l-2 ${outcome === 'APPROVE' ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-yellow-500 shadow-[0_0_40px_rgba(250,204,21,0.1)]'}`}>
                                    <div className="flex flex-col">
                                        <div className="font-pixel text-[8px] opacity-40 mb-1 tracking-widest uppercase">DECISION_LOGGED</div>
                                        <div className={`text-2xl font-pixel ${outcome === 'APPROVE' ? 'text-blue-500' : 'text-yellow-500'}`}>
                                            {outcome === 'APPROVE' ? 'PASS' : 'FAIL'}
                                        </div>
                                    </div>
                                    <div className="h-10 w-px bg-white/10" />
                                    <div className="flex flex-col">
                                        <div className="font-pixel text-[8px] opacity-40 mb-1 tracking-widest uppercase">IMPACT</div>
                                        <div className={`text-lg font-mono font-bold ${outcome === 'APPROVE' ? 'text-blue-500' : 'text-yellow-500'}`}>
                                            {((current.yesPrice - current.noPrice) / current.noPrice * 100).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* MINIMALIST TICKER CAROUSEL */}
            <div className="relative -mt-16 z-20 overflow-hidden py-10">
                <div className="max-w-[1400px] mx-auto px-12">
                    <div className="flex items-center gap-12 mb-6">
                        <div className="font-pixel text-[10px] text-white/30 tracking-[0.4em] uppercase whitespace-nowrap">/ PROPOSAL_QUEUE</div>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    <div className="relative h-20 flex items-center">
                        <AnimatePresence mode="popLayout" initial={false}>
                            <div className="flex gap-4">
                                {proposalQueue.map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        layout
                                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                            scale: 1,
                                            zIndex: proposalQueue.length - idx
                                        }}
                                        exit={{ opacity: 0, x: -100, scale: 0.8 }}
                                        transition={{
                                            type: 'spring',
                                            damping: 25,
                                            stiffness: 200,
                                            layout: { duration: 0.6, ease: "easeInOut" }
                                        }}
                                    >
                                        <MicroProposalCard
                                            proposal={p}
                                            isActive={idx === 0}
                                            outcome={idx === 0 ? outcome : null}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
