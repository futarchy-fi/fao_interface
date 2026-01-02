'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionConfirmModal({ isOpen, onClose, onConfirm, data }) {
    if (!isOpen) return null;

    const { amount, receiveAmount, distribution } = data;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/80">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-lg bg-black border border-white p-6 sm:p-8 shadow-[0_0_100px_rgba(255,255,255,0.1)] space-y-6 sm:space-y-8 max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-b border-white pb-4 sm:pb-6">
                        <div>
                            <h2 className="font-pixel text-lg sm:text-xl tracking-tighter">SECURE_TRANSACTION_AUDIT</h2>
                            <p className="text-[10px] font-pixel opacity-30 tracking-[0.3em] mt-2 uppercase">V_04 // ALPHA_CLEARANCE_REQUIRED</p>
                        </div>
                        <button onClick={onClose} className="self-end sm:self-auto font-mono text-white/40 hover:text-white transition-colors">[ ESC ]</button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6 p-4 bg-white/5 border border-white/10">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-pixel opacity-30 mb-1">INPUT (EXPENDITURE)</span>
                                <span className="text-xl sm:text-2xl font-mono font-bold text-red-400">-{amount} ETH</span>
                            </div>
                            <div className="hidden sm:block w-8 h-px bg-white/20" />
                            <div className="flex flex-col text-left sm:text-right">
                                <span className="text-[8px] font-pixel opacity-30 mb-1">OUTPUT (ACQUISITION)</span>
                                <span className="text-xl sm:text-2xl font-mono font-bold text-green-400">+{receiveAmount} FAO</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-pixel text-[10px] opacity-40 uppercase tracking-widest">_RESERVE_DISTRIBUTION</h3>
                            <div className="space-y-2">
                                {distribution.map((item, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-l-2 border-white/20 pl-4 py-1 gap-1 sm:gap-0">
                                        <span className="font-mono text-[10px] text-white/60">{item.label}</span>
                                        <span className="font-mono text-[10px] font-bold">{item.value} FAO</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border border-red-500/20 bg-red-500/5">
                            <p className="font-mono text-[9px] sm:text-[10px] text-red-400 italic leading-relaxed">
                                !! WARNING: BY PROCEEDING, YOU AGREE TO THE IMMUTABILITY OF THE FAO BONDING CURVE. ON-CHAIN ACTIONS CANNOT BE REVERSED. THE TREASURY BACKING FORMULA WILL BE ADJUSTED UPON CONFIRMATION.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 sm:py-4 border border-white/20 font-pixel text-[10px] hover:bg-white/5 transition-all"
                        >
                            [ CANCEL ]
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 sm:py-4 bg-white text-black font-pixel text-[10px] font-bold hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
                        >
                            [ CONFIRM_COMMAND ]
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
