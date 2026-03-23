/**
 * Price Polling Hook
 * Polls Polymarket prices every 5 seconds for active bets
 * Triggers match detection when prices move
 */

import { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { fetchMarketPrices } from '@/api/polymarket';

const POLL_INTERVAL = 5000; // 5 seconds

export function usePricePolling() {
  const { state, updatePrices } = useGame();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only poll if we have active bets
    const activeBets = state.bets.filter((bet) => !bet.isResolved);
    
    if (activeBets.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling
    const pollPrices = async () => {
      try {
        const marketIds = activeBets.map((bet) => bet.marketId);
        const prices = await fetchMarketPrices(marketIds);
        updatePrices(prices);
      } catch (error) {
        console.warn('Price polling failed:', error);
      }
    };

    // Initial poll
    pollPrices();

    // Set up interval
    intervalRef.current = setInterval(pollPrices, POLL_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.bets, updatePrices]);

  return null;
}
