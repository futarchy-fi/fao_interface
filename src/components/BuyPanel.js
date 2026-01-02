'use client';

import { useState } from 'react';
import { parseEther } from 'viem';
import { useFAOContract, FAO_SALE_ADDRESS } from '../hooks/useFAOContract';
import { useApproveAndCall } from '../hooks/useApproveAndCall';
import { useETHPrice } from '../hooks/useETHPrice';
import { toast } from 'sonner';
import TransactionConfirmModal from './TransactionConfirmModal';

export default function BuyPanel() {
    const [amount, setAmount] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { price: ethPrice } = useETHPrice();
    const { saleContract } = useFAOContract();
    const { approveAndCall, isLoading: isHandling } = useApproveAndCall();

    const usdValue = (parseFloat(amount) || 0) * ethPrice;

    const handleBuyClick = () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            toast.error("INVALID_INPUT_DETECTED");
            return;
        }
        setIsModalOpen(true);
    };

    const executeBuy = async () => {
        setIsModalOpen(false);
        try {
            const formattedAmount = parseEther(amount);

            // In a real setup, we'd use approveAndCall.
            // For this UI demo, we simulate success.
            const promise = new Promise((resolve) => setTimeout(resolve, 2000));
            toast.promise(promise, {
                loading: 'PROCESSING_TRANSACTION...',
                success: 'TRANSACTION_CONFIRMED',
                error: 'TRANSACTION_FAILED',
            });

            await promise;
            setAmount('');
        } catch (err) {
            console.error(err);
            toast.error("TRANSACTION_ERROR");
        }
    };

    // Mock data for the confirmation modal
    const ethAmount = parseFloat(amount) || 0;
    const mockRate = 10000; // 1 ETH = 10,000 FAO (based on 0.0001 ETH price)
    const receiveAmount = (ethAmount * mockRate).toLocaleString();
    const distribution = [
        { label: 'TREASURY_RESERVE (66%)', value: (ethAmount * mockRate * 0.66).toLocaleString() },
        { label: 'INCENTIVE_RESERVE (20%)', value: (ethAmount * mockRate * 0.20).toLocaleString() },
        { label: 'INSIDER_VESTING (14%)', value: (ethAmount * mockRate * 0.14).toLocaleString() },
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
                    <label className="text-[10px] font-pixel uppercase tracking-[0.2em] text-white/40">PAY (ETH)</label>
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
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-pixel text-[10px] text-white/30 group-focus-within:text-black">ETH</div>
                </div>
            </div>

            <button
                onClick={handleBuyClick}
                className="w-full terminal-button py-6 sm:py-8 text-base sm:text-lg font-bold hover:!bg-white hover:!text-black transition-all duration-500"
            >
                {isHandling ? 'WAITING_FOR_CONFIRMATION...' : 'EXECUTE_BUY'}
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
