'use client';

import { useState, useMemo, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { useFAOContract, FAO_SALE_ADDRESS } from '../hooks/useFAOContract';
import { useSubgraphData } from '../hooks/useSubgraphData';
import { useFAOQuoter } from '../hooks/useFAOQuoter';
import { toast } from 'sonner';
import TransactionConfirmModal from './TransactionConfirmModal';
import FAOSaleABI from '../abi/FAOSale.json';

const NATIVE_SYMBOL = 'xDAI';
const TOKEN_SYMBOL = 'FAO';

export default function SwapPanel({
    onTransactionSuccess,
    holdingsValue,
    exitValue,
    exitSymbol
}) {
    // Mode: 'BUY' (xDAI -> FAO) or 'SELL' (FAO -> xDAI)
    const [mode, setMode] = useState('BUY');

    // Inputs: 'pay' is top, 'receive' is bottom
    const [payAmount, setPayAmount] = useState('');
    const [receiveAmount, setReceiveAmount] = useState('');

    // Which field controls the calculation?
    const [activeField, setActiveField] = useState('PAY'); // 'PAY' or 'RECEIVE'

    const { saleContract } = useFAOContract();
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { refetch: refetchSubgraph } = useSubgraphData();
    const {
        getQuoteForEth,
        getQuoteForTokens,
        simulateBuy,
        simulateRagequit,
        curveParams,
        quoteAge,
        isPhase1
    } = useFAOQuoter();

    const [isSimulating, setIsSimulating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quoteData, setQuoteData] = useState(null); // Stores exact transaction values

    // --- QUOTING LOGIC ---
    useEffect(() => {
        const calculateQuote = () => {
            // Reset if empty
            if (!payAmount && !receiveAmount) {
                setQuoteData(null);
                return;
            }

            // BUY MODE: xDAI -> FAO
            if (mode === 'BUY') {
                if (activeField === 'PAY') {
                    // Exact Input (xDAI) -> Calculate FAO
                    if (!payAmount || parseFloat(payAmount) <= 0) return;
                    try {
                        const wei = parseEther(payAmount);
                        const res = getQuoteForEth(wei);
                        // Update receive input with calculated tokens (Integer)
                        setReceiveAmount(res.numTokens.toString());
                        setQuoteData({
                            tokens: res.numTokens,
                            costWei: res.exactCost,
                            type: 'BUY'
                        });
                    } catch (e) { console.error(e); }
                } else {
                    // Exact Output (FAO) -> Calculate xDAI Cost
                    if (!receiveAmount || parseFloat(receiveAmount) <= 0) return;
                    try {
                        // Ensure whole tokens for contract
                        const tokens = BigInt(Math.floor(parseFloat(receiveAmount)));
                        if (tokens <= 0n) return;

                        const costWei = getQuoteForTokens(tokens);
                        // Update pay input with exact cost
                        setPayAmount(formatEther(costWei));
                        setQuoteData({
                            tokens: tokens,
                            costWei: costWei,
                            type: 'BUY'
                        });
                    } catch (e) { console.error(e); }
                }
            }
            // SELL MODE: FAO -> xDAI
            else {
                // For now, only support Exact Input (FAO) -> Est Output (xDAI)
                // Because we don't have a reliable 'getQuoteForWei' on sell side
                if (activeField === 'PAY') {
                    if (!payAmount || parseFloat(payAmount) <= 0) return;
                    try {
                        const tokens = BigInt(Math.floor(parseFloat(payAmount)));
                        if (tokens <= 0n) return;

                        // Estimate return: tokens * currentPrice
                        // Note: This is an estimation. Ragequit burns tokens.
                        // Using currentPriceWei as spot price.
                        const estWei = tokens * curveParams.currentPrice;
                        setReceiveAmount(formatEther(estWei));
                        setQuoteData({
                            tokens: tokens,
                            estReturnWei: estWei,
                            type: 'SELL'
                        });
                    } catch (e) { console.error(e); }
                } else {
                    // Exact Output (xDAI) - Reverse calc
                    // Approx: tokens = wei / currentPrice
                    if (!receiveAmount || parseFloat(receiveAmount) <= 0) return;
                    try {
                        const weiTarget = parseEther(receiveAmount);
                        if (curveParams.currentPrice > 0n) {
                            const estTokens = weiTarget / curveParams.currentPrice;
                            setPayAmount(estTokens.toString());
                            setQuoteData({
                                tokens: estTokens,
                                estReturnWei: weiTarget, // Approx
                                type: 'SELL'
                            });
                        }
                    } catch (e) { console.error(e); }
                }
            }
        };

        // Debounce slightly to avoid rapid updates/loops
        const timer = setTimeout(calculateQuote, 100);
        return () => clearTimeout(timer);
    }, [activeField, payAmount, receiveAmount, mode, getQuoteForEth, getQuoteForTokens, curveParams]);


    // --- HANDLERS ---
    const handleToggleMode = () => {
        setMode(prev => prev === 'BUY' ? 'SELL' : 'BUY');
        setPayAmount('');
        setReceiveAmount('');
        setQuoteData(null);
        setActiveField('PAY');
    };

    const handlePayChange = (val) => {
        setPayAmount(val);
        setActiveField('PAY');
    };

    const handleReceiveChange = (val) => {
        setReceiveAmount(val);
        setActiveField('RECEIVE');
    };

    const handleActionClick = async () => {
        if (!address) {
            toast.error("WALLET_NOT_CONNECTED");
            return;
        }
        if (!quoteData || quoteData.tokens === 0n) {
            toast.error("INVALID_AMOUNT");
            return;
        }

        setIsSimulating(true);
        let simResult;

        if (mode === 'BUY') {
            simResult = await simulateBuy(quoteData.tokens, quoteData.costWei);
        } else {
            simResult = await simulateRagequit(quoteData.tokens);
        }

        setIsSimulating(false);

        if (!simResult.success) {
            toast.error(`SIMULATION_FAILED: ${simResult.error}`);
            return;
        }

        setIsModalOpen(true);
    };

    const executeTransaction = async () => {
        setIsModalOpen(false);
        if (!walletClient || !publicClient || !quoteData) return;

        const toastId = toast.loading("INITIATING_SEQUENCE...");
        try {
            let hash;
            if (mode === 'BUY') {
                hash = await walletClient.writeContract({
                    address: FAO_SALE_ADDRESS,
                    abi: FAOSaleABI,
                    functionName: 'buy',
                    args: [quoteData.tokens],
                    value: quoteData.costWei
                });
            } else {
                hash = await walletClient.writeContract({
                    address: FAO_SALE_ADDRESS,
                    abi: FAOSaleABI,
                    functionName: 'ragequit',
                    args: [quoteData.tokens]
                });
            }

            toast.loading(`PROCESSING: ${hash.slice(0, 10)}...`, { id: toastId });
            await publicClient.waitForTransactionReceipt({ hash });

            toast.success(mode === 'BUY' ? "ASSET_SECURED" : "EXIT_COMPLETED", { id: toastId });

            setPayAmount('');
            setReceiveAmount('');
            setQuoteData(null);

            // Optimistic Update
            const delta = mode === 'BUY' ? Number(quoteData.tokens) : -Number(quoteData.tokens);
            if (onTransactionSuccess) onTransactionSuccess(delta);

            setTimeout(() => refetchSubgraph(), 3000);

        } catch (err) {
            console.error(err);
            toast.error("TRANSACTION_FAILED: " + (err.shortMessage || err.message), { id: toastId });
        }
    };

    // Visual Helpers
    const paySymbol = mode === 'BUY' ? NATIVE_SYMBOL : TOKEN_SYMBOL;
    const receiveSymbol = mode === 'BUY' ? TOKEN_SYMBOL : NATIVE_SYMBOL;
    const actionLabel = isSimulating ? 'SIMULATING...' : (mode === 'BUY' ? 'BUY_FAO' : 'BURN_AND_EXIT');

    return (
        <div className="flex flex-col gap-4 w-full relative overflow-hidden p-4 sm:p-6 border transition-colors duration-700 bg-black border-white/10">
            {/* Simplified portfolio summary */}
            <div className="grid grid-cols-2 gap-3">
                <div className="border border-white/10 bg-white/5 p-3">
                    <div className="text-[9px] font-pixel opacity-30 uppercase mb-2 whitespace-nowrap">HOLDINGS</div>
                    <div className="font-mono text-sm font-bold">
                        {holdingsValue ?? '0'}
                    </div>
                </div>
                <div className="border border-white/10 bg-white/5 p-3">
                    <div className="text-[9px] font-pixel opacity-30 uppercase mb-2 whitespace-nowrap">AVG_EXIT</div>
                    <div className="font-mono text-sm font-bold">
                        {exitValue ?? '0'} {exitSymbol ?? NATIVE_SYMBOL}
                    </div>
                </div>
            </div>

            {/* ERROR / WALLET STATES */}
            {!address && (
                <div className="absolute inset-0 z-30 flex items-center justify-center flex-col text-center p-6 backdrop-blur-sm bg-black/90">
                    <span className="font-pixel font-bold text-xs mb-2 tracking-widest">WALLET_NOT_CONNECTED</span>
                </div>
            )}

            {/* Inputs Container */}
            <div className="relative flex flex-col gap-2">
                {/* PAY INPUT */}
                <div className="bg-white/5 p-4 border border-white/10 hover:border-white/20 transition-colors rounded-sm">
                    <div className="flex justify-between mb-2">
                        <label className="text-[9px] font-pixel opacity-40 uppercase whitespace-nowrap">PAY ({paySymbol})</label>
                        {mode === 'SELL' && (
                            <span className="text-[9px] font-mono opacity-40 whitespace-nowrap">BALANCE: ...</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            placeholder="0.00"
                            value={payAmount}
                            onChange={(e) => handlePayChange(e.target.value)}
                            className="bg-transparent text-2xl font-mono w-full focus:outline-none placeholder:text-white/10 appearance-none"
                        />
                        <span className="font-pixel text-xs bg-white/10 px-2 py-1 rounded whitespace-nowrap">{paySymbol}</span>
                    </div>
                </div>

                {/* TOGGLE BUTTON */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <button
                        onClick={handleToggleMode}
                        className="w-8 h-8 flex items-center justify-center bg-black border border-white/20 rounded-sm hover:border-white hover:bg-white/10 transition-all text-white/60"
                        title="Switch Direction"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                    </button>
                </div>

                {/* RECEIVE INPUT */}
                <div className="bg-white/5 p-4 border border-white/10 hover:border-white/20 transition-colors rounded-sm">
                    <div className="flex justify-between mb-2">
                        <label className="text-[9px] font-pixel opacity-40 uppercase whitespace-nowrap">RECEIVE ({receiveSymbol})</label>
                        {mode === 'BUY' && (
                            <span className="text-[9px] font-mono opacity-40 whitespace-nowrap">EST. OUTPUT</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            placeholder="0.00"
                            value={receiveAmount}
                            onChange={(e) => handleReceiveChange(e.target.value)}
                            // For Sell Mode Output (xDAI), we disable direct editing in this MVP to avoid complex reverse calc issues?
                            // Actually enabled logic above supports it.
                            className="bg-transparent text-2xl font-mono w-full focus:outline-none placeholder:text-white/10 appearance-none"
                        />
                        <span className="font-pixel text-xs bg-white/10 px-2 py-1 rounded whitespace-nowrap">{receiveSymbol}</span>
                    </div>
                </div>
            </div>

            {/* Quote Info */}
            <div className="flex justify-between items-center text-[9px] font-mono text-white/30 px-1">
                <span>
                    PRICE: {curveParams.currentPriceFormatted} {NATIVE_SYMBOL}
                </span>
                {quoteData && quoteData.type === 'BUY' && (
                    <span className="hidden sm:inline whitespace-nowrap">
                        EXACT_COST: {formatEther(quoteData.costWei)} {NATIVE_SYMBOL}
                    </span>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={handleActionClick}
                disabled={isSimulating || !quoteData}
                className={`w-full py-6 text-lg font-bold transition-all duration-300 ${mode === 'BUY'
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'bg-red-900/20 text-red-500 border border-red-500/50 hover:bg-red-900/40'
                    } disabled:opacity-50 disabled:cursor-not-allowed uppercase font-pixel tracking-widest`}
            >
                {actionLabel}
            </button>

            {/* Modals */}
            <TransactionConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={executeTransaction}
                data={{
                    amount: mode === 'BUY' ? formatEther(quoteData?.costWei || 0n) : payAmount,
                    receiveAmount: mode === 'BUY' ? receiveAmount : formatEther(quoteData?.estReturnWei || 0n),
                    inputSymbol: paySymbol, // Uses local constants (xDAI/FAO)
                    outputSymbol: receiveSymbol
                }}
            />
        </div>
    );
}
