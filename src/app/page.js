'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalWrapper } from '../components/ui/TerminalWrapper';
import { TerminalLog } from '../components/ui/TerminalLog';
import { AnimatedLogo } from '../components/ui/AnimatedLogo';
import { ConnectWallet } from '../components/ConnectWallet';
import BuyPanel from '../components/BuyPanel';
import RagequitPanel from '../components/RagequitPanel';
import BondingCurveChart from '../components/BondingCurveChart';
import TokenDistribution from '../components/TokenDistribution';
import { HeroLogo } from '../components/ui/HeroLogo'; // Keep existing correct import

export default function Home() {
  const [activeView, setActiveView] = useState('boot');
  const [showTrade, setShowTrade] = useState(false);
  const [tradeMode, setTradeMode] = useState('buy');

  const terminalCommands = [
    {
      id: 'boot',
      label: 'SYSTEM_BOOT',
      output: (
        <div className="space-y-6">
          <h1 className="ico-header">FAO.OS_STATION_V4</h1>
          <p className="max-w-xl text-lg text-white/80 leading-tight border-l-2 border-white pl-6">
            WELCOME TO THE DECENTRALIZED COGNITION NODE. THE PROTOCOL IS INITIALIZING IMMUTABLE LIQUIDITY PARAMETERS.
          </p>
          <div className="text-[10px] opacity-40 uppercase tracking-widest font-pixel">STATUS: // OPERATIONAL // SECURE // MONOCHROME</div>
        </div>
      ),
      nextOptions: ['manifesto', 'market_data', 'treasury_status', 'activity_log', 'access_vault']
    },
    {
      id: 'manifesto',
      label: 'MISSION_MANIFESTO',
      output: (
        <div className="space-y-8 max-w-2xl py-8">
          <h2 className="ico-header">THE_AGENT_GOVERNANCE</h2>
          <p className="text-xl font-mono leading-relaxed text-white">
            FAO IS AN AUTONOMOUS OPTIMIZER. WE LEVERAGE MACHINE INTELLIGENCE TO GOVERN LIQUIDITY MARKETS WITHOUT HUMAN BIAS.
          </p>
          <div className="space-y-6 text-white/60 font-mono text-sm border-t border-white/10 pt-6">
            <div className="flex gap-4">
              <span className="text-white bg-white/10 px-2 py-1 h-fit">PHASE_I</span>
              <div>
                <h3 className="text-white font-bold mb-1">14-DAY_FIXED_EQUILIBRIUM</h3>
                <p>Initial 14-day window. FAO is priced at a constant floor to ensure fair-start liquidity depth before curve activation.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-white bg-white/10 px-2 py-1 h-fit">PHASE_II</span>
              <div>
                <h3 className="text-white font-bold mb-1">LINEAR_BONDING_CURVE</h3>
                <p>Mathematical expansion. Price increases proportionally with supply, creating a hard value floor for all participants.</p>
              </div>
            </div>
          </div>
        </div>
      ),
      nextOptions: ['market_data', 'treasury_status', 'activity_log', 'access_vault']
    },
    {
      id: 'treasury_status',
      label: 'TREASURY_PROTOCOL',
      output: (
        <div className="space-y-8 py-8">
          <h2 className="ico-header">TREASURY_RESERVE_AUDIT</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-white/20 p-6 bg-white/5 space-y-4">
              <h3 className="font-pixel text-[10px] text-white/40 uppercase tracking-widest">_CURRENT_ASSETS</h3>
              <div className="text-4xl font-mono font-black">1.28M <span className="text-sm opacity-40">ETH</span></div>
              <p className="text-xs text-white/60">COLLECTED_FROM_BONDING_CURVE // 100%_LIQUIDITY_BACKED</p>
            </div>
            <div className="border border-white/20 p-6 bg-white/5 space-y-4">
              <h3 className="font-pixel text-[10px] text-white/40 uppercase tracking-widest">_RAGEQUIT_FORMULA</h3>
              <div className="text-xl font-mono">LIQUIDATION = (BALANCE / SUPPLY) * TREASURY</div>
              <p className="text-xs text-white/60 italic">Your exit value is programmatically derived from the total treasury divided by circulating supply. Fairness is hardcoded.</p>
            </div>
          </div>
        </div>
      ),
      nextOptions: ['manifesto', 'market_data', 'activity_log', 'access_vault']
    },
    {
      id: 'activity_log',
      label: 'ACTIVITY_LOG_&_PORTFOLIO',
      output: (
        <div className="space-y-8 py-8">
          <h2 className="ico-header">SYSTEM_ACTIVITY_FEED</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/10 pb-2 text-white/40 italic">
              <span>TIMESTAMP</span>
              <span>IDENTIFIER</span>
              <span>COMMAND</span>
              <span>VALUE</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono py-2 hover:bg-white/5 px-2 transition-colors">
              <span className="opacity-40">18:04:12</span>
              <span>0x8F..2E</span>
              <span className="text-white/80">BUY_FAO</span>
              <span className="font-black">12,500 FAO</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono py-2 hover:bg-white/5 px-2 transition-colors">
              <span className="opacity-40">17:52:01</span>
              <span>0x4A..9B</span>
              <span className="text-red-500">RAGEQUIT</span>
              <span className="font-black text-red-500">-5,200 FAO</span>
            </div>
          </div>

          <h2 className="ico-header mt-12 pt-12 border-t border-white/10">YOUR_PORTFOLIO</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-white/20">
              <div className="text-[8px] font-pixel opacity-30 mb-2">POSSESSION</div>
              <div className="text-2xl font-mono font-bold">25,400 <span className="text-[10px] opacity-40">FAO</span></div>
            </div>
            <div className="p-4 border border-white/20">
              <div className="text-[8px] font-pixel opacity-30 mb-2">COST_BASIS</div>
              <div className="text-2xl font-mono font-bold">0.82 <span className="text-[10px] opacity-40">ETH</span></div>
            </div>
            <div className="p-4 border border-white/20 bg-white text-black">
              <div className="text-[8px] font-pixel opacity-60 mb-2">RAGEQUIT_VALUE</div>
              <div className="text-2xl font-mono font-bold">1.04 <span className="text-[10px] opacity-60">ETH</span></div>
            </div>
          </div>
        </div>
      ),
      nextOptions: ['manifesto', 'market_data', 'treasury_status', 'access_vault']
    },
    {
      id: 'market_data',
      label: 'MARKET_ANALYTICS',
      output: (
        <div className="space-y-12 py-8">
          <h2 className="ico-header">CORE_METRICS_STREAM</h2>
          <div className="grid grid-cols-1 gap-12">
            <BondingCurveChart />
            <TokenDistribution />
          </div>
        </div>
      ),
      nextOptions: ['manifesto', 'access_vault']
    },
    {
      id: 'access_vault',
      label: 'ACCESS_VAULT_CONTROLS',
      output: "INITIALIZING_CONTROL_UNIT... LOADING_TRADING_INTERFACE... SYSTEM_READY.",
      nextOptions: ['manifesto', 'market_data']
    }
  ];

  const handleCommand = (cmdId) => {
    setActiveView(cmdId);
    if (cmdId === 'access_vault') {
      setShowTrade(true);
    } else {
      setShowTrade(false);
    }
  };

  return (
    <TerminalWrapper>
      <HeroLogo />
      <div className="flex flex-col h-full gap-12 relative z-10">
        {/* Station Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-10 gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 grayscale brightness-200">
              <AnimatedLogo />
            </div>
            <div className="flex flex-col">
              <span className="font-pixel text-[8px] opacity-30 tracking-[0.4em] uppercase mb-1">STATION_IDENTIFIER</span>
              <span className="font-pixel text-xl tracking-tighter">FAO_PROTOTYPE_04</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <ConnectWallet />
          </div>
        </header>

        {/* Main Interface Mixture */}
        <div className="flex-1 flex flex-col lg:flex-row gap-16 min-h-0">
          {/* Left: Interactive AI System Log */}
          <div className="flex-1 flex flex-col min-h-[500px]">
            <TerminalLog
              commands={terminalCommands}
              onCommandSelect={handleCommand}
            />
          </div>

          {/* Right: The High-Contrast Control Unit */}
          <AnimatePresence>
            {showTrade && (
              <motion.div
                initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                className="lg:w-[500px] flex flex-col gap-8"
              >
                <div className="flex border border-white/10 bg-white/5 p-1 mb-2">
                  <button
                    onClick={() => setTradeMode('buy')}
                    className={`flex-1 py-3 font-pixel text-[10px] transition-all ${tradeMode === 'buy' ? 'bg-white text-black' : 'hover:bg-white/10 opacity-40'}`}
                  >
                    [ SECURE_FAO ]
                  </button>
                  <button
                    onClick={() => setTradeMode('exit')}
                    className={`flex-1 py-3 font-pixel text-[10px] transition-all ${tradeMode === 'exit' ? 'bg-white text-black' : 'hover:bg-white/10 opacity-40'}`}
                  >
                    [ TERMINATE_NODE ]
                  </button>
                </div>

                <div className="bg-black border border-white shadow-[0_0_40px_rgba(255,255,255,0.05)] p-2">
                  {tradeMode === 'buy' ? <BuyPanel /> : <RagequitPanel />}
                </div>

                <div className="p-6 border border-white/5 bg-white/2">
                  <div className="font-pixel text-[8px] opacity-30 uppercase tracking-widest mb-4">_SYSTEM_WARNING</div>
                  <p className="font-mono text-[10px] leading-relaxed text-white/50">
                    TRANSACTIONS ARE IMMUTABLE. BY EXECUTING COMMANDS, YOU RECOGNIZE THE AUTONOMOUS NATURE OF THE FAO GOVERNANCE MODEL. NO CENTRAL AUTHORITY CAN REVERSE ON-CHAIN LOGIC.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <footer className="h-16 border-t border-white/10 flex items-center justify-between px-2">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[6px] font-pixel opacity-20 uppercase tracking-widest mb-1">D-INTELLIGENCE_NODE</span>
              <span className="text-[10px] font-mono text-white/60">NODE_0x1F...42E: CONNECTED</span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[6px] font-pixel opacity-20 uppercase tracking-widest mb-1">LATENCY_MS</span>
              <span className="text-[10px] font-mono text-white/60">0.038ms</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-[10px] font-mono opacity-20 hidden sm:block">STATION_OS_V4.2.0_KERN_X64</div>
            <div className="flex gap-2">
              <div className="w-1 h-3 bg-white" />
              <div className="w-1 h-3 bg-white/40" />
              <div className="w-1 h-3 bg-white/10" />
            </div>
          </div>
        </footer>
      </div>
    </TerminalWrapper>
  );
}
