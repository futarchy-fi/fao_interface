'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSubgraphData } from '../hooks/useSubgraphData';
import { useNativeCurrency } from '../hooks/useNativeCurrency';

/**
 * Format large numbers with K/M suffix (with space for clarity)
 */
function formatNumber(num) {
    if (!num) return '0';
    const n = Number(num);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + ' B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + ' M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + ' K';
    return n.toLocaleString();
}

export default function StatusHUD() {
    // Use native currency for both symbol and price (xDAI=$1, ETH=fetched)
    const { symbol: nativeSymbol, price: nativePrice, isGnosis } = useNativeCurrency();
    const { sale, lastSyncedAtUTC, isLoading } = useSubgraphData({ pollInterval: 30000 });

    // Live data from subgraph
    const tvl = sale?.totalAmountRaised || '0.00';
    const circulating = sale?.circulatingSupply || '0';
    const currentPrice = sale?.currentPrice || '0.0000';

    // Calculate USD values using native currency price (xDAI=$1, ETH=market price)
    const tvlUsd = nativePrice ? (parseFloat(tvl) * nativePrice).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '...';
    const priceUsd = nativePrice ? (parseFloat(currentPrice) * nativePrice).toFixed(4) : '...';

    const [mounted, setMounted] = useState(false);
    const [order, setOrder] = useState([0, 1, 2]);
    const [width, setWidth] = useState(0);
    const [offset, setOffset] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [dragX, setDragX] = useState(0);
    const pendingDirRef = useRef(0);
    const dragStartRef = useRef(0);
    const viewportRef = useRef(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const update = () => {
            const nextWidth = viewportRef.current?.getBoundingClientRect().width || 0;
            setWidth(nextWidth);
            setOffset(-nextWidth);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const stats = [
        { label: 'PROTOCOL_TREASURY', value: `${tvl} ${nativeSymbol}`, subValue: `$${tvlUsd} USD` },
        { label: 'CIRCULATING_SUPPLY', value: `${formatNumber(circulating)} FAO`, subValue: sale?.initialPhaseFinalized ? 'CURVE_PHASE' : 'PHASE_0_ACTIVE' },
        { label: 'CURRENT_FAO_PRICE', value: `${currentPrice} ${nativeSymbol}`, subValue: `ƒ%^ $${priceUsd} USD` },
    ];

    const rotateNext = () => {
        setOrder(([left, center, right]) => [center, right, left]);
    };

    const rotatePrev = () => {
        setOrder(([left, center, right]) => [right, left, center]);
    };

    const goNext = () => {
        if (animating || !width) return;
        pendingDirRef.current = 1;
        setAnimating(true);
        setOffset(-2 * width);
    };

    const goPrev = () => {
        if (animating || !width) return;
        pendingDirRef.current = -1;
        setAnimating(true);
        setOffset(0);
    };

    const snapBack = () => {
        if (animating || !width) return;
        pendingDirRef.current = 0;
        setAnimating(true);
        setOffset(-width);
    };

    const handleTransitionEnd = () => {
        if (!animating) return;
        if (pendingDirRef.current === 1) {
            rotateNext();
        } else if (pendingDirRef.current === -1) {
            rotatePrev();
        }
        pendingDirRef.current = 0;
        setAnimating(false);
        setDragX(0);
        setOffset(-width);
    };

    const handleTouchStart = (event) => {
        if (animating) return;
        dragStartRef.current = event.touches[0].clientX;
    };

    const handleTouchMove = (event) => {
        if (!width || animating) return;
        const delta = event.touches[0].clientX - dragStartRef.current;
        setDragX(delta);
        setOffset(-width + delta);
    };

    const handleTouchEnd = () => {
        if (!width || animating) return;
        const threshold = Math.max(40, width * 0.18);
        if (dragX > threshold) {
            goPrev();
        } else if (dragX < -threshold) {
            goNext();
        } else {
            snapBack();
        }
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
                className="relative w-full max-w-5xl mx-auto bg-black/90 backdrop-blur-xl border border-white/10 p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm pointer-events-auto"
                style={{ minHeight: 'var(--hud-height)' }}
            >
                <button
                    type="button"
                    onClick={goPrev}
                    className="sm:hidden absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/20 bg-black/80 text-white/80 flex items-center justify-center"
                    aria-label="Scroll HUD left"
                >
                    {'<'}
                </button>
                <button
                    type="button"
                    onClick={goNext}
                    className="sm:hidden absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/20 bg-black/80 text-white/80 flex items-center justify-center"
                    aria-label="Scroll HUD right"
                >
                    {'>'}
                </button>

                <div className="flex items-center gap-3 flex-shrink-0 px-4 sm:px-6 pt-2 sm:pt-0 absolute right-0 top-0 bottom-0 sm:static sm:pt-0 sm:pb-0 sm:pr-0 sm:pl-0">
                    <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
                        <div className={`absolute inset-0 w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'} animate-ping opacity-20`} />
                    </div>
                    <span className="text-[8px] font-pixel opacity-30 uppercase tracking-tighter">
                        {isLoading ? 'SYNCING...' : lastSyncedAtUTC ? `SYNCED_${lastSyncedAtUTC}` : 'LIVE_SYNC'}
                    </span>
                </div>

                {/* Mobile carousel */}
                <div
                    ref={viewportRef}
                    className="sm:hidden overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                >
                    <div
                        className="flex w-[300%]"
                        onTransitionEnd={handleTransitionEnd}
                        style={{
                            transform: `translateX(${offset}px)`,
                            transition: animating ? 'transform 240ms ease' : 'none',
                        }}
                    >
                        {order.map((statIndex, position) => {
                            const stat = stats[statIndex];
                            return (
                                <div
                                    key={`${stat.label}-${position}`}
                                    className="w-full flex-shrink-0 px-4 py-3 flex flex-col items-center border-r border-white/10 last:border-r-0"
                                    style={{ minWidth: width ? `${width}px` : '100vw' }}
                                >
                                    <span
                                        className={`text-[8px] font-pixel uppercase tracking-widest mb-1 text-center ${stat.label === 'CURRENT_FAO_PRICE' ? 'opacity-10' : 'opacity-20'}`}
                                    >
                                        {stat.label}
                                    </span>
                                    <div className="flex flex-col items-center">
                                        <span className="font-mono text-sm font-bold text-white tracking-tight">{stat.value}</span>
                                        <span className="text-[9px] font-mono text-white/40">{stat.subValue}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Desktop row */}
                <div className="hidden sm:flex sm:min-w-0 sm:flex-1">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="min-w-[160px] sm:flex-1 px-4 sm:px-6 py-3 flex flex-col items-center border-r border-white/10 last:border-r-0"
                        >
                            <span className="text-[8px] font-pixel opacity-30 uppercase tracking-widest mb-1 text-center">{stat.label}</span>
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
