'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ConnectWallet } from '../../components/ConnectWallet';
import BuyPanel from '../../components/BuyPanel';
import RagequitPanel from '../../components/RagequitPanel';
import { TypewriterText } from '../../components/ui/TypewriterText';
import PhaseCountdown from '../../components/PhaseCountdown';
import ActivityCarousel from '../../components/ActivityCarousel';
import FutarchyVisualizer from '../../components/FutarchyVisualizer';
import { ConstructionLogo } from '../../components/ui/ConstructionLogo';
import LiveTicker from '../../components/LiveTicker';
import StatusHUD from '../../components/StatusHUD';

const ScrollTypingHeader = ({ text, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    return (
        <div ref={ref} className={className}>
            {isInView ? <TypewriterText text={text} speed={0.03} /> : <span className="opacity-0">{text}</span>}
        </div>
    );
};

export default function Dashboard() {
    const [tradeMode, setTradeMode] = useState('buy');
    const [showCurveInfo, setShowCurveInfo] = useState(false);
    const [activeSection, setActiveSection] = useState('manifesto');

    const sections = [
        { id: 'manifesto', label: '01 // GOVERNANCE_ARCHITECTURE' },
        { id: 'intel', label: '02 // PROTOCOL_INTEL' },
        { id: 'audit', label: '03 // TRANSACTION_LOG' },
        { id: 'governance', label: '04 // PARTICIPATION' }
    ];

    const realTransactions = [
        { hash: '0xe3276be3ce857676e42ae1fdb393093f5b81b4258e9fe2cceb17e16a207a87e7', type: 'Admin Withdraw', val: '0 xDAI', time: '27 days ago' },
        { hash: '0x111cbcbdf55e097293e3108d8c01b48b9e41dcbd9325c68006db9c8042977795', type: 'Buy', val: '0.001 xDAI', time: '27 days ago' },
        { hash: '0x26c70362f03ec39f681e508237d76d17ace31e3ee3b91ef2e6ae6f4891b2e747', type: 'Ragequit', val: '0 xDAI', time: '27 days ago' },
        { hash: '0x2a34ff478e0b2ff19b17290002e7d239f7300737e59cab9e06f1c5dc65c7dafa', type: 'Buy', val: '0.0001 xDAI', time: '27 days ago' },
        { hash: '0x3820e08e9feb0494210ce55036eef033556dbcd200cd281a1c717c75a6e69c9e', type: 'Start Sale', val: '0 xDAI', time: '27 days ago' },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black scroll-smooth flex flex-col">
            {/* REAL-TIME TOP TICKER */}
            <LiveTicker />

            {/* PROTOCOL STATUS HUD (PINNED) */}
            <StatusHUD />

            {/* Subtle Global Scanline Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(255,255,255,0.25)_50%),linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(255,255,255,0.06))] bg-[length:100%_2px,2px_100%]" />

            <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-12 relative z-10 w-full">
                {/* Website Header */}
                <header className="flex flex-col gap-4 border-b border-white/10 pb-8 md:pb-12 mb-12 md:mb-16">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 grayscale brightness-200 cursor-pointer flex-shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <ConstructionLogo />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="font-pixel text-xl sm:text-2xl tracking-tighter leading-none whitespace-nowrap">FAO</h1>
                            <span className="font-pixel text-[7px] sm:text-[8px] opacity-30 tracking-[0.35em] uppercase mt-1 whitespace-nowrap">FUTARCHY_AUTONOMOUS_ORGANIZATION</span>
                        </div>
                        <div className="ml-auto flex items-center gap-3 sm:gap-4 flex-shrink-0">
                            <div className="hidden lg:flex flex-col text-right mr-2">
                                <span className="text-[7px] font-pixel opacity-20 uppercase tracking-widest mb-1">NETWORK_STABILITY</span>
                                <span className="text-[10px] font-mono opacity-60">99.98% // SECURE</span>
                            </div>
                            <div className="flex-shrink-0">
                                <ConnectWallet />
                            </div>
                        </div>
                    </div>

                    {/* GLOBAL NAVIGATION TABS - now on its own row */}
                    <nav className="flex flex-wrap items-center gap-1 bg-white/5 p-1 rounded-sm border border-white/5 w-full">
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => scrollTo(s.id)}
                                className={`px-3 sm:px-4 py-2.5 font-pixel text-[8px] sm:text-[9px] transition-all whitespace-nowrap ${activeSection === s.id
                                    ? 'bg-white text-black'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {s.label.split(' // ')[1]}
                            </button>
                        ))}
                    </nav>
                </header>

                {/* FULL-WIDTH HERO SECTION (BREAKING OUT OF SIDEBARS) */}
                <section id="manifesto" className="scroll-mt-20 mb-20">
                    <div className="relative w-full border border-white/20 bg-black group mb-12">
                        <FutarchyVisualizer />
                    </div>

                    <div className="space-y-6">
                        <ScrollTypingHeader text="PROTOCOL_GOVERNANCE_ARCHITECTURE" className="ico-header" />
                        <div className="text-3xl xl:text-4xl font-mono leading-tight max-w-5xl text-white/90">
                            <TypewriterText text="FAO IS AN AUTONOMOUS GOVERNANCE PROTOCOL POWERED BY CONDITIONAL TOKEN MARKETS. WE SEPARATE STRATEGIC VALUES FROM ANALYTICAL BELIEFS TO OPTIMIZE CAPITAL ALLOCATION VIA THE GNOSIS CONDITIONAL TOKEN FRAMEWORK (CTF)." speed={0.01} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-12 border-t border-white/10 mt-12">
                        <div className="phase-card space-y-6 p-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <h3 className="font-pixel text-sm flex items-center gap-3">
                                        PHASE_1: COLLATERAL_ACCUMULATION
                                        <span className="bg-green-500 text-black px-2 py-0.5 text-[8px] animate-pulse">ACTIVE</span>
                                    </h3>
                                    <p className="text-white/50 font-mono text-sm leading-relaxed">
                                        Initial 14-day window. FAO is priced at a constant floor to ensure fair-start liquidity depth before curve activation.
                                    </p>
                                </div>
                            </div>
                            <PhaseCountdown />
                        </div>
                        <div className="phase-card space-y-6 p-8">
                            <div className="space-y-4">
                                <h3 className="font-pixel text-sm text-white/40">PHASE_2: ALGORITHMIC_EXPANSION</h3>
                                <p className="text-white/30 font-mono text-sm leading-relaxed">
                                    The mathematical expansion phase. Price increases proportionally with supply, following a predefined P = m * S + b slope.
                                </p>
                                <div className="h-20 w-full border border-white/5 bg-white/2 flex items-end px-4 py-2 gap-1 overflow-hidden relative">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="bg-white/10 flex-1" style={{ height: `${(i + 1) * 5}%` }} />
                                    ))}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="font-pixel text-[8px] opacity-20">LOCKED_UNTIL_PHASE_II</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCurveInfo(!showCurveInfo)}
                                    className="font-pixel text-[8px] text-white underline tracking-widest hover:opacity-100 opacity-60 uppercase"
                                >
                                    [ {showCurveInfo ? 'HIDE_TECHNICAL_SPEC' : 'EXPLORE_BONDING_CURVE_MECHANICS'} ]
                                </button>
                            </div>

                            <AnimatePresence>
                                {showCurveInfo && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-8 border border-white bg-white/5 space-y-4 overflow-hidden"
                                    >
                                        <h4 className="font-pixel text-xs tracking-widest">EXPANSION_TECHNICAL_SPEC</h4>
                                        <p className="font-mono text-xs leading-relaxed text-white/60">
                                            THE LINEAR BONDING CURVE ENSURES THAT EVERY FAO TOKEN MINTED INCREASES THE PER-TOKEN COST IN A PURELY MATHEMATICAL RELATIONSHIP: P = m * S + b. GUARANTEEING LIQUIDITY VIA THE UNDERLYING TREASURY.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4 pt-4">
                                <h3 className="font-pixel text-sm opacity-40">PHASE_3: LIQUIDITY_EXIT_MECHANISM</h3>
                                <p className="text-white/30 font-mono text-sm leading-relaxed">
                                    The ultimate principal protection. Exit the protocol at any time for your proportional share of the treasury.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_480px] gap-8 xl:gap-16 items-start">
                    {/* MAIN SCROLLABLE CONTENT */}
                    <main className="flex-1 min-w-0 space-y-40 pb-40">
                        {/* SECTION 02: KNOWLEDGE_BASE */}
                        <section id="intel" className="space-y-24 scroll-mt-20">
                            <div className="space-y-4">
                                <ScrollTypingHeader text="PROTOCOL_GOVERNANCE_INTEL" className="ico-header text-5xl" />
                                <p className="opacity-40 font-pixel text-[8px] tracking-[0.4em] uppercase italic">// SOURCE: GOVERNANCE_OPERATING_MANUAL_V1.2</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Core Concept */}
                                <div className="space-y-8 p-10 border border-white/20 bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full border border-blue-500/40 flex items-center justify-center font-pixel text-blue-500 text-xs">01</div>
                                        <h3 className="font-pixel text-lg tracking-tighter">VALUES_VS_BELIEFS</h3>
                                    </div>
                                    <p className="font-mono text-white/60 leading-relaxed">
                                        FUTARCHY TARGETS THE CORE INEFFICIENCY OF GOVERNANCE: THE BLURRING OF INTENT (VALUES) AND EXECUTION (BELIEFS).
                                        IN OUR SYSTEM, <span className="text-white font-bold uppercase">HUMANS DECIDE THE TARGET OUTCOME</span> (E.G., TOKEN PRICE GROWTH),
                                        WHILE <span className="text-white font-bold uppercase">MARKETS AGGREGATE INFORMATION</span> TO DETERMINE THE BEST PATH TO THAT OUTCOME.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                        <div className="space-y-2">
                                            <div className="font-pixel text-[8px] opacity-30 uppercase tracking-widest">HUMAN_ROLE</div>
                                            <div className="text-[10px] font-mono opacity-80 uppercase">DEFINE_SUCCESS_METRIC</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="font-pixel text-[8px] opacity-30 uppercase tracking-widest">MARKET_ROLE</div>
                                            <div className="text-[10px] font-mono opacity-80 uppercase">EXECUTE_OPTIMAL_PATH</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Counterfactual Worlds */}
                                <div className="space-y-8 p-10 border border-white/10 bg-black">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full border border-yellow-500/40 flex items-center justify-center font-pixel text-yellow-500 text-xs">02</div>
                                        <h3 className="font-pixel text-lg tracking-tighter">COUNTERFACTUAL_EXP</h3>
                                    </div>
                                    <p className="font-mono text-white/50 leading-relaxed italic">
                                        "WHAT IF THE PROPOSAL IS APPROVED? WHAT IF IT IS NOT?"
                                    </p>
                                    <p className="font-mono text-white/60 leading-relaxed">
                                        FOR EVERY GOVERNANCE PROPOSAL, WE INITIALIZE TWO PARALLEL WORLDS: <span className="text-blue-400">YES (APPROVAL)</span> AND <span className="text-yellow-400">NO (REJECTION)</span>.
                                        TRADERS DO NOT BET ON THE FUTURE; THEY TRADE ON <span className="text-white font-bold opacity-100">CONDITIONAL EXPOSURE</span>.
                                        POSITIONS ONLY LEGALIZE IF THE CORRESPONDING WORLD OCCURS ON-CHAIN.
                                    </p>
                                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="font-pixel text-[8px] opacity-40 uppercase">WORLD_ALPHA</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                            <span className="font-pixel text-[8px] opacity-40 uppercase">WORLD_BETA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Deep Trading Logic */}
                            <div className="p-12 border border-white/5 bg-white/[0.01] space-y-12">
                                <div className="max-w-3xl space-y-6">
                                    <h3 className="font-pixel text-2xl tracking-tighter uppercase leading-none">THE_GNOSIS_CONDITIONAL_FRAMEWORK</h3>
                                    <p className="font-mono text-lg text-white/50 leading-relaxed uppercase">
                                        SECURED BY THE INDUSTRY-STANDARD GNOSIS CONDITIONAL TOKEN FRAMEWORK (CTF) — THE SAME CRYPTOGRAPHIC ARCHITECTURE PROTECTING BILLIONS IN TVL.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    <div className="space-y-4">
                                        <div className="font-pixel text-[8px] text-white/30 uppercase tracking-[0.3em]">/ COLLATERAL_SPLITTING</div>
                                        <p className="font-mono text-xs text-white/40 leading-relaxed lowercase">
                                            your currency is first split into YES_CURRENCY and NO_CURRENCY. this represents your collateral in each of the two possible worlds.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="font-pixel text-[8px] text-white/30 uppercase tracking-[0.3em]">/ DETERMINISTIC_SETTLEMENT</div>
                                        <p className="font-mono text-xs text-white/40 leading-relaxed lowercase">
                                            if a proposal fails, NO_CURRENCY is redeemable back to original currency. if it passes, YES_TOKEN becomes the underlying project asset.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="font-pixel text-[8px] text-white/30 uppercase tracking-[0.3em]">/ INFORMATION_HARVESTING</div>
                                        <p className="font-mono text-xs text-white/40 leading-relaxed lowercase">
                                            as participants trade in both markets, prices adjust to balance all views. the price delta represents the expected impact of the decision.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row gap-12">
                                    <div className="flex flex-col gap-2">
                                        <span className="font-pixel text-[8px] opacity-20 uppercase tracking-widest">SYSTEM_VERSION</span>
                                        <span className="font-mono text-xs opacity-60 italic">FAO_PROTOCOL_V4.2</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="font-pixel text-[8px] opacity-20 uppercase tracking-widest">NETWORK_DEPLOYMENT</span>
                                        <span className="font-mono text-xs opacity-60 italic">GNOSIS_CHAIN_MAINTNET</span>
                                    </div>
                                </div>
                            </div>

                            {/* Practical Example Scenario */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <h4 className="font-pixel text-xl tracking-tighter uppercase">PRACTICAL_SCENARIO: PROPOSAL_#84</h4>
                                    <div className="p-6 border-l-2 border-blue-500 bg-white/[0.02] space-y-4 font-mono text-sm uppercase">
                                        <p className="text-white">PROPOSAL: ALLOCATE 1M USDC TO PROTOCOL_MARKETING</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[8px] opacity-40">YES_MARKET_PRICE</span>
                                                <div className="text-blue-400 font-black">$1.45</div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[8px] opacity-40">NO_MARKET_PRICE</span>
                                                <div className="text-yellow-400 font-black">$1.32</div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-mono text-sm text-white/50 leading-relaxed uppercase">
                                        IN THIS SCENARIO, THE MARKET PREDICTS A <span className="text-white font-bold">$0.13 VALUE UPLIFT</span> IF THE MARKETING BUDGET IS APPROVED. THE PROTOCOL AUTOMATICALLY EXECUTES THE APPROVAL BASED ON THIS DELTA.
                                    </p>
                                </div>
                                <div className="border border-white/10 p-8 space-y-6">
                                    <div className="space-y-2">
                                        <div className="font-pixel text-[8px] opacity-30 tracking-[0.3em]">DECISION_MATRIX</div>
                                        <div className="h-2 w-full bg-white/5 overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[65%]" />
                                        </div>
                                    </div>
                                    <div className="space-y-4 font-mono text-[10px] text-white/40 uppercase">
                                        <div className="flex justify-between">
                                            <span>MARKET_CONFIDENCE</span>
                                            <span className="text-white opacity-100">89.2%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>SETTLEMENT_ETD</span>
                                            <span className="text-white opacity-100">48H_00M</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 03: TRANSACTION_LOG */}
                        <section id="audit" className="space-y-12 scroll-mt-20">
                            <div className="space-y-4">
                                <ScrollTypingHeader text="TRANSACTION_LOG" className="ico-header px-4 py-2 border border-white/10 inline-block" />
                                <div className="flex gap-4 items-center">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[8px] font-pixel opacity-40 uppercase tracking-[0.4em]">VERIFIED_ON_CHAIN_TRANSMISSION</span>
                                </div>
                            </div>

                            <ActivityCarousel />

                            <div className="border border-white/10 overflow-hidden bg-white/2">
                                <table className="w-full text-left font-mono text-[10px] md:text-xs">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-6 font-pixel text-[8px] opacity-40 uppercase">COMMAND</th>
                                            <th className="p-6 font-pixel text-[8px] opacity-40 uppercase whitespace-nowrap">TRANSACTION HASH</th>
                                            <th className="p-6 font-pixel text-[8px] opacity-40 uppercase">MAGNITUDE</th>
                                            <th className="p-6 font-pixel text-[8px] opacity-40 uppercase whitespace-nowrap">TIME RELATIVE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {realTransactions.map((tx, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-6 uppercase">
                                                    <span className={`px-2 py-1 font-pixel text-[9px] ${tx.type === 'Buy' ? 'bg-blue-600 text-white' :
                                                        tx.type === 'Ragequit' ? 'bg-red-600 text-white' :
                                                            'bg-white text-black'
                                                        }`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="p-6 font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {tx.hash.slice(0, 12)}...{tx.hash.slice(-12)}
                                                </td>
                                                <td className="p-6 font-black">{tx.val}</td>
                                                <td className="p-6 opacity-40 whitespace-nowrap">{tx.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* SECTION 04: PARTICIPATION */}
                        <section id="governance" className="scroll-mt-20 py-40 border-t border-white/10">
                            <div className="max-w-4xl space-y-10">
                                <h2 className="font-pixel text-4xl sm:text-5xl md:text-6xl tracking-tighter leading-tight break-words">
                                    PARTICIPATE_IN_FUTARCHY
                                </h2>
                                <p className="text-xl font-mono text-white/50 leading-relaxed uppercase">
                                    FUTARCHY ALIGNS CAPITAL WITH INFORMATION. CONTRIBUTE TO THE LIQUIDITY POOLS TO ESTABLISH ON-CHAIN BELIEFS THAT DRIVE PROTOCOL DECISIONS.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        className="terminal-button !py-6 !px-12 text-lg"
                                        onClick={() => scrollTo('manifesto')}
                                    >
                                        [ ENTER_MARKET ]
                                    </button>
                                    <button className="terminal-button !py-6 !px-12 text-lg opacity-40 hover:opacity-100">
                                        [ PROTOCOL_DOCUMENTATION ]
                                    </button>
                                </div>
                            </div>
                        </section>
                    </main >

                    {/* RIGHT STICKY SIDEBAR (TRADING) */}
                    < aside className="w-full lg:max-w-[440px] xl:max-w-[480px] lg:sticky lg:top-12 lg:self-start" >
                        <div className="space-y-8">
                            {/* Personal Portfolio Card */}
                            <div className="p-8 border border-white/20 bg-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-pixel text-[40px] pointer-events-none group-hover:opacity-20 transition-opacity uppercase">FAO</div>
                                <h3 className="font-pixel text-[10px] tracking-[0.3em] opacity-30 uppercase mb-8">/IDENTIFIED_PORTFOLIO</h3>
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-pixel opacity-20 uppercase mb-1">HOLDINGS</span>
                                            <span className="text-4xl font-mono font-black">25,400.00</span>
                                        </div>
                                        <span className="font-pixel text-[10px] opacity-40 mb-1 tracking-widest">FAO</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 border border-white/10 bg-black">
                                            <span className="text-[7px] font-pixel opacity-20 block mb-1 uppercase">AVG_COST</span>
                                            <span className="font-mono text-sm leading-none">0.0034 ETH</span>
                                        </div>
                                        <div className="p-4 border border-white bg-white text-black">
                                            <span className="text-[7px] font-pixel opacity-60 block mb-1 uppercase">EXIT_VALUE</span>
                                            <span className="font-mono text-sm leading-none underline decoration-2">1.04 ETH</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Trade Console */}
                            <div className="flex flex-col border border-white shadow-[0_0_60px_rgba(255,255,255,0.05)] bg-black">
                                <div className="flex border-b border-white">
                                    <button
                                        onClick={() => setTradeMode('buy')}
                                        className={`flex-1 py-4 font-pixel text-[9px] tracking-widest transition-all ${tradeMode === 'buy'
                                            ? 'bg-white text-black'
                                            : 'hover:bg-black/5 opacity-40'
                                            }`}
                                    >
                                        [ SECURE_FAO ]
                                    </button>
                                    <button
                                        onClick={() => setTradeMode('exit')}
                                        className={`flex-1 py-4 font-pixel text-[9px] tracking-widest transition-all ${tradeMode === 'exit'
                                            ? 'bg-white text-black'
                                            : 'hover:bg-black/5 opacity-40'
                                            }`}
                                    >
                                        [ TERMINATE ]
                                    </button>
                                </div>
                                <div className="p-2">
                                    {tradeMode === 'buy' ? <BuyPanel /> : <RagequitPanel />}
                                </div>
                            </div>

                            <div className="p-6 border border-white/5 font-mono text-[9px] opacity-20 italic leading-relaxed uppercase tracking-widest">
                                DAO_CLEARANCE_LEVEL: ALPHA // SECURE_SOCKET: ENABLED // BY_OPERATING_THIS_TERMINAL_YOU_ACCEPT_ON_CHAIN_DYNAMICS.
                            </div>
                        </div>
                    </aside >
                </div >

                {/* Website Footer */}
                < footer className="mt-32 pt-16 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 pb-12" >
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <span className="text-[6px] font-pixel opacity-20 uppercase tracking-widest mb-1">LIQUIDITY_GUARDIAN</span>
                            <span className="text-[10px] font-mono opacity-60 underline underline-offset-4 uppercase tracking-widest">VIEW_TREASURY_CONTRACT</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[6px] font-pixel opacity-20 uppercase tracking-widest mb-1 uppercase tracking-widest">PROTOCOL_DOCS</span>
                            <span className="text-[10px] font-mono opacity-60 underline underline-offset-4">GITBOOK_OFFLINE</span>
                        </div>
                    </div>
                    <div className="font-pixel text-[8px] opacity-20 tracking-[0.5em] uppercase">
                        FAO_AUTONOMOUS_NETWORK // EST_2024
                    </div>
                </footer >
            </div >
        </div >
    );
}
