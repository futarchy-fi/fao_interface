'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useETHPrice } from '../hooks/useETHPrice';

export default function StatusHUD() {
    const { price } = useETHPrice();
    const faoPriceEth = 0.0034; // Static protocol price for Phase 1
    const faoPriceUsd = price ? (faoPriceEth * price).toFixed(4) : '...';
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const stats = [
        { label: 'PROTOCOL_TREASURY', value: '1,420.69 ETH', subValue: `$${price ? (1420.69 * price).toLocaleString() : '...'} USD` },
        { label: 'CIRCULATING_SUPPLY', value: '254,000 FAO', subValue: 'PHASE_1_RESERVE' },
        { label: 'CURRENT_FAO_PRICE', value: `${faoPriceEth} ETH`, subValue: `ƒ%^ $${faoPriceUsd} USD` },
    ];

    const loopCopies = 5;
    const loopStats = useMemo(
        () => Array.from({ length: loopCopies }, () => stats).flat(),
        [stats]
    );

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const jumpToMiddle = () => {
            const segment = el.scrollWidth / loopCopies;
            el.scrollLeft = segment * Math.floor(loopCopies / 2);
        };

        jumpToMiddle();

        const handleScroll = () => {
            const segment = el.scrollWidth / loopCopies;
            const edgeOffset = segment * 0.5;
            const maxLeft = el.scrollWidth - el.clientWidth;
            if (el.scrollLeft <= edgeOffset) {
                el.scrollLeft += segment * Math.floor(loopCopies / 2);
            } else if (el.scrollLeft >= maxLeft - edgeOffset) {
                el.scrollLeft -= segment * Math.floor(loopCopies / 2);
            }
        };

        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [loopStats.length]);

    const scrollByCard = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const distance = el.clientWidth;
        el.scrollBy({ left: direction * distance, behavior: 'smooth' });
    };

    const hud = (
        <div
            className="fixed inset-x-0 z-[2000] pointer-events-none w-full"
            style={{
                bottom: 0,
                transform: 'translate3d(0,0,0)',
                minHeight: 'var(--hud-height)',
            }}
        >
            <div
                className="relative w-full max-w-5xl mx-auto bg-black/90 backdrop-blur-xl border border-white/10 p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm pointer-events-auto sm:mx-auto sm:max-w-5xl sm:rounded-sm sm:px-0"
                style={{ minHeight: 'var(--hud-height)' }}
            >
                <button
                    type="button"
                    onClick={() => scrollByCard(-1)}
                    className="sm:hidden absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/20 bg-black/80 text-white/80 flex items-center justify-center"
                    aria-label="Scroll HUD left"
                >
                    ‹
                </button>
                <button
                    type="button"
                    onClick={() => scrollByCard(1)}
                    className="sm:hidden absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/20 bg-black/80 text-white/80 flex items-center justify-center"
                    aria-label="Scroll HUD right"
                >
                    ›
                </button>

                <div className="flex items-center gap-3 flex-shrink-0 px-4 sm:px-6 pt-2 sm:pt-0 absolute right-0 top-0 bottom-0 sm:static sm:pt-0 sm:pb-0 sm:pr-0 sm:pl-0">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-20" />
                    </div>
                    <span className="text-[8px] font-pixel opacity-30 uppercase tracking-tighter">LIVE_SYNC</span>
                </div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pr-16 sm:pr-0 overscroll-x-contain"
                >
                    {loopStats.map((stat, index) => (
                        <div
                            key={`${stat.label}-${index}`}
                            className="min-w-[100vw] sm:min-w-[160px] sm:flex-1 px-4 sm:px-6 py-3 flex flex-col items-center border-r border-white/10 last:border-r-0 snap-start"
                        >
                            <span
                                className={`text-[8px] font-pixel uppercase tracking-widest mb-1 text-center ${stat.label === 'CURRENT_FAO_PRICE' ? 'opacity-10' : 'opacity-20'}`}
                            >
                                {stat.label}
                            </span>
                            <div className="flex flex-col items-center">
                                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-tight">{stat.value}</span>
                                <span className="text-[9px] font-mono text-white/40">{stat.subValue}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return mounted ? createPortal(hud, document.body) : hud;
}
