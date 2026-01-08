'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

/**
 * ProtocolStats - Displays live protocol metrics from subgraph
 * Auto-refreshes every 30 seconds with manual sync option
 */
export default function ProtocolStats() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { symbol: nativeSymbol } = useNativeCurrency();

    const {
        sale,
        transactions,
        isLoading,
        error,
        lastSyncedAtUTC,
        refetch
    } = useSubgraphData({ pollInterval: 30000 });

    // Calculate countdown
    const getCountdown = () => {
        if (!sale?.initialPhaseEnd) return null;

        const endTime = Number(sale.initialPhaseEnd) * 1000;
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) return { ended: true };

        return {
            days: Math.floor(remaining / 86400000),
            hours: Math.floor((remaining % 86400000) / 3600000),
            minutes: Math.floor((remaining % 3600000) / 60000),
            ended: false,
        };
    };

    const countdown = getCountdown();

    return (
        <div className="border border-white/20 bg-white/[0.02] relative overflow-hidden">
            {/* Header with sync status */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className="font-pixel text-[8px] tracking-[0.3em] opacity-50 uppercase">PROTOCOL_STATUS</span>
                </div>

                <div className="flex items-center gap-4">
                    {lastSyncedAtUTC && (
                        <span className="font-mono text-[9px] opacity-30">
                            SYNCED: {lastSyncedAtUTC}
                        </span>
                    )}
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="font-pixel text-[8px] px-2 py-1 border border-white/20 hover:bg-white hover:text-black transition-all disabled:opacity-30 uppercase tracking-widest"
                    >
                        {isLoading ? '↻ SYNCING...' : '↻ SYNC_NOW'}
                    </button>
                </div>
            </div>

            {/* Main stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
                {/* TVL */}
                <div className="bg-black p-4 space-y-2">
                    <span className="font-pixel text-[7px] opacity-30 uppercase tracking-widest block">TVL_LOCKED</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-black">
                            {sale?.totalAmountRaised || '0.00'}
                        </span>
                        <span className="font-pixel text-[8px] opacity-50">{nativeSymbol}</span>
                    </div>
                </div>

                {/* Circulating Supply */}
                <div className="bg-black p-4 space-y-2">
                    <span className="font-pixel text-[7px] opacity-30 uppercase tracking-widest block">CIRCULATING</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-black">
                            {formatNumber(sale?.circulatingSupply)}
                        </span>
                        <span className="font-pixel text-[8px] opacity-50">FAO</span>
                    </div>
                </div>

                {/* Current Price */}
                <div className="bg-black p-4 space-y-2">
                    <span className="font-pixel text-[7px] opacity-30 uppercase tracking-widest block">PRICE</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-black">
                            {sale?.currentPrice || '0.0000'}
                        </span>
                        <span className="font-pixel text-[8px] opacity-50">{nativeSymbol}</span>
                    </div>
                </div>

                {/* Countdown */}
                <div className="bg-black p-4 space-y-2">
                    <span className="font-pixel text-[7px] opacity-30 uppercase tracking-widest block">PHASE_I_ENDS</span>
                    {countdown?.ended ? (
                        <span className="text-2xl font-mono font-black text-yellow-500">ENDED</span>
                    ) : countdown ? (
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-mono font-black">{countdown.days}</span>
                            <span className="font-pixel text-[8px] opacity-50">D</span>
                            <span className="text-2xl font-mono font-black ml-1">{countdown.hours}</span>
                            <span className="font-pixel text-[8px] opacity-50">H</span>
                            <span className="text-2xl font-mono font-black ml-1">{countdown.minutes}</span>
                            <span className="font-pixel text-[8px] opacity-50">M</span>
                        </div>
                    ) : (
                        <span className="text-2xl font-mono font-black opacity-20">--</span>
                    )}
                </div>
            </div>

            {/* Expandable transaction feed */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-2 flex items-center justify-between border-t border-white/10 hover:bg-white/5 transition-colors"
            >
                <span className="font-pixel text-[8px] opacity-40 uppercase tracking-widest">
                    RECENT_TRANSACTIONS ({transactions.length})
                </span>
                <span className="font-mono text-[10px] opacity-40">
                    {isExpanded ? '[ COLLAPSE ]' : '[ EXPAND ]'}
                </span>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10 overflow-hidden"
                    >
                        <div className="max-h-48 overflow-y-auto">
                            {transactions.slice(0, 8).map((tx, i) => (
                                <div
                                    key={tx.id}
                                    className="px-4 py-2 flex items-center justify-between border-b border-white/5 hover:bg-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`px-1.5 py-0.5 font-pixel text-[7px] ${tx.type === 'BUY' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                                            }`}>
                                            {tx.type}
                                        </span>
                                        <span className="font-mono text-[10px] opacity-60">
                                            {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-[10px] font-bold">
                                            {tx.amount} {nativeSymbol}
                                        </span>
                                        <span className="font-pixel text-[7px] opacity-30">
                                            {tx.relativeTime}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error display */}
            {error && (
                <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
                    <span className="font-pixel text-[8px] text-red-500">ERROR: {error}</span>
                </div>
            )}
        </div>
    );
}
