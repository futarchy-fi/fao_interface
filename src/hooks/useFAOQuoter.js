'use client';

import { useMemo, useCallback } from 'react';
import { usePublicClient, useAccount, useReadContracts } from 'wagmi';
import { FAO_SALE_ADDRESS } from './useFAOContract';
import FAOSaleABI from '../abi/FAOSale.json';

/**
 * FAO Price Quoter Hook - USES DIRECT RPC CALLS
 * 
 * Provides real-time price quotes and transaction validation for FAO purchases.
 * Uses DIRECT CONTRACT READS (not subgraph) for accurate, up-to-date pricing.
 * 
 * Phase 0: Fixed price = INITIAL_PRICE_WEI_PER_TOKEN (0.0001 xDAI)
 * Phase 1: Price = P₀ × (1 + x/S) where:
 *   - P₀ = Initial price (0.0001 xDAI)
 *   - S = initialNetSale (tokens sold in Phase 0)
 *   - x = bondingCurveSaleTokens (tokens sold after Phase 0)
 */
export function useFAOQuoter() {
    const publicClient = usePublicClient();
    const { address: userAddress } = useAccount();

    // Read all required contract state via RPC (not subgraph!)
    const { data: contractData, isLoading, refetch, dataUpdatedAt } = useReadContracts({
        contracts: [
            {
                address: FAO_SALE_ADDRESS,
                abi: FAOSaleABI,
                functionName: 'initialPhaseFinalized',
                chainId: 100,
            },
            {
                address: FAO_SALE_ADDRESS,
                abi: FAOSaleABI,
                functionName: 'currentPriceWeiPerToken',
                chainId: 100,
            },
            {
                address: FAO_SALE_ADDRESS,
                abi: FAOSaleABI,
                functionName: 'bondingCurveSaleTokens',
                chainId: 100,
            },
            {
                address: FAO_SALE_ADDRESS,
                abi: FAOSaleABI,
                functionName: 'initialNetSale',
                chainId: 100,
            },
            {
                address: FAO_SALE_ADDRESS,
                abi: FAOSaleABI,
                functionName: 'saleStart',
                chainId: 100,
            },
            {
                address: FAO_SALE_ADDRESS,
                abi: FAOSaleABI,
                functionName: 'initialPhaseEnd',
                chainId: 100,
            },
            {
                address: FAO_SALE_ADDRESS,
                abi: FAOSaleABI,
                functionName: 'INITIAL_PRICE_WEI_PER_TOKEN',
                chainId: 100,
            },
        ],
        query: {
            refetchInterval: 10000, // Refetch every 10 seconds
            staleTime: 5000, // Consider data stale after 5 seconds
        },
    });

    // Parse contract results
    const parsedData = useMemo(() => {
        if (!contractData) {
            return {
                initialPhaseFinalized: false,
                currentPriceWei: BigInt('100000000000000'), // 0.0001 default
                bondingCurveSaleTokens: 0n,
                initialNetSale: 0n,
                saleStart: 0n,
                initialPhaseEnd: 0n,
                initialPriceWei: BigInt('100000000000000'),
            };
        }

        return {
            initialPhaseFinalized: contractData[0]?.result ?? false,
            currentPriceWei: contractData[1]?.result ?? BigInt('100000000000000'),
            bondingCurveSaleTokens: contractData[2]?.result ?? 0n,
            initialNetSale: contractData[3]?.result ?? 0n,
            saleStart: contractData[4]?.result ?? 0n,
            initialPhaseEnd: contractData[5]?.result ?? 0n,
            initialPriceWei: contractData[6]?.result ?? BigInt('100000000000000'),
        };
    }, [contractData]);

    // Phase detection from contract (not subgraph!)
    const phase = useMemo(() => {
        if (parsedData.saleStart === 0n) return 'NOT_STARTED';
        if (parsedData.initialPhaseFinalized) {
            return 'BONDING_CURVE'; // Phase 1
        }
        return 'INITIAL'; // Phase 0
    }, [parsedData.saleStart, parsedData.initialPhaseFinalized]);

    // Curve parameters for display
    const curveParams = useMemo(() => {
        const initialPrice = parsedData.initialPriceWei;
        const currentPrice = parsedData.currentPriceWei;
        const initialNetSale = parsedData.initialNetSale;
        const curveSold = parsedData.bondingCurveSaleTokens;

        return {
            initialPrice,
            initialNetSale,
            curveSold,
            currentPrice,
            // Formatted for display
            initialPriceFormatted: (Number(initialPrice) / 1e18).toFixed(6),
            initialNetSaleFormatted: Number(initialNetSale).toLocaleString(),
            curveSoldFormatted: Number(curveSold).toLocaleString(),
            currentPriceFormatted: (Number(currentPrice) / 1e18).toFixed(6),
        };
    }, [parsedData]);

    /**
     * Calculate cost/value in wei for a given amount of tokens (in wei)
     * Uses LIVE contract price from RPC
     * 
     * @param {bigint} tokenAmountWei - Amount of tokens in wei (1e18 basis)
     * @returns {bigint} Cost/Value in wei
     */
    const getQuoteForWei = useCallback((tokenAmountWei) => {
        const amount = BigInt(tokenAmountWei);
        if (amount <= 0n) return 0n;

        // Price is "Wei Per 1e18 Token"
        // Value = (Amount * Price) / 1e18
        return (amount * parsedData.currentPriceWei) / 1000000000000000000n;
    }, [parsedData.currentPriceWei]);

    /**
     * Calculate maximum tokens (in wei) purchasable with a given amount of ETH/xDAI
     * 
     * @param {bigint} weiAmount - Amount of wei to spend
     * @returns {{ numTokens: bigint, exactCost: bigint, change: bigint }}
     */
    const getQuoteForEth = useCallback((weiAmount) => {
        if (!weiAmount || weiAmount <= 0n) {
            return { numTokens: 0n, exactCost: 0n, change: 0n };
        }

        const price = parsedData.currentPriceWei;
        if (price === 0n) {
            return { numTokens: 0n, exactCost: 0n, change: weiAmount };
        }

        // numTokens = (weiAmount * 1e18) / price
        const numTokens = (weiAmount * 1000000000000000000n) / price;

        // Recalculate exact cost to handle rounding
        // exactCost = (numTokens * price) / 1e18
        const exactCost = (numTokens * price) / 1000000000000000000n;
        const change = weiAmount - exactCost;

        return { numTokens, exactCost, change };
    }, [parsedData.currentPriceWei]);

    /**
     * Simulate a buy transaction using staticCall
     * Validates the transaction will succeed before asking the user to sign.
     * 
     * @param {bigint} numTokens - Number of tokens to buy
     * @param {bigint} value - Wei amount to send
     * @returns {Promise<{ success: boolean, error?: string }>}
     */
    const simulateBuy = useCallback(async (numTokens, value) => {
        if (!publicClient || !userAddress) {
            return { success: false, error: 'Wallet not connected' };
        }

        try {
            await publicClient.simulateContract({
                address: FAO_SALE_ADDRESS,
                abi: FAOSaleABI,
                functionName: 'buy',
                args: [numTokens],
                value,
                account: userAddress
            });
            return { success: true };
        } catch (err) {
            const reason = err.shortMessage || err.message || 'Unknown error';
            return { success: false, error: reason };
        }
    }, [publicClient, userAddress]);

    /**
     * Simulate a ragequit transaction using staticCall
     * 
     * @param {bigint} numTokens - Number of tokens to return
     * @returns {Promise<{ success: boolean, error?: string }>}
     */
    const simulateRagequit = useCallback(async (numTokens) => {
        if (!publicClient || !userAddress) {
            return { success: false, error: 'Wallet not connected' };
        }

        try {
            await publicClient.simulateContract({
                address: FAO_SALE_ADDRESS,
                abi: FAOSaleABI,
                functionName: 'ragequit',
                args: [numTokens],
                account: userAddress
            });
            return { success: true };
        } catch (err) {
            const reason = err.shortMessage || err.message || 'Unknown error';
            return { success: false, error: reason };
        }
    }, [publicClient, userAddress]);

    /**
     * Project what the price would be after buying N tokens (Phase 1 only)
     * 
     * @param {bigint|number} additionalTokens - Tokens being purchased
     * @returns {bigint} Projected price per token in wei
     */
    const projectPriceAfter = useCallback((additionalTokens) => {
        if (phase !== 'BONDING_CURVE' || parsedData.initialNetSale === 0n) {
            return parsedData.initialPriceWei;
        }

        const newCurveSold = parsedData.bondingCurveSaleTokens + BigInt(additionalTokens);
        // P = P₀ × (1 + x/S) = P₀ + (P₀ × x / S)
        const priceIncrease = (parsedData.initialPriceWei * newCurveSold) / parsedData.initialNetSale;
        return parsedData.initialPriceWei + priceIncrease;
    }, [phase, parsedData]);

    // Formatted timestamp for "quote updated X ago"
    const quoteAge = useMemo(() => {
        if (!dataUpdatedAt) return null;
        const seconds = Math.floor((Date.now() - dataUpdatedAt) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m`;
    }, [dataUpdatedAt]);

    return {
        // Phase info
        phase,
        isPhase0: phase === 'INITIAL',
        isPhase1: phase === 'BONDING_CURVE',
        isNotStarted: phase === 'NOT_STARTED',

        // Curve parameters (for display in Phase 1)
        curveParams,

        // Raw contract data
        contractData: parsedData,

        // Quote functions
        getQuoteForTokens: getQuoteForWei, // Alias for backward compatibility if needed, using new Wei logic
        getQuoteForWei,
        getQuoteForEth,
        projectPriceAfter,

        // Transaction validation
        simulateBuy,
        simulateRagequit,

        // Metadata
        isLoading,
        lastSyncedAt: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
        quoteAge,
        refetch,
    };
}

export default useFAOQuoter;
