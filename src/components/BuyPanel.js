'use client';

import { useState, useMemo } from 'react';
import { parseEther, formatEther } from 'viem';
import { useAccount, useReadContract, useWalletClient, usePublicClient } from 'wagmi';
import { useFAOContract, FAO_SALE_ADDRESS } from '../hooks/useFAOContract';
import { useNativeCurrency } from '../hooks/useNativeCurrency';
import { toast } from 'sonner';
import TransactionConfirmModal from './TransactionConfirmModal';
import FAOSaleABI from '../abi/FAOSale.json';

export default function BuyPanel() {
    const [amount, setAmount] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { price: nativePrice, symbol: nativeSymbol } = useNativeCurrency();
    const { saleContract } = useFAOContract();
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    // Fetch current price from contract
    const { data: currentPriceWei } = useReadContract({
        address: FAO_SALE_ADDRESS,
        abi: FAOSaleABI,
        functionName: 'currentPriceWeiPerToken',
        watch: true,
    });

    const usdValue = (parseFloat(amount) || 0) * nativePrice;

    // Calculate tokens based on input Native Token and current price
    // If price is 0 (not loaded), default to 0
    const estimatedTokens = useMemo(() => {
        if (!amount || !currentPriceWei || currentPriceWei === 0n) return 0;
        try {
            const ethWei = parseEther(amount);
            // numTokens = ethWei / currentPriceWei
            // Note: This is an estimation. For a bonding curve, the price moves. 
            // However for Phase 1 (fixed) this is exact.
            return Number(ethWei * 1000000000000000000n / currentPriceWei) / 1000000000000000000;
        } catch (e) {
            return 0;
        }
    }, [amount, currentPriceWei]);

    const handleBuyClick = () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            toast.error("INVALID_INPUT_DETECTED");
            return;
        }
        if (!address) {
            toast.error("WALLET_NOT_CONNECTED");
            return;
        }
        setIsModalOpen(true);
    };

    const executeBuy = async () => {
        setIsModalOpen(false);
        if (!walletClient || !publicClient) return;

        const toastId = toast.loading("INITIATING_SEQUENCE...");

        try {
            const ethWeiInput = parseEther(amount);

            // 1. Calculate max whole tokens that can be bought with this amount
            // numTokens = floor(ethWeiInput / currentPriceWei)
            // Note: Contract buys in WHOLE tokens (uint256 numTokens)
            const numTokensBigInt = ethWeiInput / (currentPriceWei || BigInt(1e14));

            if (numTokensBigInt === 0n) {
                toast.error("AMOUNT_TOO_LOW: Minimum 1 Token", { id: toastId });
                return;
            }

            // 2. Recalculate exact cost required
            // cost = numTokens * currentPriceWei
            const exactCostWei = numTokensBigInt * (currentPriceWei || BigInt(1e14));

            toast.loading(`SIGN_TRANSACTION: Buying ${numTokensBigInt.toString()} FAO...`, { id: toastId });

            const hash = await walletClient.writeContract({
                address: FAO_SALE_ADDRESS,
                abi: FAOSaleABI,
                functionName: 'buy',
                args: [numTokensBigInt],
                value: exactCostWei // Send exact calculated amount, not the raw input
            });

            toast.loading(`PROCESSING: ${hash.slice(0, 10)}...`, { id: toastId });

            await publicClient.waitForTransactionReceipt({ hash });

            toast.success("ASSET_SECURED", { id: toastId });
            setAmount('');
        } catch (err) {
            console.error(err);
            toast.error("TRANSACTION_FAILED: " + (err.shortMessage || err.message), { id: toastId });
        }
    };

    // Data for the confirmation modal
    // Recalculate for display consistency
    const displayTokens = useMemo(() => {
        if (!amount || !currentPriceWei || currentPriceWei === 0n) return 0;
        try {
            const ethWei = parseEther(amount);
            const tokens = ethWei / currentPriceWei;
            return Number(tokens);
        } catch { return 0; }
    }, [amount, currentPriceWei]);

    const receiveAmount = displayTokens.toLocaleString(undefined, { maximumFractionDigits: 0 }); // Whole tokens only effectively

    // Calculate reserves based on the purchase
    // 66% Treasury, 20% Incentive, 14% Insider (based on original file logic, likely illustrative)
    const distribution = [
        { label: 'TREASURY_RESERVE (66%)', value: (displayTokens * 0.66).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: 'INCENTIVE_RESERVE (20%)', value: (displayTokens * 0.20).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: 'INSIDER_VESTING (14%)', value: (displayTokens * 0.14).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
    ];

    return (
        <div className="flex flex-col gap-6 sm:gap-8 w-full relative overflow-hidden p-4 sm:p-6 border transition-colors duration-700 bg-black border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b pb-4 border-white">
                <h2 className="ico-header">BUY()</h2>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="font-pixel text-[8px] opacity-40 uppercase">CONTRACT_EXECUTION</span>
                </div>
            </div>

            <p className="font-mono text-[11px] sm:text-xs leading-relaxed border-l pl-4 italic transition-colors duration-700 text-white/60 border-white/20">
                DEPOSIT_COLLATERAL: Mints FAO tokens against the bonding reserve by calling the buy() function on the protocol sale contract.
            </p>

            {(!saleContract || FAO_SALE_ADDRESS === "0x00000000000000000000000000000000") && (
                <div className="absolute inset-0 z-40 flex items-center justify-center border flex-col text-center p-6 backdrop-blur-sm bg-black/95 border-white">
                    <span className="font-pixel font-bold text-sm mb-4 tracking-widest px-2 py-1 bg-white text-black">!! ERR_SETUP !!</span>
                    <p className="text-[10px] font-pixel text-white/50">CONFIGURE CONTRACT_MANIFEST in config/contracts.js</p>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-0">
                    <label className="text-[10px] font-pixel uppercase tracking-[0.2em] text-white/40">PAY ({nativeSymbol})</label>
                    <div className="text-[10px] font-mono text-green-500/80">ƒ%^ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
                </div>
                <div className="relative group">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        disabled={!saleContract || FAO_SALE_ADDRESS === "0x00000000000000000000000000000000"}
                        className="w-full border p-4 sm:p-6 text-3xl sm:text-4xl font-mono focus:outline-none transition-all duration-300 placeholder:text-white/10 bg-white/5 border-white/20 text-white focus:bg-white focus:text-black"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-pixel text-[10px] text-white/30 group-focus-within:text-black">{nativeSymbol}</div>
                </div>
                {/* Display Current Price */}
                <div className="text-[9px] font-mono text-white/30 text-right">
                    PRICE_PER_TOKEN: {currentPriceWei ? formatEther(currentPriceWei) : "..."} {nativeSymbol}
                </div>
            </div>

            <button
                onClick={handleBuyClick}
                className="w-full terminal-button py-6 sm:py-8 text-base sm:text-lg font-bold hover:!bg-white hover:!text-black transition-all duration-500"
            >
                EXECUTE_BUY
            </button>

            <TransactionConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={executeBuy}
                data={{
                    amount: amount,
                    receiveAmount: receiveAmount,
                    distribution: distribution
                }}
            />
        </div>
    );
}

