'use client';

import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { FAO_SALE_ADDRESS } from '../hooks/useFAOContract';
import FAOSaleABI from '../abi/FAOSale.json';

/**
 * TEST BUTTON: Calls ragequit(1000) directly without approval
 * For debugging only - remove after testing
 */
export default function RagequitTestButton() {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const handleTestRagequit = async () => {
        if (!walletClient || !address) {
            console.error("Wallet not connected");
            alert("Connect wallet first!");
            return;
        }

        console.log("=== TEST RAGEQUIT 1000 ===");
        console.log("FAO_SALE_ADDRESS:", FAO_SALE_ADDRESS);
        console.log("User:", address);

        try {
            // Encode ragequit(1000) - 1000 tokens (not wei, just count)
            const numTokens = 1000n;

            const data = encodeFunctionData({
                abi: FAOSaleABI,
                functionName: 'ragequit',
                args: [numTokens]
            });

            console.log("Encoded calldata:", data);
            console.log("Data length:", data.length);

            // Send transaction with explicit data
            const hash = await walletClient.sendTransaction({
                to: FAO_SALE_ADDRESS,
                data: data,
                value: 0n,
            });

            console.log("TX Hash:", hash);
            alert("Transaction sent! Hash: " + hash);

        } catch (err) {
            console.error("Test ragequit failed:", err);
            alert("Error: " + err.message);
        }
    };

    return (
        <button
            onClick={handleTestRagequit}
            className="fixed bottom-4 right-4 z-[200] bg-red-600 text-white px-4 py-2 font-mono text-sm hover:bg-red-700 border-2 border-red-400"
        >
            🧪 TEST RAGEQUIT 1000
        </button>
    );
}
