/**
 * Wallet Hook
 * Handles wallet connection, clipboard, and balance fetching
 */

import { useState, useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { useGame } from '@/contexts/GameContext';
import { fetchWalletBalance, isValidTronAddress } from '@/api/tron';

interface UseWalletReturn {
  address: string;
  setAddress: (address: string) => void;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  pasteFromClipboard: () => Promise<void>;
  isValid: boolean;
}

export function useWallet(): UseWalletReturn {
  const { connectWallet } = useGame();
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = isValidTronAddress(address);

  const connect = useCallback(async () => {
    if (!isValid) {
      setError('Invalid Tron address format');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balance = await fetchWalletBalance(address);
      connectWallet(address, balance.usdValue);
      return true;
    } catch (err) {
      setError('Failed to fetch balance. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address, isValid, connectWallet]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const content = await Clipboard.getStringAsync();
      if (content) {
        setAddress(content.trim());
        setError(null);
      }
    } catch (err) {
      setError('Failed to access clipboard');
    }
  }, []);

  return {
    address,
    setAddress,
    isLoading,
    error,
    connect,
    pasteFromClipboard,
    isValid,
  };
}
