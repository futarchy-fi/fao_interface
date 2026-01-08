'use client';

import { useState, useEffect, useCallback } from 'react';
import { SUBGRAPH_URL } from '../config/contracts';

/**
 * Query to fetch all dashboard data from FAO Subgraph
 */
const DASHBOARD_QUERY = `
  query GetDashboardData {
    sale(id: "SALE") {
      id
      token
      saleStart
      initialPhaseEnd
      initialPhaseFinalized
      totalAmountRaised
      totalCurveFundsRaised
      totalCurveTokensSold
      totalSaleTokens
      initialTokensSold
      initialFundsRaised
      initialNetSale
      currentPriceWeiPerToken
      initialPriceWeiPerToken
      longTargetTokens
      longTargetReachedAt
      minInitialPhaseSold
    }
    purchaseEvents(first: 15, orderBy: timestamp, orderDirection: desc) {
      id
      buyer
      numTokens
      costWei
      timestamp
      txHash
      blockNumber
    }
    ragequitEvents(first: 15, orderBy: timestamp, orderDirection: desc) {
      id
      user
      faoBurned
      ethReturned
      timestamp
      txHash
      blockNumber
    }
  }
`;

/**
 * Format Wei to readable ETH/xDAI string
 */
function formatWei(weiString, decimals = 4) {
    if (!weiString) return '0';
    const wei = BigInt(weiString);
    const eth = Number(wei) / 1e18;
    return eth.toFixed(decimals);
}

/**
 * Calculate relative time string from Unix timestamp
 */
function getRelativeTime(timestamp) {
    const now = Date.now();
    const then = Number(timestamp) * 1000;
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}D AGO`;
    if (hours > 0) return `${hours}H AGO`;
    if (minutes > 0) return `${minutes}M AGO`;
    return 'JUST NOW';
}

/**
 * Hook to fetch and poll FAO Subgraph data
 * @param {Object} options
 * @param {number} options.pollInterval - Polling interval in ms (default: 30000)
 * @param {boolean} options.enabled - Whether to fetch (default: true)
 */
export function useSubgraphData({ pollInterval = 30000, enabled = true } = {}) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);

    const fetchData = useCallback(async () => {
        if (!enabled) return;

        try {
            setIsLoading(true);

            const response = await fetch(SUBGRAPH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: DASHBOARD_QUERY }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors[0]?.message || 'GraphQL error');
            }

            const { sale, purchaseEvents, ragequitEvents } = result.data;

            // Merge and sort transactions
            const allTransactions = [
                ...purchaseEvents.map(e => ({
                    id: e.id,
                    type: 'BUY',
                    user: e.buyer,
                    amount: formatWei(e.costWei),
                    tokens: e.numTokens,
                    timestamp: e.timestamp,
                    txHash: e.txHash,
                    blockNumber: e.blockNumber,
                    relativeTime: getRelativeTime(e.timestamp),
                })),
                ...ragequitEvents.map(e => ({
                    id: e.id,
                    type: 'RAGEQUIT',
                    user: e.user,
                    amount: formatWei(e.ethReturned),
                    tokens: e.faoBurned,
                    timestamp: e.timestamp,
                    txHash: e.txHash,
                    blockNumber: e.blockNumber,
                    relativeTime: getRelativeTime(e.timestamp),
                })),
            ].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

            // Process sale data
            const processedSale = sale ? {
                // Raw values
                saleStart: sale.saleStart,
                initialPhaseEnd: sale.initialPhaseEnd,
                initialPhaseFinalized: sale.initialPhaseFinalized,
                longTargetReachedAt: sale.longTargetReachedAt,

                // Formatted values
                totalAmountRaised: formatWei(sale.totalAmountRaised),
                totalAmountRaisedWei: sale.totalAmountRaised,
                totalCurveFundsRaised: formatWei(sale.totalCurveFundsRaised),
                initialFundsRaised: formatWei(sale.initialFundsRaised),

                // Token counts (these are already counts, not wei)
                totalSaleTokens: sale.totalSaleTokens,
                initialTokensSold: sale.initialTokensSold,
                totalCurveTokensSold: sale.totalCurveTokensSold,
                circulatingSupply: (
                    BigInt(sale.initialTokensSold || 0) +
                    BigInt(sale.totalCurveTokensSold || 0)
                ).toString(),

                // Price
                currentPriceWeiPerToken: sale.currentPriceWeiPerToken,
                currentPrice: formatWei(sale.currentPriceWeiPerToken),
                initialPrice: formatWei(sale.initialPriceWeiPerToken),

                // Targets
                longTargetTokens: sale.longTargetTokens,
                minInitialPhaseSold: sale.minInitialPhaseSold,
            } : null;

            setData({
                sale: processedSale,
                transactions: allTransactions,
                purchaseEvents,
                ragequitEvents,
            });

            setLastSyncedAt(new Date());
            setError(null);

        } catch (err) {
            console.error('[useSubgraphData] Error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [enabled]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Polling
    useEffect(() => {
        if (!enabled || !pollInterval) return;

        const interval = setInterval(fetchData, pollInterval);
        return () => clearInterval(interval);
    }, [fetchData, pollInterval, enabled]);

    return {
        sale: data?.sale,
        transactions: data?.transactions || [],
        purchaseEvents: data?.purchaseEvents || [],
        ragequitEvents: data?.ragequitEvents || [],
        isLoading,
        error,
        lastSyncedAt,
        refetch: fetchData,

        // Formatted helpers
        lastSyncedAtUTC: lastSyncedAt
            ? lastSyncedAt.toISOString().split('T')[1].split('.')[0] + ' UTC'
            : null,
    };
}

export default useSubgraphData;
