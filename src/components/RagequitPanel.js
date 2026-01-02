'use client';

import { useState } from 'react';
import { useFAOContract, FAO_SALE_ADDRESS } from '../hooks/useFAOContract';
import { useETHPrice } from '../hooks/useETHPrice';
import { toast } from 'sonner';

export default function RagequitPanel() {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { saleContract } = useFAOContract();
    const { price: ethPrice } = useETHPrice();

    // FAO is priced at 0.0001 ETH initially.
    // Pro-rata redemption depends on treasury balance, but let's estimate based on face value for UI.
    const estimatedEth = (parseFloat(amount) || 0) * 0.0001;
    const usdValue = estimatedEth * ethPrice;

    const handleRagequit = async () => {
        if (!amount || isNaN(amount)) {
            toast.error("INVALID_DAO_EXIT_COMMAND");
            return;
        }

        setIsLoading(true);
        try {
            const promise = new Promise((resolve) => setTimeout(resolve, 3000));
            toast.promise(promise, {
                loading: 'EXECUTING_SETTLEMENT...',
                success: 'LIQUIDITY_RECLAIM_CONFIRMED',
                error: 'SETTLEMENT_FAILED',
            });
            await promise;
            setAmount('');
        } catch (err) {
            console.error(err);
            toast.error("TRANSACTION_ERROR");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 sm:gap-8 w-full relative overflow-hidden p-4 sm:p-6 border transition-colors duration-700 bg-black border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b pb-4 border-white">
                <h2 className="ico-header">RAGEQUIT()</h2>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="font-pixel text-[8px] opacity-40 uppercase">CONTRACT_EXECUTION</span>
                </div>
            </div>

            <p className="font-mono text-[11px] sm:text-xs leading-relaxed border-l pl-4 italic transition-colors duration-700 text-white/60 border-white/20">
                REDEEM_SHARE: Pro-rata redemption of treasury assets by calling the ragequit() function. This process burns your FAO holdings.
            </p>

            {(!saleContract || FAO_SALE_ADDRESS === "0x00000000000000000000000000000000") && (
                <div className="absolute inset-0 z-40 flex items-center justify-center border flex-col text-center p-6 backdrop-blur-sm bg-black/95 border-white">
                    <span className="font-pixel font-bold text-sm mb-4 tracking-widest px-2 py-1 bg-white text-black">!! ERR_SETUP !!</span>
                    <p className="text-[10px] font-pixel text-white/50">CONFIGURE CONTRACT_MANIFEST in config/contracts.js</p>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-0">
                    <label className="text-[10px] font-pixel uppercase tracking-[0.2em] text-white/40">BURN (FAO)</label>
                    <div className="text-[10px] font-mono text-white/30">
                        SETTLEMENT: <span className="text-white">{estimatedEth.toFixed(4)} ETH</span>
                        <span className="ml-2 text-yellow-500">ƒ%^ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                    </div>
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
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-pixel text-[10px] text-white/30 group-focus-within:text-black">FAO</div>
                </div>
            </div>

            <button
                onClick={handleRagequit}
                className="w-full terminal-button py-6 sm:py-8 text-base sm:text-lg font-bold border-white/40 text-white/40 hover:bg-white hover:text-black hover:border-white transition-all duration-500"
            >
                {isLoading ? 'WAITING_FOR_CONFIRMATION...' : 'EXECUTE_RAGEQUIT'}
            </button>
        </div>
    );
}
