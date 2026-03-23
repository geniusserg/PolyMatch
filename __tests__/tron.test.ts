/**
 * Tron API Tests
 */

import {
  fetchWalletBalance,
  isValidTronAddress,
  formatTrxBalance,
  formatUsdValue,
} from '@/api/tron';

describe('Tron API', () => {
  describe('isValidTronAddress', () => {
    it('should validate correct Tron addresses', () => {
      expect(isValidTronAddress('TYDzsYUEp7Y2KxLdRk6bKvZfMxNqJ8ZcAB')).toBe(true);
      expect(isValidTronAddress('TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7')).toBe(true);
      expect(isValidTronAddress('TKHuVq1oKVruCGLvqVex6mVn3Bb8XmVqJd')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidTronAddress('invalid')).toBe(false);
      expect(isValidTronAddress('123456789')).toBe(false);
      expect(isValidTronAddress('')).toBe(false);
      expect(isValidTronAddress(null as any)).toBe(false);
      expect(isValidTronAddress(undefined as any)).toBe(false);
    });

    it('should reject addresses not starting with T', () => {
      expect(isValidTronAddress('AYDzsYUEp7Y2KxLdRk6bKvZfMxNqJ8ZcAB')).toBe(false);
      expect(isValidTronAddress('BYDzsYUEp7Y2KxLdRk6bKvZfMxNqJ8ZcAB')).toBe(false);
    });

    it('should reject addresses with wrong length', () => {
      expect(isValidTronAddress('TYDzsYUEp7Y2K')).toBe(false);
      expect(isValidTronAddress('TYDzsYUEp7Y2KxLdRk6bKvZfMxNqJ8ZcABCD')).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(isValidTronAddress('  TYDzsYUEp7Y2KxLdRk6bKvZfMxNqJ8ZcAB  ')).toBe(true);
    });
  });

  describe('formatTrxBalance', () => {
    it('should format TRX balance with 2 decimals', () => {
      expect(formatTrxBalance(1000)).toBe('1000.00');
      expect(formatTrxBalance(1234.567)).toBe('1234.57');
      expect(formatTrxBalance(0.1)).toBe('0.10');
    });
  });

  describe('formatUsdValue', () => {
    it('should format USD value with $ and 2 decimals', () => {
      expect(formatUsdValue(1000)).toBe('$1,000.00');
      expect(formatUsdValue(1234.567)).toBe('$1,234.57');
      expect(formatUsdValue(0.1)).toBe('$0.10');
    });
  });

  describe('fetchWalletBalance', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error for invalid address', async () => {
      await expect(fetchWalletBalance('invalid')).rejects.toThrow('Invalid Tron address format');
    });

    it('should fetch balance for valid address', async () => {
      const validAddress = 'TYDzsYUEp7Y2KxLdRk6bKvZfMxNqJ8ZcAB';
      
      // Mock fetch to return mock data (fallback behavior)
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const result = await fetchWalletBalance(validAddress);
      
      expect(result.address).toBe(validAddress);
      expect(result.trx).toBeGreaterThan(0);
      expect(result.usdValue).toBeGreaterThan(0);
      expect(result.lastUpdated).toBeGreaterThan(0);
    });

    it('should use mock data when API fails', async () => {
      const validAddress = 'TYDzsYUEp7Y2KxLdRk6bKvZfMxNqJ8ZcAB';
      
      // Mock fetch to fail, triggering fallback
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const result = await fetchWalletBalance(validAddress);
      
      // Should return mock balance between 1000-6000 TRX
      expect(result.trx).toBeGreaterThanOrEqual(1000);
      expect(result.trx).toBeLessThanOrEqual(6000);
    });
  });
});
