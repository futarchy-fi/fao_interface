'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionConfirmModal({ isOpen, onClose, onConfirm, data, onRouteSelect }) {
    if (!isOpen) return null;

    const {
        amount,
        receiveAmount,
        distribution,
        inputSymbol = "ETH",
        outputSymbol = "FAO",
        type = "buy",
        liquiditySource,
        contractPrice,
        poolPrice,
        priceSymbol = inputSymbol
    } = data;
    const contractPriceNum = Number(contractPrice);
    const poolPriceNum = Number(poolPrice);
    const hasValidPrices = Number.isFinite(contractPriceNum) && Number.isFinite(poolPriceNum);
    const isBetterPool = hasValidPrices && poolPriceNum < contractPriceNum;
    const isBetterContract = hasValidPrices && contractPriceNum < poolPriceNum;
    const suggestedRoute = isBetterPool ? 'POOL' : isBetterContract ? 'CONTRACT' : null;
    const canSuggest = suggestedRoute && suggestedRoute !== liquiditySource;

    // Dynamic title based on operation type
    const title = type === 'ragequit' ? 'CONFIRM_RAGEQUIT' : 'CONFIRM_BUY';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/80">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-lg bg-black border border-white p-6 sm:p-4 shadow-[0_0_100px_rgba(255,255,255,0.1)] space-y-6 sm:space-y-4 max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex justify-between items-center border-b border-white pb-4 sm:pb-3">
                        <h2 className="font-pixel text-lg sm:text-xl tracking-tighter">{title}</h2>
                        <button onClick={onClose} className="font-mono text-white/40 hover:text-white transition-colors">[ X ]</button>
                    </div>

                    <div className="space-y-6 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-3 bg-white/5 border border-white/10">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-pixel opacity-30 mb-1">INPUT (EXPENDITURE)</span>
                                <span className="text-xl sm:text-2xl font-mono font-bold text-red-400">
                                    ~{parseFloat(amount).toFixed(2)} {inputSymbol}
                                </span>
                                <span className="text-[10px] font-mono opacity-50 text-red-400/70">
                                    -{parseFloat(amount).toFixed(6)} {inputSymbol}
                                </span>
                            </div>
                            <div className="hidden sm:block w-8 h-px bg-white/20" />
                            <div className="flex flex-col text-left sm:text-right">
                                <span className="text-[8px] font-pixel opacity-30 mb-1">OUTPUT (ACQUISITION)</span>
                                <span className="text-xl sm:text-2xl font-mono font-bold text-green-400">
                                    ~{parseFloat(receiveAmount).toFixed(2)} {outputSymbol}
                                </span>
                                <span className="text-[10px] font-mono opacity-50 text-green-400/70">
                                    +{parseFloat(receiveAmount).toFixed(6)} {outputSymbol}
                                </span>
                            </div>
                        </div>

                        {hasValidPrices && (
                            <div className={`p-4 sm:p-3 border ${canSuggest ? 'border-yellow-300 bg-yellow-400/20 shadow-[0_0_30px_rgba(234,179,8,0.35)]' : 'border-white/10 bg-white/5'}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex flex-col">
                                        <span className={`text-[9px] font-pixel uppercase mb-1 tracking-widest ${canSuggest ? 'text-yellow-200' : 'text-white/50'}`}>
                                            PRICE_COMPARISON
                                        </span>
                                        <span className={`text-[11px] font-mono font-bold ${canSuggest ? 'text-yellow-100' : 'text-white/70'}`}>
                                            CONTRACT {contractPrice} {priceSymbol} // POOL {poolPrice} {priceSymbol}
                                        </span>
                                        <span className={`text-[9px] font-mono mt-1 ${canSuggest ? 'text-yellow-100/80' : 'text-white/50'}`}>
                                            DELTA: {((Math.abs(poolPriceNum - contractPriceNum) / contractPriceNum) * 100).toFixed(2)}% {isBetterPool ? 'POOL_CHEAPER' : isBetterContract ? 'CONTRACT_CHEAPER' : 'EQUAL'}
                                        </span>
                                    </div>
                                    {canSuggest && (
                                        <button
                                            type="button"
                                            onClick={() => onRouteSelect?.(suggestedRoute)}
                                            className="px-3 py-2 bg-yellow-300 text-black font-pixel text-[8px] tracking-widest border border-yellow-200 hover:bg-yellow-200 hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all"
                                        >
                                            SWITCH TO {suggestedRoute}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {liquiditySource && (
                            <div className="p-4 sm:p-3 border border-white/10 bg-black/60">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-pixel opacity-30 uppercase mb-1">EXECUTION_ROUTE</span>
                                        <span className={`text-[10px] font-pixel tracking-widest ${liquiditySource === 'POOL' ? 'text-yellow-300' : 'text-white'}`}>
                                            {liquiditySource}
                                        </span>
                                        {liquiditySource === 'POOL' && (
                                            <span className="text-[8px] font-mono text-yellow-400/70 uppercase mt-1">POOL_QUOTE_MOCK</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-right sm:text-left">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-pixel opacity-30 uppercase">CONTRACT_PRICE</span>
                                            <span className="text-[10px] font-mono text-white/80 whitespace-nowrap">{contractPrice} {priceSymbol}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-pixel opacity-30 uppercase">POOL_PRICE</span>
                                            <span className="text-[10px] font-mono text-yellow-300/90 whitespace-nowrap">{poolPrice} {priceSymbol}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-4 sm:p-3 border border-red-500/20 bg-red-500/5">
                            <p className="font-mono text-[9px] sm:text-[10px] text-red-400 italic leading-relaxed">
                                !! WARNING: BY PROCEEDING, YOU AGREE TO THE IMMUTABILITY OF THE FAO BONDING CURVE. ON-CHAIN ACTIONS CANNOT BE REVERSED. THE TREASURY BACKING FORMULA WILL BE ADJUSTED UPON CONFIRMATION.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 sm:py-3 border border-white/20 font-pixel text-[10px] hover:bg-white/5 transition-all"
                        >
                            [ CANCEL ]
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 sm:py-3 bg-white text-black font-pixel text-[10px] font-bold hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
                        >
                            [ CONFIRM_COMMAND ]
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
